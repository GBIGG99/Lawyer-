import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { type TrendDataPoint } from '../types';

interface TrendsChartProps {
  data: TrendDataPoint[];
  isLoading: boolean;
}

export default function TrendsChart({ data, isLoading }: TrendsChartProps) {
  if (isLoading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-6 glass-slab">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin shadow-[0_0_20px_rgba(245,158,11,0.2)]"></div>
          <div className="absolute inset-0 bg-amber-500/5 blur-xl animate-pulse"></div>
        </div>
        <span className="micro-label !text-amber-500/60 animate-pulse">
          Aggregating_Statistical_Trends...
        </span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-[450px] glass-slab p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] blur-[100px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase glow-text-amber">Jurisdictional_Trend_Analysis</h3>
        </div>
        <span className="micro-label !text-slate-600">Macro_Level_Metrics_v2.1</span>
      </div>

      <div className="h-[320px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFilings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConvictions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDismissals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#ffffff20" 
              fontSize={10} 
              tickMargin={15} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
            />
            <YAxis 
              stroke="#ffffff20" 
              fontSize={10} 
              tickMargin={15} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#f8fafc',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
              itemStyle={{
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '30px' }}
              iconType="circle"
              iconSize={8}
            />
            <Area 
              type="monotone" 
              dataKey="filings" 
              name="Case_Filings"
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorFilings)" 
              strokeWidth={3}
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="convictions" 
              name="Convictions"
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorConvictions)" 
              strokeWidth={3}
              animationDuration={2500}
            />
            <Area 
              type="monotone" 
              dataKey="dismissals" 
              name="Dismissals"
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorDismissals)" 
              strokeWidth={3}
              animationDuration={3000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
