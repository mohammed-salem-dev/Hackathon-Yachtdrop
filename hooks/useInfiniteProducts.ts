import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProductItem } from "@/lib/scraper";

type ProductsPage = {
  products: ProductItem[];
  totalCount: number;
  page: number;
  totalPages: number;
};

async function fetchProductPage(
  page: number,
  category: string,
  query: string,
): Promise<ProductsPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "12",
    ...(category && category !== "All" ? { category } : {}),
    ...(query ? { q: query } : {}),
  });

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export function useInfiniteProducts(category: string, query: string) {
  return useInfiniteQuery({
    queryKey: ["products", category, query],
    queryFn: ({ pageParam = 1 }) =>
      fetchProductPage(pageParam as number, category, query),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
}
