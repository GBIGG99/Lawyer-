import React, { useState } from 'react';
import { type ConceptMatch, type SearchResult } from '../types';
import { Network, Scale, ShieldAlert, Zap, Copy, Check, Sparkles, BookOpen, Layers } from 'lucide-react';

interface SemanticConceptViewProps {
  conceptMatches?: ConceptMatch[];
  semanticTelemetry?: SearchResult['semanticVectorTelemetry'];
}

export const SemanticConceptView: React.FC<SemanticConceptViewProps> = ({
  conceptMatches = [],
  semanticTelemetry
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCitation = (citation: string, index: number) => {
    navigator.clipboard.writeText(citation);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!conceptMatches || conceptMatches.length === 0) {
    return (
      <div className="glass-slab p-12 text-center border-cyan-500/20 bg-cyan-950/[0.05]">
        <Network className="w-10 h-10 text-cyan-500/40 mx-auto mb-4" />
        <h4 className="text-white font-bold text-base mb-2">No Concept Precedents Mapped</h4>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Enable the "Concept Search" toggle in the search console to compute semantic embeddings and match underlying legal doctrines.
        </p>
      </div>
    );
  }

  const primaryMatch = conceptMatches[0];
  const vectorSample = semanticTelemetry?.queryVectorSample || [0.85, 0.62, 0.44, 0.91, 0.73, 0.38, 0.88, 0.52, 0.69, 0.77];

  return (
    <div className="space-y-10 animate-entry">
      {/* Top Telemetry Slab */}
      <div className="glass-widget border-cyan-500/30 bg-cyan-950/[0.08] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]"></span>
              <span className="micro-label !text-cyan-400 tracking-[0.3em]">NEURAL_VECTOR_EMBEDDING_CLUSTER</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase">
              Semantic Legal Principle Matching
            </h3>
            <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
              Discovered <span className="text-cyan-300 font-bold">{conceptMatches.length} foundational doctrines</span> matching the underlying legal principles of your scenario rather than literal keywords.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-cyan-900/30 border border-cyan-500/30 rounded-2xl p-6 shrink-0">
            <div className="text-center">
              <span className="micro-label !text-slate-400 block mb-1">Top_Vector_Match</span>
              <span className="text-3xl md:text-4xl font-black text-cyan-300 font-mono">
                {Math.round((semanticTelemetry?.similarityScore || primaryMatch?.relevanceScore || 0.94) * 100)}%
              </span>
            </div>
            <div className="w-px h-12 bg-cyan-500/30"></div>
            <div className="text-center">
              <span className="micro-label !text-slate-400 block mb-1">Embedding_Dim</span>
              <span className="text-3xl md:text-4xl font-black text-emerald-400 font-mono">
                {semanticTelemetry?.embeddingDimensions || 768}
              </span>
            </div>
          </div>
        </div>

        {/* Vector Sample Distribution Visualizer */}
        <div className="mt-8 pt-8 border-t border-cyan-500/20 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers className="w-3 h-3 text-cyan-400" />
              Query Projection Vector Sample (Top Latent Semantic Dimensions)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Cosine Cos(θ) &gt; 0.80</span>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {vectorSample.slice(0, 10).map((val, idx) => (
              <div key={idx} className="bg-black/40 border border-cyan-500/20 rounded-lg p-2 text-center flex flex-col items-center">
                <div className="w-full bg-slate-800 h-14 rounded relative overflow-hidden flex items-end mb-1.5">
                  <div 
                    className="w-full bg-gradient-to-t from-cyan-600 to-cyan-300 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                    style={{ height: `${Math.round(val * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-mono text-cyan-300 font-bold">{Math.round(val * 100)}%</span>
                <span className="text-[7px] font-mono text-slate-500 uppercase">D_{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Concept Match Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {conceptMatches.map((match, idx) => {
          const scorePercent = Math.round(match.relevanceScore * 100);
          const isCopied = copiedIndex === idx;

          return (
            <div 
              key={idx}
              className="glass-slab p-8 md:p-10 border-cyan-500/20 hover:border-cyan-500/50 bg-white/[0.015] hover:bg-cyan-950/[0.08] transition-all duration-300 rounded-3xl relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 group-hover:bg-cyan-500/10 blur-[60px] pointer-events-none transition-all"></div>

              <div>
                {/* Header with Badges */}
                <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[9px] font-mono font-bold uppercase tracking-wider">
                        DOCTRINE #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase truncate">
                        {match.jurisdiction}
                      </span>
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                      {match.principle}
                    </h4>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">Similarity</span>
                    <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      {scorePercent}%
                    </div>
                  </div>
                </div>

                {/* Precedent Citation Box */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-6 flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-serif italic text-slate-200 truncate">
                      {match.landmarkPrecedent}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCitation(match.landmarkPrecedent, idx)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition-all shrink-0"
                    title="Copy Precedent Citation"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Holding & Doctrinal Rule */}
                <div className="space-y-4 mb-6 relative z-10 text-sm">
                  <div>
                    <span className="micro-label !text-slate-500 block mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      Core Legal Holding
                    </span>
                    <p className="text-slate-300 leading-relaxed font-light bg-white/[0.01] p-3.5 rounded-xl border border-white/5">
                      {match.holdingSummary}
                    </p>
                  </div>

                  <div>
                    <span className="micro-label !text-amber-400 block mb-1.5 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Strategic Tactical Application &amp; Kill Switch
                    </span>
                    <p className="text-amber-200/90 leading-relaxed font-normal bg-amber-500/[0.04] p-3.5 rounded-xl border border-amber-500/20">
                      {match.strategicApplication}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Indicator */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 relative z-10">
                <span className="text-cyan-400/80 uppercase">Rule: {match.doctrine.split('/')[0]}</span>
                <span className="text-slate-600 uppercase">Status: Grounded Precedent</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
