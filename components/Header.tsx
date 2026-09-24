
import React from 'react';
import { FileText, Scale, BrainCircuit } from 'lucide-react';

interface HeaderProps {
  onAnalyzeDocumentClick: () => void;
  onCrossReferenceClick: () => void;
  onNarrativeMapperClick: () => void;
  onMotionDraftClick: () => void;
  onJudgeIntelClick: () => void;
  activeTab?: string;
}

export default function Header({ 
  onAnalyzeDocumentClick, 
  onCrossReferenceClick, 
  onNarrativeMapperClick,
  onMotionDraftClick,
  onJudgeIntelClick,
  activeTab 
}: HeaderProps): React.ReactNode {
  
  const getButtonClass = (isActive: boolean) => `
    w-full flex items-center gap-4 px-5 py-4
    text-[10px] font-black uppercase tracking-[0.2em] 
    rounded-lg border transition-all duration-200 group relative overflow-hidden
    ${isActive 
      ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
      : 'bg-transparent text-slate-500 border-transparent hover:bg-white/[0.04] hover:text-slate-300 hover:border-white/10'
    }
  `;

  const getIconClass = (isActive: boolean) => `
    w-4 h-4 transition-colors duration-200
    ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-600 group-hover:text-emerald-400'}
  `;

  return (
    <div className="flex flex-col gap-12">
      <div className="space-y-5 pb-12 border-b border-white/5 relative">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-500/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <h1 className="text-3xl font-bold text-slate-100 serif-heading leading-tight relative z-10 drop-shadow-2xl">
          Colorado Legal <br/>
          <span className="text-5xl text-transparent bg-clip-text bg-gradient-to-br from-red-600 via-red-500 to-red-900 italic drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] tracking-tight">
            Predator
          </span>
        </h1>
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Tactical Decimation v4.0</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4 px-2 flex items-center gap-3">
           Case Tools
           <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
        </h3>
        
        <nav className="flex flex-col space-y-2">
          <button
            onClick={onAnalyzeDocumentClick}
            className={getButtonClass(activeTab === 'audit')}
          >
            <FileText className={getIconClass(activeTab === 'audit')} />
            Predator Audit
            {activeTab === 'audit' && <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_#ef4444]"></div>}
          </button>

          <button
            onClick={onMotionDraftClick}
            className={getButtonClass(activeTab === 'draft')}
          >
            <FileText className={getIconClass(activeTab === 'draft')} />
            Motion Drafting
            {activeTab === 'draft' && <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
          </button>
          
          <button
            onClick={onJudgeIntelClick}
            className={getButtonClass(activeTab === 'judge_intel')}
          >
            <Scale className={getIconClass(activeTab === 'judge_intel')} />
            JudgeBreaker Intel
            {activeTab === 'judge_intel' && <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div>}
          </button>
          
          <button
            onClick={onCrossReferenceClick}
            className={getButtonClass(false)}
          >
            <Scale className={getIconClass(false)} />
            Cross-Examination
          </button>
          
          <button
            onClick={onNarrativeMapperClick}
            className={getButtonClass(false)}
          >
            <BrainCircuit className={getIconClass(false)} />
            Narrative Mapping
          </button>
        </nav>
      </div>

      <div className="mt-auto pt-10">
        <div className="bg-[#020408] rounded-xl p-6 border border-white/5 relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-red-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Status</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </span>
          </div>
          <p className="text-[9px] font-mono text-slate-500 relative z-10 flex items-center gap-3">
             <span className="w-1 h-1 bg-slate-700 rounded-full"></span> Encrypted • US-West-2
          </p>
        </div>
      </div>
    </div>
  );
}
