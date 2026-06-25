// ---------------------------------------------------------------------------
// BenefitsGrid — Reusable benefits card grid
// ---------------------------------------------------------------------------
// Renders structured benefits (icon + title + description) in a responsive grid.
// Falls back to parsing the legacy plain-text `benefits` string.
// ---------------------------------------------------------------------------

export default function BenefitsGrid({ product }) {
  // Prefer structured benefitsList, fall back to parsing legacy string
  let benefits = product.benefitsList?.length > 0
    ? product.benefitsList
    : [];

  // Parse legacy string: split by newline, each line becomes a benefit
  if (benefits.length === 0 && product.benefits) {
    benefits = product.benefits
      .split('\n')
      .filter(Boolean)
      .map((line) => ({
        icon: '✅',
        title: line.trim(),
        description: '',
      }));
  }

  if (benefits.length === 0) return null;

  return (
    <section className="bg-[#faf6ee] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center md:mb-12">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Why choose this product
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
            Key Benefits
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-primary/5 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 md:p-6"
            >
              <span className="text-3xl mb-3">{benefit.icon}</span>
              <h3 className="font-heading text-sm font-bold text-primary md:text-base">
                {benefit.title}
              </h3>
              {benefit.description && (
                <p className="mt-2 font-body text-xs leading-relaxed text-dark/60 md:text-sm">
                  {benefit.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
