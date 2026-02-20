import { fetchLiveInventory } from "@/lib/scraper";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const inventory = await fetchLiveInventory();
  const product = inventory.find((p) => p.id === id);

  if (!product) notFound();

  const hasDiscount =
    product.originalPrice !== undefined &&
    product.originalPrice > product.price;

  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const similar = inventory
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const fallbackSimilar =
    similar.length > 0
      ? similar
      : inventory.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <div className="min-h-dvh bg-brand-surface pb-28">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* ── Back ────────────────────────────────────────────────────── */}
        <div className="py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium
              text-brand-muted hover:text-brand-teal transition-colors
              duration-200 min-h-[44px]"
          >
            <ArrowLeft size={16} />
            Back to Browse
          </Link>
        </div>

        {/* ── Product detail ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div
            className="relative aspect-square rounded-3xl overflow-hidden
            bg-white border border-brand-border shadow-card"
          >
            <ProductImage src={product.imageUrl} alt={product.name} />
            {hasDiscount && (
              <span
                className="absolute top-4 left-4 bg-red-500 text-white
                text-xs font-bold px-3 py-1.5 rounded-full shadow"
              >
                -{discountPct}% OFF
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Category badge */}
            <span
              className="inline-flex w-fit text-xs font-bold px-3 py-1
              rounded-full bg-brand-teal/10 text-brand-teal"
            >
              {product.category}
            </span>

            {/* Name */}
            <h1
              className="text-2xl md:text-3xl font-bold text-brand-navy
              leading-snug"
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-brand-navy">
                €{product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-slate-400 line-through">
                    €{product.originalPrice!.toFixed(2)}
                  </span>
                  <span
                    className="bg-red-100 text-red-600 text-sm font-bold
                    px-2.5 py-1 rounded-xl"
                  >
                    Save €{(product.originalPrice! - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div
              className="text-sm text-brand-muted leading-relaxed
              border-t border-brand-border pt-4"
            >
              <p>{product.description}</p>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "SKU",
                  value: product.id.replace("nh-", "").toUpperCase(),
                },
                { label: "Category", value: product.category },
                { label: "Price", value: `€${product.price.toFixed(2)}` },
                { label: "Stock", value: "In Stock ✓" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl px-4 py-3
                    border border-brand-border"
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest
                    text-brand-muted mb-0.5"
                  >
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-brand-navy truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Add to cart */}
            <AddToCartButton product={product} />

            {/* Source link */}
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-muted hover:text-brand-teal
                transition-colors duration-200 underline underline-offset-2
                w-fit"
            >
              View on Nautichandler →
            </a>
          </div>
        </div>

        {/* ── Similar products ─────────────────────────────────────────── */}
        <section className="mt-16 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                {similar.length > 0 ? "Similar Products" : "You May Also Like"}
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                {similar.length > 0
                  ? `More from ${product.category}`
                  : "Other products in our catalogue"}
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-brand-teal font-semibold
                hover:underline underline-offset-2"
            >
              Browse all →
            </Link>
          </div>

          <div
            className="grid gap-3
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-6"
          >
            {fallbackSimilar.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
