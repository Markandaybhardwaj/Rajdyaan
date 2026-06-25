// ---------------------------------------------------------------------------
// Cart Page — Client Component (reads from Zustand persist store)
// ---------------------------------------------------------------------------
// Route: /cart
// Full cart UI: item list, quantity controls, coupon input,
// order summary, and checkout CTA.
// ---------------------------------------------------------------------------
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '@/store/useCartStore';
import CouponInput from '@/components/cart/CouponInput';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CartPage() {
  // Hydration guard — Zustand persist loads from localStorage after mount
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const discountAmount = useCartStore((s) => s.discountAmount());
  const total = useCartStore((s) => s.total());
  const count = useCartStore((s) => s.count());
  const coupon = useCartStore((s) => s.coupon);

  // Show skeleton while hydrating
  if (!hydrated) {
    return (
      <div className="min-h-[60vh] bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-primary/10" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-sm bg-primary/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Empty Cart State ----
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-secondary px-5 py-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-support/10">
          <svg
            className="h-12 w-12 text-support"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold text-primary">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-center font-body text-sm text-dark/60">
          Looks like you haven&apos;t added any products yet. Explore our premium
          organic range and add something you love!
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-sm bg-accent px-8 py-3.5 font-body text-sm font-bold uppercase tracking-widest text-primary shadow-lg shadow-accent/20 transition-all hover:bg-primary hover:text-secondary hover:shadow-primary/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold text-primary md:text-3xl">
              Shopping Cart
              <span className="ml-2 font-body text-base font-normal text-dark/50">
                ({count} {count === 1 ? 'item' : 'items'})
              </span>
            </h1>
            <button
              type="button"
              onClick={clearCart}
              className="font-body text-xs font-medium uppercase tracking-wider text-dark/40 transition-colors hover:text-red-600"
            >
              Clear All
            </button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* ===== LEFT: Cart Items ===== */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-sm border border-[#E8DCC8] bg-white p-4 transition-shadow hover:shadow-md md:gap-6 md:p-5"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm border border-[#E8DCC8] bg-white md:h-28 md:w-28"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="h-full w-full object-contain p-2"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-heading text-sm font-semibold text-primary line-clamp-2 transition-colors hover:text-accent md:text-base">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-body text-sm font-bold text-primary">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="font-body text-xs text-gray-400 line-through">
                            ₹{item.comparePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: qty controls + subtotal + remove */}
                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center overflow-hidden rounded-sm border border-[#E8DCC8]">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center bg-white text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="flex h-8 w-10 items-center justify-center border-x border-[#E8DCC8] bg-white font-body text-sm font-semibold text-primary">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center bg-white text-primary transition-colors hover:bg-secondary"
                          aria-label="Increase quantity"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>

                      {/* Item Subtotal */}
                      <span className="hidden font-body text-sm font-bold text-primary sm:block">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="flex items-center gap-1 font-body text-xs font-medium text-dark/40 transition-colors hover:text-red-600"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="mt-2 inline-flex items-center gap-2 font-body text-sm font-medium text-accent transition-colors hover:text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* ===== RIGHT: Order Summary ===== */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-5 rounded-sm border border-[#E8DCC8] bg-white p-6">
                <h2 className="font-heading text-lg font-bold text-primary">
                  Order Summary
                </h2>

                {/* Coupon */}
                <CouponInput />

                {/* Divider */}
                <div className="h-px w-full bg-primary/10" />

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-body text-sm">
                    <span className="text-dark/60">
                      Subtotal ({count} {count === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-medium text-dark">
                      ₹{Math.round(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {coupon && discountAmount > 0 && (
                    <div className="flex items-center justify-between font-body text-sm">
                      <span className="text-support">
                        Discount ({coupon.code})
                      </span>
                      <span className="font-medium text-support">
                        −₹{Math.round(discountAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between font-body text-sm">
                    <span className="text-dark/60">Shipping</span>
                    <span className="font-medium text-support">
                      {subtotal >= 499 ? 'FREE' : '₹49'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-primary/10" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-heading text-lg font-bold text-primary">
                    Total
                  </span>
                  <span className="font-body text-xl font-bold text-primary">
                    ₹{Math.round(subtotal < 499 ? total + 49 : total).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Free shipping notice */}
                {subtotal < 499 && (
                  <p className="font-body text-xs text-accent">
                    Add ₹{Math.ceil(499 - subtotal)} more for free shipping!
                  </p>
                )}

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-4 font-body text-sm font-bold uppercase tracking-widest text-primary shadow-lg shadow-accent/20 transition-all hover:bg-primary hover:text-secondary hover:shadow-primary/20"
                >
                  Proceed to Checkout
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                {/* Trust */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <svg className="h-4 w-4 text-support" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span className="font-body text-[11px] text-dark/40">
                    Secure checkout · SSL encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

