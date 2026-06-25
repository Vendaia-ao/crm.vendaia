import React from 'react';
import { Users, Clock, Sparkles } from 'lucide-react';

export default function Clientes() {
  return (
    <div
      id="clientes-module"
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 select-none"
    >
      {/* Icon badge */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-none bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
          <Users className="w-10 h-10 text-slate-300" />
        </div>
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-none bg-amber-400 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-white" />
        </span>
      </div>

      {/* Label */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-none bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold uppercase tracking-widest">
        <Sparkles className="w-3 h-3" />
        Em Desenvolvimento
      </span>

      {/* Title */}
      <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
        Gestão de Clientes
      </h2>

      {/* Description */}
      <p className="text-sm text-slate-500 max-w-md leading-relaxed">
        Este módulo está a ser reformulado e ficará disponível em breve com
        funcionalidades melhoradas. Toda a gestão de clientes fica centralizada
        em{' '}
        <span className="font-bold text-slate-700">Gestão de Projectos</span>.
      </p>
    </div>
  );
}
