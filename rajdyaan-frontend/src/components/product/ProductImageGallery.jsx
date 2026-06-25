// ---------------------------------------------------------------------------
// ProductImageGallery — Client Component
// ---------------------------------------------------------------------------
// Main image + thumbnail row. Click thumbnail to swap.
// Mobile: horizontal scroll-snap for swipeable gallery.
// Uses next/image with priority on the first (main) image for LCP.
// ---------------------------------------------------------------------------
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductImageGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Ensure we always have at least one image
  const galleryImages = images?.length
    ? images
    : [{ url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045278/rajdhyaan/product-honey.jpg', alt: productName }];

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Main Image ---- */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-sm border border-[#E8DCC8] bg-white">
        <Image
          src={galleryImages[activeIndex].url}
          alt={galleryImages[activeIndex].alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          priority={activeIndex === 0}
        />

        {/* Image counter badge */}
        {galleryImages.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-primary/80 px-3 py-1 font-body text-[11px] font-medium text-secondary backdrop-blur-sm">
            {activeIndex + 1} / {galleryImages.length}
          </span>
        )}
      </div>

      {/* ---- Mobile Swipeable Strip ---- */}
      {galleryImages.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 md:hidden"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {galleryImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square w-[72px] flex-shrink-0 overflow-hidden rounded-sm border-2 bg-white transition-all duration-200 ${
                i === activeIndex
                  ? 'border-accent shadow-md shadow-accent/20'
                  : 'border-[#E8DCC8] opacity-70 hover:opacity-100'
              }`}
              style={{ scrollSnapAlign: 'start' }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="72px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* ---- Desktop Thumbnail Row ---- */}
      {galleryImages.length > 1 && (
        <div className="hidden gap-3 md:flex">
          {galleryImages.slice(0, 5).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square w-20 overflow-hidden rounded-sm border-2 bg-white transition-all duration-200 ${
                i === activeIndex
                  ? 'border-accent shadow-md shadow-accent/20 scale-105'
                  : 'border-[#E8DCC8] opacity-60 hover:opacity-100 hover:border-accent/50'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
