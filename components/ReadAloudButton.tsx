
import React, { useState, useEffect } from 'react';
import { generateSpeech, playAudioData } from '../services/geminiService';
import { Volume2, Square, Loader2 } from 'lucide-react';

interface ReadAloudButtonProps {
    text: string;
    className?: string;
}

export default function ReadAloudButton({ text, className = "" }: ReadAloudButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stopFn, setStopFn] = useState<(() => void) | null>(null);

    const handleToggle = async () => {
        if (isPlaying) {
            if (stopFn) stopFn();
            setIsPlaying(false);
            setStopFn(null);
            return;
        }

        setIsLoading(true);
        try {
            const base64 = await generateSpeech(text);
            if (base64) {
                const stop = await playAudioData(base64, () => {
                    setIsPlaying(false);
                    setStopFn(null);
                });
                setStopFn(() => stop);
                setIsPlaying(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (stopFn) stopFn();
        };
    }, [stopFn]);

    return (
        <button 
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest ${
                isPlaying 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
            } ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 text-current animate-spin" />
            ) : isPlaying ? (
                <Square className="w-3 h-3 text-current" />
            ) : (
                <Volume2 className="w-3 h-3 text-current" />
            )}
            {isPlaying ? 'Stop Audio' : 'Read Aloud'}
        </button>
    );
}
