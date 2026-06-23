import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables securely
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with generous payload limits
app.use(express.json({ limit: "50mb" }));

// Initialize Supabase safely using server-side variables only
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

// Only create client if variables are present to prevent crashes
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Helper to check Supabase schema presence
async function getSupabaseStatus() {
  if (!supabase) {
    return { connected: false, tablesExist: false, error: "Identificadores do Supabase ausentes no ficheiro .env" };
  }
  try {
    // Attempt a lightweight probe query
    const { error } = await supabase.from("empresas").select("id").limit(1);
    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return { connected: true, tablesExist: false, error: "Tabelas em falta no Supabase. É necessário executar a migração SQL." };
      }
      return { connected: false, tablesExist: false, error: error.message };
    }
    return { connected: true, tablesExist: true, error: null };
  } catch (err: any) {
    return { connected: false, tablesExist: false, error: err.message };
  }
}

// 1. Connection Status Enpoint
app.get("/api/db-status", async (req, res) => {
  const status = await getSupabaseStatus();
  res.json(status);
});

// 1.5. Secure Auth Endpoint for Vendaia Partners
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Por favor preencha todos os campos." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Se a senha estiver correta
  if (password === "vendaia@2026") {
    // 1. Tentar procurar no Supabase primeiro
    if (supabase) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", normalizedEmail)
          .single();

        if (profile && !error) {
          return res.json({
            success: true,
            user: {
              id: profile.id,
              email: profile.email,
              nome: profile.nome,
              perfil: profile.perfil,
              permissoes: profile.permissoes || "dashboard,empresas,pipeline,projectos"
            }
          });
        }
      } catch (e) {
        // Ignorar e usar fallback local
      }
    }

    // 2. Fallback institucional local
    if (normalizedEmail === "comercial@vendaia.com") {
      return res.json({
        success: true,
        user: {
          id: "comercial",
          email: "comercial@vendaia.com",
          nome: "Director Comercial",
          perfil: "Comercial",
          permissoes: "dashboard,empresas,pipeline,projectos,utilizadores"
        }
      });
    } else if (normalizedEmail === "operacional@vendaia.com") {
      return res.json({
        success: true,
        user: {
          id: "operacional",
          email: "operacional@vendaia.com",
          nome: "Director Operacional",
          perfil: "Operacional",
          permissoes: "dashboard,empresas,pipeline,projectos,utilizadores"
        }
      });
    }
  }

  return res.status(401).json({ 
    error: "Credenciais inválidas. Por favor utilize 'comercial@vendaia.com' ou 'operacional@vendaia.com' com a palavra-passe institucional correta (vendaia@2026)." 
  });
});

// 2. Fetch all CRM Data with automatic fallback support
app.get("/api/crm-data", async (req, res) => {
  if (!supabase) {
    return res.json({
      tablesExist: false,
      error: "Supabase não configurado no .env",
      empresas: [],
      contactos: [],
      oportunidades: [],
      projectos: [],
      historico: [],
      profiles: [],
    });
  }

  try {
    // Perform concurrent requests to all CRM database tables including profiles
    const [empRes, conRes, optRes, projRes, histRes, profRes] = await Promise.all([
      supabase.from("empresas").select("*").order("data_cadastro", { ascending: false }),
      supabase.from("contactos").select("*"),
      supabase.from("oportunidades").select("*").order("data_entrada", { ascending: false }),
      supabase.from("projectos").select("*").order("data_inicio", { ascending: false }),
      supabase.from("historico").select("*").order("data", { ascending: false }),
      supabase.from("profiles").select("*").order("data_cadastro", { ascending: false }),
    ]);

    // Detect if any table does not exist database-side
    const errors = [empRes.error, conRes.error, optRes.error, projRes.error, histRes.error];
    const missingTableError = errors.find(e => e && (e.code === "42P01" || e.message?.includes("does not exist")));

    if (missingTableError) {
      return res.json({
        tablesExist: false,
        error: "As tabelas não existem no vosso projeto Supabase. Por favor, utilize o script SQL no Painel para criá-las.",
        empresas: [],
        contactos: [],
        oportunidades: [],
        projectos: [],
        historico: [],
        profiles: [],
      });
    }

    res.json({
      tablesExist: true,
      empresas: empRes.data || [],
      contactos: conRes.data || [],
      oportunidades: optRes.data || [],
      projectos: projRes.data || [],
      historico: histRes.data || [],
      profiles: profRes.data || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Unified Upsert Sync Route (Ordered strictly due to foreign key constraints)
app.post("/api/sync", async (req, res) => {
  if (!supabase) {
    return res.status(400).json({ error: "Supabase no config" });
  }

  const { empresas, contactos, oportunidades, projectos, historico, profiles } = req.body;

  try {
    // Stage A: Empresas (Independent Parent Table)
    if (empresas && empresas.length > 0) {
      const { error } = await supabase.from("empresas").upsert(empresas);
      if (error) throw new Error(`[Empresas] ${error.message}`);
    }

    // Stage B: Oportunidades (References Empresas)
    if (oportunidades && oportunidades.length > 0) {
      const { error } = await supabase.from("oportunidades").upsert(oportunidades);
      if (error) throw new Error(`[Oportunidades] ${error.message}`);
    }

    // Stage C: Contactos (References Empresas)
    if (contactos && contactos.length > 0) {
      const { error } = await supabase.from("contactos").upsert(contactos);
      if (error) throw new Error(`[Contactos] ${error.message}`);
    }

    // Stage D: Projectos (References Empresas and Oportunidades)
    if (projectos && projectos.length > 0) {
      const { error } = await supabase.from("projectos").upsert(projectos);
      if (error) throw new Error(`[Projectos] ${error.message}`);
    }

    // Stage E: Historico (References Empresas)
    if (historico && historico.length > 0) {
      const { error } = await supabase.from("historico").upsert(historico);
      if (error) throw new Error(`[Historico] ${error.message}`);
    }

    // Stage F: Profiles
    if (profiles && profiles.length > 0) {
      const { error } = await supabase.from("profiles").upsert(profiles);
      if (error) throw new Error(`[Profiles] ${error.message}`);
    }

    res.json({ success: true, message: "Base de dados Supabase sincronizada com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Delete single record proxy
app.delete("/api/:table/:id", async (req, res) => {
  if (!supabase) {
    return res.status(400).json({ error: "Supabase no config" });
  }
  const { table, id } = req.params;
  const whitelist = ["empresas", "contactos", "oportunidades", "projectos", "historico", "profiles"];

  if (!whitelist.includes(table)) {
    return res.status(400).json({ error: "Tabela inválida para eliminação" });
  }

  try {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. App entry point & Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Listen to port 3000 exclusively
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server full-stack running on http://localhost:${PORT}`);
  });
}

startServer();
