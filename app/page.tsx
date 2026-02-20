"use client";

import { useState, useEffect, useRef, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import SearchBar from "@/components/SearchBar";
import CategoryPills from "@/components/CategoryPills";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const SKELETON_COUNT = 12;
const SCROLL_THRESHOLD = 80;

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(searchInput);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProducts(activeCategory, deferredQuery);

  const productList = data?.pages.flatMap((p) => p.products) ?? [];

  // Scroll detection
  useEffect(() => {
    function onScroll() {
      const isScrolled = window.scrollY > SCROLL_THRESHOLD;
      setScrolled(isScrolled);
      // Auto-collapse expanded search when scrolling back to top
      if (!isScrolled) setSearchExpanded(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Infinite scroll
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleCategorySelect(cat: string) {
    setActiveCategory(cat);
    window.scrollTo({ top: 0 });
  }

  function handleSearchChange(val: string) {
    setSearchInput(val);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex flex-col min-h-dvh bg-brand-surface">
      {/* Sticky search + filters */}
      <header
        className="sticky top-[56px] z-30 bg-brand-surface
  border-b border-brand-border/70 px-4 pb-2"
      >
        <div className="max-w-screen-xl mx-auto w-full">
          {/* Full search bar */}
          <AnimatePresence initial={false}>
            {!scrolled && (
              <motion.div
                key="searchbar-full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden pt-2"
              >
                <SearchBar value={searchInput} onChange={handleSearchChange} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category pills row */}
          <div className="flex items-center gap-2 min-w-0 mt-2">
            <AnimatePresence>
              {scrolled && (
                <motion.div
                  key="search-icon"
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden shrink-0"
                >
                  <SearchBar
                    value={searchInput}
                    onChange={handleSearchChange}
                    collapsed={!searchExpanded}
                    onExpandRequest={() => setSearchExpanded(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {scrolled && searchExpanded && (
                <motion.div
                  key="search-expanded"
                  initial={{ opacity: 0, scaleX: 0.9 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-4 right-4 z-10 origin-left"
                >
                  <SearchBar
                    value={searchInput}
                    onChange={handleSearchChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <CategoryPills
              key="category-pills"
              active={activeCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto w-full px-4 pt-5 pb-8 flex-1">
        {isError && (
          <div className="text-center py-16 text-slate-500 text-sm">
            <p className="text-3xl mb-3">⚓</p>
            <p className="font-medium">Couldn't reach the store.</p>
            <p className="text-xs mt-1 text-slate-400">
              Check your connection and try again.
            </p>
          </div>
        )}

        <div
          className="grid gap-3
          grid-cols-2 sm:grid-cols-3 md:grid-cols-4
          lg:grid-cols-5 xl:grid-cols-6"
        >
          {isLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          {!isLoading &&
            productList.map((product) => (
              <div id={`product-${product.id}`} key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`next-${i}`} />
            ))}
        </div>

        {!isLoading && !isError && productList.length === 0 && (
          <div className="text-center py-20 text-slate-400 text-sm">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-slate-600">No products found</p>
            <p className="text-xs mt-1">Try a different search or category</p>
          </div>
        )}

        <div ref={loadMoreRef} className="h-4 mt-2" />

        {!hasNextPage && productList.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-4 pb-2">
            You've reached the end of the catalogue
          </p>
        )}
      </main>
    </div>
  );
}
