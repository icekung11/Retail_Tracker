'use client';

import React from 'react';
import { X, Package, Box } from 'lucide-react';
import { Product } from '@/types';

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const ProductCatalogModal: React.FC<ProductCatalogModalProps> = ({
  isOpen,
  onClose,
  products
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl my-8 flex flex-col max-h-[90vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Store Inventory</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Current product catalog and available stock levels.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <div>
                  <div className="aspect-[4/3] w-full rounded-lg overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/90 text-slate-700 border border-slate-200 shadow-2xs dark:bg-slate-950/80 dark:text-slate-300 dark:border-slate-800">
                      {product.sku}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h3 className="text-xs font-medium text-slate-900 dark:text-slate-200 line-clamp-2 mb-2">{product.name}</h3>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Box className="w-3.5 h-3.5 text-slate-400" />
                    <span>{product.stock} in stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
