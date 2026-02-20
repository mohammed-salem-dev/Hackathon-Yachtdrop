"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  RotateCcw,
  Package,
  Anchor,
  Store,
  MapPin,
  CalendarDays,
  Clock,
} from "lucide-react";
import { getOrders, type StoredOrder } from "@/lib/orderStorage";
import { useCart } from "@/hooks/useCart";
import { useCartDrawerStore } from "@/lib/cartDrawerStore";
import { timeSlotLabels, type TimeSlot } from "@/lib/orderUtils";

export default function OrdersPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const openCart = useCartDrawerStore((s) => s.open);

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  function handleReorder(order: StoredOrder) {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        });
      }
    });
    setToast(`🛒 Cart loaded from ${order.orderId}`);
    setTimeout(() => setToast(null), 3000);
    openCart();
  }

  function formatPlacedAt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatScheduledDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  const totalItems = (order: StoredOrder) =>
    order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-dvh bg-brand-surface flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50
              bg-brand-navy text-white text-xs font-semibold
              px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-brand-surface border-b border-slate-200/60">
        <div className="max-w-screen-sm mx-auto w-full px-4 pt-5 pb-3">
          <h1 className="text-lg font-bold text-brand-navy">Order History</h1>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="max-w-screen-sm mx-auto w-full px-4 pt-4 pb-10">
        {/* Empty state */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Package size={28} className="text-slate-300" />
            </div>
            <div>
              <p className="font-semibold text-slate-600 text-sm">
                No orders yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Your completed orders will appear here
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-2 min-h-[44px] px-6 bg-brand-navy text-white
                rounded-2xl text-sm font-semibold active:brightness-90 transition-all"
            >
              Browse Products
            </button>
          </div>
        )}

        {/* Order list */}
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 space-y-3 border border-slate-100 shadow-sm"
            >
              {/* Top row — order ID + badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono font-bold text-brand-navy text-sm tracking-wide">
                    {order.orderId}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Placed {formatPlacedAt(order.placedAt)}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 text-[11px] font-semibold
                    px-2.5 py-1 rounded-full shrink-0
                    ${
                      order.fulfillmentType === "delivery"
                        ? "bg-brand-teal/10 text-brand-teal"
                        : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {order.fulfillmentType === "delivery" ? (
                    <>
                      <Anchor size={11} /> Delivery
                    </>
                  ) : (
                    <>
                      <Store size={11} /> Pickup
                    </>
                  )}
                </span>
              </div>

              {/* ── Delivery details ── */}
              {order.fulfillmentType === "delivery" && (
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 space-y-1.5">
                  {order.berthInfo?.marinaName && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <MapPin size={11} className="text-brand-teal shrink-0" />
                      <span className="font-medium">
                        {order.berthInfo.marinaName}
                        {order.berthInfo.berthNumber &&
                          ` — Berth ${order.berthInfo.berthNumber}`}
                      </span>
                    </div>
                  )}
                  {order.berthInfo?.deliveryDate && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <CalendarDays
                        size={11}
                        className="text-brand-teal shrink-0"
                      />
                      <span>
                        {formatScheduledDate(order.berthInfo.deliveryDate)}
                      </span>
                    </div>
                  )}
                  {(order.berthInfo?.timeSlot ||
                    order.berthInfo?.deliveryTime) && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Clock size={11} className="text-brand-teal shrink-0" />
                      <span>
                        {order.berthInfo.timeSlot &&
                          timeSlotLabels[order.berthInfo.timeSlot as TimeSlot]}
                        {order.berthInfo.timeSlot &&
                          order.berthInfo.deliveryTime &&
                          " · "}
                        {order.berthInfo.deliveryTime}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Pickup details ── */}
              {order.fulfillmentType === "pickup" && (
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="font-medium">
                      In-store pickup (Ciutat Vella, 08039 Barcelona, Spain)
                    </span>
                  </div>
                  {order.pickupInfo?.pickupDate && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <CalendarDays
                        size={11}
                        className="text-slate-400 shrink-0"
                      />
                      <span>
                        {formatScheduledDate(order.pickupInfo.pickupDate)}
                      </span>
                    </div>
                  )}
                  {(order.pickupInfo?.pickupTimeSlot ||
                    order.pickupInfo?.pickupTime) && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Clock size={11} className="text-slate-400 shrink-0" />
                      <span>
                        {order.pickupInfo.pickupTimeSlot &&
                          timeSlotLabels[
                            order.pickupInfo.pickupTimeSlot as TimeSlot
                          ]}
                        {order.pickupInfo.pickupTimeSlot &&
                          order.pickupInfo.pickupTime &&
                          " · "}
                        {order.pickupInfo.pickupTime}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Item list preview */}
              <div className="space-y-2">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-product.png";
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-1 flex-1">
                      {item.name}
                    </p>
                    <span className="text-xs text-slate-400">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-slate-400 text-center">
                    +{order.items.length - 2} more
                  </p>
                )}
              </div>

              {/* Item count & total */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {totalItems(order)} item{totalItems(order) !== 1 ? "s" : ""}
                </span>
                <span className="font-bold text-brand-navy text-sm">
                  €{order.total.toFixed(2)}
                </span>
              </div>

              {/* Reorder button */}
              <button
                onClick={() => handleReorder(order)}
                className="w-full min-h-[40px] flex items-center justify-center gap-2
                  bg-brand-navy text-white rounded-xl text-xs font-semibold
                  active:brightness-90 transition-all"
              >
                <RotateCcw size={13} /> Reorder
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
