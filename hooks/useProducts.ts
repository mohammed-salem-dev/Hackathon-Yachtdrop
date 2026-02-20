import { useQuery } from "@tanstack/react-query";
import type { ProductItem } from "@/lib/scraper";

type ProductsResponse = {
  products: ProductItem[];
  totalCount: number;
  page: number;
  totalPages: number;
};

async function getProducts(
  page: number,
  category: string,
  query: string,
): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "24",
    ...(category && { category }),
    ...(query && { q: query }),
  });

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function useProducts(page = 1, category = "", query = "") {
  return useQuery({
    queryKey: ["products", page, category, query],
    queryFn: () => getProducts(page, category, query),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // keeps old data visible during refetch
  });
}
