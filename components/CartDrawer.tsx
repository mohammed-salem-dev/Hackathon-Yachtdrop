"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Drawer from "@/components/Drawer";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: Props) {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    cartTotal,
    itemCount,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function goToCheckout() {
    onClose();
    router.push("/checkout");
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-brand-navy" />
          <span className="font-bold text-brand-navy text-base">Your Cart</span>
          {itemCount > 0 && (
            <span
              className="bg-brand-teal text-white text-[11px]
              font-bold px-2 py-0.5 rounded-full"
            >
              {itemCount}
            </span>
          )}
        </div>
      }
    >
      {/* Empty state */}
      {cartItems.length === 0 && (
        <div
          className="flex flex-col items-center justify-center
          h-full py-20 text-slate-400"
        >
          <ShoppingBag
            size={40}
            strokeWidth={1.2}
            className="mb-3 text-slate-300"
          />
          <p className="font-medium text-slate-500 text-sm">
            Your cart is empty
          </p>
          <p className="text-xs mt-1">Add some parts to get started</p>
        </div>
      )}

      {/* Item list */}
      {cartItems.length > 0 && (
        <>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 bg-slate-50 rounded-2xl p-3"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-14 h-14 rounded-xl overflow-hidden
                    bg-white shrink-0 border border-slate-100"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-product.png";
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold text-brand-navy
                      leading-snug line-clamp-2"
                    >
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-brand-teal mt-1">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-full bg-white border border-slate-200
                          flex items-center justify-center active:bg-slate-100"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-full bg-brand-teal text-white
                          flex items-center justify-center active:brightness-90"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start min-h-[36px] min-w-[32px] flex items-start
                      justify-center pt-1 text-400 hover:text-red-600
                      transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer — sticks to bottom */}
          <div
            className="sticky bottom-0 bg-brand-surface pt-4 mt-4
            border-t border-brand-border space-y-3"
          >
            {/* Order Summary */}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Order Summary
            </p>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>
                  Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""} )
                </span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Delivery fee</span>
                <span className="text-brand-teal font-semibold">
                  TBD at checkout
                </span>
              </div>
              <div className="flex justify-between font-bold text-brand-navy pt-1 border-t border-slate-100">
                <span>Estimated Total</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <CouponRow />
            {/* Accepted payments */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-slate-400">We accept</span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {(
                  [
                    { name: "Visa", src: null, bg: "bg-white" },
                    {
                      name: "Mastercard",
                      src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
                      bg: "bg-white",
                    },
                    {
                      name: "Amex",
                      src: "https://cdn.brandfetch.io/id5WXF6Iyd/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1729487084274",
                      bg: "bg-white",
                    },
                    {
                      name: "PayPal",
                      src: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
                      bg: "bg-white",
                    },
                  ] as { name: string; src: string | null; bg: string }[]
                ).map((p) => (
                  <div
                    key={p.name}
                    className={`h-7 px-2.5 ${p.bg} border border-slate-200
                      rounded-md flex items-center justify-center shadow-sm`}
                  >
                    {p.src ? (
                      <img
                        src={p.src}
                        alt={p.name}
                        className="h-4 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-[#023e8a] font-extrabold italic text-sm tracking-tight leading-none">
                        VISA
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={goToCheckout}
              className="w-full min-h-[48px] bg-brand-navy text-white
                rounded-2xl font-semibold text-sm
                active:brightness-90 transition-all"
            >
              Checkout →
            </button>

            <button
              onClick={clearCart}
              className="w-full min-h-[36px] text-xs text-slate-250
                hover:text-red-500 transition-colors"
            >
              Clear cart
            </button>
          </div>
        </>
      )}
    </Drawer>
  );

  const COUPONS: Record<string, number> = {
    YACHT10: 0.1,
    CREW20: 0.2,
    MARINA5: 0.05,
  };

  function CouponRow() {
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState<string | null>(null);
    const [error, setError] = useState(false);

    function apply() {
      const upper = code.trim().toUpperCase();
      if (COUPONS[upper]) {
        setApplied(upper);
        setError(false);
      } else {
        setError(true);
        setApplied(null);
      }
    }

    return (
      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="COUPON CODE"
            className={`flex-1 min-h-[44px] px-4 rounded-xl border text-xs
            font-semibold tracking-widest placeholder:text-slate-300
            uppercase outline-none transition-colors bg-white
            ${error ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-brand-teal"}`}
          />
          <button
            onClick={apply}
            className="min-h-[44px] px-4 bg-brand-navy text-white
            rounded-xl text-xs font-bold active:brightness-90 transition-all"
          >
            Apply
          </button>
        </div>
        {applied && (
          <p className="text-[11px] text-brand-teal font-semibold">
            ✓ {applied} applied — {Math.round(COUPONS[applied] * 100)}% off
          </p>
        )}
        {error && (
          <p className="text-[11px] text-red-400">Invalid coupon code</p>
        )}
      </div>
    );
  }
}
