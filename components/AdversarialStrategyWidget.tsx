
import React from 'react';
import { type AdversarialStrategy } from '../types';
import { AlertTriangle, Loader2, BrainCircuit } from 'lucide-react';

interface AdversarialStrategyWidgetProps {
  strategy?: AdversarialStrategy;
  isLoading?: boolean;
}

export default function AdversarialStrategyWidget({ strategy, isLoading }: AdversarialStrategyWidgetProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="glass-slab p-20 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500/40" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Running_Neural_Simulation...</span>
      </div>
    );
  }

  const prosecutorMoves = strategy?.prosecutorMoves || [];
  const defenseCounters = strategy?.defenseCounters || [];
  const hiddenRisks = strategy?.hiddenRisks || [];

  if (!strategy || (!prosecutorMoves.length && !defenseCounters.length)) return null;

  return (
    <div className="glass-slab p-8 md:p-12 relative overflow-hidden dashboard-grid">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8 border-b border-white/5 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl shadow-lg">
            <BrainCircuit className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Adversarial_Matrix</h3>
            <span className="micro-label !text-slate-500 mt-2 block">Decision_Modeling_v4.2</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-3 text-red-400 font-black text-[10px] tracking-widest uppercase rounded-lg">
          <AlertTriangle className="w-4 h-4" /> Threat_Level: Significant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
        {/* Aggressor Logic (Prosecution) */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-l-4 border-red-500 pl-6">
            <h4 className="micro-label !text-red-500">Opponent_Maneuvers</h4>
          </div>
          <ul className="space-y-6">
            {prosecutorMoves.map((move, i) => (
              <li key={i} className="flex gap-4 group p-4 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-all">
                <span className="text-red-500/30 font-mono text-xs font-black mt-1">0{i+1}</span>
                <p className="text-lg text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors italic">
                  {move}
                </p>
              </li>
            ))}
            {prosecutorMoves.length === 0 && (
              <li className="text-slate-600 text-sm italic py-4">No aggressive maneuvers predicted.</li>
            )}
          </ul>
        </div>

        {/* Tactical Counters (Defense) */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-6">
            <h4 className="micro-label !text-blue-500">Defense_Protocols</h4>
          </div>
          <ul className="space-y-6">
            {defenseCounters.map((counter, i) => (
              <li key={i} className="flex gap-4 group bg-blue-500/5 p-6 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all shadow-xl">
                <span className="text-blue-500/30 font-mono text-xs font-black mt-1">0{i+1}</span>
                <p className="text-xl text-white leading-relaxed font-bold italic tracking-tight glow-text-blue">
                  {counter}
                </p>
              </li>
            ))}
            {defenseCounters.length === 0 && (
              <li className="text-slate-600 text-sm italic py-4">No defensive counters established.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Strategic Anomalies */}
      <div className="mt-16 p-8 glass-widget !bg-white/[0.01] border-dashed">
        <div className="flex items-center gap-4 mb-8">
            <span className="h-px flex-grow bg-white/5"></span>
            <h4 className="micro-label !text-slate-600">Predicted_System_Risks</h4>
            <span className="h-px flex-grow bg-white/5"></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hiddenRisks.map((risk, i) => (
            <div key={i} className="flex gap-4 group items-start">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-red-500/50 mt-2 transition-colors"></div>
               <p className="text-[11px] text-slate-500 font-medium italic group-hover:text-slate-300 transition-colors leading-relaxed">{risk}</p>
            </div>
          ))}
          {hiddenRisks.length === 0 && (
            <div className="col-span-full text-center text-[10px] text-slate-600 uppercase font-black tracking-widest">No latent system risks identified.</div>
          )}
        </div>
      </div>
    </div>
  );
}
