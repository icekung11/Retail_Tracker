'use client';

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ArrowRightLeft, AlertCircle, Info } from 'lucide-react';
import { Product, ReturnReason, ReturnType } from '@/types';

interface LogReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (payload: any) => Promise<void>;
}

export const LogReturnModal: React.FC<LogReturnModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit
}) => {
  const [type, setType] = useState<ReturnType>('return');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState<ReturnReason>('defective');
  const [restock, setRestock] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  
  // Exchange mode state
  const [exchangeProductId, setExchangeProductId] = useState<string>('');
  const [exchangeQty, setExchangeQty] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Default selection initialization
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Reason-driven restock rule effect
  useEffect(() => {
    if (reason === 'defective' || reason === 'damaged') {
      setRestock(false);
    } else {
      setRestock(true);
    }
  }, [reason]);

  if (!isOpen) return null;

  const returnedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const exchangeProduct = products.find(p => p.id === exchangeProductId) || products.find(p => p.id !== selectedProductId) || products[0];

  // Financial calculations
  const originalTotal = returnedProduct ? Math.round(returnedProduct.price * qty * 100) / 100 : 0;
  const exchangeTotal = type === 'exchange' && exchangeProduct ? Math.round(exchangeProduct.price * exchangeQty * 100) / 100 : 0;
  const priceDifference = type === 'exchange' ? Math.round((originalTotal - exchangeTotal) * 100) / 100 : originalTotal;
  const refundAmount = priceDifference;

  const isQuarantineReason = reason === 'defective' || reason === 'damaged';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!returnedProduct) {
      setError('Please select an item to return.');
      return;
    }

    if (qty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (type === 'exchange') {
      if (!exchangeProductId) {
        setError('Please select an exchange item.');
        return;
      }
      if (exchangeProductId === returnedProduct.id) {
        setError('Exchange item must be different from the returned item.');
        return;
      }
      if (exchangeProduct && exchangeProduct.stock < exchangeQty) {
        setError(`Insufficient stock for ${exchangeProduct.name}. Current stock: ${exchangeProduct.stock}`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        productId: returnedProduct.id,
        productName: returnedProduct.name,
        unitPrice: returnedProduct.price,
        qty: Number(qty),
        reason,
        type,
        restock,
        refundAmount,
        notes: notes.trim() || undefined,
        exchangeDetails: type === 'exchange' && exchangeProduct ? {
          newProductId: exchangeProduct.id,
          newProductName: exchangeProduct.name,
          newQty: Number(exchangeQty),
          newUnitPrice: exchangeProduct.price,
          priceDifference,
          balanceAction: priceDifference > 0
            ? 'refund_to_customer'
            : priceDifference < 0
            ? 'customer_paid_extra'
            : 'even_exchange'
        } : null
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl my-8 flex flex-col max-h-[92vh] overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Record Return or Exchange</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Process customer item return, restock disposition, and refund calculation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => setType('return')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
              type === 'return'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Standard Return</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('exchange');
              if (!exchangeProductId && products.length > 1) {
                const diffProd = products.find(p => p.id !== selectedProductId);
                if (diffProd) setExchangeProductId(diffProd.id);
              }
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
              type === 'exchange'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Product Exchange</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Returned Item Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Returned Item
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toFixed(2)}) — In stock: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Qty"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Return Reason & Restock Toggle */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Return Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReturnReason)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="defective">Defective product</option>
                  <option value="damaged">Damaged in transit</option>
                  <option value="wrong_size">Wrong size / fit</option>
                  <option value="changed_mind">Customer changed mind</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Restock Item
                </label>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-800 dark:text-slate-300">
                    {restock ? 'Return to inventory (+1)' : 'Quarantine / Discard'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRestock(!restock)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      restock ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        restock ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {isQuarantineReason
                  ? 'Defective or damaged items default to quarantined to avoid reselling faulty stock.'
                  : 'Items in sellable condition default to restocking back into inventory.'}
              </span>
            </p>
          </div>

          {/* Exchange Section */}
          {type === 'exchange' && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Replacement Item (Exchange)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    value={exchangeProductId}
                    onChange={(e) => setExchangeProductId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.id === selectedProductId}>
                        {p.name} (${p.price.toFixed(2)}) — In stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="number"
                    min="1"
                    max={exchangeProduct?.stock || 1}
                    value={exchangeQty}
                    onChange={(e) => setExchangeQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Calculation */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Returned credit ({returnedProduct?.name} × {qty}):</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">${originalTotal.toFixed(2)}</span>
            </div>

            {type === 'exchange' && (
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Replacement cost ({exchangeProduct?.name} × {exchangeQty}):</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">-${exchangeTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {type === 'return'
                  ? 'Net Refund to Customer'
                  : priceDifference > 0
                  ? 'Net Refund to Customer'
                  : priceDifference < 0
                  ? 'Additional Payment Due from Customer'
                  : 'Even Exchange (No Balance)'}
              </span>
              <span className={`text-base font-bold font-mono ${
                priceDifference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {priceDifference >= 0
                  ? `$${priceDifference.toFixed(2)}`
                  : `+$${Math.abs(priceDifference).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Staff Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Receipt verified, original packaging intact"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : type === 'return' ? 'Process Refund' : 'Complete Exchange'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
