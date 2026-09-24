
import React from 'react';
import { type SearchParams } from '../types';
import { EXAMPLES } from '../constants';
import { FileText } from 'lucide-react';

interface ExamplesProps {
  onSelectExample: (example: SearchParams) => void;
}

export default function Examples({ onSelectExample }: ExamplesProps): React.ReactNode {
  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] whitespace-nowrap">
          Tactical Templates
        </h3>
        <div className="h-px w-full bg-zinc-800"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAMPLES.map((ex, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(ex)}
            className="group flex flex-col p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-left hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-emerald-500/40 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
                </div>
                <div className="w-1 h-1 rounded-full bg-zinc-800 group-hover:bg-emerald-500"></div>
            </div>
            <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-200 transition-colors leading-relaxed line-clamp-2 italic">
                "{ex.query}"
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
