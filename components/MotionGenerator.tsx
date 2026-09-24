
import React, { useState } from 'react';
import { MOTION_TEMPLATES, type MotionTemplate } from '../constants/motionTemplates';
import { FileText, Download, ChevronRight, ChevronLeft, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import { generateCourtPleadingPDF } from '../utils/pdfGenerator';

export default function MotionGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MotionTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'select' | 'fill' | 'preview'>('select');

  const handleSelect = (template: MotionTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setStep('fill');
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const generateFinalText = () => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.template;
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || placeholder);
    });
    return text;
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateFinalText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!selectedTemplate) return;
    const text = generateFinalText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.id}_court_draft.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = () => {
    if (!selectedTemplate) return;
    const text = generateFinalText();
    generateCourtPleadingPDF(selectedTemplate.title, text, `${selectedTemplate.id}_court_draft.pdf`);
  };

  return (
    <div className="glass-slab p-6 md:p-8 lg:p-12 animate-entry mb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 border-b border-white/5 pb-6 md:pb-8 gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="serif-heading text-xl md:text-3xl text-white">Procedural_Drafting_Nexus</h2>
            <p className="micro-label !text-slate-500 mt-1">Weaponize your legal arguments with precision templates.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {step !== 'select' && (
            <button 
              onClick={() => setStep(step === 'preview' ? 'fill' : 'select')}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/[0.05]"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" />
              Back
            </button>
          )}
        </div>
      </div>

      {step === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOTION_TEMPLATES.map(template => (
            <div 
              key={template.id}
              onClick={() => handleSelect(template)}
              className="glass-widget p-8 group cursor-pointer hover:border-emerald-500/40 transition-all hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{template.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{template.description}</p>
              <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                Initialize Protocol <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 'fill' && selectedTemplate && (
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {selectedTemplate.fields.map(field => (
              <div key={field.id} className="space-y-3">
                <label className="micro-label pl-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea 
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="glass-widget w-full px-6 py-4 text-sm text-slate-200 focus:outline-none placeholder:text-slate-800 bg-white/[0.01] border-white/5 focus:border-emerald-500/30 transition-all min-h-[120px]"
                  />
                ) : (
                  <input 
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="glass-widget w-full px-6 py-4 text-sm text-slate-200 focus:outline-none placeholder:text-slate-800 bg-white/[0.01] border-white/5 focus:border-emerald-500/30 transition-all"
                  />
                )}
                {field.description && <p className="text-[10px] text-slate-600 italic">{field.description}</p>}
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setStep('preview')}
            className="w-full btn-3d bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-xl flex items-center justify-center gap-4 text-sm tracking-widest"
          >
            <Sparkles className="w-5 h-5" />
            SYNTHESIZE_MOTION_DRAFT
          </button>
        </div>
      )}

      {step === 'preview' && selectedTemplate && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="micro-label shrink-0">Draft_Preview_v1.0</h3>
            <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
              <button 
                onClick={copyToClipboard}
                className={`flex-1 md:flex-none justify-center px-4 md:px-6 py-3 glass-widget flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  copied 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                    : '!bg-white/[0.02] hover:!bg-white/[0.05] text-slate-400 hover:text-white'
                }`}
              >
                <Copy className={`w-3.5 h-3.5 md:w-4 md:h-4 ${copied ? 'text-emerald-400' : ''}`} />
                <span className="truncate">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button 
                onClick={downloadAsTxt}
                className="flex-1 md:flex-none justify-center px-4 md:px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                TXT
              </button>
              <button 
                onClick={downloadAsPdf}
                className="flex-1 md:flex-none justify-center px-4 md:px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.02]"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce" style={{ animationDuration: '2s' }} />
                PDF
              </button>
            </div>
          </div>

          <div className="glass-widget p-6 md:p-12 bg-white/[0.01] border-white/5 font-mono text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[600px] shadow-2xl overflow-x-auto">
            {generateFinalText()}
          </div>

          <div className="p-6 border border-emerald-500/10 bg-emerald-500/[0.02] rounded-xl flex items-start gap-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
            <div>
              <h4 className="text-emerald-400 font-bold mb-1">Strategic Validation Complete</h4>
              <p className="text-xs text-slate-500 leading-relaxed">This draft has been structured according to Colorado procedural standards. Review all bracketed information for accuracy before filing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
