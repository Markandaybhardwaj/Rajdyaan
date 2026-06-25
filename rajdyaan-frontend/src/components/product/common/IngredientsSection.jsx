// ---------------------------------------------------------------------------
// IngredientsSection — Reusable ingredients display
// ---------------------------------------------------------------------------
// Renders structured ingredientsList or falls back to legacy plain-text.
// ---------------------------------------------------------------------------

export default function IngredientsSection({ product }) {
  // Prefer structured array, fall back to legacy string
  let items = product.ingredientsList?.length > 0
    ? product.ingredientsList
    : [];

  if (items.length === 0 && product.ingredients) {
    items = product.ingredients
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (items.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="mb-8 text-center">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
            What goes in
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
            Ingredients
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <span
              key={i}
              className="rounded-full border border-primary/10 bg-[#faf6ee] px-4 py-2 font-body text-sm font-medium text-primary/80 transition-colors hover:border-accent/30 hover:bg-accent/5"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
