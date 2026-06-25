// ---------------------------------------------------------------------------
// GheeTemplate — Category template for Ghee products
// ---------------------------------------------------------------------------
// Theme: Heritage, purity, traditional Bilona process, premium dairy
// Sections: Description → Trust → Story → Benefits → Ingredients → Storage → FAQ
// ---------------------------------------------------------------------------
import TrustBadgeStrip from '../common/TrustBadgeStrip';
import BenefitsGrid from '../common/BenefitsGrid';
import StorySection from '../common/StorySection';
import FAQSection from '../common/FAQSection';
import IngredientsSection from '../common/IngredientsSection';
import StorageInfo from '../common/StorageInfo';
import ProductDescription from '../common/ProductDescription';

export default function GheeTemplate({ product }) {
  const storySections = product.storySections?.length > 0
    ? [...product.storySections].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <>
      {/* Trust Badges */}
      <TrustBadgeStrip product={product} />

      {/* Product Description */}
      <ProductDescription product={product} />

      {/* Category-specific meta info */}
      {product.categoryMeta && (
        <section className="bg-[#faf6ee] py-8">
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6 px-5 md:gap-10 md:px-8">
            {product.categoryMeta.method && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">🥄</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-accent">Method</span>
                <span className="font-heading text-sm font-bold text-primary">{product.categoryMeta.method}</span>
              </div>
            )}
            {product.categoryMeta.milkSource && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">🐄</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-accent">Milk Source</span>
                <span className="font-heading text-sm font-bold text-primary">{product.categoryMeta.milkSource}</span>
              </div>
            )}
            {product.categoryMeta.shelfLife && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">📅</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-accent">Shelf Life</span>
                <span className="font-heading text-sm font-bold text-primary">{product.categoryMeta.shelfLife}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Visual Story Sections */}
      {storySections.length > 0 && (
        <section className="bg-secondary">
          <div className="mx-auto max-w-7xl">
            <div className="py-8 text-center md:py-12">
              <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
                Our process
              </p>
              <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
                From Farm to Your Home
              </h2>
              <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
            </div>
          </div>
          {storySections.map((section, i) => (
            <StorySection key={i} section={section} index={i} />
          ))}
        </section>
      )}

      {/* Benefits Grid */}
      <BenefitsGrid product={product} />

      {/* Ingredients */}
      <IngredientsSection product={product} />

      {/* Storage */}
      <StorageInfo product={product} />

      {/* FAQ */}
      <FAQSection product={product} />
    </>
  );
}
