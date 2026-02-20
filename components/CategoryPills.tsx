"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  "All",
  "Anchoring & Docking",
  "Life On Board",
  "Fitting",
  "Electrics - Lighting",
  "Motor",
  "Maintenance - Cleaning Products",
  "Navigation",
  "Inflatable-Water Toys",
  "Painting",
  "Plumbing",
  "Safety",
  "Ropes",
  "Electronics",
  "Screws",
  "Tools - Machines",
  "Nautical Clothing and Personal Gear",
  "Brands",
];

type Props = {
  active: string;
  onSelect: (cat: string) => void;
};

export default function CategoryPills({ active, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setTimeout(updateArrows, 50);
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, []);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 200 : -200,
      behavior: "smooth",
    });
  }

  const arrowClass = `shrink-0 w-7 h-7 rounded-full bg-white border border-slate-200
    flex items-center justify-center text-slate-500
    hover:border-brand-teal hover:text-brand-teal
    shadow-sm transition-all duration-200`;

  return (
    <div className="flex items-center gap-1 w-full min-w-0">
      {/* Left arrow — always in DOM, hidden when not needed */}
      <button
        onClick={() => scroll("left")}
        className={`${arrowClass} ${canLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronLeft size={15} />
      </button>

      {/* Pills */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1 min-w-0"
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`shrink-0 min-h-[36px] px-4 rounded-full text-xs font-semibold transition-all
                ${
                  isActive
                    ? "bg-brand-navy text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Right arrow — always in DOM, hidden when not needed */}
      <button
        onClick={() => scroll("right")}
        className={`${arrowClass} ${canRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
