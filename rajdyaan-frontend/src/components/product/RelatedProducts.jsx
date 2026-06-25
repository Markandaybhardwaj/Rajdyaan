// ---------------------------------------------------------------------------
// RelatedProducts — Server Component
// ---------------------------------------------------------------------------
// Fetches products from the same category, excludes the current product,
// and renders up to 4 in a grid using the existing ProductCard component.
// ---------------------------------------------------------------------------
import ProductCard from './ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getRelatedProducts(categoryId, excludeId) {
  try {
    const res = await fetch(
      `${API_URL}/products?category=${categoryId}&limit=5`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const products = data.data?.products || data.data || [];

    // Exclude the current product and take max 4
    return products
      .filter((p) => p._id !== excludeId)
      .slice(0, 4)
      .map((p) => {
        // Normalise image field for ProductCard compatibility
        const image = p.images?.[0]?.url || p.image || 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045278/rajdhyaan/product-honey.jpg';
        const hoverImage = p.images?.[1]?.url || p.hoverImage || null;
        return { ...p, image, hoverImage };
      });
  } catch {
    return [];
  }
}

export default async function RelatedProducts({ categoryId, currentProductId }) {
  if (!categoryId) return null;

  const products = await getRelatedProducts(categoryId, currentProductId);

  if (products.length === 0) return null;

  return (
    <section className="border-t border-primary/10 bg-secondary py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* ---- Section Header ---- */}
        <div className="mb-8 text-center md:mb-12">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
            You may also like
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-primary md:text-2xl">
            Related Products
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-accent/40" />
        </div>

        {/* ---- Product Grid ---- */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
