'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { ReasonAnalytics } from '@/components/ReasonAnalytics';
import { LogReturnModal } from '@/components/LogReturnModal';
import { ReturnLogTable } from '@/components/ReturnLogTable';
import { AuditModal } from '@/components/AuditModal';
import { ProductCatalogModal } from '@/components/ProductCatalogModal';
import { Product, ReturnRecord, AnalyticsSummary, AssertionResult } from '@/types';
import { addReturnTransaction, getAnalyticsSummary, getDatabase, resetDatabase } from '@/lib/storage';
import { runSafetyAssertions } from '@/lib/assertions';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    todayRefundTotal: 0,
    totalCount: 0,
    restockedCount: 0,
    quarantinedCount: 0,
    topReason: 'None',
    reasonBreakdown: {
      defective: { count: 0, totalCost: 0 },
      wrong_size: { count: 0, totalCost: 0 },
      changed_mind: { count: 0, totalCost: 0 },
      damaged: { count: 0, totalCost: 0 }
    }
  });
  const [assertions, setAssertions] = useState<AssertionResult | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Load data from this browser's local storage.
  const loadData = () => {
    try {
      setLoading(true);
      const db = getDatabase();
      setProducts(db.products);
      setReturns(db.returns);
      setAnalytics(getAnalyticsSummary(db));
      setAssertions(runSafetyAssertions(db));
    } catch (error) {
      console.error('Error loading browser data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle New Return or Exchange Submission
  const handleLogReturnSubmit = async (payload: Omit<ReturnRecord, 'id' | 'timestamp'>) => {
    const result = addReturnTransaction(payload);
    const db = getDatabase();
    setProducts(result.updatedProducts);
    setReturns(db.returns);
    setAnalytics(getAnalyticsSummary(db));
    setAssertions(runSafetyAssertions(db));
  };

  // Handle Reset Data to Seed
  const handleResetData = async () => {
    if (!confirm('Reset the returns database to sample store data?')) return;
    try {
      setLoading(true);
      const db = resetDatabase();
      setProducts(db.products);
      setReturns(db.returns);
      setAnalytics(getAnalyticsSummary(db));
      setAssertions(runSafetyAssertions(db));
    } catch (error) {
      console.error('Error resetting database:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run Integrity Assertions
  const handleRunAssertions = async () => {
    try {
      setAssertions(runSafetyAssertions(getDatabase()));
    } catch (error) {
      console.error('Error running assertions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-16 antialiased transition-colors duration-150">
      {/* Top Header */}
      <Header
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenCatalogModal={() => setIsCatalogModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onResetData={handleResetData}
        assertions={assertions}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Metric Overview Cards */}
        <SummaryCards analytics={analytics} />

        {/* Reason Cost Analytics */}
        <ReasonAnalytics analytics={analytics} />

        {/* Transaction History Data Table */}
        <ReturnLogTable returns={returns} />
      </main>

      {/* Modals */}
      <LogReturnModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        products={products}
        onSubmit={handleLogReturnSubmit}
      />

      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        assertions={assertions}
        onRunAssertions={handleRunAssertions}
      />

      <ProductCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        products={products}
      />
    </div>
  );
}
