'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { AnalyticsSummary, ReturnReason } from '@/types';

interface ReasonAnalyticsProps {
  analytics: AnalyticsSummary;
}

export const ReasonAnalytics: React.FC<ReasonAnalyticsProps> = ({ analytics }) => {
  const reasons: Array<{ key: ReturnReason; label: string; desc: string; defaultRestock: boolean }> = [
    {
      key: 'defective',
      label: 'Defective Product',
      desc: 'Hardware or manufacturing defect',
      defaultRestock: false
    },
    {
      key: 'wrong_size',
      label: 'Wrong Size / Fit',
      desc: 'Sizing mismatch, unworn item',
      defaultRestock: true
    },
    {
      key: 'changed_mind',
      label: 'Customer Changed Mind',
      desc: 'Unopened / change of preference',
      defaultRestock: true
    },
    {
      key: 'damaged',
      label: 'Damaged in Transit',
      desc: 'Cracked, dented, or broken packaging',
      defaultRestock: false
    }
  ];

  const grandTotalCost = Object.values(analytics.reasonBreakdown).reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Return Reasons &amp; Inventory Impact
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Breakdown of returns by reason, total refund amount, and restock behavior.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reasons.map((item) => {
          const breakdown = analytics.reasonBreakdown[item.key] || { count: 0, totalCost: 0 };
          const percentage = grandTotalCost > 0 ? Math.round((breakdown.totalCost / grandTotalCost) * 100) : 0;

          return (
            <div
              key={item.key}
              className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xs font-medium text-slate-900 dark:text-slate-200">{item.label}</h3>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    item.defaultRestock
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent'
                      : 'bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {item.defaultRestock ? 'Auto-Restock' : 'Quarantine'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{item.desc}</p>

                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-base font-semibold text-slate-900 dark:text-white">${breakdown.totalCost.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{breakdown.count} units ({percentage}%)</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percentage, breakdown.count > 0 ? 6 : 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Default action:</span>
                <span className="text-slate-800 dark:text-slate-300 font-medium">
                  {item.defaultRestock ? '+1 to inventory' : 'Do not restock'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
