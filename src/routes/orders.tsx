import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_inr: number;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; unit_price_inr: number }[];
};

export const Route = createFileRoute("/orders")({ component: OrderHistoryPage });

function OrderHistoryPage() {
  const { user } = useAuth();
  const { openLogin } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from("orders")
      .select(
        "id, order_number, status, total_inr, created_at, order_items(id, product_name, quantity, unit_price_inr)",
      )
      .order("created_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (queryError) return setError(queryError.message);
        setOrders((data ?? []) as Order[]);
      });
  }, [user]);

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-28 text-center">
        <Package className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-6 font-display text-4xl">Sign in to see your orders.</h1>
        <p className="mt-3 text-muted-foreground">
          Your past purchases and order updates will appear here.
        </p>
        <button
          onClick={() => openLogin()}
          className="mt-8 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Sign in to continue
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Your account</div>
      <h1 className="mt-3 font-display text-5xl tracking-tight">Order history</h1>
      {error && (
        <p role="status" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      )}
      {orders.length === 0 && !error ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-14 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">You have not placed an order yet.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Order {order.order_number}
                  </div>
                  <div className="mt-2 font-display text-xl">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
              <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.product_name}{" "}
                      <span className="text-muted-foreground">× {item.quantity}</span>
                    </span>
                    <span>₹{(item.unit_price_inr * item.quantity).toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex justify-between border-t border-border pt-5 font-medium">
                <span>Total</span>
                <span>₹{order.total_inr.toLocaleString("en-IN")}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
