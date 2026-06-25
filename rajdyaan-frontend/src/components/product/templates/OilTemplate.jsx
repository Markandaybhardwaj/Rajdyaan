// ---------------------------------------------------------------------------
// OilTemplate — Category template for Cold Pressed Oil products
// ---------------------------------------------------------------------------
// Theme: Natural extraction, health, cooking performance
// Sections: Description → Trust → Meta (Smoke Point) → Story → Benefits → Ingredients → Storage → FAQ
// ---------------------------------------------------------------------------
import TrustBadgeStrip from '../common/TrustBadgeStrip';
import BenefitsGrid from '../common/BenefitsGrid';
import StorySection from '../common/StorySection';
import FAQSection from '../common/FAQSection';
import IngredientsSection from '../common/IngredientsSection';
import StorageInfo from '../common/StorageInfo';
import ProductDescription from '../common/ProductDescription';

export default function OilTemplate({ product }) {
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

      {/* Oil-specific highlights */}
      {(meta.smokePoint || meta.extractionMethod || meta.seedSource) && (
        <section className="bg-[#f4f8f0] py-8">
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6 px-5 md:gap-10 md:px-8">
            {meta.extractionMethod && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">⚙️</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-[#2E7D32]">Extraction</span>
                <span className="font-heading text-sm font-bold text-primary">{meta.extractionMethod}</span>
              </div>
            )}
            {meta.smokePoint && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">🔥</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-[#2E7D32]">Smoke Point</span>
                <span className="font-heading text-sm font-bold text-primary">{meta.smokePoint}</span>
              </div>
            )}
            {meta.seedSource && (
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl">🌱</span>
                <span className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-[#2E7D32]">Seed Source</span>
                <span className="font-heading text-sm font-bold text-primary">{meta.seedSource}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Visual Story Sections */}
      {storySections.length > 0 && (
        <section className="bg-secondary">
          <div className="py-8 text-center md:py-12">
            <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-[#2E7D32]">
              The cold pressed way
            </p>
            <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
              How We Make It
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-[#2E7D32]/40" />
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
