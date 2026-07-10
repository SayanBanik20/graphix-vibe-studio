import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Check,
  Minus,
  Plus,
  Heart,
  Truck,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  Upload,
} from "lucide-react";
import { findProduct, products } from "@/lib/products";
import { useShop } from "@/lib/shop";

const starterReviews = [
  {
    name: "Aarav",
    rating: 5,
    text: "Beautifully made and even better in person. The finishing is impeccable.",
  },
  {
    name: "Meera",
    rating: 5,
    text: "A thoughtful gift that arrived carefully packed and right on time.",
  },
];

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Product not found — Graphix Vibe" },
          { name: "robots", content: "noindex" },
        ],
      };
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
      <p className="mt-3 text-muted-foreground">
        The piece you're looking for isn't in our catalog.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background"
      >
        Back to shop <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [reviewsByProduct, setReviewsByProduct] = useState<Record<string, typeof starterReviews>>(
    {},
  );
  const [reviewRating, setReviewRating] = useState(5);
  const { addToCart, isSignedIn, openLogin, toggleWishlist, wishlist } = useShop();
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const isWishlisted = wishlist.includes(product.slug);
  const reviews = [...(reviewsByProduct[product.slug] ?? []), ...starterReviews];

  function withAccount(action: () => void) {
    if (isSignedIn) action();
    else openLogin(action);
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    setPhoto(event.target.files?.[0] ?? null);
  }

  function addReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignedIn) return openLogin();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("review") ?? "").trim();
    if (!text) return;
    setReviewsByProduct((current) => ({
      ...current,
      [product.slug]: [
        { name: "You", rating: reviewRating, text },
        ...(current[product.slug] ?? []),
      ],
    }));
    event.currentTarget.reset();
  }

  function addProductToCart(goToCart = false) {
    if (product.requiresPhoto && !photo) return;
    withAccount(() => {
      addToCart(product.slug, qty, photo?.name);
      if (goToCart) navigate({ to: "/cart" });
    });
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 pt-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-10 md:grid-cols-2 md:py-16">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-muted shadow-soft">
            <img
              src={product.image}
              alt={product.name}
              width={1000}
              height={1000}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.badge && (
            <span className="absolute left-6 top-6 rounded-full bg-foreground px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-background">
              {product.badge}
            </span>
          )}
        </div>

        <div className="md:pt-4">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {product.category}
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <div className="mt-2 text-muted-foreground">{product.tagline}</div>
          <button
            onClick={() => setTab("reviews")}
            className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <Star className="h-4 w-4 fill-primary text-primary" /> {product.rating.toFixed(1)} (
            {product.reviewCount + reviews.length} reviews)
          </button>

          <div className="mt-6 flex items-baseline gap-3">
            <div className="font-display text-3xl">₹{product.price.toLocaleString("en-IN")}</div>
            {product.compareAt && (
              <div className="text-lg text-muted-foreground line-through">
                ₹{product.compareAt.toLocaleString("en-IN")}
              </div>
            )}
            {product.compareAt && (
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                Save ₹{(product.compareAt - product.price).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <p className="mt-8 max-w-lg text-muted-foreground">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {product.details.map((d: string) => (
              <li key={d} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {d}
              </li>
            ))}
          </ul>

          {product.requiresPhoto && (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">
                    Upload your photo <span className="text-primary">*</span>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    One clear image is required to personalize this piece.
                  </p>
                </div>
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary bg-background px-4 py-4 text-sm font-medium hover:bg-muted">
                <Upload className="h-4 w-4" /> {photo ? photo.name : "Upload one photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={selectPhoto}
                  className="sr-only"
                />
              </label>
              {!photo && (
                <p className="mt-2 text-xs text-destructive">
                  Please upload a photo before adding this item to your bag.
                </p>
              )}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                aria-label="Decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                aria-label="Increase"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => addProductToCart()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background hover:opacity-90 sm:flex-none"
            >
              Add to cart · ₹{(product.price * qty).toLocaleString("en-IN")}
            </button>
            <button
              onClick={() => addProductToCart(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground hover:opacity-90 sm:flex-none"
            >
              Buy now
            </button>
            <button
              onClick={() => withAccount(() => toggleWishlist(product.slug))}
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              className={`grid h-12 w-12 place-items-center rounded-full border hover:bg-muted ${isWishlisted ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8 text-xs text-muted-foreground">
            <div className="flex flex-col items-start gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <div>
                <span className="text-foreground">Free shipping</span> on orders over ₹1000
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <span className="text-foreground">Quality</span> guaranteed on every piece
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <span className="text-foreground">Made-to-order</span> in 3 working days
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab("description")}
              className={`px-6 py-4 text-sm font-medium ${tab === "description" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
            >
              Description
            </button>
            <button
              onClick={() => setTab("reviews")}
              className={`px-6 py-4 text-sm font-medium ${tab === "reviews" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
            >
              Reviews ({product.reviewCount + reviews.length})
            </button>
          </div>
          {tab === "description" ? (
            <div className="grid gap-8 p-7 md:grid-cols-3 md:p-10">
              <div className="md:col-span-2">
                <h2 className="font-display text-3xl">Made to hold a moment.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                  {product.description} Each order is checked by hand before it leaves our Mumbai
                  studio. Share a high-quality image and we will prepare it with the care your
                  memory deserves.
                </p>
              </div>
              <div className="rounded-2xl bg-surface p-5 text-sm">
                <div className="font-medium">Product details</div>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {product.details.map((detail) => (
                    <li key={detail}>• {detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 p-7 md:grid-cols-5 md:p-10">
              <div className="md:col-span-3">
                <div className="flex items-center gap-3">
                  <div className="font-display text-4xl">{product.rating.toFixed(1)}</div>
                  <div>
                    <div className="flex text-primary">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Based on {product.reviewCount + reviews.length} reviews
                    </div>
                  </div>
                </div>
                <div className="mt-7 space-y-6">
                  {reviews.map((review, index) => (
                    <article
                      key={`${review.name}-${index}`}
                      className="border-t border-border pt-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{review.name}</div>
                        <div className="flex text-primary">
                          {Array.from({ length: review.rating }).map((_, star) => (
                            <Star key={star} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.text}</p>
                    </article>
                  ))}
                </div>
              </div>
              <form onSubmit={addReview} className="rounded-2xl bg-surface p-5 md:col-span-2">
                <h2 className="font-display text-2xl">Write a review</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your feedback helps others choose a meaningful gift.
                </p>
                <label className="mt-5 block text-sm font-medium">
                  Your rating
                  <select
                    value={reviewRating}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <option value={5}>★★★★★ Excellent</option>
                    <option value={4}>★★★★ Good</option>
                    <option value={3}>★★★ Average</option>
                    <option value={2}>★★ Fair</option>
                    <option value={1}>★ Poor</option>
                  </select>
                </label>
                <label className="mt-4 block text-sm font-medium">
                  Your review
                  <textarea
                    required
                    name="review"
                    rows={4}
                    placeholder="Tell us about your order"
                    className="mt-2 w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary"
                  />
                </label>
                <button className="mt-4 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background">
                  {isSignedIn ? "Post review" : "Sign in to review"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">You may also love</h2>
          <Link to="/shop" className="text-sm font-medium hover:text-primary">
            All pieces →
          </Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <Link
              key={p.slug}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
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
