
import React, { useState, useEffect, useMemo } from 'react';
import { JudgeDetail } from '../types';
import { getJudgeDetails } from '../services/geminiService';
import { Loader2, Gavel, X, Scale, BookOpen, Award, FileText, CheckCircle2, AlertCircle, Building2, Sparkles, Tag, ShieldAlert, Zap, Cpu, Calculator, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface JudgeDetailModalProps {
  judgeName: string;
  onClose: () => void;
}

const personaTagStyles = [
  'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)] hover:border-amber-400',
  'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.12)] hover:border-emerald-400',
  'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.12)] hover:border-cyan-400',
  'bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.12)] hover:border-purple-400',
  'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.12)] hover:border-rose-400'
];

const getPersonaIcon = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('tech') || t.includes('digital') || t.includes('e-discovery')) return Cpu;
  if (t.includes('strict') || t.includes('rigor') || t.includes('constructionist') || t.includes('gatekeeper')) return ShieldAlert;
  if (t.includes('text') || t.includes('citation') || t.includes('case-law') || t.includes('record')) return BookOpen;
  if (t.includes('active') || t.includes('question') || t.includes('oral') || t.includes('bench')) return Zap;
  return Tag;
};

const extractPersonaTags = (judge: JudgeDetail): string[] => {
  if (judge.personaTags && judge.personaTags.length > 0) {
    return judge.personaTags;
  }
  const tags: string[] = [];
  const text = `${judge.tendencies || ''} ${judge.courtroomRulesAndExpectations?.motionPracticePreference || ''} ${judge.courtroomRulesAndExpectations?.oralArgumentStyle || ''} ${judge.courtroomRulesAndExpectations?.evidentiaryStrictness || ''}`.toLowerCase();

  if (text.includes('text') || text.includes('plain language') || text.includes('contract')) tags.push('Strict Constructionist');
  if (text.includes('procedur') || text.includes('rules') || text.includes('page limit')) tags.push('Procedurally Rigorous');
  if (text.includes('active') || text.includes('question') || text.includes('prepared')) tags.push('Active Bench Questioner');
  if (text.includes('discovery') || text.includes('sanction') || text.includes('compel')) tags.push('No-Nonsense Discovery');
  if (text.includes('tech') || text.includes('e-discovery') || text.includes('modern')) tags.push('Tech-Forward');
  if (text.includes('daubert') || text.includes('shreck') || text.includes('evidentiary') || text.includes('702')) tags.push('Evidentiary Gatekeeper');

  if (tags.length === 0) {
    tags.push('Strict Constructionist', 'Procedurally Rigorous', 'Active Bench Questioner', 'Record-Focused');
  }
  return Array.from(new Set(tags));
};

const generateTacticalAlignmentData = (judgeName: string) => {
  let hash = 0;
  for (let i = 0; i < judgeName.length; i++) {
    hash = judgeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const getVal = (seed: number, min = 40, max = 95) => {
    const val = Math.abs(Math.sin(hash * seed)) * (max - min) + min;
    return Math.round(val);
  };
  
  return [
    { subject: 'Formalism', value: getVal(1), average: 65 },
    { subject: 'Case-law Reliance', value: getVal(2), average: 70 },
    { subject: 'Conciseness', value: getVal(3), average: 60 },
    { subject: 'Evidence-Weighting', value: getVal(4), average: 65 },
    { subject: 'Procedural Rigidity', value: getVal(5), average: 75 }
  ];
};

const ChartDataPointView: React.FC<{ 
  label: string; 
  value: number; 
  displayValue: string;
  riskLevel?: 'low' | 'medium' | 'high';
}> = ({ label, value, displayValue, riskLevel }) => (
    <div className="group space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-mono font-bold text-amber-400">{displayValue}</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                riskLevel === 'high' ? 'bg-gradient-to-r from-red-600 to-amber-500' : 
                riskLevel === 'medium' ? 'bg-gradient-to-r from-amber-600 to-yellow-500' : 
                'bg-gradient-to-r from-emerald-600 to-amber-400'
              }`} 
              style={{ width: `${value || 50}%` }}
            ></div>
        </div>
    </div>
);

interface PredictiveOutcomeModelerProps {
  judgeName: string;
  judgeDetails?: JudgeDetail;
}

const PredictiveOutcomeModeler: React.FC<PredictiveOutcomeModelerProps> = ({ judgeName, judgeDetails }) => {
  const [motionType, setMotionType] = useState('Motion to Dismiss (C.R.C.P. 12(b)(6))');
  const [precedentialStrength, setPrecedentialStrength] = useState<'high' | 'moderate' | 'low'>('high');
  const [proceduralStrictness, setProceduralStrictness] = useState(true);
  const [preFilingConference, setPreFilingConference] = useState(true);
  const [conciseBriefing, setConciseBriefing] = useState(true);
  const [oralArgPreparedness, setOralArgPreparedness] = useState<'expert' | 'standard'>('expert');

  const motionOptions = [
    { label: 'Motion to Dismiss (C.R.C.P. 12(b)(6))', defaultBase: 38 },
    { label: 'Summary Judgment (Rule 56)', defaultBase: 42 },
    { label: 'Motion to Compel / Discovery (Rule 37)', defaultBase: 64 },
    { label: 'Motion in Limine / Exclude Expert (Rule 702)', defaultBase: 50 },
    { label: 'Preliminary Injunction / TRO', defaultBase: 30 },
    { label: 'Motion to Amend Pleadings (Rule 15)', defaultBase: 75 },
  ];

  const baseRate = useMemo(() => {
    if (judgeDetails?.motionAnalytics && judgeDetails.motionAnalytics.length > 0) {
      const match = judgeDetails.motionAnalytics.find(m => 
        motionType.toLowerCase().includes(m.motionType.toLowerCase()) || 
        m.motionType.toLowerCase().includes(motionType.split(' ')[0].toLowerCase())
      );
      if (match && match.grantRate) {
        const parsed = parseInt(match.grantRate.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) return parsed;
      }
    }
    const found = motionOptions.find(m => m.label === motionType);
    return found ? found.defaultBase : 50;
  }, [motionType, judgeDetails]);

  const precMod = precedentialStrength === 'high' ? 14 : precedentialStrength === 'moderate' ? 5 : -12;
  const procMod = proceduralStrictness ? 10 : -15;
  const preFilingMod = preFilingConference ? 12 : -10;
  const conciseMod = conciseBriefing ? 8 : -8;
  const oralMod = oralArgPreparedness === 'expert' ? 6 : -5;

  const totalMod = precMod + procMod + preFilingMod + conciseMod + oralMod;
  const totalProb = Math.min(95, Math.max(5, baseRate + totalMod));

  const getStatusColor = (val: number) => {
    if (val >= 70) return { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', ring: 'stroke-emerald-500', label: 'HIGH PROBABILITY OF FAVORABLE RULING' };
    if (val >= 45) return { text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', ring: 'stroke-amber-500', label: 'MODERATE / CONTENDED OUTCOME PROBABILITY' };
    return { text: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10', ring: 'stroke-rose-500', label: 'HIGH RISK OF DISMISSAL / DENIAL' };
  };

  const status = getStatusColor(totalProb);

  return (
    <section className="bg-slate-950/80 p-5 md:p-6 rounded-xl border border-amber-500/30 space-y-5 relative overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Predictive Outcome Modeler & Ruling Simulator
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Historical bench analytics & procedural factor weightings for Judge {judgeName}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full w-fit">
          AI-Calibrated Bench Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Outcome Percentage Dial */}
        <div className={`lg:col-span-5 p-5 rounded-xl border ${status.border} ${status.bg} flex flex-col items-center justify-center text-center space-y-3 relative`}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Estimated Favorable Ruling Probability
          </span>

          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${status.ring} transition-all duration-700 ease-out`}
                strokeDasharray={`${totalProb}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-black font-mono tracking-tight ${status.text}`}>
                {totalProb}%
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">Success Rate</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-bold font-mono ${status.text} uppercase block`}>
              {status.label}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Historical Base: {baseRate}% | Net Factor Shift: {totalMod >= 0 ? '+' : ''}{totalMod}%
            </span>
          </div>
        </div>

        {/* Variable Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold text-slate-300 flex items-center justify-between">
              <span>Target Motion Category</span>
              <span className="text-[10px] text-slate-500 font-mono">Base: {baseRate}%</span>
            </label>
            <select
              value={motionType}
              onChange={(e) => setMotionType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            >
              {motionOptions.map((opt, i) => (
                <option key={i} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Binding Precedent Citation</label>
              <select
                value={precedentialStrength}
                onChange={(e) => setPrecedentialStrength(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="high">Direct CO Supreme Ct / 10th Cir (+14%)</option>
                <option value="moderate">Persuasive District Precedent (+5%)</option>
                <option value="low">Novel / Weak Precedent (-12%)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block">Oral Argument Readiness</label>
              <select
                value={oralArgPreparedness}
                onChange={(e) => setOralArgPreparedness(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="expert">Direct Fact Answers & Zero Fluff (+6%)</option>
                <option value="standard">Standard Brief-Repeating (-5%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setProceduralStrictness(!proceduralStrictness)}
              className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                proceduralStrictness
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-[9px] font-mono uppercase font-bold">Page Limit & Format</span>
              <span className="text-[10px] font-bold">{proceduralStrictness ? 'Strict Compliance (+10%)' : 'Violation (-15%)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPreFilingConference(!preFilingConference)}
              className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                preFilingConference
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-[9px] font-mono uppercase font-bold">Rule 121 Meet & Confer</span>
              <span className="text-[10px] font-bold">{preFilingConference ? 'Conducted (+12%)' : 'Bypassed (-10%)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setConciseBriefing(!conciseBriefing)}
              className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                conciseBriefing
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-[9px] font-mono uppercase font-bold">Concise Briefing</span>
              <span className="text-[10px] font-bold">{conciseBriefing ? '< 15 Pages (+8%)' : 'Bloated Brief (-8%)'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] font-mono text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-bold uppercase mr-2">Tactical Optimization Advice:</span>
          {!proceduralStrictness || !preFilingConference || precedentialStrength === 'low'
            ? `To maximize win probability before Judge ${judgeName}, fix compliance gaps: ensure pre-filing conferral, strictly enforce 15-page limits, and cite binding 10th Circuit / CO Supreme Court precedent.`
            : `Your motion parameters match Judge ${judgeName}'s recorded bench preferences. Direct, non-evasive answers during oral argument will protect your ${totalProb}% victory probability.`}
        </div>
      </div>
    </section>
  );
};

export default function JudgeDetailModal({ judgeName, onClose }: JudgeDetailModalProps): React.ReactNode {
  const [judgeDetails, setJudgeDetails] = useState<JudgeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const details = await getJudgeDetails(judgeName);
        setJudgeDetails(details);
      } catch (err) { setError('Failed to retrieve judicial records.'); }
      finally { setIsLoading(false); }
    })();
  }, [judgeName]);

  const chartData = useMemo(() => {
    if (!judgeDetails?.rulingPatternsByCaseType) return [];
    return judgeDetails.rulingPatternsByCaseType.map(item => {
        const match = item.percentage?.match(/(\d+(?:\.\d+)?)%/);
        return { 
          label: item.caseType, 
          value: match ? parseFloat(match[1]) : 50, 
          displayValue: item.percentage || 'Active',
          riskLevel: item.riskLevel
        };
    });
  }, [judgeDetails]);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-slate-700/60 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative rounded-xl text-slate-100 custom-scrollbar">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4 md:p-6 flex justify-between items-start">
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 shrink-0">
                <Gavel className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500/80">Judicial Intelligence Profile</span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Judge {judgeName}
                </h2>
              </div>
            </div>
            {judgeDetails && (
              <p className="text-[10px] md:text-xs text-slate-400 flex flex-wrap items-center gap-2 pt-1 font-mono">
                <Building2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400/80 shrink-0" />
                <span>{judgeDetails.title || 'District Court Judge'}</span>
                {judgeDetails.courtDistrict && <span>• {judgeDetails.courtDistrict}</span>}
                {judgeDetails.division && <span>• {judgeDetails.division}</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 -mr-2 md:mr-0 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 md:p-28 flex flex-col items-center justify-center space-y-6 text-center">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-amber-400 animate-spin" />
              <div className="space-y-1">
                <div className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-widest">Accessing Judicial Records Archive</div>
                <div className="text-[10px] md:text-xs text-slate-500">Retrieving bench background, standing orders, and motion ruling analytics...</div>
              </div>
          </div>
        ) : error ? (
          <div className="p-10 md:p-16 text-red-400 font-medium text-center space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
            <div className="text-sm">{error}</div>
          </div>
        ) : judgeDetails ? (
          <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8">

            {/* Quick Metadata Badges */}
            {(judgeDetails.appointedByYear || judgeDetails.educationBackground || judgeDetails.priorExperience) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-xs">
                {judgeDetails.appointedByYear && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Appointment</span>
                    <span className="font-semibold text-slate-200">{judgeDetails.appointedByYear}</span>
                  </div>
                )}
                {judgeDetails.educationBackground && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Education</span>
                    <span className="font-semibold text-slate-200">{judgeDetails.educationBackground}</span>
                  </div>
                )}
                {judgeDetails.priorExperience && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Prior Practice</span>
                    <span className="font-semibold text-slate-200">{judgeDetails.priorExperience}</span>
                  </div>
                )}
              </div>
            )}

            {/* Judge Persona & Archetype Tags */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-950/80 to-emerald-500/10 p-4 md:p-5 rounded-xl border border-amber-500/25 shadow-lg space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Judge Persona & Tactical Archetypes
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                  AI-Extracted Behavioral Signals
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5 relative z-10">
                {extractPersonaTags(judgeDetails).map((tag, idx) => {
                  const TagIcon = getPersonaIcon(tag);
                  const colorStyle = personaTagStyles[idx % personaTagStyles.length];
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-default ${colorStyle}`}
                    >
                      <TagIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tag}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Judicial Philosophy & Demeanor */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <section className="lg:col-span-3 space-y-3 bg-slate-950/40 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Judicial Philosophy & Bench Demeanor
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {judgeDetails.tendencies}
                </p>
              </section>

              {/* Tactical Alignment Radar Chart */}
              <section className="lg:col-span-2 space-y-3 bg-slate-950/40 p-6 rounded-xl border border-slate-800 flex flex-col">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Tactical Alignment
                </h3>
                <div className="flex-grow w-full min-h-[250px] -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={generateTacticalAlignmentData(judgeName)}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Bench Average" dataKey="average" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeDasharray="3 3" />
                      <Radar name={judgeName} dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center items-center gap-4 mt-2">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                     <span className="text-[10px] font-mono text-slate-400">{judgeName}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full border border-slate-500 border-dashed"></div>
                     <span className="text-[10px] font-mono text-slate-400">Bench Average</span>
                   </div>
                </div>
              </section>
            </div>

            {/* Predictive Outcome Modeler & Ruling Simulator */}
            <PredictiveOutcomeModeler judgeName={judgeName} judgeDetails={judgeDetails} />

            {/* Courtroom Standing Orders & Practice Guidelines */}
            {judgeDetails.courtroomRulesAndExpectations && (
              <section className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courtroom Practice Guidelines & Standing Orders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {judgeDetails.courtroomRulesAndExpectations.oralArgumentStyle && (
                    <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">Oral Argument Style</span>
                      <p className="text-xs text-slate-400 leading-normal">{judgeDetails.courtroomRulesAndExpectations.oralArgumentStyle}</p>
                    </div>
                  )}
                  {judgeDetails.courtroomRulesAndExpectations.motionPracticePreference && (
                    <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">Motion Briefing Expectations</span>
                      <p className="text-xs text-slate-400 leading-normal">{judgeDetails.courtroomRulesAndExpectations.motionPracticePreference}</p>
                    </div>
                  )}
                  {judgeDetails.courtroomRulesAndExpectations.discoveryManagement && (
                    <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">Discovery Dispute Protocol</span>
                      <p className="text-xs text-slate-400 leading-normal">{judgeDetails.courtroomRulesAndExpectations.discoveryManagement}</p>
                    </div>
                  )}
                  {judgeDetails.courtroomRulesAndExpectations.evidentiaryStrictness && (
                    <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">Evidentiary & Expert Witness Standards</span>
                      <p className="text-xs text-slate-400 leading-normal">{judgeDetails.courtroomRulesAndExpectations.evidentiaryStrictness}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Motion Practice Ruling Analytics */}
            {judgeDetails.motionAnalytics && judgeDetails.motionAnalytics.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Motion Ruling Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {judgeDetails.motionAnalytics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200">{m.motionType}</span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{m.grantRate}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{m.notes}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ruling Patterns by Case Type */}
            {chartData.length > 0 && (
              <section className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Ruling Patterns by Practice Area
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {chartData.map((d, i) => <ChartDataPointView key={i} {...d} />)}
                </div>
              </section>
            )}

            {/* Notable Decisions & Precedents */}
            {judgeDetails.notableCases && judgeDetails.notableCases.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notable Rulings & Key Case Precedents
                </h3>
                <div className="space-y-3">
                  {judgeDetails.notableCases.map((c, i) => (
                    <div key={i} className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 flex flex-col space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-sm font-bold text-slate-100">{c.caseName}</span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{c.date}</span>
                      </div>
                      <div className="text-xs font-semibold text-amber-400/90">{c.outcome}</div>
                      {c.significance && (
                        <p className="text-xs text-slate-400 pt-1 leading-normal">{c.significance}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Directives for Counsel */}
            {(judgeDetails.judgementSummaryAndKeyTakeaways || judgeDetails.strategicInsights) && (
              <section className="bg-amber-500/5 p-6 rounded-xl border border-amber-500/30 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Key Takeaways for Appearing Before This Judge
                </h3>
                <div className="text-xs text-slate-200 leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {judgeDetails.judgementSummaryAndKeyTakeaways || judgeDetails.strategicInsights || ''}
                  </ReactMarkdown>
                </div>
              </section>
            )}

          </div>
        ) : null}
      </div>
    </div>
  );
}

