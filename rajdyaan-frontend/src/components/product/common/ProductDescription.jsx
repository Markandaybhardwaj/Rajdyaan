// ---------------------------------------------------------------------------
// ProductDescription — Tabbed or flowing description section
// ---------------------------------------------------------------------------
// Shows the product description in a clean, readable format.
// If storySections exist, this only shows the "About" paragraph;
// the story sections are rendered separately by the template.
// ---------------------------------------------------------------------------

import Image from 'next/image';

export default function ProductDescription({ product }) {
  if (!product.description) return null;

  const categoryImage = product.category?.image?.url;

  return (
    <>
      <section className="mx-auto max-w-7xl border-t border-primary/10 px-5 pt-12 pb-8 md:px-8 md:pt-16 md:pb-12">
        <div className="mb-6">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Product details
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
            About This Product
          </h2>
          <div className="mt-3 h-px w-12 bg-accent/40" />
        </div>

        <div className="max-w-5xl font-body text-sm leading-relaxed text-dark/80 md:text-base">
          {product.description.split('\n').map((para, i) => (
            <p key={i} className="mb-4">
              {para}
            </p>
          ))}
        </div>
      </section>

      {categoryImage && (
        <section className="w-full">
          <Image
            src={categoryImage}
            alt={`${product.category?.name || 'Category'} image`}
            width={1920}
            height={1080}
            sizes="100vw"
            className="w-full h-auto object-cover"
          />
        </section>
      )}
    </>
  );
}
