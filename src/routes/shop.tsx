import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { products } from "@/lib/products";
import { Star } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Personalized Gifts & Keepsakes | Graphix Vibe" },
      {
        name: "description",
        content:
          "Browse handcrafted photo frames, keepsakes, love books, and gift hampers from Graphix Vibe's Mumbai studio.",
      },
      { property: "og:title", content: "Shop — Graphix Vibe" },
      {
        property: "og:description",
        content: "Handcrafted keepsakes, personalized gifts, and brand goods from Graphix Vibe.",
      },
    ],
  }),
  component: Shop,
});

const categories = [
  "All",
  "Personalized Gifts",
  "Gift Hampers",
  "Branding",
  "Accessories",
] as const;

function Shop() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [sort, setSort] = useState<"featured" | "asc" | "desc">("featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = active === "All" ? products : products.filter((p) => p.category === active);
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [active, sort]);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const displayedProducts = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">The Shop</div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
            Everyday <em className="font-normal text-gradient">heirlooms</em>, made by hand.
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Every piece is designed in-studio and finished by our craftspeople. Made-to-order —
            usually within 3 days.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setActive(c);
                  setPage(1);
                }}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  active === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as typeof sort);
                setPage(1);
              }}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="featured">Featured</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </label>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProducts.map((p) => (
            <Link
              key={p.slug}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-background">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {p.category}
                  </div>
                  <div className="mt-1 font-display text-xl leading-tight">{p.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.tagline}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {p.rating.toFixed(1)}{" "}
                    ({p.reviewCount})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{p.price.toLocaleString("en-IN")}</div>
                  {p.compareAt && (
                    <div className="text-xs text-muted-foreground line-through">
                      ₹{p.compareAt.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            Nothing in this category yet. Check back soon.
          </div>
        )}
        {pageCount > 1 && (
          <nav aria-label="Product pages" className="mt-14 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background p-2 shadow-soft">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                Previous
              </button>
              <span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
                className="rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
