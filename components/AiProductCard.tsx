"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import type { ProductItem } from "@/lib/scraper";

type Props = {
  product: ProductItem;
  rank: number;
  onAdd?: () => void;
};

export default function AiProductCard({ product, rank, onAdd }: Props) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    });

    setJustAdded(true);
    toast.success(`${product.name} added ✓`, {
      icon: "⚡",
      style: {
        borderRadius: "12px",
        background: "#0A1628",
        color: "#fff",
        fontSize: "13px",
      },
    });

    setTimeout(() => {
      setJustAdded(false);
      onAdd?.();
    }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: rank * 0.08 }}
      className="flex gap-3 bg-brand-surface rounded-2xl p-3
        border border-brand-border/60"
    >
      {/* Thumbnail */}
      <div
        className="relative w-16 h-16 rounded-xl overflow-hidden
        bg-white border border-brand-border shrink-0"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="64px"
          className="object-contain p-1"
          unoptimized
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-product.png";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* AI Match badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="inline-flex items-center gap-1 bg-brand-teal/10
              text-brand-teal text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              <Sparkles size={9} />
              AI Match #{rank}
            </span>
          </div>
          <p className="text-xs font-semibold text-brand-navy line-clamp-2 leading-snug">
            {product.name}
          </p>
          <p className="text-[11px] text-brand-muted mt-0.5">
            {product.category}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-brand-teal">
            {product.price > 0 ? `€${product.price.toFixed(2)}` : "POA"}
          </span>

          {/* Add button */}
          <button
            onClick={handleAdd}
            className="min-h-[36px] px-3 rounded-xl bg-brand-teal text-white
              text-xs font-semibold flex items-center gap-1
              active:brightness-90 transition-all duration-200"
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check size={12} /> Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
