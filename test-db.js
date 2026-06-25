import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const [empRes, conRes, optRes, projRes, histRes, profRes, cliRes] = await Promise.all([
    supabase.from("empresas").select("*").order("data_cadastro", { ascending: false }),
    supabase.from("contactos").select("*"),
    supabase.from("oportunidades").select("*").order("data_entrada", { ascending: false }),
    supabase.from("projectos").select("id, oportunidade_id, cliente_id"),
    supabase.from("historico").select("*").order("data", { ascending: false }),
    supabase.from("profiles").select("*").order("data_cadastro", { ascending: false }),
    supabase.from("clientes").select("*").order("data_fecho", { ascending: false }),
  ]);

  console.log("Errors:");
  console.log("empRes.error:", empRes.error);
  console.log("conRes.error:", conRes.error);
  console.log("optRes.error:", optRes.error);
  console.log("projRes.error:", projRes.error);
  console.log("histRes.error:", histRes.error);
  console.log("profRes.error:", profRes.error);
  console.log("cliRes.error:", cliRes.error);
  
  console.log("Data counts:");
  console.log("empresas:", empRes.data?.length);
  console.log("contactos:", conRes.data?.length);
}
test();
