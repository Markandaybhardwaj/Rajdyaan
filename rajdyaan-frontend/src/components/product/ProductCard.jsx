'use client';

import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product._id));

  // Compute discount
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  // Normalise images since backend now uses `images` array explicitly
  const primaryImg = product.images?.[0]?.url || product.image;
  const hoverImg = product.images?.[1]?.url || product.hoverImage;

  return (
    <div
      id={`product-card-${product._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-black/5 transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(61,43,26,0.15)] hover:-translate-y-2"
    >
      {/* ---- Gold accent bar on hover ---- */}
      <div className="absolute bottom-0 left-0 z-20 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-[#b8860b] to-[#d4a843] transition-transform duration-500 ease-out group-hover:scale-x-100" />

      {/* ---- Image Container (Crossfade) ---- */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-[#faf6ee]"
      >
        {/* Primary Image */}
        {primaryImg ? (
          <Image
            src={primaryImg}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-transform duration-700 ease-out ${
              hoverImg ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl">📦</div>
        )}

        {/* Hover Image (if exists) */}
        {hoverImg && (
          <Image
            src={hoverImg}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="absolute inset-0 object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        {/* Overlay gradient for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded bg-gradient-to-r from-[#b8860b] to-[#d4a843] px-2.5 py-1 font-body text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg">
            {discount}% off
          </span>
        )}
      </Link>

      {/* ---- Hover Action Buttons ---- */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 translate-x-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100">
        {/* Wishlist */}
        <button
          type="button"
          onClick={() => toggleItem(product)}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 hover:scale-110 hover:bg-[#faf6ee]"
        >
          {isInWishlist ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-red-500">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          )}
        </button>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={() => addItem(product)}
          aria-label="Add to cart"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 hover:scale-110 hover:bg-[#faf6ee]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>
      </div>

      {/* ---- Product Info ---- */}
      <div className="flex flex-1 flex-col px-5 py-5 z-10 bg-white">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading text-lg font-bold leading-tight text-primary line-clamp-1 transition-colors duration-300 hover:text-accent">
            {product.name}
          </h3>
        </Link>

        {/* Weight Display */}
        {product.weight && (
          <span className="mt-1 font-body text-[11px] font-bold text-accent/90">
            {product.weight >= 1000 ? `${product.weight / 1000} kg` : `${product.weight} g`}
          </span>
        )}
        
        {/* Category Tag (optional, if you have category names) */}
        {product.category?.name && (
          <p className="mt-1 font-body text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {product.category.name}
          </p>
        )}

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-body text-xl font-black tracking-tight text-primary">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="font-body text-sm font-medium text-gray-400 line-through">
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
