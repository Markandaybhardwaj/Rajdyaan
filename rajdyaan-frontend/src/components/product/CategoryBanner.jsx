// ---------------------------------------------------------------------------
// CategoryBanner — Server/Client compatible presentational component
// ---------------------------------------------------------------------------
// Shown on product detail pages to contextualise the product's category.
// Shows: category image (if any), category name, description, and a CTA link.
// ---------------------------------------------------------------------------

import Image from 'next/image';
import Link from 'next/link';

export default function CategoryBanner({ category }) {
  if (!category) return null;

  const hasBannerImage = Boolean(category.image?.url);

  return (
    <section
      aria-label={`${category.name} category`}
      className="relative w-full my-8"
    >
      <div
        className={`relative flex min-h-[240px] items-center w-full ${
          hasBannerImage ? '' : 'bg-gradient-to-r from-primary to-primary/80'
        }`}
      >
        {/* Background Image */}
        {hasBannerImage && (
          <>
            <Image
              src={category.image.url}
              alt={category.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority={false}
            />
            {/* Dark overlay so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-transparent" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
          {/* Left: label + name + description */}
          <div className="flex flex-col gap-2">
            {/* "Category" pill */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-widest text-accent backdrop-blur-sm">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6Z"
                />
              </svg>
              Category
            </span>

            <h2 className="font-heading text-3xl font-bold leading-tight text-secondary md:text-4xl">
              {category.name}
            </h2>

            {category.description && (
              <p className="max-w-xl font-body text-base leading-relaxed text-secondary/80">
                {category.description}
              </p>
            )}
          </div>

          {/* Right: CTA */}
          <div className="mt-4 flex-shrink-0 md:mt-0">
            <Link
              href={`/products?category=${category._id}`}
              className="inline-flex items-center gap-2 rounded-sm border-2 border-accent bg-accent/10 px-6 py-3 font-body text-sm font-bold uppercase tracking-widest text-accent backdrop-blur-sm transition-all duration-300 hover:bg-accent hover:text-primary"
            >
              Browse {category.name}
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
