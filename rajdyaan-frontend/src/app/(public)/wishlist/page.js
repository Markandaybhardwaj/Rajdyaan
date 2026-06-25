// ---------------------------------------------------------------------------
// Wishlist Page — Rajdhyaan
// ---------------------------------------------------------------------------
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useWishlistStore from '@/store/useWishlistStore';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const { items, removeFromWishlist, fetchFromServer } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchFromServer();
    }
  }, [isAuthenticated, fetchFromServer]);

  if (!mounted) return null;

  const handleMoveToCart = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      slug: product._id,
      image: product.image || 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1782302722/Rajdyan_Logo1_fkhmhu.png',
    });
    removeFromWishlist(product._id);
  };

  return (
    <ProtectedRoute>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Wishlist</h1>
            <span className={styles.itemCount}>
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🤍</div>
              <h2>Your wishlist is empty</h2>
              <p>Save items that you like in your wishlist. Review them anytime and easily move them to the cart.</p>
              <Link href="/products" className={styles.continueShoppingBtn}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {items.map((product) => (
                <div key={product._id} className={styles.card}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(product._id)}
                    aria-label="Remove from wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className={styles.imageWrap}>
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name || 'Product Image'}
                        fill
                        style={{ objectFit: 'contain', padding: '1rem' }}
                      />
                    ) : (
                      <div className={styles.placeholderImg}>📦</div>
                    )}
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.name}>{product.name || 'Unknown Product'}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>₹{product.price || 0}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className={styles.originalPrice}>₹{product.comparePrice}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.moveToCartBtn}
                      onClick={() => handleMoveToCart(product)}
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
