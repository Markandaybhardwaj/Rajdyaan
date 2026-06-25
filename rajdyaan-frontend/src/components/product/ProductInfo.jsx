// ---------------------------------------------------------------------------
// ProductInfo — Client Component
// ---------------------------------------------------------------------------
// Product name, price, short description, quantity selector,
// Add to Cart / Add to Wishlist buttons, and trust badges.
// ---------------------------------------------------------------------------
'use client';

import { useState } from 'react';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';

export default function ProductInfo({ product, discount }) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product._id));

  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleIncrement = () => {
    if (quantity < product.stock) setQuantity((q) => q + 1);
  };

  return (
    <div className="flex flex-col gap-5 py-2 lg:py-4">
      {/* ---- Product Name ---- */}
      <h1 className="font-heading text-2xl font-bold leading-tight text-primary md:text-3xl lg:text-[28px]">
        {product.name}
      </h1>
      {product.weight && (
        <span className="font-body text-sm font-bold text-accent -mt-4">
          {product.weight >= 1000 ? `${product.weight / 1000} kg` : `${product.weight} g`}
        </span>
      )}

      {/* ---- Ratings (if available) ---- */}
      {product.ratingsAverage > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(product.ratingsAverage)
                    ? 'text-accent'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-body text-sm text-dark/60">
            {product.ratingsAverage} ({product.ratingsCount} reviews)
          </span>
        </div>
      )}

      {/* ---- Price Block ---- */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-body text-2xl font-bold text-primary md:text-3xl">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <>
            <span className="font-body text-base text-gray-400 line-through md:text-lg">
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
            <span className="rounded-sm bg-accent/15 px-2 py-0.5 font-body text-xs font-bold text-accent">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {/* ---- Tax info ---- */}
      <p className="font-body text-xs text-dark/50">
        Inclusive of all taxes. Free shipping on orders above ₹499.
      </p>

      {/* ---- Short Description ---- */}
      {product.shortDescription && (
        <p className="max-w-lg font-body text-[15px] leading-relaxed text-dark/75">
          {product.shortDescription}
        </p>
      )}

      {/* ---- Divider ---- */}
      <div className="h-px w-full bg-primary/10" />

      {/* ---- Stock Status ---- */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            inStock ? 'bg-support' : 'bg-red-500'
          }`}
        />
        <span
          className={`font-body text-sm font-medium ${
            inStock ? 'text-support' : 'text-red-600'
          }`}
        >
          {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
        </span>
      </div>

      {/* ---- Quantity Selector ---- */}
      {inStock && (
        <div className="flex items-center gap-4">
          <span className="font-body text-sm font-medium text-dark/70">
            Quantity:
          </span>
          <div className="flex items-center overflow-hidden rounded-sm border border-[#E8DCC8]">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center bg-white text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="flex h-10 w-12 items-center justify-center border-x border-[#E8DCC8] bg-white font-body text-sm font-semibold text-primary">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
              className="flex h-10 w-10 items-center justify-center bg-white text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ---- CTA Buttons ---- */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-6 py-3.5 font-body text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
            addedToCart
              ? 'bg-support text-white'
              : inStock
              ? 'bg-accent text-primary hover:bg-primary hover:text-secondary shadow-lg shadow-accent/20 hover:shadow-primary/20'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
        >
          {addedToCart ? (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Added to Cart
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => toggleItem(product)}
          className={`flex items-center justify-center gap-2 rounded-sm border-2 px-6 py-3.5 font-body text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
            isInWishlist
              ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-accent text-accent hover:bg-accent hover:text-primary'
          }`}
        >
          {isInWishlist ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          )}
          <span className="hidden sm:inline">
            {isInWishlist ? 'Wishlisted' : 'Wishlist'}
          </span>
        </button>
      </div>

      {/* ---- Trust Badges ---- */}
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-sm border border-[#E8DCC8] bg-white/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-support" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          <span className="font-body text-xs font-semibold text-dark/70">100% Pure</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-support" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <span className="font-body text-xs font-semibold text-dark/70">Lab Tested</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-support" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span className="font-body text-xs font-semibold text-dark/70">No Chemicals</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-support" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <span className="font-body text-xs font-semibold text-dark/70">Free Delivery ₹499+</span>
        </div>
      </div>

      {/* ---- Tags ---- */}
      {product.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 font-body text-[11px] font-medium text-dark/60 border border-primary/10"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
