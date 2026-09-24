
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type ChatMessage, type SearchResult, type DocumentAnalysisResult } from '../types';
import { conductTacticalChat } from '../services/geminiService';
import { X, Loader2, BrainCircuit, MessageSquare } from 'lucide-react';

interface ChatBotProps {
  onClose: () => void;
  contextResult?: SearchResult | null;
  contextDocument?: DocumentAnalysisResult | null;
}

export default function ChatBot({ onClose, contextResult, contextDocument }: ChatBotProps): React.ReactNode {
  // Determine if we have context
  const hasResultContext = !!(contextResult && contextResult.summary);
  const hasDocumentContext = !!(contextDocument && contextDocument.strategicSummary);
  const isContextLinked = hasResultContext || hasDocumentContext;

  const initialGreeting = useMemo(() => {
    if (hasDocumentContext) return `Neural link to dossier [${contextDocument.fileName}] established. Tactical audit complete. How should we exploit the identified discrepancies?`;
    if (hasResultContext) return "Intelligence dossier active in neural workspace. Tactical scenario mapped. What offensive maneuvers do you require?";
    return "Strategic Tactical Hub established. I am ready to identify institutional failure points. Provide a scenario.";
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Construct a tactical context prompt
  const currentContextString = useMemo(() => {
    if (!isContextLinked) return "";
    let ctx = "CURRENT TACTICAL CONTEXT:\n";
    if (hasDocumentContext) {
      ctx += `Document: ${contextDocument.fileName}\nAudit Summary: ${contextDocument.strategicSummary}\nKey Arguments: ${contextDocument.keyArguments.join('; ')}`;
    } else if (hasResultContext) {
      ctx += `Search Dossier Summary: ${contextResult.summary}\n`;
    }
    return ctx;
  }, [contextResult, contextDocument, isContextLinked]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to local history
    const nextHistory = [...messages, { role: 'user', text: userMsg } as ChatMessage];
    setMessages(nextHistory);
    setIsStreaming(true);

    try {
      let streamingText = "";
      // Placeholder for AI thinking
      setMessages(prev => [...prev, { role: 'model', text: "", isThinking: true }]);
      
      // Pass the current context to the chat service
      await conductTacticalChat(messages, userMsg, (chunk) => {
        streamingText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'model') {
            last.text = streamingText;
            last.isThinking = false;
          }
          return updated;
        });
      }, currentContextString);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || String(err);
      let refinedError = "Neural uplink severed. Institutional gravity detected. Re-establish connection.";
      if (errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('api_key') || errMsg.toLowerCase().includes('400')) {
        refinedError = "Neural uplink severed due to an INVALID, MISSING, or EXPIRED GEMINI_API_KEY. Please verify your API key under Settings > Secrets in the workspace, or restart the server.";
      }
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'model' && last.isThinking) {
          last.text = refinedError;
          last.isThinking = false;
          return updated;
        }
        return [...prev, { role: 'model', text: refinedError }];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:bottom-28 lg:right-8 lg:w-[450px] lg:h-[700px] z-[200] flex flex-col glass-slab shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
      
      {/* Header HUD */}
      <div className="px-6 py-5 border-b border-white/5 bg-slate-800/50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
             <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic leading-none">Tactical_Nexus</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isContextLinked ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`}></span>
                <span className="text-[9px] font-mono text-blue-400 uppercase tracking-tighter">
                    {hasDocumentContext ? `Link: ${contextDocument.fileName.substring(0, 15)}...` : 
                     hasResultContext ? 'Link: Dossier_Intel' : 'Standard_Uplink'}
                </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0f172a]/40">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-[8px] font-black uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-blue-500' : 'text-slate-500'}`}>
              {msg.role === 'user' ? 'Operator' : 'Strategic_Intel'}
            </div>
            <div className={`p-4 lg:p-5 rounded-2xl max-w-[90%] ${
              msg.role === 'user' 
                ? 'bg-blue-600/10 border border-blue-500/30 text-blue-100' 
                : 'bg-white/[0.03] border border-white/5 text-slate-200 shadow-xl'
            }`}>
              {msg.isThinking ? (
                <div className="flex items-center gap-4">
                   <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Calculating_Asymmetry...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none text-slate-200 prose-p:leading-relaxed prose-strong:text-blue-400 prose-h2:text-blue-500 prose-h2:text-xs prose-h2:uppercase">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Module */}
      <div className="p-6 bg-slate-800/30 border-t border-white/5 shrink-0">
        {isContextLinked && (
            <div className="mb-4 flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">AI Contextual Synchronization: 100%</span>
                <div className="flex gap-1">
                    <div className="w-3 h-1 bg-blue-500/40 rounded-full animate-pulse"></div>
                    <div className="w-3 h-1 bg-blue-500/60 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-3 h-1 bg-blue-500/80 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
        )}
        <div className="tactile-input p-1 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isContextLinked ? "Ask about this case..." : "Input tactical scenario..."}
            className="flex-grow bg-transparent border-none px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-600 font-medium"
            disabled={isStreaming}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-30 flex items-center justify-center"
          >
             {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
