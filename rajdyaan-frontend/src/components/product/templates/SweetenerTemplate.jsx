// ---------------------------------------------------------------------------
// SweetenerTemplate — Category template for Jaggery / Khand / Sweeteners
// ---------------------------------------------------------------------------
// Theme: Natural sweetness, chemical-free, farm fresh, traditional processing
// This is also the DEFAULT template for unmapped categories.
// ---------------------------------------------------------------------------
import TrustBadgeStrip from '../common/TrustBadgeStrip';
import BenefitsGrid from '../common/BenefitsGrid';
import StorySection from '../common/StorySection';
import FAQSection from '../common/FAQSection';
import IngredientsSection from '../common/IngredientsSection';
import StorageInfo from '../common/StorageInfo';
import ProductDescription from '../common/ProductDescription';

export default function SweetenerTemplate({ product }) {
  const storySections = product.storySections?.length > 0
    ? [...product.storySections].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const meta = product.categoryMeta || {};

  return (
    <>
      {/* Trust Badges */}
      <TrustBadgeStrip product={product} />

      {/* Product Description */}
      <ProductDescription product={product} />

      {/* Sweetener-specific meta */}
      {(meta.source || meta.texture || meta.processingMethod) && (
        <section className="bg-[#faf6ee] py-8">
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6 px-5 md:gap-10 md:px-8">
            {meta.source && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">🌾</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-accent">Source</span>
                <span className="font-heading text-sm font-bold text-primary">{meta.source}</span>
              </div>
            )}
            {meta.texture && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">✨</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-accent">Texture</span>
                <span className="font-heading text-sm font-bold text-primary">{meta.texture}</span>
              </div>
            )}
            {meta.processingMethod && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">🏭</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-accent">Processing</span>
                <span className="font-heading text-sm font-bold text-primary">{meta.processingMethod}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Visual Story Sections */}
      {storySections.length > 0 && (
        <section className="bg-secondary">
          <div className="py-8 text-center md:py-12">
            <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
              From sugarcane to your table
            </p>
            <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
              The Traditional Way
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
          </div>
          {storySections.map((section, i) => (
            <StorySection key={i} section={section} index={i} />
          ))}
        </section>
      )}

      {/* Benefits */}
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
