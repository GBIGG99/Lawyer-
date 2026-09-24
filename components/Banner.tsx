
import React from 'react';

export default function Banner(): React.ReactNode {
  return (
    <div className="mx-auto pt-6 px-6 max-w-6xl w-full z-50 animate-entry">
      <div className="bg-zinc-900/40 backdrop-blur-xl py-2.5 px-6 flex justify-between items-center relative overflow-hidden rounded-full border border-emerald-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[9px] font-black tracking-[0.3em] text-zinc-500 uppercase">
            AI Core Status: <span className="text-emerald-400">ACTIVE_REASONING_v5.0</span>
          </span>
        </div>
        <div className="hidden md:flex gap-8 relative z-10">
           <div className="flex items-center gap-3">
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none">Security</span>
              <span className="text-[9px] font-mono text-emerald-500/80 font-bold uppercase tracking-widest">Encrypted</span>
           </div>
           <div className="w-px h-3 bg-zinc-800"></div>
           <div className="flex items-center gap-3">
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none">Latency</span>
              <span className="text-[9px] font-mono text-zinc-400">12ms</span>
           </div>
        </div>
      </div>
    </div>
  );
}
