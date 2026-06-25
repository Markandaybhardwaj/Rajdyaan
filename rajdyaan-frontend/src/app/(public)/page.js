// ---------------------------------------------------------------------------
// Homepage — Server Component with ISR
// ---------------------------------------------------------------------------
// Route: / (via the (public) route group)
// Fetches featured products from the backend API.
// Falls back to static mock data when the API is unreachable (dev mode).
// Revalidates every 3600 seconds (1 hour).
// ---------------------------------------------------------------------------
import HomePage from '@/components/HomePage';

export const revalidate = 0;

async function getFeaturedProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/products?isFeatured=true&limit=4`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();

    // Normalise — backend returns images[] array, we need a single image
    const products = (data.data?.products || data.data || []).map((p) => {
      const baseImages = p.images?.length ? p.images : [];
      let image = baseImages[0]?.url || p.image;
      let hoverImage = baseImages[1]?.url || p.hoverImage;
      
      return {
        ...p,
        image,
        hoverImage,
      };
    });

    return products;
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

async function getBanners() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/banners`, {
      cache: 'no-store', // Always fetch fresh banners
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    return data.data?.banners || data.data || [];
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return [];
  }
}

export default async function PublicHomePage() {
  const [products, banners] = await Promise.all([
    getFeaturedProducts(),
    getBanners(),
  ]);

  return <HomePage products={products} banners={banners} />;
}
