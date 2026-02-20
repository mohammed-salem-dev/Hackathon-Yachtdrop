"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// In Drawer.tsx — change the type
type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode; // ← was string
  side?: "left" | "right";
  children: React.ReactNode;
};

export default function Drawer({
  isOpen,
  onClose,
  title,
  side = "right",
  children,
}: Props) {
  const isRight = side === "right";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: isRight ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? "100%" : "-100%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
              mass: 0.8,
            }}
            className={`fixed top-0 ${isRight ? "right-0" : "left-0"}
              h-full w-full max-w-sm z-50
              bg-brand-surface border-${isRight ? "l" : "r"} border-brand-border
              flex flex-col shadow-2xl`}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between
              px-5 py-4 border-b border-brand-border shrink-0"
            >
              {title && (
                <h2 className="text-base font-bold text-brand-navy">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto w-8 h-8 flex items-center justify-center
                  rounded-xl text-brand-muted hover:text-brand-ink
                  hover:bg-slate-100 transition-colors duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
