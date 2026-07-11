import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  ChevronRight,
  Eye,
  HeartOff,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  PencilLine,
  Plus,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_inr: number;
  created_at: string;
  payment_provider: string | null;
  payment_reference: string | null;
  order_items: { id: string; product_name: string; quantity: number; unit_price_inr: number }[];
};

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

type WishlistItem = {
  product_id: string;
  products: {
    id: string;
    slug: string;
    name: string;
    price_inr: number;
    main_image_url: string | null;
  } | null;
};

export const Route = createFileRoute("/orders")({ component: OrderHistoryPage });

function OrderHistoryPage() {
  const { user, signOut: signOutAuth } = useAuth();
  const { addToCart, openLogin, toggleWishlist } = useShop();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (!user || !supabase) {
      setProfile(null);
      setOrders([]);
      setAddresses([]);
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    let active = true;
    async function loadAccountData() {
      setLoading(true);
      setStatus(null);
      const [profileResponse, addressResponse, wishlistResponse, ordersResponse] =
        await Promise.all([
          supabase
            .from("users")
            .select("id, email, full_name, phone, avatar_url, created_at, updated_at")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("addresses")
            .select(
              "id, recipient_name, phone, line1, line2, city, state, postal_code, country_code, is_default",
            )
            .eq("user_id", user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("wishlist")
            .select("product_id, products(id, slug, name, price_inr, main_image_url)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("orders")
            .select(
              "id, order_number, status, total_inr, created_at, payment_provider, payment_reference, order_items(id, product_name, quantity, unit_price_inr)",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (!active) return;
      if (profileResponse.error) setStatus(profileResponse.error.message);
      if (addressResponse.error) setStatus(addressResponse.error.message);
      if (wishlistResponse.error) setStatus(wishlistResponse.error.message);
      if (ordersResponse.error) setStatus(ordersResponse.error.message);

      setProfile((profileResponse.data as Profile | null) ?? null);
      setAddresses((addressResponse.data as Address[] | null) ?? []);
      setWishlistItems((wishlistResponse.data as WishlistItem[] | null) ?? []);
      setOrders((ordersResponse.data as Order[] | null) ?? []);
      setLoading(false);
    }

    void loadAccountData();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.full_name ?? "", phone: profile.phone ?? "" });
    }
  }, [profile]);

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim() ?? profile?.email?.split("@")[0] ?? "A";
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((entry) => entry[0]?.toUpperCase() ?? "")
        .join("") || "A"
    );
  }, [profile]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !supabase) return;
    setStatus(null);
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email ?? "",
          full_name: profileForm.fullName.trim() || null,
          phone: profileForm.phone.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("id, email, full_name, phone, avatar_url, created_at, updated_at")
      .single();
    if (error) {
      setStatus(error.message);
      return;
    }
    setProfile(data as Profile);
    setShowProfileForm(false);
    setStatus("Profile updated.");
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !supabase) return;
    if (passwordForm.next !== passwordForm.confirm) {
      setStatus("New passwords do not match.");
      return;
    }
    if (!passwordForm.current || !passwordForm.next) {
      setStatus("Please complete all password fields.");
      return;
    }
    setStatus(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: passwordForm.current,
    });
    if (signInError) {
      setStatus(signInError.message);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: passwordForm.next });
    if (updateError) {
      setStatus(updateError.message);
      return;
    }
    setPasswordForm({ current: "", next: "", confirm: "" });
    setStatus("Password updated securely.");
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !supabase) return;
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      user_id: user.id,
      recipient_name: String(formData.get("recipient_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      line1: String(formData.get("line1") ?? "").trim(),
      line2: String(formData.get("line2") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      postal_code: String(formData.get("postal_code") ?? "").trim(),
      country_code: String(formData.get("country_code") ?? "IN")
        .trim()
        .toUpperCase(),
      is_default: Boolean(formData.get("is_default")),
    };

    if (
      !payload.recipient_name ||
      !payload.phone ||
      !payload.line1 ||
      !payload.city ||
      !payload.state ||
      !payload.postal_code
    ) {
      setStatus("Please fill in all required address fields.");
      return;
    }

    const response = editingAddress
      ? await supabase
          .from("addresses")
          .update(payload)
          .eq("id", editingAddress.id)
          .select(
            "id, recipient_name, phone, line1, line2, city, state, postal_code, country_code, is_default",
          )
          .single()
      : await supabase
          .from("addresses")
          .insert(payload)
          .select(
            "id, recipient_name, phone, line1, line2, city, state, postal_code, country_code, is_default",
          )
          .single();

    if (response.error) {
      setStatus(response.error.message);
      return;
    }

    if (payload.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", response.data.id);
    }

    setAddressFormReset();
    setStatus(editingAddress ? "Address updated." : "Address saved.");
    void loadAddresses();
  }

  async function loadAddresses() {
    if (!user || !supabase) return;
    const { data, error } = await supabase
      .from("addresses")
      .select(
        "id, recipient_name, phone, line1, line2, city, state, postal_code, country_code, is_default",
      )
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      setStatus(error.message);
      return;
    }
    setAddresses((data as Address[]) ?? []);
  }

  function setAddressFormReset() {
    setEditingAddress(null);
    setShowAddressForm(false);
  }

  async function removeAddress(address: Address) {
    if (!user || !supabase) return;
    const { error } = await supabase.from("addresses").delete().eq("id", address.id);
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Address removed.");
    void loadAddresses();
  }

  async function makeDefaultAddress(address: Address) {
    if (!user || !supabase) return;
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    if (error) {
      setStatus(error.message);
      return;
    }
    const { error: updateError } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", address.id);
    if (updateError) {
      setStatus(updateError.message);
      return;
    }
    setStatus("Default address updated.");
    void loadAddresses();
  }

  async function removeWishlistItem(item: WishlistItem) {
    if (!user || !supabase || !item.products?.slug) return;
    setStatus(null);
    toggleWishlist(item.products.slug);
    setWishlistItems((current) => current.filter((entry) => entry.product_id !== item.product_id));
    setStatus("Removed from wishlist.");
  }

  async function moveWishlistItemToCart(item: WishlistItem) {
    if (!user || !supabase || !item.products?.slug) return;
    addToCart(item.products.slug, 1);
    setStatus("Added to cart.");
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-28 text-center">
        <Package className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-6 font-display text-4xl">Sign in to view your account.</h1>
        <p className="mt-3 text-muted-foreground">
          Your profile, addresses, wishlist, and orders will appear here once you sign in.
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
    <section className="site-container py-16 md:py-24">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">My account</div>
      <h1 className="mt-3 font-display text-5xl tracking-tight">Welcome back</h1>
      {status && (
        <p
          role="status"
          className="mt-6 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm"
        >
          {status}
        </p>
      )}
      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading your account details…</p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
                    {initials}
                  </div>
                  <div>
                    <div className="font-display text-2xl">
                      {profile?.full_name || profile?.email || "Customer"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {profile?.email || "Your email will appear here"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileForm((shown) => !shown)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  <PencilLine className="h-4 w-4" /> Edit profile
                </button>
              </div>
              <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-border p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Name
                  </div>
                  <div className="mt-2 font-medium">{profile?.full_name || "—"}</div>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Phone
                  </div>
                  <div className="mt-2 font-medium">{profile?.phone || "—"}</div>
                </div>
                <div className="rounded-2xl border border-border p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Email
                  </div>
                  <div className="mt-2 font-medium">{profile?.email}</div>
                </div>
              </div>
              {showProfileForm && (
                <form
                  onSubmit={saveProfile}
                  className="mt-6 grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2"
                >
                  <label className="text-sm font-medium sm:col-span-2">
                    Full name
                    <input
                      name="full_name"
                      value={profileForm.fullName}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, fullName: event.target.value }))
                      }
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Your full name"
                    />
                  </label>
                  <label className="text-sm font-medium sm:col-span-2">
                    Phone number
                    <input
                      name="phone"
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Phone number"
                    />
                  </label>
                  <button className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
                    Save profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileForm(false)}
                    className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl">Change password</h2>
              </div>
              <form onSubmit={changePassword} className="mt-6 space-y-4">
                <label className="block text-sm font-medium">
                  Current password
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, current: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm font-medium">
                  New password
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, next: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Confirm password
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirm: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <button className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
                  Update password
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl">Saved addresses</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm((shown) => !shown);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Plus className="h-4 w-4" /> Add address
                </button>
              </div>
              {showAddressForm && (
                <form
                  onSubmit={saveAddress}
                  className="mt-6 grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2"
                >
                  <input
                    required
                    name="recipient_name"
                    placeholder="Full name"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                    defaultValue={editingAddress?.recipient_name ?? ""}
                  />
                  <input
                    required
                    name="phone"
                    placeholder="Phone"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                    defaultValue={editingAddress?.phone ?? ""}
                  />
                  <input
                    required
                    name="line1"
                    placeholder="House / Apartment"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
                    defaultValue={editingAddress?.line1 ?? ""}
                  />
                  <input
                    name="line2"
                    placeholder="Street / Locality"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
                    defaultValue={editingAddress?.line2 ?? ""}
                  />
                  <input
                    required
                    name="city"
                    placeholder="City"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                    defaultValue={editingAddress?.city ?? ""}
                  />
                  <input
                    required
                    name="state"
                    placeholder="State"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                    defaultValue={editingAddress?.state ?? ""}
                  />
                  <input
                    required
                    name="postal_code"
                    placeholder="Pincode"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                    defaultValue={editingAddress?.postal_code ?? ""}
                  />
                  <input
                    name="country_code"
                    placeholder="Country"
                    className="rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
                    defaultValue={editingAddress?.country_code || "IN"}
                  />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      name="is_default"
                      defaultChecked={editingAddress?.is_default ?? false}
                      className="accent-primary"
                    />
                    Set as default address
                  </label>
                  <button className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
                    {editingAddress ? "Save changes" : "Save address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressFormReset()}
                    className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                </form>
              )}
              {addresses.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">No saved addresses yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{address.recipient_name}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {address.line1}, {address.line2 ? `${address.line2}, ` : ""}
                            {address.city}, {address.state} {address.postal_code}
                          </div>
                        </div>
                        {address.is_default && (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(address);
                            setShowAddressForm(true);
                          }}
                          className="rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAddress(address)}
                          className="rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                          Delete
                        </button>
                        {!address.is_default && (
                          <button
                            type="button"
                            onClick={() => makeDefaultAddress(address)}
                            className="rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                          >
                            Set default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl">Orders</h2>
              </div>
              {orders.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  No orders yet. Once you place one, it will appear here.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {orders.map((order) => {
                    const paymentStatus =
                      order.status === "pending_payment"
                        ? "Pending payment"
                        : order.status === "paid"
                          ? "Paid"
                          : "Completed";
                    return (
                      <article key={order.id} className="rounded-2xl border border-border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Order {order.order_number}
                            </div>
                            <div className="mt-1 font-medium">
                              {new Date(order.created_at).toLocaleDateString("en-IN")}
                            </div>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                            {order.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Payment
                            </div>
                            <div className="mt-1 font-medium">{paymentStatus}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Total
                            </div>
                            <div className="mt-1 font-medium">
                              ₹{order.total_inr.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                          <span className="text-muted-foreground">
                            {order.order_items.length} item
                            {order.order_items.length === 1 ? "" : "s"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId((current) =>
                                current === order.id ? null : order.id,
                              )
                            }
                            className="inline-flex items-center gap-2 font-medium hover:text-primary"
                          >
                            View order <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        {expandedOrderId === order.id && (
                          <ul className="mt-4 space-y-2 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
                            {order.order_items.map((item) => (
                              <li key={item.id} className="flex justify-between gap-3">
                                <span>{item.product_name}</span>
                                <span className="text-muted-foreground">× {item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <HeartOff className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl">Wishlist</h2>
              </div>
              {wishlistItems.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  Your saved favorites will appear here.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {wishlistItems.map((item) => (
                    <div key={item.product_id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{item.products?.name || "Saved item"}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            ₹{(item.products?.price_inr ?? 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => removeWishlistItem(item)}
                            className="rounded-full border border-border p-2 text-sm hover:bg-muted"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveWishlistItemToCart(item)}
                            className="rounded-full border border-border p-2 text-sm hover:bg-muted"
                            aria-label="Move to cart"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <button
                type="button"
                onClick={() => {
                  void signOutAuth();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
