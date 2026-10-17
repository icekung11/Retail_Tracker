'use client';

import React from 'react';
import { DollarSign, RotateCcw, PackageCheck, AlertCircle } from 'lucide-react';
import { AnalyticsSummary } from '@/types';

interface SummaryCardsProps {
  analytics: AnalyticsSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analytics }) => {
  const reasonLabels: Record<string, string> = {
    defective: 'Defective',
    wrong_size: 'Wrong Size',
    changed_mind: 'Changed Mind',
    damaged: 'Damaged Freight',
    None: 'None'
  };

  const restockRate = analytics.totalCount > 0
    ? Math.round((analytics.restockedCount / (analytics.restockedCount + analytics.quarantinedCount || 1)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {/* 1. Today Refund Total */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-xs font-medium tracking-wide">Refunds Today</span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            ${analytics.todayRefundTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Total refunded to customers today
          </p>
        </div>
      </div>

      {/* 2. Total Transactions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-xs font-medium tracking-wide">Total Returns Logged</span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {analytics.totalCount} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">transactions</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Returns &amp; item exchanges
          </p>
        </div>
      </div>

      {/* 3. Restocked vs Quarantined */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-xs font-medium tracking-wide">Restocked vs Quarantined</span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{analytics.restockedCount}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">restocked</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">{analytics.quarantinedCount}</span>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">scrapped</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {restockRate}% returned to available stock
          </p>
        </div>
      </div>

      {/* 4. Top Return Reason */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-xs font-medium tracking-wide">Leading Return Reason</span>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 truncate">
            {reasonLabels[analytics.topReason] || analytics.topReason}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Highest cumulative refund value
          </p>
        </div>
      </div>
    </div>
  );
};
