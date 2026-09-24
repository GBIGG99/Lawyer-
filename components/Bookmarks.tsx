import React from 'react';
import { type Bookmark } from '../types';
import { Eye, Trash2, BookmarkCheck } from 'lucide-react';

interface BookmarksProps {
  bookmarks: Bookmark[];
  onView: (bookmark: Bookmark) => void;
  onDelete: (key: string) => void;
}

export default function Bookmarks({ bookmarks, onView, onDelete }: BookmarksProps): React.ReactNode {
  if (bookmarks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks.map(bookmark => (
        <div 
          key={bookmark.key} 
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-all shadow-xl hover:-translate-y-1"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                 {bookmark.type === 'search' ? 'Inquiry_Asset' : 
                  bookmark.type === 'document_analysis' ? 'Dossier_Audit' : 
                  bookmark.type === 'cross_reference' ? 'Cross_Ref_Intel' : 'Unified_Synthesis'}
               </span>
               <div className="flex items-center gap-1">
                 <button 
                   onClick={() => onDelete(bookmark.key)} 
                   className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
            </div>
            
            <div className="min-h-[60px]">
               <h4 className="text-sm font-bold text-zinc-300 leading-snug group-hover:text-white transition-colors line-clamp-3">
                 {bookmark.type === 'search' ? bookmark.params.query : 
                  bookmark.type === 'document_analysis' ? bookmark.result.fileName : 
                  bookmark.type === 'cross_reference' ? `Audit: ${bookmark.result.fileAName} vs ${bookmark.result.fileBName}` : 
                  'Unified Case Analysis'}
               </h4>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/50">
             <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">
               {new Date(bookmark.savedAt).toLocaleDateString()}
             </span>
             <button 
               onClick={() => onView(bookmark)} 
               className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
             >
                <Eye className="w-3 h-3" />
                Dossier_Link
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
