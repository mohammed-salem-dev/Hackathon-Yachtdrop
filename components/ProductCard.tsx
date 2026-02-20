"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store";
import type { ProductItem } from "@/lib/scraper";

type Props = { product: ProductItem };

export default function ProductCard({ product }: Props) {
  const [quantity, setQuantity] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const hasDiscount =
    product.originalPrice !== undefined &&
    product.originalPrice > product.price;

  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.imageUrl,
  };

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartItem);
    setQuantity((q) => q + 1);
  }

  function handleIncrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartItem);
    setQuantity((q) => q + 1);
  }

  function handleDecrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    decrementItem(product.id); // ← was removeItem
    setQuantity((q) => Math.max(0, q - 1));
  }

  return (
    <div className="card flex flex-col overflow-hidden h-full group">
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square bg-brand-surface overflow-hidden"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw,
                 (max-width: 1024px) 33vw,
                 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-product.png";
          }}
        />
        {hasDiscount && (
          <span
            className="absolute top-2 left-2 bg-red-500 text-white
            text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
          >
            -{discountPct}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/products/${product.id}`}>
          <p
            className="text-sm font-semibold text-brand-navy leading-snug
            line-clamp-2 hover:text-brand-teal transition-colors duration-200"
          >
            {product.name}
          </p>
        </Link>

        {/* Price row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base font-bold text-brand-navy">
            €{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              €{product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Controls row */}
        <div className="mt-auto flex items-center gap-2">
          {/* Counter */}
          <AnimatePresence initial={false}>
            {quantity > 0 && (
              <motion.div
                key="counter"
                initial={{ opacity: 0, scale: 0.7, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.7, width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                  mass: 0.8,
                }}
                className="flex-1 flex items-center justify-between h-9
                  rounded-xl border border-brand-teal overflow-hidden min-w-0"
              >
                <button
                  onClick={handleDecrement}
                  className="flex-1 h-full flex items-center justify-center
                    text-brand-teal hover:bg-brand-teal/10
                    active:bg-brand-teal/20 transition-colors duration-100"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>

                <motion.span
                  key={quantity}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-sm font-bold text-brand-navy w-8 text-center"
                >
                  {quantity}
                </motion.span>

                <button
                  onClick={handleIncrement}
                  className="flex-1 h-full flex items-center justify-center
                    bg-brand-teal text-white hover:brightness-110
                    active:brightness-90 transition-all duration-100"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {}
          <motion.button
            onClick={handleAdd}
            layout
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 24,
              mass: 0.8,
            }}
            className={`flex items-center justify-center gap-1 h-9
              rounded-xl bg-brand-teal text-white text-xs font-semibold
              hover:brightness-110 active:scale-95 shrink-0
              transition-[filter] duration-150 whitespace-nowrap
              ${quantity === 0 ? "w-full px-4" : "px-4"}`}
          >
            <Plus size={0} strokeWidth={2.5} />
            Add
          </motion.button>
        </div>
      </div>
    </div>
  );
}
