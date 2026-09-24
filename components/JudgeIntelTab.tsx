import React, { useState } from 'react';
import { Scale, Search, Users, Sparkles, BookOpen, MessageSquare, ShieldAlert, Award, ArrowUpRight, Zap, Check } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface JudgeIntelTabProps {
  onSearchJudge: (judgeName: string) => void;
}

interface JudgePlaybookProfile {
  id: string;
  name: string;
  court: string;
  division: string;
  color: string;
  metrics: {
    tone: number;           // 0-100 Formality & Deference
    citations: number;      // 0-100 Case law / Statutory density
    oralArgument: number;   // 0-100 Hot bench / Oral engagement
    conciseness: number;    // 0-100 Strict brief length preference
    discoveryStrict: number;// 0-100 Sanctions / Strict discovery
    evidentiaryGate: number;// 0-100 CRE 702 Daubert/Shreck rigor
  };
  keyAdvice: {
    tone: string;
    citations: string;
    oralArgument: string;
    killSwitch: string;
  };
  tags: string[];
}

const COLORADO_JUDGES_PLAYBOOK: JudgePlaybookProfile[] = [
  {
    id: 'starrs',
    name: 'Hon. Elizabeth A. Starrs',
    court: 'Denver District Court',
    division: 'Division 209 (Civil / Complex)',
    color: '#10b981', // Emerald
    metrics: {
      tone: 88,
      citations: 92,
      oralArgument: 95,
      conciseness: 85,
      discoveryStrict: 90,
      evidentiaryGate: 86
    },
    keyAdvice: {
      tone: 'Ultra-formal, high respect for C.R.C.P. decorum. Avoid rhetorical flourishes.',
      citations: 'Prioritizes CO Supreme Court precedents and strict textual contract interpretation.',
      oralArgument: 'Very active questioner. Jump directly to pivotal issues; do not re-read briefs.',
      killSwitch: 'Never file Rule 37 discovery motions without a mandatory 15-min telephone meet & confer.'
    },
    tags: ['Strict Constructionist', 'Active Bench Questioner', 'Procedurally Rigorous']
  },
  {
    id: 'goble',
    name: 'Hon. Renee Goble',
    court: 'Denver County Court',
    division: 'Courtroom 3C (Criminal & Traffic)',
    color: '#f59e0b', // Amber
    metrics: {
      tone: 75,
      citations: 70,
      oralArgument: 88,
      conciseness: 94,
      discoveryStrict: 78,
      evidentiaryGate: 82
    },
    keyAdvice: {
      tone: 'Direct, practical, no-nonsense courtroom management. Respect docket flow.',
      citations: 'Prefers localized Denver Municipal Code and Crim. P. statutory citations over lengthy treatises.',
      oralArgument: 'Fast-paced. State the core relief in the first 30 seconds of oral argument.',
      killSwitch: 'Do not waste time on boilerplate constitutional arguments without direct record foundation.'
    },
    tags: ['Docket Efficiency', 'Practical Pragmatist', 'Concise Advocate']
  },
  {
    id: 'baumann',
    name: 'Hon. Christopher Baumann',
    court: 'Denver District Court',
    division: 'Division 424 (Civil)',
    color: '#06b6d4', // Cyan
    metrics: {
      tone: 82,
      citations: 88,
      oralArgument: 76,
      conciseness: 90,
      discoveryStrict: 85,
      evidentiaryGate: 92
    },
    keyAdvice: {
      tone: 'Analytical and deliberative. Welcomes structured, clear briefing with tables of authority.',
      citations: 'Deep case-law reliance with particular emphasis on 10th Circuit and Colorado Court of Appeals.',
      oralArgument: 'Focused on resolving nuanced legal ambiguities and evidentiary threshold issues.',
      killSwitch: 'Scrutinizes CRE 702 expert methodology heavily; pre-mark all evidentiary exhibits.'
    },
    tags: ['Evidentiary Gatekeeper', 'Analytical Depth', 'Tech-Forward']
  },
  {
    id: 'gerdes',
    name: 'Hon. Kandace Gerdes',
    court: 'Denver District Court',
    division: 'Division 215 (Criminal)',
    color: '#a855f7', // Purple
    metrics: {
      tone: 85,
      citations: 80,
      oralArgument: 90,
      conciseness: 78,
      discoveryStrict: 94,
      evidentiaryGate: 88
    },
    keyAdvice: {
      tone: 'Strict procedural integrity and fair trial protection. Zero tolerance for Brady delays.',
      citations: 'Heavy emphasis on constitutional guarantees and Crim. P. 16 affirmative disclosure rules.',
      oralArgument: 'Demands precise evidentiary timeline from counsel during suppression hearings.',
      killSwitch: 'Late witness disclosure or discovery gamesmanship triggers immediate exclusion orders.'
    },
    tags: ['Procedural Due Process', 'Discovery Strictness', 'Rigorous Record']
  }
];

export default function JudgeIntelTab({ onSearchJudge }: JudgeIntelTabProps) {
  const [query, setQuery] = useState('');
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>(['starrs', 'goble']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchJudge(query.trim());
    }
  };

  const toggleJudgeSelection = (id: string) => {
    if (selectedJudgeIds.includes(id)) {
      if (selectedJudgeIds.length > 1) {
        setSelectedJudgeIds(selectedJudgeIds.filter(j => j !== id));
      }
    } else {
      if (selectedJudgeIds.length < 3) {
        setSelectedJudgeIds([...selectedJudgeIds, id]);
      } else {
        // Replace first
        setSelectedJudgeIds([selectedJudgeIds[1], selectedJudgeIds[2], id]);
      }
    }
  };

  const activeJudges = COLORADO_JUDGES_PLAYBOOK.filter(j => selectedJudgeIds.includes(j.id));

  // Build Radar Chart Data
  const radarData = [
    {
      metric: 'Tone & Formality',
      fullMetric: 'Tone Formality (Court Decorum)',
      ...activeJudges.reduce((acc, j) => ({ ...acc, [j.id]: j.metrics.tone }), {})
    },
    {
      metric: 'Citations & Precedents',
      fullMetric: 'Citation Density (Case Law)',
      ...activeJudges.reduce((acc, j) => ({ ...acc, [j.id]: j.metrics.citations }), {})
    },
    {
      metric: 'Oral Engagement',
      fullMetric: 'Oral Argument Interactivity (Hot Bench)',
      ...activeJudges.reduce((acc, j) => ({ ...acc, [j.id]: j.metrics.oralArgument }), {})
    },
    {
      metric: 'Brief Conciseness',
      fullMetric: 'Conciseness Weight (Page Limits)',
      ...activeJudges.reduce((acc, j) => ({ ...acc, [j.id]: j.metrics.conciseness }), {})
    },
    {
      metric: 'Discovery Rigor',
      fullMetric: 'Discovery Strictness (Rule 37)',
      ...activeJudges.reduce((acc, j) => ({ ...acc, [j.id]: j.metrics.discoveryStrict }), {})
    },
    {
      metric: 'Evidentiary Gatekeeping',
      fullMetric: 'Evidentiary Gatekeeping (CRE 702)',
      ...activeJudges.reduce((acc, j) => ({ ...acc, [j.id]: j.metrics.evidentiaryGate }), {})
    }
  ];

  return (
    <div className="animate-entry space-y-12 max-w-7xl mx-auto w-full pt-6 pb-20">
      {/* Header Search Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
         <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-4">
            <Scale className="w-7 h-7 text-amber-500" />
         </div>
         <h2 className="text-3xl md:text-5xl font-bold serif-heading text-white">
           JudgeBreaker <span className="text-amber-500 italic">Intel</span>
         </h2>
         <p className="text-xs md:text-sm font-mono text-zinc-400 uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
            Extract legitimate communicative leverage, judicial tendencies, and strategic communication playbooks.
         </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto w-full px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-2 flex flex-col md:flex-row md:items-center shadow-2xl focus-within:border-amber-500/50 transition-colors gap-2 md:gap-0">
          <div className="flex items-center w-full md:w-auto flex-grow">
             <div className="pl-4 md:pl-6 pr-3 md:pr-4">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
             </div>
             <input 
               type="text"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Enter judge name (e.g. Judge Renee Goble Colorado, Hon. Elizabeth Starrs)..."
               className="w-full bg-transparent border-none text-base md:text-lg text-white placeholder:text-zinc-600 focus:outline-none py-3 md:py-4 font-sans font-medium"
             />
          </div>
          <button 
            type="submit"
            disabled={!query.trim()}
            className="w-full md:w-auto bg-amber-500 text-amber-950 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl md:ml-auto hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0"
          >
            Extract Intel
          </button>
        </div>
      </form>

      {/* Communication Playbook Radar Chart Section */}
      <div className="space-y-8 pt-6">
        <div className="glass-slab p-8 md:p-12 border-amber-500/20 bg-zinc-900/50 relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="micro-label !text-amber-400 tracking-[0.25em]">
                  COMMUNICATION_PLAYBOOK_RADAR
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Judicial Preference Comparison Matrix
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Compare courtroom preferences across Tone Formality, Case-Law Citations, Oral Argument Style, Brief Conciseness, Discovery Rigor, and Evidentiary Gatekeeping.
              </p>
            </div>

            {/* Multi-Judge Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Select to compare (max 3):</span>
              {COLORADO_JUDGES_PLAYBOOK.map((j) => {
                const isSelected = selectedJudgeIds.includes(j.id);
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => toggleJudgeSelection(j.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'border-white/40 text-white shadow-lg'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${j.color}25` : undefined,
                      borderColor: isSelected ? j.color : undefined,
                      color: isSelected ? j.color : undefined
                    }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: j.color }}
                    />
                    <span>{j.name.replace('Hon. ', '')}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radar Chart & Side Strategy Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Radar Chart Visualizer */}
            <div className="lg:col-span-6 h-[380px] md:h-[420px] w-full bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#64748b', fontSize: 9 }} 
                  />
                  {activeJudges.map((j) => (
                    <Radar
                      key={j.id}
                      name={j.name}
                      dataKey={j.id}
                      stroke={j.color}
                      fill={j.color}
                      fillOpacity={0.25}
                      strokeWidth={2.5}
                    />
                  ))}
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                            <span className="font-bold text-white block mb-1 border-b border-white/10 pb-1">{label}</span>
                            {payload.map((p: any) => {
                              const jObj = activeJudges.find(j => j.id === p.dataKey);
                              return (
                                <div key={p.dataKey} className="flex items-center justify-between gap-4 font-mono">
                                  <span style={{ color: p.stroke }}>{jObj?.name.replace('Hon. ', '')}:</span>
                                  <span className="font-bold text-white">{p.value}/100</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Selected Judges Tactical Playbook Summary */}
            <div className="lg:col-span-6 space-y-4">
              {activeJudges.map((j) => (
                <div 
                  key={j.id} 
                  className="bg-black/40 border border-white/5 hover:border-white/15 rounded-2xl p-5 space-y-3 transition-all"
                  style={{ borderLeftColor: j.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{j.name}</h4>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{j.court}</span>
                      </div>
                      <span className="text-xs text-zinc-400 font-light">{j.division}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSearchJudge(j.name)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono shrink-0"
                      title="Open full profile"
                    >
                      <span>Full Intel</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block mb-0.5 flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5 text-amber-400" />
                        Tone &amp; Oral Argument
                      </span>
                      <p className="text-slate-300 text-[11px] leading-snug">{j.keyAdvice.oralArgument}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block mb-0.5 flex items-center gap-1">
                        <BookOpen className="w-2.5 h-2.5 text-cyan-400" />
                        Citations &amp; Briefing
                      </span>
                      <p className="text-slate-300 text-[11px] leading-snug">{j.keyAdvice.citations}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/20 text-xs">
                    <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block mb-0.5 flex items-center gap-1">
                      <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                      Tactical Kill-Switch Warning
                    </span>
                    <p className="text-amber-200 text-[11px] leading-snug">{j.keyAdvice.killSwitch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
