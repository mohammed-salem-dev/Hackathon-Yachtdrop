"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveOrder } from "@/lib/orderStorage";
import { nanoid } from "nanoid";
import { getSavedBerth } from "@/lib/berthStorage";

import {
  Anchor,
  Store,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Package,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { timeSlotLabels, type TimeSlot } from "@/lib/orderUtils";

// ─── Store coordinates ────────────────────────────────────────────────────────
const STORE = {
  lng: 2.1878,
  lat: 41.3784,
  name: "YachtDrop Store",
  address:
    "Pg. de Joan de Borbó, 80, Local H, Ciutat Vella, 08039 Barcelona, Spain",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FulfillmentMode = "delivery" | "pickup";

type DeliveryFields = {
  marinaName: string;
  berthNumber: string;
  timeSlot: TimeSlot | "";
  deliveryDate: string;
  deliveryTime: string;
};

type PickupFields = {
  pickupDate: string;
  pickupTimeSlot: TimeSlot | "";
  pickupTime: string;
};

type FormErrors = Partial<
  Record<keyof DeliveryFields | keyof PickupFields, string>
>;

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`rounded-full transition-all duration-300
            ${
              step === current
                ? "w-6 h-2 bg-brand-teal"
                : step < current
                  ? "w-2 h-2 bg-brand-teal/40"
                  : "w-2 h-2 bg-slate-200"
            }`}
        />
      ))}
    </div>
  );
}

// ─── Slide animation ──────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function FulfillmentTile({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[96px] rounded-2xl flex flex-col items-center justify-center
        gap-2 border-2 font-semibold text-sm transition-all active:scale-[0.97]
        ${
          active
            ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
            : "border-slate-200 bg-white text-slate-600"
        }`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-center leading-tight px-2">{label}</span>
    </button>
  );
}

function FormField({
  label,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full min-h-[48px] px-4 rounded-xl border text-sm
          text-brand-navy placeholder:text-slate-400 bg-white outline-none
          transition-colors focus:border-brand-teal
          ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
      {icon}
      <span>{text}</span>
    </div>
  );
}

// ─── Date picker row ──────────────────────────────────────────────────────────

function DatePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
        <Clock size={13} /> Choose a date
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const iso = d.toISOString().split("T")[0];
          const day = d.toLocaleDateString("en-GB", { weekday: "short" });
          const date = d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          });
          const isToday = i === 0;
          const active = value === iso;
          return (
            <button
              key={iso}
              onClick={() => onChange(iso)}
              className={`shrink-0 min-w-[62px] py-2.5 rounded-2xl flex flex-col
                items-center gap-0.5 border-2 transition-all text-xs font-semibold
                ${
                  active
                    ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
            >
              <span
                className={`text-[10px] font-normal ${active ? "text-brand-teal/70" : "text-slate-400"}`}
              >
                {isToday ? "Today" : day}
              </span>
              <span>{date}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Time slot + specific time picker ────────────────────────────────────────

function TimeSlotPicker({
  selectedSlot,
  selectedTime,
  onSlotChange,
  onTimeChange,
  slotError,
  timeError,
}: {
  selectedSlot: TimeSlot | "";
  selectedTime: string;
  onSlotChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  slotError?: string;
  timeError?: string;
}) {
  const slots = [
    { slot: "morning", label: "Morning", time: "8AM – 12PM" },
    { slot: "afternoon", label: "Afternoon", time: "12PM – 5PM" },
    { slot: "evening", label: "Evening", time: "5PM – 9PM" },
  ] as { slot: TimeSlot; emoji: string; label: string; time: string }[];

  const timeOptions: Record<TimeSlot, string[]> = {
    morning: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
    afternoon: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
    evening: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <Clock size={13} /> Preferred time window
        </label>
        <div className="grid grid-cols-3 gap-2">
          {slots.map(({ slot, emoji, label, time }) => (
            <button
              key={slot}
              onClick={() => {
                onSlotChange(slot);
                onTimeChange("");
              }}
              className={`min-h-[80px] rounded-2xl flex flex-col items-center
                justify-center gap-0.5 text-xs font-semibold border-2 transition-all px-1
                ${
                  selectedSlot === slot
                    ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="capitalize">{label}</span>
              <span
                className={`text-[10px] font-normal mt-0.5
                  ${selectedSlot === slot ? "text-brand-teal/70" : "text-slate-400"}`}
              >
                {time}
              </span>
            </button>
          ))}
        </div>
        {slotError && <p className="text-xs text-red-500">{slotError}</p>}
      </div>

      {selectedSlot && (
        <motion.div
          key={selectedSlot}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Clock size={13} /> Specific time
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {timeOptions[selectedSlot].map((t) => (
              <button
                key={t}
                onClick={() => onTimeChange(t)}
                className={`shrink-0 px-4 py-2 rounded-xl border-2 text-xs font-semibold
                  transition-all
                  ${
                    selectedTime === t
                      ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          {timeError && <p className="text-xs text-red-500">{timeError}</p>}
        </motion.div>
      )}
    </>
  );
}

// ─── Pickup Map ───────────────────────────────────────────────────────────────

function PickupMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: any;

    (async () => {
      if (!document.getElementById("mapbox-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-css";
        link.rel = "stylesheet";
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css";
        document.head.appendChild(link);
        await new Promise((r) => setTimeout(r, 50));
      }

      const mapboxgl =
        (await import("mapbox-gl" as any)).default ??
        (await import("mapbox-gl" as any));
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

      if (!containerRef.current) return;

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [STORE.lng, STORE.lat],
        zoom: 15,
        interactive: true,
        attributionControl: false,
      });

      map.on("load", () => {
        new mapboxgl.Marker({ color: "#0891b2" })
          .setLngLat([STORE.lng, STORE.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>${STORE.name}</strong><br/><span style="font-size:11px;color:#64748b">${STORE.address}</span>`,
            ),
          )
          .addTo(map);

        const berth = getSavedBerth();
        if (berth) {
          new mapboxgl.Marker({ color: "#64748b", scale: 0.8 })
            .setLngLat([berth.lng, berth.lat])
            .addTo(map);

          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([STORE.lng, STORE.lat]);
          bounds.extend([berth.lng, berth.lat]);
          map.fitBounds(bounds, { padding: 60, duration: 800 });
        }
      });
    })();

    return () => {
      map?.remove();
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 px-1">
        <MapPin size={14} className="text-brand-teal mt-0.5 shrink-0" />
        <p className="text-xs font-semibold text-brand-navy leading-snug">
          {STORE.address}
        </p>
      </div>
      <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 pointer-events-none z-10">
          <p className="text-white text-xs font-bold">{STORE.name}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Fulfillment
// ─────────────────────────────────────────────────────────────────────────────

type StepOneProps = {
  fulfillmentMode: FulfillmentMode;
  deliveryFields: DeliveryFields;
  pickupFields: PickupFields;
  formErrors: FormErrors;
  onSelectMode: (mode: FulfillmentMode) => void;
  onUpdateDeliveryField: (field: keyof DeliveryFields, value: string) => void;
  onUpdatePickupField: (field: keyof PickupFields, value: string) => void;
  onNext: () => void;
};

function StepOneFulfillment({
  fulfillmentMode,
  deliveryFields,
  pickupFields,
  formErrors,
  onSelectMode,
  onUpdateDeliveryField,
  onUpdatePickupField,
  onNext,
}: StepOneProps) {
  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <FulfillmentTile
          icon="🚢"
          label="Deliver to my boat"
          active={fulfillmentMode === "delivery"}
          onClick={() => onSelectMode("delivery")}
        />
        <FulfillmentTile
          icon="🏪"
          label="I'll pick it up"
          active={fulfillmentMode === "pickup"}
          onClick={() => onSelectMode("pickup")}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ── Delivery form ── */}
        {fulfillmentMode === "delivery" && (
          <motion.div
            key="delivery-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <SectionLabel icon={<MapPin size={15} />} text="Delivery details" />

            <FormField
              label="Marina name"
              placeholder="e.g. Puerto Portals, Port Vell"
              value={deliveryFields.marinaName}
              error={formErrors.marinaName}
              onChange={(v) => onUpdateDeliveryField("marinaName", v)}
            />
            <FormField
              label="Berth / slip number"
              placeholder="e.g. B-42, Pier 3 Slip 7"
              value={deliveryFields.berthNumber}
              error={formErrors.berthNumber}
              onChange={(v) => onUpdateDeliveryField("berthNumber", v)}
            />

            <DatePicker
              value={deliveryFields.deliveryDate}
              onChange={(v) => onUpdateDeliveryField("deliveryDate", v)}
              error={formErrors.deliveryDate}
            />

            <TimeSlotPicker
              selectedSlot={deliveryFields.timeSlot}
              selectedTime={deliveryFields.deliveryTime}
              onSlotChange={(v) => onUpdateDeliveryField("timeSlot", v)}
              onTimeChange={(v) => onUpdateDeliveryField("deliveryTime", v)}
              slotError={formErrors.timeSlot}
              timeError={formErrors.deliveryTime}
            />
          </motion.div>
        )}

        {/* ── Pickup form ── */}
        {fulfillmentMode === "pickup" && (
          <motion.div
            key="pickup-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <SectionLabel icon={<Store size={15} />} text="Pickup location" />

            <PickupMap />

            <div className="flex items-center gap-3 bg-brand-teal/10 border border-brand-teal/30 rounded-2xl px-4 py-3">
              <span className="text-2xl">⏱</span>
              <div>
                <p className="text-sm font-bold text-brand-teal">
                  Ready in ~45 mins
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  We'll send a confirmation when your order is packed
                </p>
              </div>
            </div>

            <DatePicker
              value={pickupFields.pickupDate}
              onChange={(v) => onUpdatePickupField("pickupDate", v)}
              error={formErrors.pickupDate}
            />

            <TimeSlotPicker
              selectedSlot={pickupFields.pickupTimeSlot}
              selectedTime={pickupFields.pickupTime}
              onSlotChange={(v) => onUpdatePickupField("pickupTimeSlot", v)}
              onTimeChange={(v) => onUpdatePickupField("pickupTime", v)}
              slotError={formErrors.pickupTimeSlot}
              timeError={formErrors.pickupTime}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onNext}
        className="w-full min-h-[52px] bg-brand-navy text-white rounded-2xl
          font-semibold text-base flex items-center justify-center gap-2
          active:brightness-90 transition-all"
      >
        Review Order <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Summary
// ─────────────────────────────────────────────────────────────────────────────

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
};

type StepTwoProps = {
  cartItems: CartItem[];
  cartTotal: number;
  fulfillmentMode: FulfillmentMode;
  deliveryFields: DeliveryFields;
  pickupFields: PickupFields;
  onConfirm: () => void;
  onBack: () => void;
};

function StepTwoSummary({
  cartItems,
  cartTotal,
  fulfillmentMode,
  deliveryFields,
  pickupFields,
  onConfirm,
}: StepTwoProps) {
  const deliveryFee = fulfillmentMode === "delivery" ? 4.9 : 0;
  const orderTotal = cartTotal + deliveryFee;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div className="space-y-5">
      <SectionLabel icon={<Package size={15} />} text="Items in this order" />

      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white rounded-2xl p-3"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
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
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-navy line-clamp-2">
                {item.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Qty: {item.quantity}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-brand-navy">
                €{(item.price * item.quantity).toFixed(2)}
              </p>
              {item.originalPrice && item.originalPrice > item.price && (
                <>
                  <p className="text-xs text-slate-400 line-through">
                    €{(item.originalPrice * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold text-red-500">
                    −{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    off
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fulfillment details */}
      <div className="bg-white rounded-2xl px-4 py-3 space-y-2">
        <SectionLabel
          icon={
            fulfillmentMode === "delivery" ? (
              <Anchor size={14} />
            ) : (
              <Store size={14} />
            )
          }
          text={
            fulfillmentMode === "delivery"
              ? "Delivery details"
              : "Pickup details"
          }
        />
        {fulfillmentMode === "delivery" ? (
          <div className="text-xs text-slate-600 space-y-1 pl-0.5">
            <p>
              📍 {deliveryFields.marinaName} — Berth{" "}
              {deliveryFields.berthNumber}
            </p>
            <p>
              📅{" "}
              {deliveryFields.deliveryDate &&
                formatDate(deliveryFields.deliveryDate)}
            </p>
            <p>
              🕐{" "}
              {deliveryFields.timeSlot &&
                timeSlotLabels[deliveryFields.timeSlot as TimeSlot]}
              {" · "}
              {deliveryFields.deliveryTime}
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-600 space-y-1 pl-0.5">
            <p>🏪 In-store pickup · Ready in ~50 mins</p>
            <p>
              📅{" "}
              {pickupFields.pickupDate && formatDate(pickupFields.pickupDate)}
            </p>
            <p>
              🕐{" "}
              {pickupFields.pickupTimeSlot &&
                timeSlotLabels[pickupFields.pickupTimeSlot as TimeSlot]}
              {" · "}
              {pickupFields.pickupTime}
            </p>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>€{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Delivery fee</span>
          <span>{deliveryFee > 0 ? `€${deliveryFee.toFixed(2)}` : "Free"}</span>
        </div>
        <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-brand-navy">
          <span>Total</span>
          <span>€{orderTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full min-h-[52px] bg-brand-navy text-white rounded-2xl
          font-semibold text-base active:brightness-90 transition-all"
      >
        Confirm Order →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Confirmation
// ─────────────────────────────────────────────────────────────────────────────

function StepThreeConfirmation({
  orderId,
  onDone,
}: {
  orderId: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center gap-6 px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center">
          <CheckCircle2
            size={56}
            className="text-brand-teal"
            strokeWidth={1.5}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-brand-navy">
          You're all set! ⚓
        </h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Your order has been placed and the team is on it.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl px-6 py-4 border border-slate-200 w-full max-w-xs"
      >
        <p className="text-xs text-slate-400 mb-1">Order reference</p>
        <p className="font-mono font-bold text-brand-navy text-lg tracking-widest">
          {orderId}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onDone}
        className="w-full max-w-xs min-h-[52px] bg-brand-navy text-white
          rounded-2xl font-semibold text-base active:brightness-90 transition-all"
      >
        Back to Shop
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    fulfillmentMode,
    setFulfillmentMode,
    clearCart,
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [slideDir, setSlideDir] = useState(1);
  const [orderId, setOrderId] = useState("");

  const [deliveryFields, setDeliveryFields] = useState<DeliveryFields>({
    marinaName: "",
    berthNumber: "",
    timeSlot: "",
    deliveryDate: "",
    deliveryTime: "",
  });

  const [pickupFields, setPickupFields] = useState<PickupFields>({
    pickupDate: "",
    pickupTimeSlot: "",
    pickupTime: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const berth = getSavedBerth();
    if (berth) {
      const [latPart, lngPart] = berth.label.split(",");
      setDeliveryFields((prev) => ({
        ...prev,
        marinaName: prev.marinaName || `Berth @ ${latPart?.trim()}`,
        berthNumber: prev.berthNumber || lngPart?.trim() || berth.label,
      }));
    }
  }, []);

  function goToStep(next: number) {
    setSlideDir(next > currentStep ? 1 : -1);
    setCurrentStep(next);
  }

  function validateDelivery(): boolean {
    const errors: FormErrors = {};
    if (!deliveryFields.marinaName.trim())
      errors.marinaName = "Marina name is required";
    if (!deliveryFields.berthNumber.trim())
      errors.berthNumber = "Berth / slip number is required";
    if (!deliveryFields.deliveryDate)
      errors.deliveryDate = "Please choose a date";
    if (!deliveryFields.timeSlot)
      errors.timeSlot = "Please choose a delivery window";
    if (!deliveryFields.deliveryTime)
      errors.deliveryTime = "Please choose a specific time";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validatePickup(): boolean {
    const errors: FormErrors = {};
    if (!pickupFields.pickupDate)
      errors.pickupDate = "Please choose a pickup date";
    if (!pickupFields.pickupTimeSlot)
      errors.pickupTimeSlot = "Please choose a time window";
    if (!pickupFields.pickupTime)
      errors.pickupTime = "Please choose a specific time";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleStepOneNext() {
    if (fulfillmentMode === "delivery" && !validateDelivery()) return;
    if (fulfillmentMode === "pickup" && !validatePickup()) return;
    goToStep(2);
  }

  function updateDeliveryField(field: keyof DeliveryFields, value: string) {
    setDeliveryFields((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function updatePickupField(field: keyof PickupFields, value: string) {
    setPickupFields((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function confirmOrder() {
    const newOrderId = `YD-${nanoid(5).toUpperCase()}`;
    const deliveryFee = fulfillmentMode === "delivery" ? 4.9 : 0;

    saveOrder({
      orderId: newOrderId,
      items: cartItems,
      fulfillmentType: fulfillmentMode,
      berthInfo:
        fulfillmentMode === "delivery"
          ? {
              marinaName: deliveryFields.marinaName,
              berthNumber: deliveryFields.berthNumber,
              timeSlot: deliveryFields.timeSlot || undefined,
              deliveryDate: deliveryFields.deliveryDate || undefined,
              deliveryTime: deliveryFields.deliveryTime || undefined,
            }
          : {},
      pickupInfo:
        fulfillmentMode === "pickup"
          ? {
              pickupDate: pickupFields.pickupDate || undefined,
              pickupTimeSlot: pickupFields.pickupTimeSlot || undefined,
              pickupTime: pickupFields.pickupTime || undefined,
            }
          : undefined,
      placedAt: new Date().toISOString(),
      total: cartTotal + deliveryFee,
    });

    setOrderId(newOrderId);
    clearCart();
    goToStep(3);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-brand-light">
      <header
        className="sticky top-0 z-40 bg-brand-light border-b border-slate-200/60
        px-4 pt-4 pb-3 flex items-center gap-3"
      >
        {currentStep < 3 && (
          <button
            onClick={() =>
              currentStep === 1 ? router.back() : goToStep(currentStep - 1)
            }
            className="min-h-[48px] min-w-[48px] flex items-center justify-center
              text-slate-500 active:text-brand-navy -ml-2"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-bold text-brand-navy text-base">
            {currentStep === 1 && "Fulfillment"}
            {currentStep === 2 && "Order Summary"}
            {currentStep === 3 && "Order Placed!"}
          </h1>
          {currentStep < 3 && <StepDots current={currentStep} />}
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={currentStep}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-32"
          >
            {currentStep === 1 && (
              <StepOneFulfillment
                fulfillmentMode={fulfillmentMode}
                deliveryFields={deliveryFields}
                pickupFields={pickupFields}
                formErrors={formErrors}
                onSelectMode={setFulfillmentMode}
                onUpdateDeliveryField={updateDeliveryField}
                onUpdatePickupField={updatePickupField}
                onNext={handleStepOneNext}
              />
            )}
            {currentStep === 2 && (
              <StepTwoSummary
                cartItems={cartItems}
                cartTotal={cartTotal}
                fulfillmentMode={fulfillmentMode}
                deliveryFields={deliveryFields}
                pickupFields={pickupFields}
                onConfirm={confirmOrder}
                onBack={() => goToStep(1)}
              />
            )}
            {currentStep === 3 && (
              <StepThreeConfirmation
                orderId={orderId}
                onDone={() => router.push("/")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
