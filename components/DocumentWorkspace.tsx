
import React, { useState, useRef, useCallback } from 'react';
import { DocumentAnalysisResult, DocumentAnnotation, MultiDocumentAnalysisResult } from '../types';
import { Loader2, FileText, X, Trash2, AlertTriangle, Sparkles, Plus, Info, Lightbulb, Scale, ArrowRight, Cpu, Layers, Clipboard, Check, Download } from 'lucide-react';
import { generateTacticalAuditPDF, generateMultiDocAuditPDF } from '../utils/pdfGenerator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReadAloudButton from './ReadAloudButton';
import CrossDossierGraph from './CrossDossierGraph';

interface DocumentWorkspaceProps {
  files: DocumentAnalysisResult[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onUpload: (b64: string, mime: string, name: string) => void;
  onRemove: (id: string) => void;
  onMapNarrative: (file: DocumentAnalysisResult) => void;
  onAnalyzeMultiDocs?: () => void;
  multiDocResult?: MultiDocumentAnalysisResult | null;
  isMultiDocLoading?: boolean;
}

const AnnotationCard: React.FC<{ annotation: DocumentAnnotation }> = ({ annotation }) => {
  const priorityColors = {
    high: 'border-red-500 bg-red-500/5 text-red-400',
    medium: 'border-orange-500 bg-orange-500/5 text-orange-400',
    low: 'border-blue-500 bg-blue-500/5 text-blue-400'
  };

  const TypeIcon = () => {
    switch (annotation.type) {
      case 'risk': return <AlertTriangle className="w-3 h-3" />;
      case 'opportunity': return <Lightbulb className="w-3 h-3" />;
      case 'discrepancy': return <Info className="w-3 h-3" />;
      case 'procedural': 
      case 'procedural_strike': return <Scale className="w-3 h-3 text-red-500" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  return (
    <div className={`p-4 border-l-2 mb-4 rounded-r-lg transition-all hover:shadow-lg ${priorityColors[annotation.priority]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
           <TypeIcon />
           {annotation.type} Protocol
        </span>
        <span className="text-[8px] font-bold opacity-60">Annotation #{annotation.id?.substring(0, 4) || 'AUTH'}</span>
      </div>
      {annotation.quote && (
        <div className="text-[10px] italic border-l border-current/20 pl-2 mb-2 opacity-80">
          "{annotation.quote}"
        </div>
      )}
      <p className="text-xs font-medium leading-relaxed">
        {annotation.text}
      </p>
    </div>
  );
};

function cleanErrorMessage(msg: string): string {
  if (!msg) return 'An unexpected neural network error occurred.';
  
  // Try to find if there is a JSON error payload within the message
  try {
    const jsonStart = msg.indexOf('{');
    if (jsonStart !== -1) {
      const jsonStr = msg.substring(jsonStart);
      const parsed = JSON.parse(jsonStr);
      if (parsed.error && parsed.error.message) {
        msg = parsed.error.message;
      } else if (parsed.message) {
        msg = parsed.message;
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }

  // Handle specific Gemini API key error
  if (msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('api_key_invalid') || msg.toLowerCase().includes('api key')) {
    return 'Your GEMINI_API_KEY environment variable is invalid, inactive, or expired. Please verify and update your credentials under Settings > Secrets in the workspace editor, or restart the server.';
  }

  // Handle missing key
  if (msg.toLowerCase().includes('not defined on the server') || msg.toLowerCase().includes('not be set') || msg.toLowerCase().includes('not found')) {
    return 'The GEMINI_API_KEY is missing or undefined. Please add your Gemini API key in Settings > Secrets.';
  }

  // Handle other typical errors
  if (msg.toLowerCase().includes('quota exceeded') || msg.toLowerCase().includes('rate limit')) {
    return 'Gemini API quota exceeded or rate limited. Please try again shortly.';
  }

  if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('model')) {
    return 'The requested Gemini model is currently unavailable or invalid. Please check your model settings.';
  }

  // If we cleaned it up, return it, otherwise return the original message (stripped of "Audit failure: ")
  return msg.replace(/^Audit failure:\s*/i, '');
}

export default function DocumentWorkspace({ 
  files, 
  activeFileId, 
  onSelectFile, 
  onUpload, 
  onRemove,
  onMapNarrative,
  onAnalyzeMultiDocs,
  multiDocResult,
  isMultiDocLoading
}: DocumentWorkspaceProps): React.ReactNode {
  const [dragActive, setDragActive] = useState(false);
  const [annotationFilter, setAnnotationFilter] = useState<'all' | 'risk' | 'opportunity' | 'discrepancy' | 'procedural'>('all');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const activeFile = files.find(f => f.id === activeFileId);

  const handleCopyReport = useCallback(() => {
    if (!activeFile) return;
    const textToCopy = `TACTICAL EVIDENCE AUDIT BRIEF: ${activeFile.fileName}
======================================================
Generated via Neural Sense Legal Intelligence
======================================================

STRATEGIC ANALYSIS SUMMARY:
${activeFile.strategicSummary}

CREDIBILITY ATTACK VECTORS & LOOPHOLES:
${(activeFile.keyArguments || []).map((arg, idx) => `[STRIKE 0${idx + 1}] ${arg}`).join('\n')}

DETECTED OVERARCHING ENTITIES:
${(activeFile.identifiedEntities || []).map(ent => `- [${ent.type}] ${ent.value}`).join('\n')}

NEUTRALIZATION ACTIONS ROADMAP:
${(activeFile.actionableInsights || []).map((insight, idx) => `- [ACTION 0${idx + 1}] ${insight}`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeFile]);

  const handleDownloadReport = useCallback(() => {
    if (!activeFile) return;
    const textToCopy = `TACTICAL EVIDENCE AUDIT BRIEF: ${activeFile.fileName}
======================================================
Generated via Neural Sense Legal Intelligence
======================================================

STRATEGIC ANALYSIS SUMMARY:
${activeFile.strategicSummary}

CREDIBILITY ATTACK VECTORS & LOOPHOLES:
-------------------------------------------
${(activeFile.keyArguments || []).map((arg, idx) => `[STRIKE 0${idx + 1}] ${arg}`).join('\n\n')}

DETECTED OVERARCHING ENTITIES:
-------------------------------------------
${(activeFile.identifiedEntities || []).map(ent => `[${ent.type}] ${ent.value}`).join('\n')}

NEUTRALIZATION ACTIONS ROADMAP:
-------------------------------------------
${(activeFile.actionableInsights || []).map((insight, idx) => `[ACTION 0${idx + 1}] ${insight}`).join('\n')}
`;
    const blob = new Blob([textToCopy], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeFile.fileName.replace(/\.[^/.]+$/, "")}_tactical_audit.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activeFile]);

  const handleDownloadReportPDF = useCallback(() => {
    if (!activeFile) return;
    const textToCopy = `TACTICAL EVIDENCE AUDIT BRIEF: ${activeFile.fileName}
======================================================
Generated via Neural Sense Legal Intelligence
======================================================

STRATEGIC ANALYSIS SUMMARY:
${activeFile.strategicSummary}

CREDIBILITY ATTACK VECTORS & LOOPHOLES:
-------------------------------------------
${(activeFile.keyArguments || []).map((arg, idx) => `[STRIKE 0${idx + 1}] ${arg}`).join('\n\n')}

DETECTED OVERARCHING ENTITIES:
-------------------------------------------
${(activeFile.identifiedEntities || []).map(ent => `[${ent.type}] ${ent.value}`).join('\n')}

NEUTRALIZATION ACTIONS ROADMAP:
-------------------------------------------
${(activeFile.actionableInsights || []).map((insight, idx) => `[ACTION 0${idx + 1}] [ACTION] ${insight}`).join('\n')}
`;
    generateTacticalAuditPDF(activeFile.fileName, textToCopy, `${activeFile.fileName.replace(/\.[^/.]+$/, "")}_tactical_audit.pdf`, activeFile);
  }, [activeFile]);

  const handleDownloadMultiDocPDF = useCallback(() => {
    if (!multiDocResult) return;
    generateMultiDocAuditPDF(multiDocResult, files, `unified_case_synthesis_${Date.now()}.pdf`);
  }, [multiDocResult, files]);

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = (e.target?.result as string).split(',')[1];
      onUpload(b64, file.type, file.name);
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[70vh] gap-8 animate-in fade-in duration-500">
      
      {/* File List Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="law-card p-6 flex flex-col gap-6">
           <div className="flex justify-between items-center px-1">
             <h3 className="etched-label">Adversarial Dossiers</h3>
             <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Combat_Ready</span>
             </div>
           </div>

           <div className="space-y-2">
              <button 
                onClick={() => inputRef.current?.click()}
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest group-hover:text-zinc-200 transition-colors">Inject Dossier</span>
              </button>
              <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
           </div>

           <div className="flex-grow space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
              {files.length >= 2 && onAnalyzeMultiDocs && (
                 <button 
                   onClick={onAnalyzeMultiDocs}
                   className={`w-full p-4 border rounded cursor-pointer transition-all relative flex items-center gap-3 overflow-hidden ${
                     activeFileId === 'MULTI_CASE_ANALYSIS' 
                       ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                       : 'bg-zinc-900/40 border-emerald-500/10 hover:border-emerald-500/30'
                   }`}
                 >
                   <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 rotate-45 translate-x-4 -translate-y-4"></div>
                   <Layers className={`w-4 h-4 ${activeFileId === 'MULTI_CASE_ANALYSIS' ? 'text-emerald-500' : 'text-emerald-500/40'}`} />
                   <div className="text-left">
                     <span className="text-[10px] font-black uppercase text-emerald-500 block leading-tight">Unified Case Analysis</span>
                     <span className="text-[8px] text-zinc-500 font-bold">{files.length} Dossiers Syncing</span>
                   </div>
                 </button>
               )}
              {files.length === 0 && (
                <div className="p-8 text-center opacity-20 italic text-[10px] text-slate-500">
                  No dossiers loaded in current session.
                </div>
              )}
              {files.map((file, idx) => (
                <div 
                  key={file.id || `file-${idx}`} 
                  onClick={() => onSelectFile(file.id!)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all relative group ${
                    activeFileId === file.id 
                      ? 'bg-zinc-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                   <div className="flex items-start justify-between mb-1">
                      <span className="text-[10px] font-bold text-zinc-200 truncate pr-4">{file.fileName}</span>
                      <button onClick={(e) => { e.stopPropagation(); onRemove(file.id!); }} className="text-zinc-500 hover:text-red-500 hover:bg-zinc-800 p-1 rounded-md transition-all cursor-pointer">
                         <Trash2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <div className="flex items-center gap-2 mt-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        file.status === 'analyzing' ? 'bg-amber-500 animate-pulse' : 
                        file.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                        {file.status === 'analyzing' ? 'Neural Synthesis...' : file.status.toUpperCase()}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="law-card p-6 bg-red-500/[0.03] border-red-500/10">
           <h4 className="etched-label text-red-500/60 mb-3">Predator Protocol</h4>
           <p className="text-[10px] text-slate-500 leading-relaxed italic">
             All data ingested here is analyzed with zero-mercy logic. We identify loopholes. We attack credibility. We protect the defendant by dismantling the opposition.
           </p>
        </div>
      </div>

      {/* Main Analysis/Review Area */}
      <div className="flex-grow relative min-h-[600px]">
        {activeFileId === 'MULTI_CASE_ANALYSIS' ? (
          isMultiDocLoading ? (
            <div className="absolute inset-0 law-card flex flex-col items-center justify-center gap-8 p-20">
               <div className="relative">
                 <div className="w-24 h-24 border-2 border-red-500/10 border-t-red-500 rounded-full animate-spin"></div>
                 <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 w-8 h-8 animate-pulse" />
               </div>
               <div className="text-center space-y-4">
                 <span className="etched-label animate-pulse text-red-500">Cross-Referencing Multi-Dossier Intelligence...</span>
                 <p className="text-[10px] text-slate-500 italic max-w-sm">Generating unified case strategy and detecting cross-document contradictions. Using high-tier neural reasoning.</p>
               </div>
            </div>
          ) : multiDocResult ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-20">
              <div className="law-card p-10 lg:p-12 border-red-500/20 bg-red-500/[0.02]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                    <span className="etched-label !text-red-500">Unified Strategic Audit</span>
                  </div>
                  <button
                    onClick={handleDownloadMultiDocPDF}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-wider transition-all rounded-xl flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02]"
                    title="Generate and download full PDF report of Unified Case Synthesis"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download Unified PDF Report</span>
                  </button>
                </div>
                <h2 className="text-4xl font-bold text-white serif-heading mb-8">Unified Case Synthesis</h2>
                
                <div className="prose prose-invert prose-lg max-w-none text-slate-300 mb-12">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{multiDocResult.caseSummary}</ReactMarkdown>
                </div>

                {/* D3 Graph Visualization of Dossiers, Entities, and Arguments */}
                <div className="mb-12">
                   <CrossDossierGraph files={files} multiDocResult={multiDocResult} />
                </div>

                <div className="hidden" /> {/*>
                   <ReactMarkdown>
                </div>

*/}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <h3 className="etched-label opacity-40">Unified Strategy</h3>
                      <div className="p-6 bg-slate-900/60 border border-red-500/10 rounded-xl">
                        <ReactMarkdown className="text-sm leading-relaxed text-slate-300">{multiDocResult.unifiedStrategy}</ReactMarkdown>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h3 className="etched-label opacity-40">Actionable Roadmap</h3>
                      <div className="space-y-3">
                        {multiDocResult.actionableRoadmap.map((step, i) => (
                           <div key={i} className="flex gap-4 p-4 bg-slate-950 border border-white/5 rounded-lg">
                              <span className="text-red-500 font-mono text-[10px] shrink-0">STEP_{i+1}</span>
                              <p className="text-xs text-slate-400 font-medium">{step}</p>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <div className="law-card p-8 border-white/5 bg-slate-900/40">
                       <h3 className="etched-label mb-6 opacity-40">Cross-Document Discrepancies</h3>
                       <div className="space-y-4">
                          {multiDocResult.crossDocumentDiscrepancies.length > 0 ? multiDocResult.crossDocumentDiscrepancies.map((disc, i) => (
                            <div key={i} className="p-6 bg-slate-950 border-l-2 border-red-500 rounded-r-xl space-y-3">
                               <div className="flex items-center justify-between">
                                 <h4 className="text-sm font-bold text-slate-200">{disc.topic}</h4>
                                 <div className="flex gap-2">
                                    {disc.filesInvolved.map((f, fi) => (
                                      <span key={fi} className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-[8px] font-bold text-slate-500">{f}</span>
                                    ))}
                                 </div>
                               </div>
                               <p className="text-xs text-slate-400 leading-relaxed italic">"{disc.details}"</p>
                            </div>
                          )) : (
                            <p className="text-xs text-slate-600 italic">No significant discrepancies detected across analyzed dossiers.</p>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="law-card p-8 border-white/5 bg-slate-900/40">
                       <h3 className="etched-label mb-6 opacity-40">Overarching Risks</h3>
                       <div className="space-y-3">
                          {multiDocResult.overarchingRisks.map((risk, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs text-slate-400 group">
                               <AlertTriangle className="w-3 h-3 text-red-500/40 group-hover:text-red-500 shrink-0 mt-0.5 transition-colors" />
                               <span>{risk}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="law-card p-8 border-white/5 bg-slate-900/40">
                       <h3 className="etched-label mb-6 opacity-40">Key Entities</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {multiDocResult.keyIdentifiedEntities.map((ent, i) => (
                            <div key={i} className="p-2 bg-slate-950 border border-white/5 rounded text-[10px]">
                               <span className="block text-[8px] font-black uppercase text-slate-600 mb-1">{ent.type}</span>
                               <span className="font-bold text-slate-300">{ent.value}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 law-card flex flex-col items-center justify-center gap-6 border-white/5 bg-slate-950/20">
               <AlertTriangle className="w-12 h-12 text-red-500/20" />
               <div className="text-center space-y-2">
                  <h3 className="serif-heading text-2xl text-slate-300">Analysis Halted</h3>
                  <p className="text-slate-500 text-xs font-medium">Unified Case synthesis failed to initialize. Ensure all dossiers are successfully audited.</p>
               </div>
            </div>
          )
        ) : !activeFile ? (
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); e.dataTransfer.files && handleFile(e.dataTransfer.files[0]); }}
            className={`absolute inset-0 bg-zinc-950/20 flex flex-col items-center justify-center gap-6 border-2 border-dashed transition-all rounded-3xl ${
              dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800'
            }`}
          >
            <div className="p-8 bg-zinc-900 rounded-full border border-zinc-800 text-emerald-500/20">
              <FileText className="w-12 h-12" />
            </div>
            <div className="text-center space-y-2">
               <h3 className="text-2xl text-zinc-300 font-bold">Defense Architecture</h3>
               <p className="text-zinc-500 text-xs font-medium">Inject a dossier to begin ruthless credibility dissection.</p>
            </div>
          </div>
        ) : activeFile.status === 'analyzing' ? (
          <div className="absolute inset-0 law-card flex flex-col items-center justify-center gap-8 p-20">
             <div className="relative">
               <div className="w-24 h-24 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
               <div className="absolute inset-4 border-2 border-slate-800 border-b-amber-500/40 rounded-full animate-spin-slow"></div>
               <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-6 h-6 animate-pulse" />
             </div>
             <div className="text-center space-y-4">
               <span className="etched-label animate-pulse text-red-500">Neutralizing Opposition Data...</span>
               <div className="flex flex-col items-center gap-1 opacity-60">
                  <span className="text-[10px] font-mono uppercase text-red-500/50">Dissecting Evidence Credibility</span>
                  <span className="text-[10px] font-mono uppercase text-red-500/50">Weaponizing Procedural Flaws</span>
                  <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 animate-progress-indefinite"></div>
                  </div>
               </div>
               <p className="text-[10px] text-slate-600 italic mt-8">Deep synthesis can take up to 30 seconds for complex dossiers.</p>
             </div>
          </div>
         ) : (
          <div className="flex flex-col lg:flex-row gap-8 h-full">
             
             {/* Document Synthesis Brief */}
             <div className="flex-grow flex flex-col gap-8 overflow-y-auto no-scrollbar pb-20">
                 <div className="law-card p-6 md:p-10 lg:p-12 relative overflow-hidden text-red-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.02] blur-3xl rounded-full"></div>
                    
                    <div className="flex flex-col xl:flex-row justify-between items-start border-b border-white/5 pb-6 md:pb-8 mb-6 md:mb-8 gap-4">
                       <div>
                         <div className="flex items-center gap-2 mb-2">
                           <span className="etched-label text-[10px] !text-red-500">Procedural Decimation Report</span>
                         </div>
                         <h2 className="text-2xl md:text-3xl font-bold text-white serif-heading tracking-tight">Audit: {activeFile.fileName}</h2>
                       </div>
                       <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
                         <ReadAloudButton text={activeFile.strategicSummary} />
                         <button 
                           onClick={handleCopyReport}
                           className="flex-1 sm:flex-none justify-center px-4 py-3 md:py-2 bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all rounded-xl flex items-center gap-2 cursor-pointer"
                         >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-zinc-500" />}
                            {copied ? "Copied" : "Copy Brief"}
                         </button>
                         <button 
                           onClick={handleDownloadReport}
                           className="flex-1 sm:flex-none justify-center px-4 py-3 md:py-2 bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all rounded-xl flex items-center gap-2 cursor-pointer"
                         >
                            <Download className="w-3.5 h-3.5 text-zinc-500" />
                            TXT
                         </button>
                         <button 
                           onClick={handleDownloadReportPDF}
                           className="flex-1 sm:flex-none justify-center px-4 py-3 md:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black hover:border-emerald-400 text-[10px] uppercase transition-all rounded-xl flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02]"
                         >
                            <Download className="w-3.5 h-3.5 text-emerald-100 animate-bounce" style={{ animationDuration: '2s' }} />
                            PDF
                         </button>
                         <button 
                           onClick={() => onMapNarrative(activeFile)}
                           className="flex-1 sm:flex-none justify-center px-4 py-3 md:py-2 bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all rounded-xl cursor-pointer"
                         >
                            Map
                         </button>
                       </div>
                    </div>

                   <div className="prose prose-invert prose-lg max-w-none text-slate-300 mb-12">
                      {activeFile.status === 'error' ? (
                        <div className="p-8 glass-widget border-red-500/20 bg-red-500/[0.02] rounded-xl text-center space-y-4">
                           <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                           <h3 className="text-xl font-bold text-red-400">Audit Interrupted</h3>
                           <p className="text-sm text-slate-400">{cleanErrorMessage(activeFile.strategicSummary)}</p>
                           <button 
                             onClick={() => onRemove(activeFile.id!)}
                             className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                           >
                             Purge & Retry
                           </button>
                        </div>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeFile.strategicSummary}</ReactMarkdown>
                      )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="etched-label opacity-40">Credibility Attack Vectors</h4>
                        <ul className="space-y-3">
                           {(activeFile.keyArguments || []).map((arg, i) => (
                             <li key={i} className="flex gap-4 p-4 bg-slate-900/40 border border-white/5 rounded-lg text-sm text-slate-300 font-medium leading-relaxed hover:border-red-500/20 transition-all">
                               <span className="text-red-500 font-mono text-[10px]">STRIKE_0{i+1}</span>
                               {arg}
                             </li>
                           ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="etched-label opacity-40">Adversarial Entities</h4>
                        <div className="grid grid-cols-2 gap-3">
                           {(activeFile.identifiedEntities || []).map((ent, i) => (
                             <div key={i} className="p-3 bg-slate-900/40 border border-white/5 rounded-lg text-xs hover:border-red-500/20 transition-all">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">{ent.type}</span>
                                <span className="text-slate-300 font-bold">{ent.value}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="law-card p-10 border-red-500/10 bg-red-500/[0.01]">
                   <h4 className="etched-label mb-8">Neutralization Roadmap</h4>
                   <div className="space-y-4">
                      {(activeFile.actionableInsights || []).map((insight, i) => (
                        <div key={i} className="flex items-center gap-6 group">
                           <div className="w-10 h-10 rounded bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-red-500/30 transition-all">
                              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-red-500" />
                           </div>
                           <p className="text-sm text-slate-400 font-medium group-hover:text-white transition-colors">
                              {insight}
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* AI Review Panel */}
             <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
                <div className="law-card p-6 flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl">
                   <div className="flex items-center gap-3 mb-6 border-b border-zinc-850 pb-4">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <h3 className="etched-label text-zinc-100 font-bold">Tactical Review</h3>
                   </div>
                   
                    <span className="text-[9px] font-mono uppercase text-zinc-500 mb-2 block tracking-wider">Severity Filter</span>
                    <div className="flex flex-wrap gap-1 mb-6">
                       {(['all', 'risk', 'opportunity', 'discrepancy', 'procedural'] as const).map(f => {
                         const count = f === 'all' 
                           ? (activeFile.annotations || []).length
                           : (activeFile.annotations || []).filter(ann => {
                               if (f === 'procedural') return ann.type === 'procedural' || ann.type === 'procedural_strike';
                               return ann.type === f;
                             }).length;
                         const isActive = annotationFilter === f;
                         return (
                           <button
                             key={f}
                             onClick={() => setAnnotationFilter(f)}
                             className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tight transition-all border cursor-pointer ${
                               isActive 
                                 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                 : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                             }`}
                           >
                             {f} ({count})
                           </button>
                         );
                       })}
                    </div>

                   <div className="flex-grow overflow-y-auto no-scrollbar pr-2">
                      {activeFile.annotations && activeFile.annotations.length > 0 ? (
                        (() => {
                           const filtered = activeFile.annotations.filter(ann => {
                             if (annotationFilter === 'all') return true;
                             if (annotationFilter === 'procedural') return ann.type === 'procedural' || ann.type === 'procedural_strike';
                             return ann.type === annotationFilter;
                           });
                           if (filtered.length === 0) {
                             return [{ id: 'empty-filter', type: 'info', text: `No findings are categorized under ${annotationFilter}.`, priority: 'low' } as any];
                           }
                           return filtered;
                        })().map((ann, idx) => (
                          <AnnotationCard key={ann.id || `ann-${idx}`} annotation={ann} />
                        ))
                      ) : (
                        <div className="p-10 text-center space-y-4 opacity-20">
                           <Cpu className="w-6 h-6 text-2xl" />
                           <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed">
                               Predator Node scanning for evidentiary vulnerabilities.
                           </p>
                        </div>
                      )}
                   </div>

                   <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-600 tracking-[0.2em]">
                         <span>Audit ID: {activeFile.id?.substring(0, 8)}</span>
                         <span>Rel: 98.4%</span>
                      </div>
                   </div>
                </div>
             </div>

          </div>
        )}
      </div>

    </div>
  );
}
