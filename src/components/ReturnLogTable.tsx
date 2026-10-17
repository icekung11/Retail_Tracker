'use client';

import React, { useState } from 'react';
import { Search, Download, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { ReturnRecord, ReturnReason } from '@/types';

interface ReturnLogTableProps {
  returns: ReturnRecord[];
}

export const ReturnLogTable: React.FC<ReturnLogTableProps> = ({ returns }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredReturns = returns.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.exchangeDetails?.newProductName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReason = reasonFilter === 'all' || r.reason === reasonFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;

    return matchesSearch && matchesReason && matchesType;
  });

  const handleExportCSV = () => {
    if (filteredReturns.length === 0) return;

    const headers = ['Transaction ID', 'Date', 'Type', 'Item', 'Qty', 'Unit Price', 'Reason', 'Restocked', 'Net Amount', 'Exchange Item', 'Notes'];
    const rows = filteredReturns.map(r => [
      r.id,
      new Date(r.timestamp).toLocaleString(),
      r.type,
      `"${r.productName.replace(/"/g, '""')}"`,
      r.qty,
      r.unitPrice,
      r.reason,
      r.restock ? 'YES' : 'NO',
      r.refundAmount,
      r.exchangeDetails ? `"${r.exchangeDetails.newProductName.replace(/"/g, '""')}"` : 'N/A',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `returns_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reasonLabels: Record<ReturnReason, string> = {
    defective: 'Defective',
    damaged: 'Damaged',
    wrong_size: 'Wrong Size',
    changed_mind: 'Changed Mind'
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-12 shadow-xs transition-colors">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Transaction History</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Log of customer returns, product exchanges, and inventory adjustments.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search item or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none w-44 sm:w-56"
            />
          </div>

          {/* Reason Filter */}
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All reasons</option>
            <option value="defective">Defective</option>
            <option value="wrong_size">Wrong Size</option>
            <option value="changed_mind">Changed Mind</option>
            <option value="damaged">Damaged</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All types</option>
            <option value="return">Returns only</option>
            <option value="exchange">Exchanges only</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={filteredReturns.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 font-medium">
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Restock</th>
              <th className="py-3 px-4 text-right">Refund / Charge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
            {filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                  No return records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-300">{r.id}</td>

                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    <span className="text-slate-400 dark:text-slate-600">·</span>{' '}
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  <td className="py-3 px-4">
                    {r.type === 'exchange' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-transparent">
                        <ArrowRightLeft className="w-3 h-3" /> Exchange
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-transparent">
                        <RotateCcw className="w-3 h-3" /> Return
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-900 dark:text-slate-200">
                    <div className="font-medium">{r.productName}</div>
                    {r.exchangeDetails && (
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
                        ↳ Swapped for: {r.exchangeDetails.newProductName} (×{r.exchangeDetails.newQty})
                      </div>
                    )}
                    {r.notes && <div className="text-[11px] text-slate-500 mt-0.5 italic">"{r.notes}"</div>}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-slate-900 dark:text-slate-300">{r.qty}</td>

                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">
                      {reasonLabels[r.reason] || r.reason}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {r.restock ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Restocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                        Quarantined
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {r.refundAmount >= 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">${r.refundAmount.toFixed(2)}</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">+${Math.abs(r.refundAmount).toFixed(2)}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
