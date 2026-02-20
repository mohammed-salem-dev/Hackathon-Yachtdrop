"use client";

import { ShoppingCart, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { ProductItem } from "@/lib/scraper";

export default function AddToCartButton({ product }: { product: ProductItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const cartItems = useCartStore((s) => s.cartItems);
  const router = useRouter();

  const cartItem = cartItems.find((i) => i.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    });
  }

  function handleDecrement() {
    decrementItem(product.id);
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Counter row */}
      <AnimatePresence mode="wait" initial={false}>
        {qty === 0 ? (
          <motion.button
            key="add"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            onClick={handleAdd}
            className="btn-primary flex items-center justify-center gap-2 w-full"
          >
            <ShoppingCart size={18} /> Add to Cart
          </motion.button>
        ) : (
          <motion.div
            key="counter"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between w-full gap-4"
          >
            {/* Minus */}
            <button
              onClick={handleDecrement}
              className="w-9 h-9 rounded-2xl border-2 border-brand-teal
  text-brand-teal flex items-center justify-center shrink-0
  active:bg-brand-teal/20 active:scale-95 transition-all duration-150"
            >
              <Minus size={18} />
            </button>

            {/* Count */}
            <div className="flex-1 flex flex-col items-center">
              <motion.span
                key={qty}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-2xl font-bold text-brand-navy"
              >
                {qty}
              </motion.span>
              <span className="text-[10px] text-brand-muted font-medium">
                in cart · €{(product.price * qty).toFixed(2)}
              </span>
            </div>

            {/* Plus */}
            <button
              onClick={handleAdd}
              className="w-8 h-8 rounded-2xl bg-brand-teal text-white
                flex items-center justify-center
                hover:brightness-110 active:scale-95
                transition-all duration-150"
            >
              <Plus size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Now — only show when item is in cart */}
      <AnimatePresence>
        {qty > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => router.push("/cart")}
            className="w-30 h-10 rounded-2xl bg-brand-navy text-white
              font-bold text-sm flex items-center justify-center gap-2
              hover:brightness-110 active:scale-[0.98]
              transition-all duration-200"
          >
            <ShoppingBag size={18} /> Buy Now · €
            {(product.price * qty).toFixed(2)}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
