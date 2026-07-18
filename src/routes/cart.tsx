import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { getProducts } from "@/lib/products";
import { useShop } from "@/lib/shop";

export const Route = createFileRoute("/cart")({ loader: () => getProducts(), component: CartPage });

function CartPage() {
  const { cart, isSignedIn, openLogin, removeFromCart, updateCartQuantity } = useShop();
  const products = Route.useLoaderData();
  const lines = cart.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return product ? [{ ...line, product }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <section className="site-container py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Your order</div>
      <h1 className="mt-3 font-display text-5xl tracking-tight">Shopping bag</h1>
      {lines.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-14 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/shop"
            search={{ q: "" }}
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-border p-6 sm:p-8">
          <div className="space-y-5">
            {lines.map(({ product, quantity, photoName, attachments }) => (
              <div
                key={`${product.slug}-${photoName ?? "standard"}`}
                className="flex items-center gap-4"
              >
                <img src={product.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-display text-lg">{product.name}</div>
                  <div className="mt-2 inline-flex items-center rounded-full border border-border">
                    <button
                      onClick={() => updateCartQuantity(product.slug, photoName, quantity - 1)}
                      aria-label={`Decrease ${product.name} quantity`}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(product.slug, photoName, quantity + 1)}
                      aria-label={`Increase ${product.name} quantity`}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {(photoName || attachments?.length) && (
                    <div className="text-xs text-primary">
                      {attachments?.length
                        ? `${attachments.length} attachment${attachments.length === 1 ? "" : "s"} selected: ${attachments.map((item) => item.fileName).join(", ")}`
                        : `Photo attached: ${photoName}`}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ₹{(product.price * quantity).toLocaleString("en-IN")}
                  </div>
                  <button
                    onClick={() => removeFromCart(product.slug, photoName)}
                    aria-label={`Remove ${product.name} from bag`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between border-t border-border pt-6">
            <span className="font-display text-2xl">Total</span>
            <span className="font-display text-2xl">₹{total.toLocaleString("en-IN")}</span>
          </div>
          {isSignedIn ? (
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-full bg-foreground py-3.5 text-center text-sm font-medium text-background"
            >
              Continue to checkout
            </Link>
          ) : (
            <button
              onClick={() => openLogin()}
              className="mt-6 w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background"
            >
              Sign in to checkout
            </button>
          )}
        </div>
      )}
    </section>
  );
}
