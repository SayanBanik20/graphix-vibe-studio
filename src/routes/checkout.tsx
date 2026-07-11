import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, MapPin, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import { useShop } from "@/lib/shop";
import { supabase } from "@/lib/supabase";

type Address = {
  id: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  is_default: boolean;
};

export const Route = createFileRoute("/checkout")({
  loader: () => getProducts(),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const { cart, openLogin } = useShop();
  const products = Route.useLoaderData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [paymentPrepared, setPaymentPrepared] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from("addresses")
      .select(
        "id, recipient_name, phone, line1, line2, city, state, postal_code, country_code, is_default",
      )
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .then(({ data, error }) => {
        if (error) return setStatus(error.message);
        const nextAddresses = (data ?? []) as Address[];
        setAddresses(nextAddresses);
        setSelectedAddress(nextAddresses[0]?.id ?? null);
      });
  }, [user]);

  const lines = useMemo(
    () =>
      cart.flatMap((line) => {
        const product = products.find((item) => item.slug === line.slug);
        return product ? [{ ...line, product }] : [];
      }),
    [cart, products],
  );
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 1000 ? 0 : 99;
  const total = subtotal + shipping;

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !supabase)
      return setStatus("Sign in and configure Supabase before saving an address.");
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        recipient_name: String(form.get("recipient_name")),
        phone: String(form.get("phone")),
        line1: String(form.get("line1")),
        line2: String(form.get("line2")) || null,
        city: String(form.get("city")),
        state: String(form.get("state")),
        postal_code: String(form.get("postal_code")),
        country_code: "IN",
        is_default: addresses.length === 0,
      })
      .select(
        "id, recipient_name, phone, line1, line2, city, state, postal_code, country_code, is_default",
      )
      .single();
    if (error) return setStatus(error.message);
    setAddresses((current) => [...current, data as Address]);
    setSelectedAddress(data.id);
    setShowAddressForm(false);
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-28 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-6 font-display text-4xl">Sign in to check out.</h1>
        <p className="mt-3 text-muted-foreground">Your bag will be ready when you return.</p>
        <button
          onClick={() => openLogin()}
          className="mt-8 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Sign in to continue
        </button>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-28 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-6 font-display text-4xl">Your bag is empty.</h1>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Browse the shop
        </Link>
      </section>
    );
  }

  return (
    <section className="site-container py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Checkout</div>
      <h1 className="mt-3 font-display text-5xl tracking-tight">Almost yours.</h1>
      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-3xl border border-border p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl">Delivery address</h2>
              <button
                onClick={() => setShowAddressForm((shown) => !shown)}
                className="inline-flex items-center gap-1 text-sm font-medium hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Add address
              </button>
            </div>
            {addresses.length > 0 && (
              <div className="mt-6 space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${selectedAddress === address.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === address.id}
                      onChange={() => setSelectedAddress(address.id)}
                      className="mt-1 accent-primary"
                    />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">
                        {address.recipient_name} · {address.phone}
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                        {address.postal_code}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {showAddressForm && (
              <form
                onSubmit={saveAddress}
                className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2"
              >
                <input
                  required
                  name="recipient_name"
                  placeholder="Full name"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  required
                  name="phone"
                  placeholder="Phone number"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  required
                  name="line1"
                  placeholder="Address line 1"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
                />
                <input
                  name="line2"
                  placeholder="Address line 2 (optional)"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
                />
                <input
                  required
                  name="city"
                  placeholder="City"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  required
                  name="state"
                  placeholder="State"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <input
                  required
                  name="postal_code"
                  placeholder="PIN code"
                  className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <button className="rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background">
                  Save address
                </button>
              </form>
            )}
            {addresses.length === 0 && !showAddressForm && (
              <div className="mt-6 rounded-2xl bg-surface p-5 text-sm text-muted-foreground">
                <MapPin className="mb-2 h-5 w-5 text-primary" />
                Add a delivery address to continue.
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl">Payment</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your address and order total are prepared below. Secure payment will be added in the
              next step.
            </p>
            {paymentPrepared && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">
                <Check className="h-4 w-4" /> Order details are ready for payment.
              </div>
            )}
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:col-span-2">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-6 space-y-4">
            {lines.map(({ product, quantity, photoName, attachments }) => (
              <div key={`${product.slug}-${photoName ?? "standard"}`} className="flex gap-3">
                <img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-1 text-muted-foreground">
                    Qty {quantity}
                    {attachments?.length
                      ? ` · ${attachments.length} image${attachments.length === 1 ? "" : "s"} selected`
                      : photoName
                        ? " · Personalized photo"
                        : ""}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  ₹{(product.price * quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between pt-2 font-display text-xl text-foreground">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button
            disabled={!selectedAddress}
            onClick={() => setPaymentPrepared(true)}
            className="mt-6 w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prepare secure payment
          </button>
          {status && (
            <p role="status" className="mt-3 text-sm text-destructive">
              {status}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
