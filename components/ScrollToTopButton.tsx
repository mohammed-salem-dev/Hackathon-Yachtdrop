"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 left-4 z-50 w-10 h-10 rounded-full
  bg-brand-navy text-white shadow-lg flex items-center justify-center
  hover:bg-brand-teal transition-all duration-200 active:scale-95"
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} />
    </button>
  );
}
