import React from 'react';
import { TimelineEvent } from '../types';
import { Calendar, Gavel, FileText, Sparkles } from 'lucide-react';

interface TimelineChartProps {
    events: TimelineEvent[];
    isLoading: boolean;
}

const getEventStyles = (type: TimelineEvent['type']) => {
    switch (type) {
        case 'filing': return { 
            icon: <FileText className="w-6 h-6 text-white/20" />,
            accent: 'border-l-white/10',
            tag: 'DOC_FILING'
        };
        case 'court_date': return {
            icon: <Calendar className="w-6 h-6 text-white" />,
            accent: 'border-l-white',
            tag: 'SESS_PROTOCOL'
        };
        case 'ruling': return {
            icon: <Gavel className="w-6 h-6 text-white/60" />,
            accent: 'border-l-white/60',
            tag: 'FINAL_DECISION'
        };
        default: return {
            icon: <Sparkles className="w-6 h-6 text-white/10" />,
            accent: 'border-l-white/5',
            tag: 'DATA_NODE'
        };
    }
}

const getTrackClasses = (track?: 'prosecution' | 'defense' | 'undisputed') => {
    switch (track) {
        case 'prosecution':
            return 'bg-gradient-to-r from-red-950/20 to-[#050505] border-red-900/30';
        case 'defense':
            return 'bg-gradient-to-r from-blue-950/20 to-[#050505] border-blue-900/30';
        case 'undisputed':
            return 'bg-gradient-to-r from-gray-800/20 to-[#050505] border-white/10';
        default:
            return 'bg-white/5 border-white/10';
    }
};

const getTrackLabel = (track?: 'prosecution' | 'defense' | 'undisputed') => {
    if (!track) return null;
    const colors = {
        prosecution: 'text-red-500/60 border-red-500/20 bg-red-500/5',
        defense: 'text-blue-400/60 border-blue-400/20 bg-blue-400/5',
        undisputed: 'text-gray-400/60 border-gray-400/20 bg-gray-400/5'
    };
    return (
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 border rounded-sm ${colors[track]}`}>
            {track}_vector
        </span>
    );
};

export default function TimelineChart({ events, isLoading }: TimelineChartProps): React.ReactNode {
    if (isLoading) return null;
    if (!events || events.length === 0) return null;

    return (
        <div className="relative">
            <div className="flex items-center gap-10 mb-24 relative z-10">
                <div className="p-8 glass-slab !bg-white text-black shadow-2xl border-white/20">
                    <Calendar className="w-12 h-12" />
                </div>
                <div>
                    <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none glow-text-blue">Temporal<br/>Vector_Map</h4>
                    <p className="micro-label mt-4 !text-slate-600">Chronological_Data_Sequence_v4.0</p>
                </div>
            </div>
            
            <div className="relative pl-24 border-l-2 border-white/5 space-y-24 ml-12">
                {/* Vertical Line Glow */}
                <div className="absolute left-[-2px] top-0 bottom-0 w-1 bg-blue-500/10 blur-sm"></div>

                {events.map((event, index) => {
                    const styles = getEventStyles(event.type);
                    const trackClasses = getTrackClasses(event.narrativeTrack);
                    
                    return (
                        <div key={index} className="relative group">
                            {/* Node Number */}
                            <div className="absolute -left-[118px] top-0 w-24 h-24 flex items-center justify-center glass-slab !bg-[#050505] text-white font-mono text-3xl font-black z-10 group-hover:border-blue-500/50 transition-all shadow-2xl">
                                <span className="relative z-10">{index + 1}</span>
                                <div className="absolute inset-0 bg-blue-500/[0.02] group-hover:bg-blue-500/[0.05] transition-colors"></div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-8 mb-10 max-w-5xl">
                                <div className="flex items-center gap-10">
                                    <span className="font-mono font-black text-sm text-blue-400 bg-blue-500/5 border border-blue-500/20 px-10 py-4 tracking-[0.2em] rounded-lg shadow-lg">
                                        {event.date}
                                    </span>
                                    <div className="flex items-center gap-6">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{styles.icon}</div>
                                        <span className="micro-label !text-slate-600 group-hover:!text-slate-400 transition-colors">
                                            {styles.tag}
                                        </span>
                                    </div>
                                </div>
                                {getTrackLabel(event.narrativeTrack)}
                            </div>

                            <div className={`p-12 glass-slab !bg-white/[0.01] group-hover:!bg-white/[0.03] transition-all border-l-[12px] shadow-2xl relative overflow-hidden ${trackClasses} ${styles.accent}`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] blur-[80px] pointer-events-none"></div>
                                <p className="text-3xl text-white font-extralight italic leading-relaxed tracking-tight max-w-4xl relative z-10">
                                    "{event.description}"
                                </p>
                                {event.citation && (
                                    <div className="mt-12 pt-10 border-t border-white/5 flex items-center relative z-10">
                                        <span className="micro-label !text-slate-700">REF_BLOCK_ID:</span>
                                        <span className="data-value text-xs text-slate-500 ml-4 tracking-widest">{event.citation}</span>
                                        <div className="h-px flex-grow mx-10 bg-white/5"></div>
                                        <span className="text-[8px] font-black text-slate-800 uppercase tracking-[0.5em]">Neural_Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}