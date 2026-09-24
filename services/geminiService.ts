import { type SearchParams, type SearchResult, type Source, TimelineEvent, JudgeSummary, JudgeDetail, DocumentAnalysisResult, CrossReferenceResult, NarrativeMapResult, AdversarialStrategy, StrategicTelemetry, DocumentAnnotation, SummaryLength, ChatMessage, TrendDataPoint, MultiDocumentAnalysisResult } from '../types';

export const searchWebWithGemini = async (params: SearchParams, onPartial: (partial: any) => void): Promise<SearchResult> => {
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Uplink synchronization fault.');
    }
    const result = await response.json();
    onPartial({ summary: result.summary, sources: result.sources });
    return result;
};

export const generateExecutiveSummary = async (summary: string, strategy: AdversarialStrategy): Promise<string> => {
    const response = await fetch('/api/generate-executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, strategy })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Summary link failure.');
    }
    const data = await response.json();
    return data.summary;
};

export const generateStrategicAnalysis = async (summary: string): Promise<string> => {
    const response = await fetch('/api/generate-strategic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Strategic channel timeout.');
    }
    const data = await response.json();
    return data.analysis;
};

export const getJudgeDetails = async (judgeName: string): Promise<JudgeDetail> => {
    const response = await fetch('/api/get-judge-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judgeName })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Could not correlate record for ${judgeName}.`);
    }
    return response.json();
};

export const analyzeMultiDocuments = async (
    files: { base64: string; mimeType: string; fileName: string; id: string }[]
): Promise<MultiDocumentAnalysisResult> => {
    const response = await fetch('/api/analyze-multi-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {
            id: crypto.randomUUID(),
            fileIds: files.map(f => f.id),
            status: 'error',
            caseSummary: `Audit failure: ${err.error || 'Unknown network error'}.`,
            unifiedStrategy: '',
            overarchingRisks: [],
            keyIdentifiedEntities: [],
            crossDocumentDiscrepancies: [],
            actionableRoadmap: []
        };
    }
    return response.json();
};

export const analyzeDocument = async (base64Content: string, mimeType: string, fileName: string): Promise<DocumentAnalysisResult> => {
    const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Content, mimeType, fileName })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {
            id: crypto.randomUUID(),
            fileName,
            uploadDate: Date.now(),
            status: 'error',
            strategicSummary: `Audit failure: ${err.error || 'Unknown network error'}.`,
            keyArguments: [],
            identifiedEntities: [],
            actionableInsights: [],
            annotations: []
        };
    }
    return response.json();
};

export const askDocumentQuestion = async (analysis: DocumentAnalysisResult, question: string): Promise<string> => {
    const response = await fetch('/api/ask-document-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, question })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Tactical link failure.');
    }
    const data = await response.json();
    return data.answer;
};

export const crossReferenceDocuments = async (
    fileABase64: string, fileAMime: string, fileAName: string,
    fileBBase64: string, fileBMime: string, fileBName: string
): Promise<any> => {
    const response = await fetch('/api/cross-reference-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileABase64, fileAMime, fileAName, fileBBase64, fileBMime, fileBName })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Uplink synchronization fault.');
    }
    return response.json();
};

export const generateNarrativeMap = async (base64Content: string, mimeType: string, fileName: string): Promise<NarrativeMapResult> => {
    const response = await fetch('/api/generate-narrative-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Content, mimeType, fileName })
    });
    if (!response.ok) {
        return { nodes: [], links: [], timeline: [], strategicAssessment: 'Neural network timeout.' };
    }
    return response.json();
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data;
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    return audioContext;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playAudioData = async (base64String: string, onEnded?: () => void): Promise<() => void> => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
    
    const audioBuffer = await decodeAudioData(decode(base64String), ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => {
        if (onEnded) onEnded();
    };
    source.start();
    
    return () => {
        try {
            source.stop();
            source.disconnect();
        } catch (e) {}
    };
};

export const conductTacticalChat = async (
    history: ChatMessage[],
    message: string,
    onPartial: (chunk: string) => void,
    context?: string
) => {
    const response = await fetch('/api/conduct-tactical-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history, message, context }),
    });

    if (!response.body) {
        throw new Error('ReadableStream not supported.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            onPartial(chunk);
        }
    }
};
