'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Play, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { AssertionResult } from '@/types';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assertions?: AssertionResult | null;
  onRunAssertions: () => Promise<void>;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  assertions,
  onRunAssertions
}) => {
  const [running, setRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRun = async () => {
    setRunning(true);
    await onRunAssertions();
    setRunning(false);
  };

  const allPassed = assertions?.allPassed ?? true;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl my-10 overflow-hidden transition-colors">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className={`w-5 h-5 ${allPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">System Integrity Check</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Validates inventory and refund rules on every transaction</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Overall status */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
            allPassed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-400'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/5 dark:border-rose-500/20 dark:text-rose-400'
          }`}>
            <div>
              <p className="text-sm font-semibold">
                {allPassed ? 'All checks passed' : 'Issues detected'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Last run: {assertions?.timestamp ? new Date(assertions.timestamp).toLocaleTimeString() : '—'}
              </p>
            </div>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-all disabled:opacity-50"
            >
              {running
                ? <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                : <Play className="w-3.5 h-3.5" />
              }
              {running ? 'Running…' : 'Run now'}
            </button>
          </div>

          {/* Individual assertions */}
          <div className="space-y-2">
            {assertions?.assertions.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${
                  item.passed
                    ? 'bg-slate-50 border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-800'
                    : 'bg-rose-50/50 border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/25'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {item.passed
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    }
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-transparent'
                  }`}>
                    {item.passed ? 'OK' : 'FAIL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-6 mb-2 leading-relaxed">{item.description}</p>
                <div className="ml-6 px-3 py-2 rounded-lg bg-white dark:bg-slate-950/60 text-[11px] font-mono text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60">
                  {item.details}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
