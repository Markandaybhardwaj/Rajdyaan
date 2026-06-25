// ---------------------------------------------------------------------------
// HeroBanner — Full-width image slideshow with 2 banners
// ---------------------------------------------------------------------------
// Auto-rotates every 5 seconds with smooth crossfade transition.
// Includes dot indicators and pause-on-hover.
// ---------------------------------------------------------------------------
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BANNERS = [
  {
    src: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778436876/heroBanner_1_iomhjf.png',
    alt: 'Rajdhyaan — Premium Organic Honey, Ghee & Jaggery',
  },
  {
    src: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778436896/HeroBanner_2_jcikhs.png',
    alt: 'Rajdhyaan — Farm Fresh Natural Sweeteners',
  },
];

const SLIDE_INTERVAL = 5000; // 5 seconds

export default function HeroBanner({ banners }) {
  // Filter active hero banners sorted by key
  const activeBanners = banners?.length
    ? banners
        .filter((b) => b.section === 'homepage' && b.key.startsWith('hero-') && b.isActive && b.image?.url)
        .sort((a, b) => a.key.localeCompare(b.key))
    : [];

  const slides = activeBanners.length > 0
    ? activeBanners.map((b) => ({
        src: b.image.url,
        alt: b.altText || b.label,
        link: b.link || '/products',
      }))
    : BANNERS.map((b) => ({
        src: b.src,
        alt: b.alt,
        link: '/products',
      }));

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Auto-play
  useEffect(() => {
    if (paused || slides.length === 0) return;
    const timer = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, nextSlide, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      id="hero-banner"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative w-full" style={{ aspectRatio: '16/6' }}>
        {slides.map((banner, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: current === i ? 1 : 0, zIndex: current === i ? 2 : 1 }}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />

            {/* Click-through link overlay - unique link per banner slide */}
            <Link
              href={banner.link}
              className="absolute inset-0 z-10"
              aria-label={banner.alt}
            />
          </div>
        ))}

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2.5 md:bottom-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); goToSlide(i); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                current === i
                  ? 'w-8 bg-[#B5922A] shadow-md shadow-[#B5922A]/40'
                  : 'w-2.5 bg-white/60 hover:bg-white/90'
              }`}
            />
          ))}
        </div>

        {/* Left/Right arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setCurrent((current - 1 + slides.length) % slides.length); }}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 md:left-6 md:h-12 md:w-12"
              aria-label="Previous slide"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 md:right-6 md:h-12 md:w-12"
              aria-label="Next slide"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-black/10">
          <div
            className="h-full bg-[#B5922A] transition-all ease-linear"
            style={{
              width: '100%',
              animation: paused ? 'none' : `slideProgress ${SLIDE_INTERVAL}ms linear`,
              animationIterationCount: '1',
            }}
            key={`${current}-${paused}`}
          />
        </div>
      </div>

      {/* Progress bar animation */}
      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
