"use client";

import { useEffect, useRef, useState } from "react";
import { Anchor, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSavedBerth,
  saveBerth,
  clearBerth,
  type SavedBerth,
} from "@/lib/berthStorage";

const TOUCH_CSS = `
  .mapboxgl-canvas {
    touch-action: pan-x pan-y;
  }
`;

export default function MarinaPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [savedBerth, setSavedBerth] = useState<SavedBerth | null>(null);
  const [pendingPin, setPendingPin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: any;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxglRef.current = mapboxgl;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css";
      document.head.appendChild(link);

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [2.1734, 41.3851],
        zoom: 13,
        doubleClickZoom: false,
        touchZoomRotate: true,
      });

      mapRef.current = map;

      map.on("load", () => {
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: true }),
          "top-right",
        );
        setMapReady(true);

        // Restore saved berth
        const existing = getSavedBerth();
        if (existing) {
          setSavedBerth(existing);
          placeMarker(mapboxgl, map, existing.lng, existing.lat);
        }

        // Auto-center on user location
        navigator.geolocation?.getCurrentPosition(({ coords }) => {
          map.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 15,
            duration: 1800,
          });
        });

        // ── Desktop: double-click ────────────────────────────────────────────
        map.on("dblclick", (e: any) => {
          e.preventDefault();
          setPendingPin({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });

        // ── Desktop: right-click fallback ────────────────────────────────────
        map.on("contextmenu", (e: any) => {
          setPendingPin({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });

        // ── Mobile: manual double-tap detection ──────────────────────────────
        const canvas = map.getCanvas();
        let lastTap = 0;
        let lastTapPoint: { x: number; y: number } | null = null;
        const DOUBLE_TAP_DELAY = 300; // ms
        const DOUBLE_TAP_RADIUS = 30; // px

        canvas.addEventListener(
          "touchend",
          (e: TouchEvent) => {
            const now = Date.now();
            const touch = e.changedTouches[0];

            if (
              lastTapPoint &&
              now - lastTap < DOUBLE_TAP_DELAY &&
              Math.abs(touch.clientX - lastTapPoint.x) < DOUBLE_TAP_RADIUS &&
              Math.abs(touch.clientY - lastTapPoint.y) < DOUBLE_TAP_RADIUS
            ) {
              // Double-tap confirmed — convert pixel → lngLat
              const rect = canvas.getBoundingClientRect();
              const lngLat = map.unproject({
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
              });
              setPendingPin({ lat: lngLat.lat, lng: lngLat.lng });
              lastTap = 0;
              lastTapPoint = null;
            } else {
              lastTap = now;
              lastTapPoint = { x: touch.clientX, y: touch.clientY };
            }
          },
          { passive: true },
        );
      });
    })();

    return () => {
      map?.remove();
    };
  }, []);

  function placeMarker(mapboxgl: any, map: any, lng: number, lat: number) {
    markerRef.current?.remove();
    const marker = new mapboxgl.Marker({ color: "#0891b2", anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);
    markerRef.current = marker;
  }

  function confirmPin() {
    if (!pendingPin || !mapRef.current || !mapboxglRef.current) return;
    const { lat, lng } = pendingPin;
    const berth: SavedBerth = {
      lat,
      lng,
      label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };

    saveBerth(berth);

    // Place marker FIRST before any state changes
    placeMarker(mapboxglRef.current, mapRef.current, lng, lat);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1200 });

    setSavedBerth(berth);
    setPendingPin(null);
  }

  function handleClear() {
    clearBerth();
    setSavedBerth(null);
    markerRef.current?.remove();
    markerRef.current = null;
  }

  return (
    <div className="relative w-full" style={{ height: "calc(100dvh - 120px)" }}>
      <style>{TOUCH_CSS}</style>

      {/* Map canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Hint pill */}
      <AnimatePresence>
        {mapReady && !savedBerth && !pendingPin && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ delay: 0.6 }}
            className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none"
          >
            <div
              className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-semibold
  px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 whitespace-nowrap"
            >
              <Anchor size={13} className="text-brand-teal shrink-0" />
              Double-tap anywhere on the map to pin your berth
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending pin confirm — slides from top */}
      <AnimatePresence>
        {pendingPin && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-4 left-4 right-4 z-50 bg-white rounded-2xl
              shadow-2xl border border-slate-100 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center shrink-0">
                <Anchor size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="font-bold text-brand-navy text-sm">
                  Set as delivery spot?
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {pendingPin.lat.toFixed(5)}, {pendingPin.lng.toFixed(5)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPendingPin(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200
                  text-slate-600 font-semibold text-sm active:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmPin}
                className="flex-1 h-11 rounded-xl bg-brand-teal text-white
                  font-bold text-sm active:brightness-95 transition-all"
              >
                Yes, save it ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved berth card */}
      <AnimatePresence>
        {savedBerth && !pendingPin && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="absolute bottom-4 left-0 right-0 z-30 flex justify-center px-4"
          >
            <div
              className="backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl
              border border-white/10 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-teal/20 flex items-center justify-center shrink-0">
                <Anchor size={20} className="text-brand-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mb-0.5">
                  Delivery Berth Saved ✓
                </p>
                <p className="text-white/80 text-xs font-mono truncate">
                  {savedBerth.label}
                </p>
              </div>
              <button
                onClick={handleClear}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center
                  text-white/50 active:text-red-400 active:bg-red-400/20 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
