// ---------------------------------------------------------------------------
// SareeTemplate — Category template for Sarees / Textiles
// ---------------------------------------------------------------------------
// Theme: Fashion, luxury, craftsmanship, Indian culture
// Uses editorial-style layouts with larger image emphasis.
// ---------------------------------------------------------------------------
import TrustBadgeStrip from '../common/TrustBadgeStrip';
import BenefitsGrid from '../common/BenefitsGrid';
import StorySection from '../common/StorySection';
import FAQSection from '../common/FAQSection';
import StorageInfo from '../common/StorageInfo';
import ProductDescription from '../common/ProductDescription';

export default function SareeTemplate({ product }) {
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

      {/* Saree-specific details */}
      {(meta.fabric || meta.weaveType || meta.occasion || meta.blouseIncluded !== undefined) && (
        <section className="bg-[#faf0f4] py-8">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <h3 className="mb-6 text-center font-heading text-lg font-bold text-primary md:text-xl">
              Fabric Details
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {meta.fabric && (
                <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm">
                  <span className="text-2xl">🧵</span>
                  <span className="mt-1 font-body text-[10px] font-bold uppercase tracking-wider text-accent">Fabric</span>
                  <span className="font-heading text-sm font-bold text-primary">{meta.fabric}</span>
                </div>
              )}
              {meta.weaveType && (
                <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm">
                  <span className="text-2xl">🪡</span>
                  <span className="mt-1 font-body text-[10px] font-bold uppercase tracking-wider text-accent">Weave</span>
                  <span className="font-heading text-sm font-bold text-primary">{meta.weaveType}</span>
                </div>
              )}
              {meta.occasion && (
                <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm">
                  <span className="text-2xl">🎉</span>
                  <span className="mt-1 font-body text-[10px] font-bold uppercase tracking-wider text-accent">Occasion</span>
                  <span className="font-heading text-sm font-bold text-primary">{meta.occasion}</span>
                </div>
              )}
              {meta.blouseIncluded !== undefined && (
                <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm">
                  <span className="text-2xl">👗</span>
                  <span className="mt-1 font-body text-[10px] font-bold uppercase tracking-wider text-accent">Blouse</span>
                  <span className="font-heading text-sm font-bold text-primary">
                    {meta.blouseIncluded ? 'Included' : 'Not Included'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Visual Story / Styling Sections */}
      {storySections.length > 0 && (
        <section className="bg-secondary">
          <div className="py-8 text-center md:py-12">
            <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
              The art of weaving
            </p>
            <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
              Craftsmanship Story
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
          </div>
          {storySections.map((section, i) => (
            <StorySection key={i} section={section} index={i} />
          ))}
        </section>
      )}

      {/* Benefits / Features */}
      <BenefitsGrid product={product} />

      {/* Care Instructions (reuse StorageInfo for care) */}
      <StorageInfo product={product} />

      {/* FAQ */}
      <FAQSection product={product} />
    </>
  );
}
