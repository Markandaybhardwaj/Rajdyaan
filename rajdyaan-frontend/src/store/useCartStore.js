// ---------------------------------------------------------------------------
// Cart Store — Zustand 4.x with localStorage persistence
// ---------------------------------------------------------------------------
// Persists cart to localStorage so guest users don't lose items on refresh.
// Coupon validation is always server-side — frontend never sets discount amount.
//
// State shape:
//   items: [{ productId, name, price, comparePrice, quantity, image, slug }]
//   coupon: { code, type, value, maxDiscount } | null
//   couponError: string | null
//   couponLoading: boolean
//
// Computed (via get()):
//   total  — sum of (price * qty), minus discount
//   count  — sum of all quantities
//   subtotal — sum of (price * qty), before discount
//   discountAmount — calculated discount value
// ---------------------------------------------------------------------------
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      couponError: null,
      couponLoading: false,

      // ----- Add to Cart -----
      // If item already exists, increment quantity. Otherwise add new.
      addToCart: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product._id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product._id
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                name: product.name,
                price: product.price,
                comparePrice: product.comparePrice || null,
                quantity: qty,
                image:
                  product.images?.[0]?.url ||
                  product.image ||
                  'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045278/rajdhyaan/product-honey.jpg',
                slug: product.slug,
              },
            ],
          });
        }
      },

      // Alias for backward compatibility with existing components
      addItem: (product) => get().addToCart(product, 1),

      // ----- Remove from Cart -----
      removeFromCart: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      removeItem: (productId) => get().removeFromCart(productId),

      // ----- Update Quantity -----
      updateQty: (productId, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i
          ),
        });
      },

      // ----- Clear Cart -----
      clearCart: () => set({ items: [], coupon: null, couponError: null }),

      // ----- Coupon: Apply -----
      applyCoupon: async (code) => {
        if (!code?.trim()) return;

        set({ couponLoading: true, couponError: null });

        try {
          const res = await fetch(`${API_URL}/order/validate-coupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              code: code.trim().toUpperCase(),
              subtotal: get().subtotal,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({
              couponError: data.message || 'Invalid coupon code',
              couponLoading: false,
              coupon: null,
            });
            return;
          }

          // Server returns the validated discount details
          set({
            coupon: data.data?.coupon || {
              code: code.trim().toUpperCase(),
              type: data.data?.type || 'percentage',
              value: data.data?.value || 0,
              maxDiscount: data.data?.maxDiscount || null,
            },
            couponError: null,
            couponLoading: false,
          });
        } catch (err) {
          set({
            couponError: 'Failed to validate coupon. Please try again.',
            couponLoading: false,
            coupon: null,
          });
        }
      },

      // ----- Coupon: Remove -----
      removeCoupon: () => set({ coupon: null, couponError: null }),

      // ----- Computed: Subtotal (before discount) -----
      // NOTE: These must be plain functions, NOT JS `get` accessors.
      // Zustand's persist middleware captures state as a plain object at init,
      // so `get X()` accessors are evaluated once and frozen at 0.
      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      // ----- Computed: Discount Amount -----
      discountAmount: () => {
        const { coupon } = get();
        if (!coupon) return 0;

        const sub = get().subtotal();

        if (coupon.type === 'percentage') {
          const raw = (sub * coupon.value) / 100;
          return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
        }

        // flat discount
        return Math.min(coupon.value, sub);
      },

      // ----- Computed: Total (after discount) -----
      total: () => {
        return Math.max(0, get().subtotal() - get().discountAmount());
      },

      // ----- Computed: Item Count -----
      count: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Alias used by Navbar
      totalItems: () => get().count(),
    }),

    {
      name: 'rajdyaan-cart',
      // Only persist items and coupon, not loading/error states
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);

export default useCartStore;
