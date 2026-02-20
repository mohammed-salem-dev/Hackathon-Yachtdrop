"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAiMatch } from "@/hooks/useAiMatch";
import AiProductCard from "@/components/AiProductCard";

const EXAMPLE_PROMPTS = [
  "Bilge pump stopped working",
  "20m mooring rope",
  "Running lights not working",
  "Anchor windlass chain",
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AiMatchSheet({ isOpen, onClose }: Props) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, matches, error, findMatches, clearMatches } = useAiMatch();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setInputValue("");
      clearMatches();
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleSubmit() {
    if (!inputValue.trim() || isLoading) return;
    findMatches(inputValue);
  }

  function handleExampleTap(example: string) {
    setInputValue(example);
    findMatches(example);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            key="ai-sheet"
            initial={{ opacity: 0, scale: 0.85, x: 40, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 40, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
            }}
            className="fixed bottom-36 right-4 z-50
              w-[340px] max-w-[calc(100vw-2rem)]
              bg-white rounded-3xl shadow-2xl
              flex flex-col max-h-[65dvh]
              origin-bottom-right"
          >
            <div className="px-4 pt-4 pb-3 border-b border-brand-border shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl bg-brand-teal/10
                    flex items-center justify-center"
                  >
                    <Wand size={16} className="text-brand-teal" />
                  </div>
                  <div>
                    <h2 className="font-bold text-brand-navy text-sm leading-tight">
                      Smart Part Finder
                    </h2>
                    <p className="text-[10px] text-brand-muted">
                      Powered by AI · Searches live catalogue
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="min-h-[40px] min-w-[40px] flex items-center
                    justify-center text-brand-muted hover:text-brand-ink
                    rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Input */}
              <div className="mt-3 flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your problem or what you need..."
                  rows={2}
                  className="flex-1 field resize-none py-2.5 leading-snug
                    rounded-2xl text-sm min-h-[48px]"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-2xl bg-brand-teal text-white
                    flex items-center justify-center shrink-0
                    disabled:opacity-90 active:brightness-90
                    transition-all duration-200"
                >
                  {isLoading ? (
                    <span
                      className="w-4 h-4 border-2 border-white/30
                      border-t-white rounded-full animate-spin"
                    />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>

              {/* Example prompts */}
              {!isLoading && matches.length === 0 && !error && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => handleExampleTap(ex)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full
                        bg-brand-surface border border-brand-border
                        text-brand-muted hover:border-brand-teal
                        hover:text-brand-teal transition-all duration-200"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {/* Loading */}
              {isLoading && (
                <div className="space-y-2.5">
                  <p
                    className="text-xs text-brand-muted text-center mb-3
                    flex items-center justify-center gap-1.5"
                  >
                    <Sparkles
                      size={11}
                      className="text-brand-teal animate-pulse"
                    />
                    Searching catalogue…
                  </p>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 bg-brand-surface
                      rounded-2xl p-2.5 animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-2.5 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                        <div className="h-7 bg-slate-200 rounded-xl mt-1 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && !isLoading && (
                <div
                  className="flex flex-col items-center justify-center
                  py-8 text-center gap-2.5"
                >
                  <div
                    className="w-10 h-10 rounded-full bg-red-50
                    flex items-center justify-center"
                  >
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <p className="text-xs font-medium text-brand-ink">{error}</p>
                  <button
                    onClick={() => findMatches(inputValue)}
                    className="text-xs font-semibold text-brand-teal
                      min-h-[40px] px-4"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* No matches */}
              {!isLoading && !error && matches.length === 0 && inputValue && (
                <div
                  className="flex flex-col items-center justify-center
                  py-8 text-center gap-1.5 text-brand-muted"
                >
                  <span className="text-2xl">🔍</span>
                  <p className="text-xs font-medium text-brand-ink">
                    No matches found
                  </p>
                  <p className="text-[11px]">Try describing differently</p>
                </div>
              )}

              {/* Matches */}
              {!isLoading && matches.length > 0 && (
                <div className="space-y-2.5">
                  <p
                    className="text-[10px] font-bold text-brand-muted
                    uppercase tracking-widest mb-2.5 flex items-center gap-1"
                  >
                    <Sparkles size={10} className="text-brand-teal" />
                    {matches.length} AI Match{matches.length !== 1 ? "es" : ""}
                  </p>
                  {matches.map((product, index) => (
                    <AiProductCard
                      key={product.id}
                      product={product}
                      rank={index + 1}
                      onAdd={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
