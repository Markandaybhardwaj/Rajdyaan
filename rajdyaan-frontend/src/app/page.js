// ---------------------------------------------------------------------------
// Root page — re-exports the (public) homepage
// ---------------------------------------------------------------------------
// In Next.js App Router, if both app/page.js and app/(public)/page.js exist,
// the root page.js takes precedence for the "/" route. We keep the homepage
// logic in (public)/page.js for clean route grouping, and re-export here.
// ---------------------------------------------------------------------------
import HomePage from '@/components/HomePage';

export const revalidate = 0;

async function getFeaturedProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/products?isFeatured=true&limit=4`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    return (data.data?.products || data.data || []).map((p) => ({
      ...p,
      image: p.images?.[0]?.url || p.image,
      hoverImage: p.images?.[1]?.url || p.hoverImage,
    }));
  } catch {
    return [];
  }
}

async function getBanners() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/banners`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    return data.data?.banners || data.data || [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const [products, banners] = await Promise.all([
    getFeaturedProducts(),
    getBanners(),
  ]);
  return <HomePage products={products} banners={banners} />;
}