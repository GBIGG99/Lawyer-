
import React from 'react';
import { StrategicTelemetry } from '../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import StrategicRadarChart from './StrategicRadarChart';

interface StrategicTelemetryWidgetProps {
  telemetry?: StrategicTelemetry;
  isLoading?: boolean;
}

const ThreatIndicator: React.FC<{ label: string; impact: number; probability: number }> = ({ label, impact, probability }) => {
  const score = (impact * probability) / 100;
  const isHigh = score > 0.5;
  
  return (
    <div className="flex flex-col gap-3 p-5 glass-widget !bg-white/[0.01] group hover:border-white/20 transition-all">
      <div className="flex justify-between items-start">
        <span className="micro-label !text-slate-500 truncate max-w-[140px]">{label}</span>
        {isHigh && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
      </div>
      <div className="flex gap-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isHigh ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-orange-500'}`} 
          style={{ width: `${(impact/10)*100}%` }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-widest">
        <span>Impact: {impact}/10</span>
        <span>Prob: {probability * 10}%</span>
      </div>
    </div>
  );
};

export default function StrategicTelemetryWidget({ telemetry, isLoading }: StrategicTelemetryWidgetProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="glass-slab p-24 flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-500/40 animate-spin" />
          <div className="absolute inset-0 bg-blue-500/10 blur-xl animate-pulse"></div>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Scanning_Threat_Vectors...</span>
      </div>
    );
  }

  if (!telemetry) return null;

  const threatMatrix = telemetry.threatMatrix || [];
  const strategicFactors = telemetry.strategicFactors || { evidence: 5, procedural: 5, jurisdictional: 5, resource: 5, opponentVulnerability: 5 };

  return (
    <div className="glass-slab p-8 md:p-12 relative overflow-hidden dashboard-grid">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/[0.03] blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start mb-16 border-b border-white/5 pb-16 relative z-10">
        {/* Readiness Meter & Radar Container */}
        <div className="flex flex-col sm:flex-row gap-16 items-center shrink-0">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/[0.02]" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="66" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={414.7}
                  strokeDashoffset={414.7 - (414.7 * (telemetry.readinessScore || 0)) / 100}
                  className="text-blue-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white italic tracking-tighter glow-text-blue">{telemetry.readinessScore || 0}</span>
                <span className="micro-label !text-blue-500">Readiness</span>
              </div>
            </div>
            <p className="micro-label !text-slate-600 text-center max-w-[140px]">Case_Preparation_Velocity</p>
          </div>

          {/* Strategic Factor Pulse (Radar Chart) */}
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 glass-widget !bg-white/[0.01] border-white/5">
              <StrategicRadarChart factors={strategicFactors} size={200} />
            </div>
            <p className="micro-label !text-slate-600 text-center max-w-[140px]">Strategic_Strength_Pulse</p>
          </div>

          {/* Success Probability Gauge */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/[0.02]" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="66" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={414.7}
                  strokeDashoffset={414.7 - (414.7 * (Math.max(0, (telemetry.readinessScore || 0) - (telemetry.complexityIndex || 0) * 2))) / 100}
                  className="text-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white italic tracking-tighter glow-text-emerald">{Math.max(0, (telemetry.readinessScore || 0) - (telemetry.complexityIndex || 0) * 2)}%</span>
                <span className="micro-label !text-emerald-500">Success_Prob</span>
              </div>
            </div>
            <p className="micro-label !text-slate-600 text-center max-w-[140px]">Outcome_Probability_Model</p>
          </div>
        </div>

        {/* Complexity Index */}
        <div className="flex-grow space-y-10 w-full">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase glow-text-blue">Intelligence_Telemetry</h3>
              <div className="flex flex-col items-end">
                <span className="micro-label !text-slate-500">Complexity_Index</span>
                <span className="text-2xl font-black text-white font-mono tracking-tighter">{telemetry.complexityIndex || 0}.00/10.00</span>
              </div>
            </div>
            <div className="h-6 w-full bg-white/[0.02] rounded-lg overflow-hidden border border-white/5 p-1 relative">
               <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 rounded-md shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                style={{ width: `${(telemetry.complexityIndex || 0) * 10}%` }}
               />
               <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-lg text-slate-400 font-light leading-relaxed italic">
            Neural sensors indicate a <span className="text-white font-bold tracking-tight">{(telemetry.complexityIndex || 0) > 7 ? 'HIGH_CRITICAL' : (telemetry.complexityIndex || 0) > 4 ? 'MODERATE_STABLE' : 'LOW_MINIMAL'}</span> complexity legal landscape. Strategy deployment should focus on procedural efficiency and neural optimization.
          </p>
        </div>
      </div>

      {/* Threat Matrix */}
      <div className="relative z-10">
        <div className="flex items-center gap-6 mb-10">
          <h4 className="micro-label !text-slate-600">Adversarial_Threat_Matrix_v2</h4>
          <div className="h-px flex-grow bg-white/5"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {threatMatrix.map((threat, i) => (
            <ThreatIndicator key={i} {...threat} />
          ))}
          {threatMatrix.length === 0 && (
            <div className="col-span-full py-12 glass-widget !bg-white/[0.01] border-dashed text-center">
                <span className="micro-label !text-slate-700">No_High-Risk_Threat_Vectors_Detected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
