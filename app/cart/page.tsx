"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  X,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";

const VALID_COUPONS: Record<string, number> = {
  YACHT10: 0.1,
  CREW20: 0.2,
  MARINA5: 0.05,
};

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    cartTotal,
    itemCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const discount = appliedCoupon ? VALID_COUPONS[appliedCoupon] : 0;
  const discountAmount = cartTotal * discount;
  const orderTotal = cartTotal - discountAmount;

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (VALID_COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code");
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-dvh bg-brand-surface flex flex-col items-center justify-center px-8 text-center gap-4">
        <ShoppingBag size={56} className="text-slate-300" strokeWidth={1} />
        <p className="text-lg font-semibold text-slate-500">
          Your cart is empty
        </p>
        <p className="text-sm text-slate-400">
          Add some products to get started
        </p>
        <button
          onClick={() => router.push("/")}
          className="min-h-[48px] px-8 bg-brand-navy text-white rounded-2xl text-sm font-semibold active:brightness-90 transition-all"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-brand-surface">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-brand-surface border-b border-slate-200/60 px-6 pt-4 pb-3">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-500 active:text-brand-navy -ml-2"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-brand-navy text-base flex items-center gap-1.5">
            <ShoppingBag size={18} className="inline" />
            Your Cart
            <span className="text-slate-400 font-normal">({itemCount})</span>
          </h1>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-32 lg:pb-10 flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT — Item list */}
        <div className="flex-1 w-full space-y-3">
          <AnimatePresence initial={false}>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-product.png";
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 py-1">
                  <p className="text-sm font-semibold text-brand-navy line-clamp-2 mb-2 leading-tight">
                    {item.name}
                  </p>

                  <p className="text-base font-bold text-brand-navy mb-3">
                    €{(item.price * item.quantity).toFixed(2)}
                    {item.quantity > 1 && (
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        €{item.price.toFixed(2)} each
                      </span>
                    )}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center active:bg-slate-200 text-slate-600 transition-all"
                    >
                      <Minus size={15} />
                    </button>

                    <div className="w-12 h-10 bg-brand-teal/5 border-2 border-brand-teal/30 rounded-xl flex items-center justify-center">
                      <span className="text-base font-bold text-brand-teal">
                        {item.quantity}
                      </span>
                    </div>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-brand-teal text-white flex items-center justify-center active:brightness-90 transition-all"
                    >
                      <Plus size={15} />
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

        {/* RIGHT — Order summary */}
        <div className="w-full lg:w-96 lg:sticky lg:top-24 space-y-3">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">
              Order Summary
            </h2>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({itemCount} items)</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-between text-brand-teal font-semibold"
                >
                  <span>Discount ({(discount * 100).toFixed(0)}% off)</span>
                  <span>−€{discountAmount.toFixed(2)}</span>
                </motion.div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Delivery fee</span>
                <span className="text-brand-teal font-medium">
                  TBD at checkout
                </span>
              </div>

              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-brand-navy text-base">
                <span>Estimated Total</span>
                <span>€{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-brand-teal/10 border border-brand-teal/30 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 text-brand-teal text-sm font-semibold">
                    <Tag size={14} />
                    <span>{appliedCoupon} applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-brand-teal hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Coupon code"
                      className={`flex-1 min-h-[42px] px-3 rounded-xl border text-sm text-brand-navy placeholder:text-slate-400 bg-white outline-none transition-colors focus:border-brand-teal uppercase ${couponError ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                    />
                    <button
                      onClick={applyCoupon}
                      className="min-h-[42px] px-4 bg-brand-navy text-white rounded-xl text-sm font-semibold active:brightness-90 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}
                </div>
              )}
            </div>
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
            {/* Checkout CTA */}
            <button
              onClick={() => router.push("/checkout")}
              className="w-full min-h-[52px] bg-brand-navy text-white rounded-2xl font-bold text-base active:brightness-90 transition-all shadow-lg"
            >
              Checkout →
            </button>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full min-h-[40px] text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear cart
            </button>
          </div>

          {/* Trust badge */}
        </div>
      </div>
    </div>
  );
}
