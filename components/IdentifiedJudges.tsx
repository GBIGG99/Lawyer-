import React from 'react';
import { JudgeSummary } from '../types';
import { Gavel, ChevronRight } from 'lucide-react';

interface IdentifiedJudgesProps {
  judges: JudgeSummary[];
  isLoading: boolean;
  onJudgeClick: (judgeName: string) => void;
}

export default function IdentifiedJudges({ judges, isLoading, onJudgeClick }: IdentifiedJudgesProps): React.ReactNode {
  if (isLoading) return null;
  if (!judges || judges.length === 0) return null;

  return (
    <div className="glass-slab p-8 !bg-slate-900/40 border-amber-500/20 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Gavel className="w-4 h-4 text-amber-400" />
          Identified Judicial Officers & Bench Intelligence
        </h4>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2.5 py-0.5 rounded-full">
          {judges.length} {judges.length === 1 ? 'Judge' : 'Judges'}
        </span>
      </div>
      <div className="space-y-2">
        {judges.map((judge, index) => (
          <button
            key={index}
            onClick={() => onJudgeClick(judge.name)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all rounded-lg group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-serif font-bold text-sm group-hover:scale-105 transition-transform">
                J
              </div>
              <div>
                <span className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors block">
                  Judge {judge.name.replace(/^judge\s+/i, '')}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Click to inspect bench profile, standing orders & ruling analytics
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}