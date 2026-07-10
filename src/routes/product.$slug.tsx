import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Plus, Heart, Truck, Shield, Sparkles, ArrowRight } from "lucide-react";
import { findProduct, products } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Product not found — Graphix Vibe" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Graphix Vibe` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Graphix Vibe` },
        { property: "og:description", content: p.description },
        { property: "og:image", content: p.image },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Product not found.</h1>
      <p className="mt-3 text-muted-foreground">The piece you're looking for isn't in our catalog.</p>
      <Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background">
        Back to shop <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-10 md:grid-cols-2 md:py-16">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-muted shadow-soft">
            <img src={product.image} alt={product.name} width={1000} height={1000} className="aspect-square w-full object-cover" />
          </div>
          {product.badge && (
            <span className="absolute left-6 top-6 rounded-full bg-foreground px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-background">
              {product.badge}
            </span>
          )}
        </div>

        <div className="md:pt-4">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{product.category}</div>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-5xl">{product.name}</h1>
          <div className="mt-2 text-muted-foreground">{product.tagline}</div>

          <div className="mt-6 flex items-baseline gap-3">
            <div className="font-display text-3xl">₹{product.price.toLocaleString("en-IN")}</div>
            {product.compareAt && (
              <div className="text-lg text-muted-foreground line-through">₹{product.compareAt.toLocaleString("en-IN")}</div>
            )}
            {product.compareAt && (
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                Save ₹{(product.compareAt - product.price).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <p className="mt-8 max-w-lg text-muted-foreground">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {product.details.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {d}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border">
              <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button aria-label="Increase" onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background hover:opacity-90 sm:flex-none">
              Add to cart · ₹{(product.price * qty).toLocaleString("en-IN")}
            </button>
            <button aria-label="Save" className="grid h-12 w-12 place-items-center rounded-full border border-border hover:bg-muted">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8 text-xs text-muted-foreground">
            <div className="flex flex-col items-start gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <div><span className="text-foreground">Free shipping</span> on orders over ₹1000</div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div><span className="text-foreground">Quality</span> guaranteed on every piece</div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div><span className="text-foreground">Made-to-order</span> in 3 working days</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">You may also love</h2>
          <Link to="/shop" className="text-sm font-medium hover:text-primary">All pieces →</Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} className="group block">
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img src={p.image} alt={p.name} width={1000} height={1000} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="font-display text-lg leading-tight">{p.name}</div>
                <div className="font-medium">₹{p.price.toLocaleString("en-IN")}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
