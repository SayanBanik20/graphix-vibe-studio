import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { findProduct } from "@/lib/products";
import { useShop } from "@/lib/shop";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { cart, isSignedIn, openLogin } = useShop();
  const lines = cart.flatMap((line) => {
    const product = findProduct(line.slug);
    return product ? [{ ...line, product }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Your order</div>
      <h1 className="mt-3 font-display text-5xl tracking-tight">Shopping bag</h1>
      {lines.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-14 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-border p-6 sm:p-8">
          <div className="space-y-5">
            {lines.map(({ product, quantity, photoName }) => (
              <div
                key={`${product.slug}-${photoName ?? "standard"}`}
                className="flex items-center gap-4"
              >
                <img src={product.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-display text-lg">{product.name}</div>
                  <div className="text-sm text-muted-foreground">Quantity: {quantity}</div>
                  {photoName && (
                    <div className="text-xs text-primary">Photo attached: {photoName}</div>
                  )}
                </div>
                <div className="font-medium">
                  ₹{(product.price * quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between border-t border-border pt-6">
            <span className="font-display text-2xl">Total</span>
            <span className="font-display text-2xl">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button
            onClick={() => !isSignedIn && openLogin()}
            className="mt-6 w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background"
          >
            {isSignedIn ? "Continue to checkout" : "Sign in to checkout"}
          </button>
        </div>
      )}
    </section>
  );
}
