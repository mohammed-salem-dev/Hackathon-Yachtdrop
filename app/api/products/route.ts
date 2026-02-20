import { NextRequest, NextResponse } from "next/server";
import { fetchLiveInventory } from "@/lib/scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "24", 10);
    const category = searchParams.get("category") ?? "";
    const query = searchParams.get("q") ?? "";

    let productList = await fetchLiveInventory();

    if (category) {
      productList = productList.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (query) {
      const q = query.toLowerCase();
      productList = productList.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    const totalCount = productList.length;
    const offset = (page - 1) * limit;
    const paginated = productList.slice(offset, offset + limit);

    return NextResponse.json(
      {
        products: paginated,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    console.error("[api/products] error:", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}
