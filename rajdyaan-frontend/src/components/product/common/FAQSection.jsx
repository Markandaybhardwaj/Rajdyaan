// ---------------------------------------------------------------------------
// FAQSection — Reusable accordion FAQ
// ---------------------------------------------------------------------------
// Renders product FAQ as an accessible accordion.
// Uses pure CSS + details/summary for zero JS.
// ---------------------------------------------------------------------------

export default function FAQSection({ product }) {
  const faqs = product.faq?.length > 0 ? product.faq : [];

  if (faqs.length === 0) return null;

  // Sort by order field
  const sorted = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center md:mb-12">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Common questions
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
        </div>

        {/* FAQ Accordion */}
        <div className="divide-y divide-primary/10 rounded-2xl border border-primary/10 overflow-hidden">
          {sorted.map((faq, i) => (
            <details
              key={i}
              className="group bg-white transition-colors hover:bg-[#faf6ee]/50"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-body text-sm font-semibold text-primary md:px-6 md:py-5 md:text-base [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <svg
                  className="h-5 w-5 flex-shrink-0 text-accent transition-transform duration-300 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-5 pb-5 font-body text-sm leading-relaxed text-dark/70 md:px-6 md:pb-6 md:text-base">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
