import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
};

type FulfillmentMode = "delivery" | "pickup";

type CartStore = {
  cartItems: CartItem[];
  fulfillmentMode: FulfillmentMode;
  berthLocation: string;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  decrementItem: (id: string) => void;

  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  setBerthLocation: (location: string) => void;
  cartTotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      fulfillmentMode: "delivery",
      berthLocation: "",
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      addItem: (item) => {
        const existing = get().cartItems.find((i) => i.id === item.id);
        if (existing) {
          set((s) => ({
            cartItems: s.cartItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          }));
        } else {
          set((s) => ({
            cartItems: [...s.cartItems, { ...item, quantity: 1 }],
          }));
        }
      },

      removeItem: (id) =>
        set((s) => ({ cartItems: s.cartItems.filter((i) => i.id !== id) })),

      // ← ADD THIS
      decrementItem: (id) => {
        const existing = get().cartItems.find((i) => i.id === id);
        if (!existing) return;
        if (existing.quantity <= 1) {
          set((s) => ({ cartItems: s.cartItems.filter((i) => i.id !== id) }));
        } else {
          set((s) => ({
            cartItems: s.cartItems.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
            ),
          }));
        }
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((s) => ({
          cartItems: s.cartItems.map((i) =>
            i.id === id ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      setFulfillmentMode: (mode) => set({ fulfillmentMode: mode }),
      setBerthLocation: (location) => set({ berthLocation: location }),

      cartTotal: () =>
        get().cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().cartItems.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "yachtdrop-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
