// ---------------------------------------------------------------------------
// TrustBadgeStrip — Reusable trust indicator strip
// ---------------------------------------------------------------------------
// Displays trust badges (Lab Tested, Free Shipping, etc.) in a horizontal strip.
// Reads from product.trustBadges first, falls back to category.defaultTrustBadges,
// then falls back to hardcoded defaults.
// ---------------------------------------------------------------------------

const DEFAULT_BADGES = [
  { icon: '🔬', label: 'Lab Tested' },
  { icon: '🚚', label: 'Free Shipping ₹499+' },
  { icon: '🌿', label: 'No Chemicals' },
  { icon: '🔄', label: 'Easy Returns' },
];

export default function TrustBadgeStrip({ product }) {
  const badges =
    product.trustBadges?.length > 0
      ? product.trustBadges
      : product.category?.defaultTrustBadges?.length > 0
      ? product.category.defaultTrustBadges
      : DEFAULT_BADGES;

  return (
    <section className="border-y border-primary/10 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-5 py-5 md:gap-x-12 md:px-8 md:py-6">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-xl">{badge.icon}</span>
            <span className="font-body text-xs font-semibold tracking-wide text-dark/70 md:text-sm">
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
