// ---------------------------------------------------------------------------
// Product Detail Page — SSR + ISR (revalidate every hour)
// ---------------------------------------------------------------------------
// Route: /products/[slug]
// Server Component — fetches product data server-side for SEO.
// Generates metadata dynamically for Google indexing.
// Renders JSON-LD Schema.org Product markup for rich snippets.
//
// ARCHITECTURE:
//   This page fetches the product → detects category.templateSlug →
//   renders the matching category template via TemplateSelector.
//   The template then renders category-specific sections (story, FAQ, etc.)
//   while sharing common components (Hero, TrustBadges, Reviews, Related).
// ---------------------------------------------------------------------------
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import MobileStickyBar from '@/components/product/MobileStickyBar';
import TemplateSelector from '@/components/product/TemplateSelector';
import CategoryBanner from '@/components/product/CategoryBanner';
import Link from 'next/link';

export const revalidate = 3600;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ---------------------------------------------------------------------------
// Fetch a single product by slug from the backend
// ---------------------------------------------------------------------------
async function getProductBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data?.product || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// generateStaticParams — pre-render all product pages at build time
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const products = data.data?.products || data.data || [];

    return products.map((p) => ({
      slug: p.slug,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// generateMetadata — dynamic SEO metadata for each product
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | RajDyaan',
      description: 'The product you are looking for could not be found.',
    };
  }

  const ogImage = product.images?.[0]?.url || 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045278/rajdhyaan/product-honey.jpg';

  return {
    title: `${product.name} | RajDyaan`,
    description:
      product.shortDescription ||
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at ₹${product.price}. 100% pure, lab-tested organic product from RajDyaan.`,
    openGraph: {
      title: `${product.name} | RajDyaan`,
      description:
        product.shortDescription || product.description?.substring(0, 160),
      images: [{ url: ogImage, width: 800, height: 800, alt: product.name }],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | RajDyaan`,
      description: product.shortDescription || product.description?.substring(0, 160),
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component — Server Component
// ---------------------------------------------------------------------------
export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-secondary px-5">
        <h1 className="font-heading text-3xl font-bold text-primary">
          Product Not Found
        </h1>
        <p className="mt-3 font-body text-dark/70">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest text-secondary transition-colors hover:bg-accent hover:text-primary"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  // Normalise images for the gallery
  const images = product.images?.length
    ? product.images.map((img) => ({
        url: img.url,
        alt: img.alt || product.name,
      }))
    : [{ url: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045278/rajdhyaan/product-honey.jpg', alt: product.name }];

  // JSON-LD Schema.org structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images.map((i) => i.url),
    brand: {
      '@type': 'Brand',
      name: 'RajDyaan',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'RajDyaan',
      },
    },
    ...(product.ratingsAverage > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingsAverage,
        reviewCount: product.ratingsCount || 1,
      },
    }),
  };

  // Compute discount for display
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  return (
    <>
      {/* JSON-LD — rendered server-side for Google crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-secondary">
        {/* ---- Breadcrumb ---- */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-7xl px-5 pt-6 md:px-8"
        >
          <ol className="flex items-center gap-2 font-body text-xs text-dark/60">
            <li>
              <Link href="/" className="transition-colors hover:text-accent">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li>
              <Link
                href="/products"
                className="transition-colors hover:text-accent"
              >
                Products
              </Link>
            </li>
            {product.category?.name && (
              <>
                <li aria-hidden="true">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </li>
                <li>
                  <Link
                    href={`/products?category=${product.category._id}`}
                    className="transition-colors hover:text-accent"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li className="font-medium text-primary">{product.name}</li>
          </ol>
        </nav>

        {/* ---- Hero Section: Gallery + Product Info ---- */}
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-2 md:gap-12 md:px-8 md:py-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="md:sticky md:top-24 md:self-start">
            <ProductImageGallery images={images} productName={product.name} />
          </div>

          {/* Right: Product Info */}
          <ProductInfo
            product={product}
            discount={discount}
          />
        </section>

        {/* ---- Category Banner ---- */}
        {/* Shows the category image, name, description and a browse-category CTA */}
        {product.category && (
          <CategoryBanner category={product.category} />
        )}

        {/* ---- Category Template Sections ---- */}
        {/* This is where the magic happens:
            TemplateSelector reads category.templateSlug and renders
            GheeTemplate, OilTemplate, SweetenerTemplate, or SareeTemplate.
            Each template composes its own unique section order. */}
        <TemplateSelector product={product} />

        {/* ---- Related Products ---- */}
        <RelatedProducts
          categoryId={product.category?._id || product.category}
          currentProductId={product._id}
        />

        {/* ---- Mobile Sticky CTA ---- */}
        <MobileStickyBar product={product} />
      </div>
    </>
  );
}
