'use client';

import React from 'react';
import { RefreshCw, ShieldCheck, PlusCircle, PackageSearch, Store, Sun, Moon } from 'lucide-react';
import { AssertionResult } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  onOpenLogModal: () => void;
  onOpenCatalogModal: () => void;
  onOpenAuditModal: () => void;
  onResetData: () => void;
  assertions?: AssertionResult | null;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogModal,
  onOpenCatalogModal,
  onOpenAuditModal,
  onResetData,
  assertions,
  loading
}) => {
  const isAllPassed = assertions?.allPassed ?? true;
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 mb-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/25 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
              Returns &amp; Exchange
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Store #402 · Branch Main
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* System Check */}
          <button
            onClick={onOpenAuditModal}
            title="System integrity checks"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isAllPassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/15'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/15'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>System Check</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isAllPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </button>

          {/* Inventory */}
          <button
            onClick={onOpenCatalogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all"
          >
            <PackageSearch className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Inventory</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetData}
            disabled={loading}
            title="Reset to demo data"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* New Return CTA */}
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Return</span>
          </button>
        </div>
      </div>
    </header>
  );
};
