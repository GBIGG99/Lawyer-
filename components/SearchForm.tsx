
import React, { useRef, useLayoutEffect, useState } from 'react';
import { type SearchParams, SummaryLength } from '../types';
import { Loader2, FileText, BrainCircuit, Network, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchFormProps {
  params: SearchParams;
  setParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  isLoading: boolean;
  onClear: () => void;
  onSelectHistory: (params: SearchParams) => void;
  onSave: () => void;
  onImportPDF: () => void;
  canSave: boolean;
}

const POPULAR_DOCTRINES = [
  { label: 'C.R.C.P. 12(b)(5) Plausibility', querySnippet: 'C.R.C.P. 12(b)(5) Twombly-Iqbal plausibility and conclusory allegations' },
  { label: 'Economic Loss Rule', querySnippet: 'Economic Loss Rule barring tort recovery in contract breach' },
  { label: 'CGIA 182-Day Immunity', querySnippet: 'Colorado Governmental Immunity Act (CGIA) 182-day jurisdictional notice requirement' },
  { label: 'CRE 702 Shreck Gatekeeping', querySnippet: 'CRE 702 Shreck scientific reliability and expert gatekeeping' },
  { label: 'Promissory Estoppel', querySnippet: 'Promissory estoppel and detrimental reliance without formal consideration' },
  { label: 'Brady / Rule 16 Exculpatory', querySnippet: 'Brady v. Maryland and Crim. P. 16 affirmative duty to disclose exculpatory evidence' },
  { label: 'Fourth Amendment Privacy', querySnippet: 'Fourth Amendment warrantless search exceptions and curtilage privacy expectations' },
  { label: 'Parol Evidence Integration', querySnippet: 'Parol Evidence Rule and full contract integration clause preclusion' }
];

export default function SearchForm({ 
  params, 
  setParams, 
  onSearch, 
  isLoading, 
  onClear,
  onImportPDF
}: SearchFormProps): React.ReactNode {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showConceptInfo, setShowConceptInfo] = useState(false);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(140, textarea.scrollHeight)}px`;
    }
  }, [params.query]);

  const handleInsertDoctrine = (snippet: string) => {
    const newQuery = params.query.trim() 
      ? `${params.query.trim()}\n\n[Concept Search Target]: ${snippet}`
      : snippet;
    setParams({ ...params, query: newQuery, conceptSearch: true });
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden group animate-entry">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="space-y-8 md:space-y-10 relative z-10">
        {/* Main Input Area */}
        <div className="space-y-4">
           <div className="flex justify-between items-end px-1">
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  Strategic Intelligence Input
                </label>
                {params.conceptSearch && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-mono font-bold uppercase tracking-wider animate-pulse">
                    <Network className="w-2.5 h-2.5" />
                    Semantic Embedding Mode Active
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-600 transition-colors">
                {params.query.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
              </span>
           </div>
           <div className="bg-zinc-950/50 border border-zinc-800 focus-within:border-emerald-500/40 rounded-2xl p-5 md:p-8 transition-all duration-300">
             <textarea
               ref={textareaRef}
               value={params.query}
               onChange={(e) => setParams({...params, query: e.target.value})}
               placeholder={
                 params.conceptSearch 
                   ? "Describe case dynamics or underlying legal principles (e.g. 'unilateral change in contract terms without consideration', 'police search beyond consent scope')..."
                   : "Identify procedural hurdles, analyze judge tendencies, or cross-reference evidence..."
               }
               className="w-full bg-transparent border-none text-xl md:text-2xl text-zinc-100 placeholder:text-zinc-800 focus:outline-none resize-none leading-relaxed font-sans font-medium"
               disabled={isLoading}
             />
           </div>

           {/* Semantic Concept Quick Select Drawer */}
           {params.conceptSearch && (
             <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 md:p-5 animate-entry transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                      Doctrinal Principle Quick-Targets (Vector Embeddings)
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowConceptInfo(!showConceptInfo)}
                    className="text-[10px] text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    <HelpCircle className="w-3 h-3" />
                    {showConceptInfo ? 'Hide Guide' : 'How it Works'}
                  </button>
                </div>

                {showConceptInfo && (
                  <p className="text-xs text-cyan-200/70 mb-3 leading-relaxed bg-black/40 p-3 rounded-lg border border-cyan-500/10">
                    <strong>Semantic Concept Search</strong> computes dense mathematical embeddings for your query and matches against core Colorado and Federal legal doctrines, case precedents, and procedural rules based on legal meaning rather than exact words.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {POPULAR_DOCTRINES.map((doc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertDoctrine(doc.querySnippet)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-xs font-mono transition-all flex items-center gap-1.5"
                    >
                      <span>+</span>
                      <span>{doc.label}</span>
                    </button>
                  ))}
                </div>
             </div>
           )}
        </div>

        {/* Tactical Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Target Party', key: 'partyName', type: 'text', placeholder: 'Enter Entity Name' },
            { label: 'Venue Selector', key: 'jurisdiction', type: 'select', options: [
                { val: 'all', label: 'All Jurisdictions' },
                { val: 'denver_district', label: 'Denver District' },
                { val: 'denver_county', label: 'Denver County' },
                { val: 'colorado_supreme', label: 'CO Supreme Court' },
                { val: 'federal_district', label: 'US District (CO)' }
              ] 
            },
            { label: 'Case Number', key: 'caseNumber', type: 'text', placeholder: 'e.g. 2024CV0000', mask: 'XXXXXX' },
            { label: 'Briefing Depth', key: 'summaryLength', type: 'select', options: [
                { val: SummaryLength.CONCISE, label: 'Concise Summary' },
                { val: SummaryLength.BALANCED, label: 'Standard Analysis' },
                { val: SummaryLength.DETAILED, label: 'Exhaustive Audit' }
              ] 
            }
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">{field.label}</label>
              {field.type === 'text' ? (
                <input 
                  type="text" 
                  placeholder={field.placeholder}
                  value={(params as any)[field.key] || ''} 
                  onChange={(e) => setParams({...params, [field.key]: e.target.value})} 
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/40 rounded-xl px-5 py-4 text-sm text-zinc-200 placeholder:text-zinc-800 focus:outline-none transition-all"
                />
              ) : (
                <div className="relative group/select">
                  <select 
                    value={(params as any)[field.key]} 
                    onChange={(e) => setParams({...params, [field.key]: e.target.value as any})} 
                    className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/40 rounded-xl px-5 py-4 text-sm text-zinc-200 focus:outline-none appearance-none cursor-pointer transition-all"
                  >
                    {field.options?.map(o => <option key={o.val} value={o.val} className="bg-zinc-900">{o.label}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700 group-hover/select:text-emerald-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 md:pt-8 border-t border-zinc-800">
          <div className="flex flex-wrap w-full sm:w-auto items-center justify-between sm:justify-start gap-3">
             {/* Semantic Concept Search Toggle */}
             <button 
                type="button"
                id="concept-search-toggle"
                onClick={() => setParams({...params, conceptSearch: !params.conceptSearch})}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all ${
                  params.conceptSearch 
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                    : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                }`}
                title="Use embeddings to match legal precedents based on underlying principles rather than exact keywords"
             >
                <Network className={`w-3.5 h-3.5 ${params.conceptSearch ? 'text-cyan-400 animate-pulse' : 'text-zinc-600'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Concept Search</span>
                {params.conceptSearch && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                )}
             </button>

             {/* Enhanced / Deep Thinking Toggle */}
             <button 
                type="button"
                id="enhanced-thinking-toggle"
                onClick={() => setParams({...params, deepThinking: !params.deepThinking})}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all ${
                  params.deepThinking 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                    : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                }`}
             >
                <div className={`w-1.5 h-1.5 rounded-full ${params.deepThinking ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Enhanced</span>
             </button>

             <button 
                type="button"
                onClick={onClear}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors px-3 py-2"
             >
                Reset
             </button>
          </div>

          <div className="flex flex-col sm:flex-row flex-grow w-full justify-end gap-3 md:gap-4">
             <button 
                type="button"
                onClick={onImportPDF}
                className="flex flex-1 sm:flex-none items-center justify-center gap-3 px-6 py-4 md:py-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all font-bold text-xs"
             >
                <FileText className="w-4 h-4 text-zinc-500" />
                Files
             </button>
             <button 
                type="button"
                onClick={onSearch}
                disabled={isLoading || !params.query.trim()}
                className="flex flex-[2] sm:flex-none items-center justify-center gap-3 px-8 py-4 md:py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white transition-all shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 group"
             >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <BrainCircuit className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
                <span className="font-black text-xs uppercase tracking-widest">
                  {params.conceptSearch ? 'Execute Concept Search' : 'Analyze Case'}
                </span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
