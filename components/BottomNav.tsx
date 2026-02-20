"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Package, MapPin, ChevronUp } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Browse", icon: Home },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/marina", label: "Marina", icon: MapPin },
  { href: "/orders", label: "Orders", icon: Package },
];

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white
      border-t border-brand-border h-16 flex items-center
      safe-area-inset-bottom overflow-hidden"
    >
      <div className="max-w-screen-xl mx-auto w-full flex items-center">
        {/* Arrow — slides in from left when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.button
              key="scroll-top"
              initial={{ width: 0, opacity: 0, x: -20 }}
              animate={{ width: 48, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
              className="flex flex-col items-center justify-center
                min-h-[56px] shrink-0 text-brand-navy overflow-hidden"
            >
              <ChevronUp size={22} strokeWidth={1.8} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Nav items — naturally compress when arrow appears */}
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const isCart = href === "/cart";

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center
                gap-0.5 min-h-[56px] transition-colors duration-200
                ${isActive ? "text-brand-teal" : "text-slate-400"}`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                {isCart && mounted && itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px]
                    h-4 bg-brand-teal text-white text-[10px] font-bold
                    rounded-full flex items-center justify-center px-0.5"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold ${isActive ? "text-brand-teal" : "text-slate-400"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
