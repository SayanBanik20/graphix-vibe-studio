import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";

import { useShop } from "@/lib/shop";
import { getProducts } from "@/lib/products";

export const Route = createFileRoute("/wishlist")({
  loader: () => getProducts(),
  component: WishlistPage,
});

function WishlistPage() {
  const { isSignedIn, openLogin, toggleWishlist, wishlist } = useShop();
  const products = Route.useLoaderData().filter((product) => wishlist.includes(product.slug));

  if (!isSignedIn) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-28 text-center">
        <Heart className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-6 font-display text-4xl">Your wishlist is waiting.</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to keep your favorite pieces saved on this device.
        </p>
        <button
          onClick={() => openLogin()}
          className="mt-8 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Sign in to view wishlist
        </button>
      </section>
    );
  }

  return (
    <section className="site-container py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Saved for later
      </div>
      <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">Your wishlist</h1>
      {products.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-14 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">You have not saved any pieces yet.</p>
          <Link
            to="/shop"
            search={{ q: "" }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            <ShoppingBag className="h-4 w-4" /> Explore the shop
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.slug} className="group relative">
              <Link to="/product/$slug" params={{ slug: product.slug }}>
                <img
                  src={product.image}
                  alt={product.name}
                  width={1000}
                  height={1000}
                  className="aspect-square w-full rounded-2xl bg-muted object-cover"
                />
                <h2 className="mt-4 font-display text-xl">{product.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </Link>
              <button
                onClick={() => toggleWishlist(product.slug)}
                aria-label={`Remove ${product.name} from wishlist`}
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background text-primary shadow-soft"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
