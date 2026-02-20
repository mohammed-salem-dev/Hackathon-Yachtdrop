"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/lib/store";

type Props = { onOpen: () => void };

export default function StickyCartBar({ onOpen }: Props) {
  const { itemCount, cartTotal } = useCart();
  const hasHydrated = useCartStore((s) => s._hasHydrated);

  const count = hasHydrated ? itemCount : 0;
  const total = hasHydrated ? cartTotal : 0;

  return (
    <button
      onClick={onOpen}
      aria-label="Open cart"
      className="flex items-center gap-1.5
        bg-brand-surface border border-brand-border
        text-brand-navy
        px-3 py-1.5 rounded-xl shadow-sm
        hover:border-brand-teal hover:text-brand-teal
        active:brightness-90
        transition-all duration-200"
    >
      <div className="relative w-[16px] h-[16px]">
        <ShoppingCart size={16} strokeWidth={2} />
        {count > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5
            min-w-[14px] h-[14px]
            bg-brand-teal text-white text-[8px] font-bold
            rounded-full flex items-center justify-center px-0.5
            leading-none"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>

      <span className="text-xs font-semibold">Cart</span>

      {/* Show 0 when empty, total when items exist */}
      <span className="text-xs font-bold text-brand-teal">
        €{total.toFixed(2)}
      </span>
    </button>
  );
}
