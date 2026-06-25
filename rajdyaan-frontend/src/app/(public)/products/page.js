// ---------------------------------------------------------------------------
// Products Listing Page — Rajdhyaan Product Catalog
// ---------------------------------------------------------------------------
// Categories: Jaggery (Gur), Dairy Products, Others
// Features: Search with highlighting, category jump-links, price range slider,
//           sort dropdown, availability filter, loading spinner, responsive grid.
// ---------------------------------------------------------------------------
'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import styles from './products.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
];

const MAX_PRICE_LIMIT = 10000;

// ---------------------------------------------------------------------------
// Star Rating Component
// ---------------------------------------------------------------------------
function StarRating({ rating, reviews }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={styles.starRating}>
      <div className={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={styles.starFull}>★</span>
        ))}
        {hasHalf && <span className={styles.starHalf}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.starEmpty}>★</span>
        ))}
      </div>
      <span className={styles.reviewCount}>({reviews})</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Highlight matched text
// ---------------------------------------------------------------------------
function HighlightText({ text, query }) {
  if (!query || query.trim().length < 2) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={styles.highlight}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Product Card Component
// ---------------------------------------------------------------------------
function ProductCard({ product, searchQuery, onAddToCart }) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product._id));

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.slug || product._id}`}
      id={`product-card-${product._id}`}
      className={`${styles.productCard} ${!product.inStock ? styles.outOfStock : ''} block hover:opacity-95`}
    >
      {/* Discount badge */}
      {discount > 0 && (
        <div className={styles.discountBadge}>{discount}% OFF</div>
      )}

      {/* Out of stock overlay */}
      {!product.inStock && (
        <div className={styles.outOfStockOverlay}>
          <span>Out of Stock</span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-label="Toggle Wishlist"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isWishlisted ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      {/* Product Image / Emoji */}
      <div className={styles.productImageWrap}>
        {product.images?.length > 0 || product.image ? (
          <>
            <Image 
              src={product.images?.[0]?.url || product.image} 
              alt={product.name} 
              fill 
              className={`${styles.productImg} ${product.images?.length > 1 || product.hoverImage ? styles.hasHover : ''}`} 
              style={{ objectFit: 'cover', padding: '0' }} 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            />
            {(product.images?.[1]?.url || product.hoverImage) && (
              <Image 
                src={product.images?.[1]?.url || product.hoverImage} 
                alt={`${product.name} Hover`} 
                fill 
                className={styles.productImgHover} 
                style={{ objectFit: 'cover', padding: '0' }} 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
              />
            )}
          </>
        ) : (
          <span className={styles.productEmoji}>{product.emoji || '📦'}</span>
        )}
      </div>

      {/* Product Info */}
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>
          <HighlightText text={product.name} query={searchQuery} />
        </h3>

        <span className={styles.productWeight}>
          {product.weight 
            ? (product.weight >= 1000 ? `${product.weight / 1000} kg` : `${product.weight} g`) 
            : 'N/A'}
        </span>

        <StarRating rating={product.rating || 4.5} reviews={product.reviews || Math.floor(Math.random() * 200) + 20} />

        {/* Pricing */}
        <div className={styles.priceRow}>
          <span className={styles.salePrice}>₹{product.price}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className={styles.originalPrice}>₹{product.comparePrice}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          className={styles.addToCartBtn}
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          aria-label={`Add ${product.name} to cart`}
        >
          {product.inStock ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Cart
            </>
          ) : (
            'Notify Me'
          )}
        </button>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Loading Spinner
// ---------------------------------------------------------------------------
function LoadingSpinner() {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinner}>
        <div className={styles.spinnerInner}></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Products Page
// ---------------------------------------------------------------------------
function ProductsContent() {
  const addToCart = useCartStore((s) => s.addToCart);
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);
  const [sortBy, setSortBy] = useState('featured');
  const [showInStock, setShowInStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cartToast, setCartToast] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const debounceRef = useRef(null);
  const categoryRefs = useRef({});

  // ---- Fetch Products from DB ----
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          // Backend returns products in data.data.products or similar structure
          const products = data.data?.products || data.data || [];
          
          // Map backend products to match frontend expectations
          const mappedProducts = products.map(p => ({
            ...p,
            inStock: p.stock > 0,
            tags: p.tags || []
          }));
          setAllProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsFetchingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // ---- Trigger loading on filter changes ----
  const triggerLoading = useCallback(() => {
    setIsLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setIsLoading(false), 400);
  }, []);

  useEffect(() => {
    triggerLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, maxPrice, sortBy, showInStock, showOutOfStock]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Search filter
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => {
        const searchable = `${p.name} ${p.category?.name || p.category} ${p.weight || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        return searchable.includes(q);
      });
    }

    // Price filter - only apply if user has moved the slider below max
    if (maxPrice < MAX_PRICE_LIMIT) {
      products = products.filter((p) => p.price <= maxPrice);
    }

    // Availability filter
    if (showInStock && !showOutOfStock) {
      products = products.filter((p) => p.inStock);
    } else if (showOutOfStock && !showInStock) {
      products = products.filter((p) => !p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'best-selling':
        products.sort((a, b) => (b.bestSelling ? 1 : 0) - (a.bestSelling ? 1 : 0) || (b.reviews || 0) - (a.reviews || 0));
        break;
      case 'featured':
      default:
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
        break;
    }

    return products;
  }, [allProducts, searchQuery, maxPrice, sortBy, showInStock, showOutOfStock]);

  // ---- Extract Unique Categories ----
  const CATEGORIES = useMemo(() => {
    const cats = new Set();
    allProducts.forEach(p => {
      cats.add(p.category?.name || p.category || 'Uncategorized');
    });
    return Array.from(cats);
  }, [allProducts]);

  // ---- Group by Category ----
  const groupedByCategory = useMemo(() => {
    const grouped = {};
    CATEGORIES.forEach((cat) => {
      const items = filteredProducts.filter((p) => (p.category?.name || p.category || 'Uncategorized') === cat);
      if (items.length > 0) {
        grouped[cat] = items;
      }
    });
    return grouped;
  }, [filteredProducts, CATEGORIES]);

  // ---- Scroll to Category ----
  const scrollToCategory = (cat) => {
    const el = categoryRefs.current[cat];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ---- Add to Cart Handler with Toast ----
  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      slug: product.slug || product._id,
      image: product.images?.[0]?.url || product.image || 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1782302722/Rajdyan_Logo1_fkhmhu.png',
    });
    setCartToast(product.name);
    setTimeout(() => setCartToast(null), 2000);
  };

  // ---- Active categories (that have results) ----
  const activeCategories = Object.keys(groupedByCategory);

  return (
    <div className={styles.pageWrapper}>
      {/* ===== Hero Banner ===== */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Products</h1>
          <p className={styles.heroSubtitle}>
            Pure, organic &amp; handcrafted — straight from Indian farmlands to your kitchen
          </p>
        </div>
        <div className={styles.heroGrain}></div>
      </section>

      {/* ===== Search & Filters Bar ===== */}
      <div className={styles.controlsSection}>
        <div className={styles.controlsInner}>
          {/* Search */}
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="product-search"
              type="text"
              placeholder="Search products... (e.g. gur, jaggery, khand)"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Jump Links */}
          <div className={styles.categoryLinks}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategories.includes(cat);
              return (
                <button
                  key={cat}
                  className={`${styles.categoryLink} ${isActive ? styles.categoryLinkActive : styles.categoryLinkDisabled}`}
                  onClick={() => isActive && scrollToCategory(cat)}
                  disabled={!isActive}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Filter Row */}
          <div className={styles.filterRow}>
            {/* Sort Dropdown */}
            <div className={styles.filterGroup}>
              <label htmlFor="sort-select" className={styles.filterLabel}>Sort by</label>
              <select
                id="sort-select"
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className={styles.filterGroup}>
              <label htmlFor="price-range" className={styles.filterLabel}>
                Max Price: <strong>{maxPrice === MAX_PRICE_LIMIT ? 'Any' : `₹${maxPrice}`}</strong>
              </label>
              <input
                id="price-range"
                type="range"
                min="50"
                max={MAX_PRICE_LIMIT}
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={styles.priceSlider}
              />
            </div>

            {/* Availability Checkboxes */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Availability</span>
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showInStock}
                    onChange={(e) => setShowInStock(e.target.checked)}
                    className={styles.checkbox}
                  />
                  In Stock
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showOutOfStock}
                    onChange={(e) => setShowOutOfStock(e.target.checked)}
                    className={styles.checkbox}
                  />
                  Out of Stock
                </label>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className={styles.resultsCount}>
            Showing <strong>{filteredProducts.length}</strong> of {allProducts.length} products
          </div>
        </div>
      </div>

      {/* ===== Products Listing ===== */}
      <section className={styles.productsSection}>
        {isLoading || isFetchingProducts ? (
          <LoadingSpinner />
        ) : activeCategories.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsEmoji}>🔍</span>
            <h2>No products found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          activeCategories.map((cat) => (
            <div
              key={cat}
              className={styles.categorySection}
              ref={(el) => (categoryRefs.current[cat] = el)}
              id={`category-${cat.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
            >
              {/* Category Heading */}
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>{cat}</h2>
                <div className={styles.categoryLine}></div>
                <span className={styles.categoryCount}>{groupedByCategory[cat].length} products</span>
              </div>

              {/* Product Grid */}
              <div className={styles.productGrid}>
                {groupedByCategory[cat].map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    searchQuery={searchQuery}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* ===== Cart Toast ===== */}
      {cartToast && (
        <div className={styles.toast}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span><strong>{cartToast}</strong> added to cart</span>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading Products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
