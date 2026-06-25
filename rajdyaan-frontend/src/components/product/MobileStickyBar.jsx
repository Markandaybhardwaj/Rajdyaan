// ---------------------------------------------------------------------------
// MobileStickyBar — Client Component
// ---------------------------------------------------------------------------
// Fixed bottom bar visible only on mobile (lg:hidden).
// Shows price + "Add to Cart" button for quick mobile checkout.
// ---------------------------------------------------------------------------
'use client';

import { useState } from 'react';
import useCartStore from '@/store/useCartStore';

export default function MobileStickyBar({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const inStock = product.stock > 0;

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-primary/10 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        {/* Price */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-body text-lg font-bold text-primary">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="font-body text-xs text-gray-400 line-through">
                ₹{product.comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="font-body text-[11px] font-semibold text-accent">
              You save ₹{(product.comparePrice - product.price).toLocaleString('en-IN')} ({discount}% off)
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className={`flex items-center gap-2 rounded-sm px-6 py-3 font-body text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
            added
              ? 'bg-support text-white'
              : inStock
              ? 'bg-accent text-primary shadow-lg shadow-accent/20 active:scale-95'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
        >
          {added ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Added
            </>
          ) : inStock ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
}
