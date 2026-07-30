import React from 'react';
import { TrendingUp } from 'lucide-react';

export const SalesChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map(d => Number(d.revenue) || 1), 1000);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" /> Revenue Performance Trend
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Daily aggregate sales revenue over the last 15-30 days</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20">
          Live Data
        </span>
      </div>

      {/* Dynamic SVG Sparkline / Bar Chart Visualization */}
      <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
        {data.map((item, idx) => {
          const heightPercent = Math.min(Math.max((Number(item.revenue) / maxRevenue) * 100, 8), 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip on Hover */}
              <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-800 text-slate-100 text-[10px] py-1 px-2 rounded border border-slate-700 shadow-xl z-20 whitespace-nowrap">
                <span>{item.date}</span>
                <span className="font-bold text-emerald-400">${Number(item.revenue).toLocaleString()}</span>
              </div>

              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full bg-gradient-to-t from-emerald-600/30 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:from-emerald-500 group-hover:to-emerald-300"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-1">
        <span>{data[0]?.date || 'Start'}</span>
        <span>{data[Math.floor(data.length / 2)]?.date || 'Mid'}</span>
        <span>{data[data.length - 1]?.date || 'End'}</span>
      </div>
    </div>
  );
};
