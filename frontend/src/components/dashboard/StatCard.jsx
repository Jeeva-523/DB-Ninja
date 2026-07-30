import React from 'react';

export const StatCard = ({ title, value, badgeText, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  };

  const currentTheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg transition-all hover:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-slate-100">{value}</div>
      {badgeText && (
        <div className={`text-xs mt-1.5 font-medium ${currentTheme.text}`}>
          {badgeText}
        </div>
      )}
    </div>
  );
};
