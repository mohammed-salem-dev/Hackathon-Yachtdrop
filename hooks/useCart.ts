import { useCartStore } from "@/lib/store";

export function useCart() {
  const {
    cartItems,
    fulfillmentMode,
    berthLocation,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setFulfillmentMode,
    setBerthLocation,
    cartTotal,
    itemCount,
  } = useCartStore();

  return {
    cartItems,
    fulfillmentMode,
    berthLocation,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setFulfillmentMode,
    setBerthLocation,
    cartTotal: cartTotal(),
    itemCount: itemCount(),
  };
}
