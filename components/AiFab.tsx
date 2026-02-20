"use client";

import { motion } from "framer-motion";
import { Wand } from "lucide-react"; // ✅ single clean import

type Props = { onClick: () => void };

export default function AiFab({ onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-20 right-4 z-40
        w-11 h-11 rounded-2xl bg-brand-teal text-white
        flex items-center justify-center
        shadow-[0_4px_20px_rgba(14,124,123,0.45)]
        active:brightness-90 transition-all duration-200"
      aria-label="AI Smart Part Finder"
    >
      <Wand size={24} />
    </motion.button>
  );
}
