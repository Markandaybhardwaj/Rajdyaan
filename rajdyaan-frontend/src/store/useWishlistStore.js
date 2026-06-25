// ---------------------------------------------------------------------------
// Wishlist Store — Zustand 4.x with localStorage persistence + API sync
// ---------------------------------------------------------------------------
// - Guest users: stores full product objects in localStorage
// - Logged-in users: syncs with server API, falls back to localStorage
// - On login, merges local items to server (sync)
// ---------------------------------------------------------------------------
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // array of product objects { _id, name, price, image, ... }
      toastMessage: null, // for toast notifications

      // ---- Toggle: add if not present, remove if present ----
      toggleWishlist: (product) => {
        const items = get().items;
        const productId = typeof product === 'object' ? product._id : product;
        const exists = items.find((i) => i._id === productId);

        if (exists) {
          set({
            items: items.filter((i) => i._id !== productId),
            toastMessage: `${exists.name || 'Item'} removed from wishlist`,
          });
          // Fire API delete (fire-and-forget)
          get()._apiRemove(productId);
        } else {
          const newItem = typeof product === 'object'
            ? product
            : { _id: product };
          set({
            items: [...items, newItem],
            toastMessage: `${newItem.name || 'Item'} added to wishlist`,
          });
          // Fire API add (fire-and-forget)
          get()._apiAdd(productId);
        }

        // Auto-dismiss toast
        setTimeout(() => set({ toastMessage: null }), 2500);
      },

      // Alias for backward compatibility
      toggleItem: (product) => get().toggleWishlist(product),

      // ---- Check if a product is wishlisted ----
      isWishlisted: (productId) => {
        return get().items.some((i) => i._id === productId);
      },

      // Alias for backward compatibility
      isInWishlist: (productId) => get().isWishlisted(productId),

      // ---- Remove a specific item ----
      removeFromWishlist: (productId) => {
        const item = get().items.find((i) => i._id === productId);
        set({
          items: get().items.filter((i) => i._id !== productId),
          toastMessage: `${item?.name || 'Item'} removed from wishlist`,
        });
        get()._apiRemove(productId);
        setTimeout(() => set({ toastMessage: null }), 2500);
      },

      // ---- Clear all ----
      clearWishlist: () => set({ items: [] }),

      // ---- Dismiss toast ----
      clearToast: () => set({ toastMessage: null }),

      // ---- Count ----
      totalItems: () => get().items.length,

      // ---- Sync local wishlist to server (call after login) ----
      syncToServer: async () => {
        const items = get().items;
        if (items.length === 0) return;

        try {
          const res = await fetch(`${API_URL}/wishlist/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              productIds: items.map((i) => i._id),
            }),
          });

          if (!res.ok) return;
          // Server returned the merged list — but we keep local items
          // since they have full product data the server doesn't store
        } catch {
          // Silently fail — localStorage is the fallback
        }
      },

      // ---- Fetch wishlist from server ----
      fetchFromServer: async () => {
        try {
          const res = await fetch(`${API_URL}/wishlist`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          if (!res.ok) return;

          const data = await res.json();
          const serverIds = data.data?.items?.map((i) => i.productId) || [];

          // Merge: keep local items (they have full product data),
          // add any server-only IDs as stubs
          const localIds = new Set(get().items.map((i) => i._id));
          const newItems = serverIds
            .filter((id) => !localIds.has(id))
            .map((id) => ({ _id: id }));

          if (newItems.length > 0) {
            set({ items: [...get().items, ...newItems] });
          }
        } catch {
          // Silently fail
        }
      },

      // ---- Internal: fire-and-forget API calls ----
      _apiAdd: async (productId) => {
        try {
          await fetch(`${API_URL}/wishlist/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId }),
          });
        } catch {
          // Silently fail — localStorage is source of truth
        }
      },

      _apiRemove: async (productId) => {
        try {
          await fetch(`${API_URL}/wishlist/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId }),
          });
        } catch {
          // Silently fail
        }
      },
    }),
    {
      name: 'rajdyaan-wishlist',
      // Only persist items, not toast state
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

export default useWishlistStore;
