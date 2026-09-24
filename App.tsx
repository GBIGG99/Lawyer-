
import React, { useState, useCallback, useEffect } from 'react';
import { SearchType, type SearchParams, DateRange, CaseStatus, type Bookmark, CaseType, Jurisdiction, type SearchResult, type DocumentAnalysisResult, type CrossReferenceResult, SummaryLength, type MultiDocumentAnalysisResult } from './types';
import { searchWebWithGemini, analyzeDocument, crossReferenceDocuments, generateNarrativeMap, analyzeMultiDocuments } from './services/geminiService';
import { getCachedResult, setCachedResult } from './services/cacheService';
import { addToHistory } from './services/historyService';
import { getBookmarks, saveBookmark, removeBookmark, isSearchBookmarked, isDocBookmarked, isCrossRefBookmarked, generateSearchKey, generateDocKey, generateCrossRefKey } from './services/bookmarkService';
import { MAX_QUERY_LENGTH } from './constants';
import Header from './components/Header';
import Banner from './components/Banner';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import Examples from './components/Examples';
import Bookmarks from './components/Bookmarks';
import JudgeDetailModal from './components/JudgeDetailModal';
import CrossReferenceModal from './components/CrossReferenceModal';
import NarrativeMapper from './components/NarrativeMapper';
import DocumentWorkspace from './components/DocumentWorkspace';
import MotionGenerator from './components/MotionGenerator';
import JudgeIntelTab from './components/JudgeIntelTab';
import { BrainCircuit, Bookmark as BookmarkIcon, History, FileText, Scale } from 'lucide-react';

function cleanErrorMessage(msg: string): string {
  if (!msg) return 'An unexpected neural network error occurred.';
  
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
  } catch (e) {}

  if (msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('api_key_invalid') || msg.toLowerCase().includes('api key')) {
    return 'Your GEMINI_API_KEY environment variable is invalid, inactive, or expired. Please verify and update your credentials under Settings > Secrets in the workspace editor, or restart the server.';
  }

  if (msg.toLowerCase().includes('not defined on the server') || msg.toLowerCase().includes('not be set') || msg.toLowerCase().includes('not found')) {
    return 'The GEMINI_API_KEY is missing or undefined. Please add your Gemini API key in Settings > Secrets.';
  }

  if (msg.toLowerCase().includes('quota exceeded') || msg.toLowerCase().includes('rate limit')) {
    return 'Gemini API quota exceeded or rate limited. Please try again shortly.';
  }

  if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('model')) {
    return 'The requested Gemini model is currently unavailable or invalid. Please check your model settings.';
  }

  return msg.replace(/^Audit failure:\s*/i, '');
}

type AppTab = 'copilot' | 'audit' | 'vault' | 'draft' | 'judge';

export default function App(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<AppTab>('copilot');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    searchType: SearchType.SEARCH,
    listCount: undefined,
    dateRange: DateRange.ANY,
    siteRestrict: '',
    fileType: '',
    partyName: '',
    caseNumber: '',
    caseStatus: CaseStatus.ALL,
    caseType: CaseType.ALL,
    jurisdiction: Jurisdiction.ALL,
    summaryLength: SummaryLength.BALANCED,
    deepThinking: false,
  });
  const [currentSearchParamsForResults, setCurrentSearchParamsForResults] = useState<SearchParams | null>(null);
  const [output, setOutput] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [selectedJudgeName, setSelectedJudgeName] = useState<string | null>(null);

  const [documentWorkspaceFiles, setDocumentWorkspaceFiles] = useState<DocumentAnalysisResult[]>([]);
  const [activeWorkspaceFileId, setActiveWorkspaceFileId] = useState<string | null>(null);
  const [multiDocumentResult, setMultiDocumentResult] = useState<MultiDocumentAnalysisResult | null>(null);
  const [isMultiDocLoading, setIsMultiDocLoading] = useState(false);

  const [showCrossRefModal, setShowCrossRefModal] = useState(false);
  const [crossRefResult, setCrossRefResult] = useState<CrossReferenceResult | null>(null);
  const [isCrossRefLoading, setIsCrossRefLoading] = useState(false);

  const [showNarrativeMapper, setShowNarrativeMapper] = useState(false);
  const [narrativeInitialData, setNarrativeInitialData] = useState<{b64: string, mime: string, name: string} | null>(null);

  useEffect(() => {
    setBookmarks(getBookmarks());
    const docBookmarks = getBookmarks().filter(b => b.type === 'document_analysis') as any[];
    if (docBookmarks.length > 0) {
      setDocumentWorkspaceFiles(docBookmarks.map(b => b.result));
    }
  }, []);

  const executeSearch = useCallback(async (params: SearchParams) => {
    const finalParams: SearchParams = { ...params, query: params.query.trim() };
    
    if (!finalParams.query) {
      setError('Please enter a valid legal inquiry.');
      return;
    }

    const cachedResult = getCachedResult(finalParams);
    if (cachedResult && !finalParams.deepThinking) {
      setOutput({
        ...cachedResult,
        isSummaryStreaming: false,
        isFollowUpQuestionsLoading: false,
        isRelatedQueriesLoading: false,
        isTimelineLoading: false,
        isIdentifiedJudgesLoading: false,
      });
      setCurrentSearchParamsForResults(finalParams);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput({
      summary: '',
      sources: [],
      followUpQuestions: [],
      relatedQueries: [],
      timelineEvents: [],
      identifiedJudges: [],
      isSummaryStreaming: true,
      isFollowUpQuestionsLoading: false,
      isRelatedQueriesLoading: false,
      isTimelineLoading: false,
      isIdentifiedJudgesLoading: false,
    });
    setCurrentSearchParamsForResults(finalParams);

    try {
      const result = await searchWebWithGemini(finalParams, (partial) => {
        setOutput(prev => ({ ...prev!, ...partial }));
      });
      setOutput(prev => ({
          ...prev!,
          ...result,
          isSummaryStreaming: false,
      }));
      if (!finalParams.deepThinking) {
        setCachedResult(finalParams, result);
      }
      addToHistory(finalParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System encountered an error during analysis.');
      setOutput(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => executeSearch(searchParams), [searchParams, executeSearch]);
  
  const handleSaveResult = (params: SearchParams, result: SearchResult) => {
    const key = generateSearchKey(params);
    saveBookmark({ key, type: 'search', params, result, savedAt: Date.now() });
    setBookmarks(getBookmarks());
  };

  const handleRemoveSave = (params: SearchParams) => {
    removeBookmark(generateSearchKey(params));
    setBookmarks(getBookmarks());
  };

  const handleViewBookmark = (bookmark: Bookmark) => {
    if (bookmark.type === 'search') {
        setSearchParams(bookmark.params);
        setOutput({ ...bookmark.result, isSummaryStreaming: false });
        setCurrentSearchParamsForResults(bookmark.params);
        setActiveTab('copilot');
    } else if (bookmark.type === 'document_analysis') {
        setActiveWorkspaceFileId(bookmark.result.id || null);
        setActiveTab('audit');
    } else if (bookmark.type === 'cross_reference') {
        setCrossRefResult(bookmark.result);
        setShowCrossRefModal(true);
    }
  };

  const handleWorkspaceUpload = async (b64: string, mime: string, name: string) => {
    const tempId = crypto.randomUUID();
    const placeholder: DocumentAnalysisResult = {
      id: tempId,
      fileName: name,
      uploadDate: Date.now(),
      status: 'analyzing',
      strategicSummary: '',
      keyArguments: [],
      identifiedEntities: [],
      actionableInsights: [],
      base64: b64,
      mimeType: mime
    };
    setDocumentWorkspaceFiles(prev => [placeholder, ...prev]);
    setActiveWorkspaceFileId(tempId);

    try {
      const result = await analyzeDocument(b64, mime, name);
      const finalResult = { ...result, id: tempId, base64: b64, mimeType: mime };
      setDocumentWorkspaceFiles(prev => prev.map(f => f.id === tempId ? finalResult : f));
      saveBookmark({
        key: generateDocKey(name),
        type: 'document_analysis',
        result: finalResult,
        savedAt: Date.now()
      });
      setBookmarks(getBookmarks());
    } catch (e) {
      setDocumentWorkspaceFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'error', strategicSummary: 'Audit failure.' } : f));
    }
  };

  const handleAnalyzeMultiDocs = async () => {
    if (documentWorkspaceFiles.length < 2) {
      setError("Please upload at least 2 dossiers to perform unified cross-dossier analysis.");
      return;
    }
    
    setIsMultiDocLoading(true);
    setActiveWorkspaceFileId('MULTI_CASE_ANALYSIS');
    
    try {
      const filesForAnalysis = documentWorkspaceFiles.map(f => {
        let b64 = f.base64;
        if (!b64) {
          const contentText = `Document Name: ${f.fileName}\nSummary: ${f.strategicSummary || 'Reviewed dossier'}\nKey Arguments: ${(f.keyArguments || []).join('\n')}\nEntities: ${JSON.stringify(f.identifiedEntities || [])}`;
          try {
            b64 = btoa(unescape(encodeURIComponent(contentText)));
          } catch {
            b64 = 'RG9jdW1lbnQ=';
          }
        }
        return {
          base64: b64,
          mimeType: f.mimeType || 'text/plain',
          fileName: f.fileName,
          id: f.id || crypto.randomUUID()
        };
      });

      const result = await analyzeMultiDocuments(filesForAnalysis);
      setMultiDocumentResult(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Multi-dossier analysis failed.');
      setActiveWorkspaceFileId(documentWorkspaceFiles[0]?.id || null);
    } finally {
      setIsMultiDocLoading(false);
    }
  };

  const handleRemoveWorkspaceFile = (id: string) => {
    const file = documentWorkspaceFiles.find(f => f.id === id);
    if (file) {
      removeBookmark(generateDocKey(file.fileName));
      setBookmarks(getBookmarks());
    }
    setDocumentWorkspaceFiles(prev => prev.filter(f => f.id !== id));
    if (activeWorkspaceFileId === id) setActiveWorkspaceFileId(null);
  };

  return (
    <div className="min-h-screen pb-32 flex flex-col bg-zinc-950 text-zinc-100 font-sans relative selection:bg-emerald-500/30">
      <Banner />
      
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col max-w-6xl mx-auto w-full px-6 lg:px-8 gap-8 mt-8 lg:mt-16 relative z-10">
        
        {/* Modern Dashboard Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
           <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <BrainCircuit className="w-5 h-5 text-white" />
                 </div>
                 Legal Intelligence Core
              </h1>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 pl-11">
                 Advanced Tactical Analysis Systems
              </p>
           </div>

           <div className="flex items-center gap-6 px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl">
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 leading-none mb-1">AI Core Status</span>
                 <span className="text-[10px] font-bold text-emerald-400">ACTIVE_REASONING</span>
              </div>
              <div className="w-px h-6 bg-zinc-800"></div>
              <div className="flex items-center gap-3">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-[10px] font-mono text-zinc-500">Node_01_CO</span>
              </div>
           </div>
        </header>

        <div className="flex-grow flex flex-col gap-10 min-w-0">
          {activeTab === 'copilot' && (
            <main className="flex flex-col gap-10 animate-entry">
              <SearchForm
                params={searchParams}
                setParams={setSearchParams}
                onSearch={handleSearch}
                isLoading={isLoading}
                onClear={() => { setOutput(null); setSearchParams({...searchParams, query: ''}); }}
                onSelectHistory={(p) => { setSearchParams(p); executeSearch(p); }}
                onSave={() => currentSearchParamsForResults && output && handleSaveResult(currentSearchParamsForResults, output)}
                onImportPDF={() => setActiveTab('audit')}
                canSave={!!output && !!currentSearchParamsForResults}
              />
              
              <Examples onSelectExample={(ex) => setSearchParams({...searchParams, ...ex})} />

              {error && (
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl flex items-center gap-6 text-red-400 animate-entry">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">System Exception</span>
                    <span className="text-sm font-bold tracking-tight">{cleanErrorMessage(error)}</span>
                  </div>
                </div>
              )}

              <ResultsDisplay
                output={output}
                searchParams={currentSearchParamsForResults}
                isLoading={isLoading}
                onQuestionClick={(q) => { setSearchParams({...searchParams, query: q}); executeSearch({...searchParams, query: q}); }}
                onAnalysisClick={() => {}}
                onSave={handleSaveResult}
                onRemoveSave={handleRemoveSave}
                isSaved={currentSearchParamsForResults ? isSearchBookmarked(currentSearchParamsForResults) : false}
                onJudgeClick={(name) => { setSelectedJudgeName(name); setShowJudgeModal(true); }}
              />
            </main>
          )}

          {activeTab === 'audit' && (
            <DocumentWorkspace 
              files={documentWorkspaceFiles}
              activeFileId={activeWorkspaceFileId}
              onSelectFile={setActiveWorkspaceFileId}
              onUpload={handleWorkspaceUpload}
              onRemove={handleRemoveWorkspaceFile}
              onMapNarrative={(file) => setShowNarrativeMapper(true)}
              onAnalyzeMultiDocs={handleAnalyzeMultiDocs}
              multiDocResult={multiDocumentResult}
              isMultiDocLoading={isMultiDocLoading}
            />
          )}

          {activeTab === 'draft' && (
            <MotionGenerator />
          )}

          {activeTab === 'judge' && (
            <JudgeIntelTab 
               onSearchJudge={(name) => {
                  setSelectedJudgeName(name);
                  setShowJudgeModal(true);
               }} 
            />
          )}

          {activeTab === 'vault' && (
             <div className="animate-entry space-y-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                   <h2 className="text-2xl font-bold serif-heading">Secured Vault</h2>
                   <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Local_Encrypted_Storage</p>
                </div>
                <Bookmarks 
                  bookmarks={bookmarks}
                  onView={handleViewBookmark}
                  onDelete={(key) => { removeBookmark(key); setBookmarks(getBookmarks()); }}
                />
             </div>
          )}
        </div>
      </div>

      <footer className="mt-20 py-12 text-center border-t border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Legal_Intelligence_Platform // v5.0.0_STABLE</span>
          <div className="flex items-center gap-8">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Licensed_to: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            <div className="h-4 w-px bg-zinc-800"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">© 2026_NEURAL_SENSE_SYSTEMS</span>
          </div>
        </div>
      </footer>

      {/* Persistent Bottom Navigation - Sophisticated Dock */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] md:w-[90%] max-w-md shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-3xl">
        <nav className="bg-zinc-900/95 backdrop-blur-3xl border border-zinc-800/80 rounded-3xl p-1.5 flex items-center justify-between gap-1 overflow-hidden">
          {[
            { id: 'copilot', label: 'Counsel', icon: BrainCircuit, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', glowClass: 'bg-emerald-500/50' },
            { id: 'audit', label: 'Workspace', icon: FileText, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', glowClass: 'bg-emerald-500/50' },
            { id: 'draft', label: 'Draft', icon: History, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', glowClass: 'bg-emerald-500/50' },
            { id: 'judge', label: 'Judge', icon: Scale, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', glowClass: 'bg-amber-500/50' },
            { id: 'vault', label: 'Vault', icon: BookmarkIcon, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', glowClass: 'bg-emerald-500/50' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`flex-grow flex flex-col items-center justify-center gap-1 py-2.5 rounded-[20px] transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? `${tab.bgClass} ${tab.colorClass}` 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {isActive && <div className={`absolute top-0 left-0 right-0 h-1 ${tab.glowClass} blur-sm`}></div>}
                <Icon className={`w-[18px] h-[18px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {showJudgeModal && selectedJudgeName && (
        <JudgeDetailModal judgeName={selectedJudgeName} onClose={() => setShowJudgeModal(false)} />
      )}
      {showCrossRefModal && (
        <CrossReferenceModal
          onClose={() => setShowCrossRefModal(false)}
          onReset={() => setCrossRefResult(null)}
          onAnalyze={async (a, am, an, b, bm, bn) => {
            setIsCrossRefLoading(true);
            try { setCrossRefResult(await crossReferenceDocuments(a, am, an, b, bm, bn)); }
            catch(e) { console.error(e); }
            finally { setIsCrossRefLoading(false); }
          }}
          result={crossRefResult}
          isLoading={isCrossRefLoading}
          error={null}
          onSave={(res) => {
            saveBookmark({ key: generateCrossRefKey(res.fileAName, res.fileBName), type: 'cross_reference', result: res, savedAt: Date.now() });
            setBookmarks(getBookmarks());
          }}
          onRemoveSave={(r) => {
            removeBookmark(generateCrossRefKey(r.fileAName, r.fileBName));
            setBookmarks(getBookmarks());
          }}
          isSaved={crossRefResult ? isCrossRefBookmarked(crossRefResult.fileAName, crossRefResult.fileBName) : false}
        />
      )}
      {showNarrativeMapper && (
        <NarrativeMapper 
          onClose={() => { setShowNarrativeMapper(false); setNarrativeInitialData(null); }} 
          initialData={narrativeInitialData}
          onGenerate={async (b, m, n) => await generateNarrativeMap(b, m, n)}
        />
      )}
    </div>
  );
}
