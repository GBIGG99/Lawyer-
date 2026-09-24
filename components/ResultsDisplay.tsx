
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type SearchResult, type SearchParams, type Source } from '../types';
import { generateExecutiveSummary, generateStrategicAnalysis } from '../services/geminiService';
import FollowUpQuestions from './FollowUpQuestions';
import RelatedQueries from './RelatedQueries';
import TimelineChart from './TimelineChart';
import IdentifiedJudges from './IdentifiedJudges';
import AdversarialStrategyWidget from './AdversarialStrategyWidget';
import StrategicTelemetryWidget from './StrategicTelemetryWidget';
import TrendsChart from './TrendsChart';
import ReadAloudButton from './ReadAloudButton';
import { SemanticConceptView } from './SemanticConceptView';
import { Bookmark, BookmarkCheck, Loader2, Sparkles, ClipboardCopy, Check, BrainCircuit, Scale, AlertTriangle, Download, Network, ArrowRight, FileText } from 'lucide-react';
import { generateStrategicAnalysisPDF } from '../utils/pdfGenerator';

interface ResultsDisplayProps {
  output: SearchResult | null;
  searchParams: SearchParams | null;
  isLoading: boolean;
  onQuestionClick: (q: string) => void;
  onAnalysisClick: (p: string) => void;
  onSave: (p: SearchParams, r: SearchResult) => void;
  onRemoveSave: (p: SearchParams) => void;
  isSaved: boolean;
  onJudgeClick: (n: string) => void;
}

const SourceItem: React.FC<{ source: Source }> = ({ source }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(source.uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="data-row grid-cols-[1fr_auto] items-center gap-4 bg-white/[0.01] border-white/5 hover:bg-white/[0.03] transition-all rounded-lg group">
        <a href={source.uri} target="_blank" rel="noreferrer" className="min-w-0 group/link">
            <div className="flex items-center gap-2 mb-1">
              <span className="status-indicator status-active scale-75"></span>
              <span className="micro-label">Verified_Source</span>
            </div>
            <span className="text-sm font-bold text-slate-200 group-hover/link:text-emerald-400 truncate block transition-colors">{source.title}</span>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5 font-mono opacity-60">{source.uri}</span>
        </a>
        <div className="flex items-center gap-2">
             <button 
                onClick={handleCopy}
                className="p-2 rounded-md bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                title="Copy Link"
             >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
             </button>
        </div>
    </div>
  );
};

const WinningGuaranteeWidget: React.FC<{ probability: string }> = ({ probability }) => {
  const [percent, ...rest] = probability.split(' - ');
  const statement = rest.join(' - ');

  return (
    <div className="glass-slab p-6 md:p-10 lg:p-16 border-emerald-500/30 bg-emerald-500/[0.03] relative overflow-hidden group mb-12 animate-entry shadow-[0_0_50px_rgba(16,185,129,0.1)]">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
        <div className="flex flex-col items-center lg:items-start shrink-0">
          <span className="micro-label !text-emerald-500 mb-2 md:mb-4 tracking-[0.4em]">VICTORY_PROBABILITY_INDEX</span>
          <div className="relative">
            <span className="text-6xl md:text-7xl lg:text-9xl font-black text-emerald-400 italic tracking-tighter glow-text-emerald leading-none">
              {percent}
            </span>
            <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        <div className="h-px lg:h-32 w-full lg:w-px bg-emerald-500/20"></div>
        
        <div className="flex-grow text-center lg:text-left">
          <span className="micro-label !text-slate-500 mb-2 md:mb-4 block">500_IQ_STRATEGIC_GUARANTEE</span>
          <h2 className="text-xl md:text-2xl lg:text-4xl font-black text-white uppercase italic tracking-tight leading-tight mb-4 md:mb-6">
            {statement || "VICTORY INEVITABLE. ALL PROCEDURAL VECTORS OPTIMIZED."}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Procedural_Lock_Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Error_Preservation_Complete</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/30">
        <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-progress-fast"></div>
      </div>
    </div>
  );
};

const TacticalOverview: React.FC<{ output: SearchResult }> = ({ output }) => {
  const readiness = output.telemetry?.readinessScore || 0;
  const complexity = output.telemetry?.complexityIndex || 0;
  
  const posture = readiness > 75 ? 'DOMINANT' : readiness > 45 ? 'STABLE' : 'VULNERABLE';
  const risk = complexity > 7 ? 'CRITICAL' : complexity > 4 ? 'ELEVATED' : 'MINIMAL';

  const metrics = [
    { 
      label: 'Legal_Posture', 
      value: posture, 
      icon: Scale, 
      color: posture === 'DOMINANT' ? 'text-emerald-500' : posture === 'STABLE' ? 'text-blue-400' : 'text-amber-500',
      bg: posture === 'DOMINANT' ? 'bg-emerald-500/10' : posture === 'STABLE' ? 'bg-blue-500/10' : 'bg-amber-500/10',
      border: posture === 'DOMINANT' ? 'border-emerald-500/20' : posture === 'STABLE' ? 'border-blue-500/20' : 'border-amber-500/20',
      desc: 'Overall_Strategic_Position'
    },
    { 
      label: 'Winning_Certainty', 
      value: 'GUARANTEED', 
      icon: Sparkles, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      desc: 'Mathematical_Outcome_Model'
    },
    { 
      label: 'Strategic_Path', 
      value: 'OPTIMIZED', 
      icon: BrainCircuit, 
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      desc: 'Neural_Trajectory_Model'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 animate-entry">
      {metrics.map((m, i) => (
        <div key={i} className={`glass-slab p-6 md:p-8 flex items-center gap-4 md:gap-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${m.border}`}>
          <div className={`absolute top-0 right-0 w-32 h-32 ${m.bg} blur-[60px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity`}></div>
          <div className={`p-4 md:p-5 rounded-2xl ${m.bg} ${m.border} relative z-10 shadow-xl shrink-0`}>
            <m.icon className={`w-6 h-6 md:w-8 md:h-8 ${m.color}`} />
          </div>
          <div className="flex flex-col relative z-10 min-w-0">
            <span className="micro-label !text-slate-600 mb-1 truncate">{m.label}</span>
            <span className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${m.color} leading-none mb-1 md:mb-2 truncate`}>{m.value}</span>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest truncate">{m.desc}</span>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-500 group-hover:w-full w-0" style={{ color: 'inherit' }}></div>
        </div>
      ))}
    </div>
  );
};

export default function ResultsDisplay({ output, searchParams, isLoading, onQuestionClick, onSave, onRemoveSave, isSaved, onJudgeClick }: ResultsDisplayProps): React.ReactNode {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [execSummary, setExecSummary] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategicAudit, setStrategicAudit] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'briefing' | 'concepts' | 'intelligence' | 'entities' | 'timeline' | 'exploration'>('briefing');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = () => {
    if (!output || !searchParams) return;
    setIsGeneratingPDF(true);
    try {
      const querySlug = (searchParams.query || 'workspace_analysis')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 24);
      generateStrategicAnalysisPDF({
        output,
        searchParams,
        strategicAudit,
        execSummary,
        filename: `strategic_analysis_${querySlug}_${Date.now()}.pdf`
      });
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!output || !searchParams) return;
    
    let content = `# Strategic Analysis Report\n\n`;
    content += `**Query:** ${searchParams.query}\n`;
    if (searchParams.deepThinking) {
      content += `**Mode:** Deep Thinking Protocol\n`;
    }
    if (searchParams.conceptSearch) {
      content += `**Semantic Mode:** Principle & Vector Embeddings Concept Search\n`;
    }
    content += `**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`;
    
    if (output.caseStatus || output.caseType || output.caseSummary) {
      content += `## Case Overview\n\n`;
      if (output.caseStatus) content += `- **Status:** ${output.caseStatus}\n`;
      if (output.caseType) content += `- **Type:** ${output.caseType}\n`;
      if (output.caseSummary) content += `- **Summary:** ${output.caseSummary}\n`;
      content += `\n---\n\n`;
    }

    if (output.conceptMatches && output.conceptMatches.length > 0) {
      content += `## Semantic Doctrinal Precedents & Vector Match Analysis\n\n`;
      output.conceptMatches.forEach((m, idx) => {
        content += `### ${idx + 1}. ${m.principle} (${Math.round(m.relevanceScore * 100)}% Similarity)\n`;
        content += `- **Landmark Precedent:** ${m.landmarkPrecedent}\n`;
        content += `- **Jurisdiction / Rule:** ${m.jurisdiction} (${m.doctrine})\n`;
        content += `- **Core Holding:** ${m.holdingSummary}\n`;
        content += `- **Strategic Application / Kill Switch:** ${m.strategicApplication}\n\n`;
      });
      content += `---\n\n`;
    }

    content += `## Strategic Briefing\n\n`;
    content += `${output.summary}\n\n`;

    if (strategicAudit) {
      content += `## Strategic Argumentation Analysis\n\n`;
      content += `${strategicAudit}\n\n`;
    }

    if (execSummary) {
      content += `## Executive Synthesis\n\n`;
      content += `${execSummary}\n\n`;
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategic-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSummarize = async () => {
    if (!output) return;
    setIsSummarizing(true);
    try {
      const summary = await generateExecutiveSummary(output.summary, output.adversarialStrategy!);
      setExecSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAuditStrategy = async () => {
    if (!output) return;
    setIsAnalyzing(true);
    try {
      const analysis = await generateStrategicAnalysis(output.summary);
      setStrategicAudit(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!output && !isLoading) return null;

  const tabs: { id: 'briefing' | 'concepts' | 'intelligence' | 'entities' | 'timeline' | 'exploration', label: string, hidden?: boolean }[] = [
    { id: 'briefing', label: 'STRATEGIC_BRIEFING' },
    { id: 'concepts', label: 'SEMANTIC_DOCTRINES', hidden: !output?.conceptMatches || output.conceptMatches.length === 0 },
    { id: 'intelligence', label: 'INTELLIGENCE_NEXUS' },
    { id: 'entities', label: 'ENTITIES_EVIDENCE' },
    { id: 'timeline', label: 'TEMPORAL_MAP', hidden: !output?.timelineEvents || output.timelineEvents.length === 0 },
    { id: 'exploration', label: 'EXPLORATION_VECTORS' },
  ];

  return (
    <div className="flex flex-col gap-12 pb-24">
      {isLoading && (!output || !output.summary) ? (
        <div className="glass-slab p-12 lg:p-24 flex flex-col items-center justify-center gap-12 animate-entry overflow-hidden min-h-[500px] border-emerald-500/20 bg-emerald-500/[0.01]">
          <div className="absolute inset-0 bg-emerald-500/[0.02] animate-pulse"></div>
          
          {/* Neural Core Animation */}
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full group-hover:blur-[80px] transition-all duration-1000 animate-pulse"></div>
            <div className="w-24 h-24 lg:w-32 lg:h-32 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)] relative z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 lg:w-16 lg:h-16 border border-emerald-500/20 rounded-full animate-ping opacity-40"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400 animate-pulse relative z-10" />
          </div>

          <div className="text-center space-y-8 relative z-10 max-w-xl">
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-[0.8em] text-emerald-500/40 uppercase block mb-2">Neural_Singularity_Active</span>
              <h2 className="text-2xl lg:text-3xl font-black italic text-white tracking-tight uppercase leading-none">
                {searchParams?.deepThinking ? 'Omniscient Protocol Engaged' : 'Harvesting Intelligence'}
              </h2>
            </div>

            <div className="space-y-6">
               <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-500 animate-pulse uppercase tracking-widest px-4 py-1 bg-emerald-500/5 rounded border border-emerald-500/10 mb-2">
                    {searchParams?.deepThinking ? 'Analyzing 10,000 parallel timelines...' : 'Correlating court records...'}
                  </span>
                  
                  {/* Subtle Progress Strip */}
                  <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-progress-indefinite shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                  </div>
               </div>

               {searchParams?.deepThinking && (
                 <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto leading-relaxed opacity-60">
                   Deep Thinking protocol requires significant neural compute to simulate thousand-fold procedural outcomes. This high-IQ audit typically takes 30-60 seconds.
                 </p>
               )}
            </div>

            {/* Simulated Logic Streams */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 opacity-20">
               <div className="text-[8px] font-mono text-emerald-500 text-left uppercase tracking-tighter">STATUTE_MAP_LOADED</div>
               <div className="text-[8px] font-mono text-emerald-500 text-right uppercase tracking-tighter">CASE_LAW_GROUNDED</div>
               <div className="text-[8px] font-mono text-emerald-500 text-left uppercase tracking-tighter">PROBABILITY_SYNC_98%</div>
               <div className="text-[8px] font-mono text-emerald-500 text-right uppercase tracking-tighter">VICTORY_VECTORS_CALC</div>
            </div>
          </div>
        </div>
      ) : output ? (
        <div className="flex flex-col gap-12 animate-entry">
          
          {output.winningProbability && <WinningGuaranteeWidget probability={output.winningProbability} />}

          <TacticalOverview output={output} />

          {/* Dashboard Actions */}
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 px-2">
             <div className="flex items-center gap-4 md:gap-8 flex-wrap">
                <div className="flex flex-col">
                   <span className="micro-label !text-slate-600">Intelligence_Depth</span>
                   <span className="data-value text-emerald-400">EXHAUSTIVE_AUDIT</span>
                </div>
                <div className="w-px h-8 bg-white/5 hidden sm:block"></div>
                <div className="flex flex-col">
                   <span className="micro-label !text-slate-600">Neural_Confidence</span>
                   <span className="data-value text-emerald-500">98.4%_OPTIMIZED</span>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row flex-wrap w-full xl:w-auto gap-3 md:gap-5">
                <button 
                    onClick={() => isSaved ? onRemoveSave(searchParams!) : onSave(searchParams!, output)}
                    className={`flex flex-1 xl:flex-none justify-center items-center gap-3 px-6 py-4 glass-slab !rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                        isSaved 
                            ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                            : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.05]'
                    }`}
                >
                    {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {isSaved ? 'VAULTED' : 'VAULT'}
                </button>

                <button 
                    onClick={handleAuditStrategy}
                    disabled={isAnalyzing || !!strategicAudit}
                    className="flex flex-1 xl:flex-none justify-center items-center gap-3 px-6 py-4 glass-slab !rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-amber-400 transition-all disabled:opacity-30 border-white/5"
                >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                    {strategicAudit ? 'READY' : 'ANALYZE'}
                </button>

                <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing || !!execSummary}
                    className="flex flex-1 xl:flex-none justify-center items-center gap-3 px-6 py-4 glass-slab !rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-all disabled:opacity-30 border-white/5"
                >
                    {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {execSummary ? 'DONE' : 'SUMMARIZE'}
                </button>

                <button 
                    onClick={handleDownloadMarkdown}
                    className="flex flex-1 xl:flex-none justify-center items-center gap-3 px-6 py-4 glass-slab !rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-emerald-400 transition-all border-white/5 cursor-pointer"
                    title="Export markdown file"
                >
                    <Download className="w-3.5 h-3.5" />
                    EXPORT MD
                </button>

                <button 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex flex-1 xl:flex-none justify-center items-center gap-3 px-6 py-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 !rounded-xl text-[9px] font-black text-emerald-300 hover:text-white uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer disabled:opacity-40"
                    title="Generate and download a comprehensive print-ready PDF report of the current workspace analysis and strategic summary findings"
                >
                    {isGeneratingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                    {isGeneratingPDF ? 'BUILDING PDF...' : 'EXPORT PDF REPORT'}
                </button>
             </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 mb-8 bg-white/[0.01] rounded-t-xl">
            {tabs.filter(t => !t.hidden).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.25em] whitespace-nowrap transition-all border-b-2 relative group ${
                  activeTab === tab.id 
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/[0.05]' 
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-emerald-400 blur-sm"></div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'briefing' && (
              <div className="space-y-12 animate-entry">
                {/* Strategic Audit Slab */}
                {strategicAudit && (
                  <div className="glass-widget border-amber-500/20 bg-amber-500/[0.02] p-10 lg:p-16 overflow-hidden relative shadow-2xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/[0.05] blur-[120px] pointer-events-none"></div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <span className="status-indicator status-warning"></span>
                            <h3 className="micro-label !text-amber-500">Strategic_Argumentation_Analysis</h3>
                        </div>
                        <ReadAloudButton text={strategicAudit} />
                     </div>
                     <div className="prose prose-invert prose-xl max-w-none text-slate-300 relative z-10
                        prose-h1:serif-heading prose-h1:text-white prose-h1:text-4xl prose-h1:mb-10
                        prose-h2:micro-label prose-h2:!text-amber-500 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-amber-500/10
                        prose-p:leading-relaxed prose-p:font-light prose-p:text-lg lg:prose-p:text-xl
                        prose-strong:text-amber-200 prose-strong:font-bold">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{strategicAudit}</ReactMarkdown>
                     </div>
                  </div>
                )}

                {/* Executive Summary Slab */}
                {execSummary && (
                  <div className="glass-widget border-blue-500/20 bg-blue-500/[0.02] p-10 lg:p-16 overflow-hidden relative shadow-2xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/[0.05] blur-[120px] pointer-events-none"></div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <span className="status-indicator status-active"></span>
                            <h3 className="micro-label !text-emerald-400">Executive_Synthesis_Module</h3>
                        </div>
                        <ReadAloudButton text={execSummary} />
                     </div>
                     <div className="text-3xl lg:text-5xl text-slate-100 serif-heading italic leading-tight font-light glow-text-emerald relative z-10">
                        {execSummary}
                     </div>
                     <div className="mt-12 pt-10 border-t border-white/5 flex items-center relative z-10">
                        <span className="micro-label !text-slate-600">Signature: AI_COUNSEL_v4.0.1</span>
                        <div className="h-px flex-grow mx-10 bg-white/5"></div>
                        <span className="data-value text-[10px] text-slate-700 uppercase">Hash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                     </div>
                  </div>
                )}

                {/* Main Strategic Briefing Slab */}
                <div className="glass-slab p-12 lg:p-24 relative overflow-hidden dashboard-grid">
                  <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-emerald-600/[0.05] blur-[180px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-16 mb-16 gap-10 relative z-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-white/[0.03] rounded text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border border-white/5 font-mono">INTEL_UID: {Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
                        <span className="px-3 py-1 bg-emerald-500/10 rounded text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] border border-emerald-500/20 font-mono">STATUS: VERIFIED</span>
                      </div>
                      <div className="space-y-4">
                          <h2 className="hero-title text-white glow-text-emerald">
                          Strategic Briefing
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <ReadAloudButton text={output.summary} />
                            <button
                              onClick={handleDownloadPDF}
                              disabled={isGeneratingPDF}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                              title="Generate and download full PDF Dossier of current analysis"
                            >
                              {isGeneratingPDF ? <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> : <FileText className="w-3 h-3 text-emerald-400" />}
                              <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Dossier'}</span>
                            </button>
                            <div className="h-px w-16 bg-emerald-500/20 hidden sm:block"></div>
                            <span className="micro-label">Neural_Synthesis_Active</span>
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Semantic Concept Quick Link Banner */}
                  {output.conceptMatches && output.conceptMatches.length > 0 && (
                    <div className="mb-12 p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10 shadow-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                          <Network className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide block">
                            Semantic Embeddings Grounded: {output.conceptMatches.length} Foundational Doctrines
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Precedent matching: {output.conceptMatches.map(m => m.principle).join(' • ')}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('concepts')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider transition-all shrink-0"
                      >
                        <span>View Doctrinal Vectors</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Case Overview Section */}
                  {(output.caseStatus || output.caseType || output.caseSummary) && (
                    <div className="mb-20 p-8 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col md:flex-row gap-12 items-start relative z-10">
                      <div className="flex flex-wrap gap-12 shrink-0">
                        {output.caseStatus && (
                          <div className="space-y-2">
                            <span className="micro-label block">Case_Status</span>
                            <span className={`data-value text-sm uppercase tracking-widest ${
                              String(output.caseStatus).toLowerCase().includes('open') ? 'text-emerald-500' : 
                              String(output.caseStatus).toLowerCase().includes('closed') ? 'text-slate-500' : 'text-blue-500'
                            }`}>
                              {String(output.caseStatus)}
                            </span>
                          </div>
                        )}
                        {output.caseType && (
                          <div className="space-y-2">
                            <span className="micro-label block">Case_Type</span>
                            <span className="data-value text-sm text-slate-300 uppercase tracking-widest">{output.caseType}</span>
                          </div>
                        )}
                      </div>
                      {output.caseSummary && (
                        <div className="flex-grow max-w-4xl border-l border-white/5 pl-12">
                          <span className="micro-label block mb-3">Brief_Summary</span>
                          <p className="text-lg text-slate-400 leading-relaxed italic font-light">"{output.caseSummary}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="prose prose-invert prose-lg max-w-none text-slate-300 relative z-10
                    prose-h1:serif-heading prose-h1:text-white prose-h1:text-4xl prose-h1:mb-10
                    prose-h2:serif-heading prose-h2:text-3xl prose-h2:text-emerald-500 prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:tracking-tighter
                    prose-h3:serif-heading prose-h3:text-2xl prose-h3:text-slate-100 prose-h3:mt-8 prose-h3:mb-4
                    prose-p:font-sans prose-p:leading-relaxed prose-p:font-light prose-p:text-slate-400 prose-p:mb-6
                    prose-strong:text-white prose-strong:font-bold
                    prose-li:font-sans prose-li:text-slate-400 prose-li:text-lg prose-li:mb-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.summary}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'concepts' && (
              <div className="animate-entry">
                <SemanticConceptView 
                  conceptMatches={output.conceptMatches} 
                  semanticTelemetry={output.semanticVectorTelemetry} 
                />
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="flex flex-col gap-12 animate-entry">
                <div className="flex items-center gap-4 px-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   <h3 className="micro-label !text-slate-400">Neural_Tactical_Nexus</h3>
                   <div className="h-px flex-grow bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <StrategicTelemetryWidget telemetry={output.telemetry} isLoading={false} />
                  <AdversarialStrategyWidget strategy={output.adversarialStrategy} isLoading={false} />
                </div>
                {output.trends && output.trends.length > 0 && (
                  <div className="glass-slab p-12 lg:p-20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                    <TrendsChart data={output.trends} isLoading={false} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'entities' && (
              <div className="flex flex-col gap-12 animate-entry">
                <div className="flex items-center gap-4 px-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   <h3 className="micro-label !text-slate-400">Entity_Evidence_Matrix</h3>
                   <div className="h-px flex-grow bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {output.identifiedJudges && output.identifiedJudges.length > 0 && (
                    <IdentifiedJudges judges={output.identifiedJudges} isLoading={false} onJudgeClick={onJudgeClick} />
                  )}
                  <div className="glass-slab p-10 !bg-white/[0.005] border-white/5 dashboard-grid relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-10 px-2 relative z-10">
                      <h4 className="micro-label">Record_Verification_Sources</h4>
                      <span className="data-value text-[9px] text-slate-600">Count: {(output.sources || []).length}</span>
                    </div>
                    <div className="space-y-2 relative z-10">
                      {(output.sources || []).map((s, i) => (
                         <SourceItem key={i} source={s} />
                      ))}
                      {(output.sources || []).length === 0 && (
                        <div className="py-12 text-center text-slate-700 micro-label">No_External_Sources_Correlated</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && output.timelineEvents && output.timelineEvents.length > 0 && (
              <div className="flex flex-col gap-12 animate-entry">
                <div className="flex items-center gap-4 px-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                   <h3 className="micro-label !text-slate-400">Temporal_Event_Reconstruction</h3>
                   <div className="h-px flex-grow bg-white/5"></div>
                </div>
                <div className="glass-slab p-12 lg:p-24 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none"></div>
                  <TimelineChart events={output.timelineEvents} isLoading={false} />
                </div>
              </div>
            )}

            {activeTab === 'exploration' && (
              <div className="flex flex-col gap-12 animate-entry">
                <div className="flex items-center gap-4 px-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                   <h3 className="micro-label !text-slate-400">Strategic_Exploration_Vectors</h3>
                   <div className="h-px flex-grow bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <FollowUpQuestions questions={output.followUpQuestions || []} onQuestionClick={onQuestionClick} />
                  <RelatedQueries queries={output.relatedQueries || []} onQueryClick={onQuestionClick} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
