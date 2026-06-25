// ---------------------------------------------------------------------------
// CouponInput — Client Component
// ---------------------------------------------------------------------------
// Text input + Apply button. Calls store.applyCoupon() which validates
// server-side. Shows loading spinner, error, or success badge.
// ---------------------------------------------------------------------------
'use client';

import { useState } from 'react';
import useCartStore from '@/store/useCartStore';

export default function CouponInput() {
  const [code, setCode] = useState('');
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const coupon = useCartStore((s) => s.coupon);
  const couponError = useCartStore((s) => s.couponError);
  const couponLoading = useCartStore((s) => s.couponLoading);
  const discountAmount = useCartStore((s) => s.discountAmount());

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    await applyCoupon(code);
    if (!useCartStore.getState().couponError) {
      setCode('');
    }
  };

  // If a coupon is already applied, show the badge
  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm border border-support/30 bg-support/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-support"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <div>
            <span className="font-body text-sm font-bold text-support">
              {coupon.code}
            </span>
            <span className="ml-2 font-body text-xs text-dark/60">
              — You save ₹{Math.round(discountAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={removeCoupon}
          className="flex h-6 w-6 items-center justify-center rounded-full text-dark/40 transition-colors hover:bg-red-100 hover:text-red-600"
          aria-label="Remove coupon"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 rounded-sm border border-[#E8DCC8] bg-white px-4 py-2.5 font-body text-sm text-dark placeholder:text-dark/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          disabled={couponLoading}
        />
        <button
          type="submit"
          disabled={couponLoading || !code.trim()}
          className="flex items-center gap-2 rounded-sm border-2 border-accent bg-white px-5 py-2.5 font-body text-sm font-bold uppercase tracking-wider text-accent transition-all hover:bg-accent hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {couponLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Applying
            </>
          ) : (
            'Apply'
          )}
        </button>
      </form>
      {couponError && (
        <p className="mt-2 font-body text-xs font-medium text-red-600">
          {couponError}
        </p>
      )}
    </div>
  );
}
