// ---------------------------------------------------------------------------
// ProductGrid — Featured Products section
// ---------------------------------------------------------------------------
// Section heading + 2-col mobile / 4-col desktop grid of ProductCards.
// "View All" gold CTA link below the grid.
// ---------------------------------------------------------------------------
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  return (
    <section id="featured-products" className="bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* ---- Section Header ---- */}
        <div className="mb-10 text-center md:mb-14">
          <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Curated for you
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-primary md:text-3xl lg:text-4xl">
            Featured Products
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-accent/40" />
        </div>

        {/* ---- Product Grid (Centered) ---- */}
        <div className="flex flex-wrap justify-center -m-2 md:-m-3">
          {products.map((product) => (
            <div key={product._id} className="w-1/2 lg:w-1/4 p-2 md:p-3 max-w-[300px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ---- View All CTA ---- */}
        <div className="mt-10 text-center md:mt-14">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-accent px-8 py-3 font-body text-sm font-semibold uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent hover:text-primary"
          >
            View All Products
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
