import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export type CartAttachment = {
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  storagePath: string | null;
  publicUrl: string | null;
};

export type CartLine = {
  id?: string;
  slug: string;
  quantity: number;
  photoName?: string;
  productId?: string;
  attachments?: CartAttachment[];
};

type ShopContextValue = {
  isSignedIn: boolean;
  signOut: () => void;
  loginOpen: boolean;
  openLogin: (afterLogin?: () => void) => void;
  closeLogin: () => void;
  completeLogin: () => void;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  cart: CartLine[];
  cartItemCount: number;
  addToCart: (
    slug: string,
    quantity: number,
    photoName?: string,
    attachments?: CartAttachment[],
    productId?: string,
  ) => void;
  updateCartQuantity: (
    slug: string,
    photoName: string | undefined,
    quantity: number,
    productId?: string,
  ) => void;
  removeFromCart: (slug: string, photoName?: string, productId?: string) => void;
  clearCart: () => void;
};

type CartRow = {
  id: string;
  product_id: string | null;
  product_slug: string;
  quantity: number;
  photo_name: string | null;
  attachments: CartAttachment[] | null;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const GUEST_CART_KEY = "graphix-vibe-guest-cart";
const LEGACY_STORAGE_KEY = "graphix-vibe-shop";

const sameLine = (line: CartLine, slug: string, photoName?: string, productId?: string) =>
  line.slug === slug &&
  line.productId === productId &&
  (line.photoName ?? "") === (photoName ?? "");

function readGuestCart(): CartLine[] {
  try {
    const stored = window.localStorage.getItem(GUEST_CART_KEY);
    if (stored) return sanitizeCart(JSON.parse(stored));
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? "{}") as {
      cart?: unknown;
    };
    return sanitizeCart(legacy.cart);
  } catch {
    return [];
  }
}

function sanitizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((line): CartLine[] => {
    if (!line || typeof line !== "object") return [];
    const item = line as Partial<CartLine>;
    if (
      !item.slug ||
      typeof item.slug !== "string" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    )
      return [];
    return [{ ...item, quantity: Math.floor(item.quantity) } as CartLine];
  });
}

function writeGuestCart(cart: CartLine[]) {
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

function fromRows(rows: CartRow[]): CartLine[] {
  return rows.map((row) => ({
    id: row.id,
    slug: row.product_slug,
    productId: row.product_id ?? undefined,
    quantity: row.quantity,
    photoName: row.photo_name ?? undefined,
    attachments: row.attachments ?? undefined,
  }));
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [afterLogin, setAfterLogin] = useState<(() => void) | undefined>();
  const initialized = useRef(false);
  const activeUserId = useRef<string | null>(null);

  const invalidateCart = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const persistRemoteLine = useCallback(async (line: CartLine, userId: string) => {
    if (!supabase) return;
    let lookup = supabase
      .from("cart_items")
      .select("id")
      .eq("user_id", userId)
      .eq("product_slug", line.slug);
    lookup = line.productId
      ? lookup.eq("product_id", line.productId)
      : lookup.is("product_id", null);
    lookup = line.photoName
      ? lookup.eq("photo_name", line.photoName)
      : lookup.is("photo_name", null);
    const { data: existing, error: lookupError } = await lookup.maybeSingle();
    if (lookupError) throw lookupError;
    const payload = {
      user_id: userId,
      product_id: line.productId ?? null,
      product_slug: line.slug,
      quantity: line.quantity,
      photo_name: line.photoName ?? null,
      attachments: line.attachments ?? [],
    };
    const { error } = existing
      ? await supabase
          .from("cart_items")
          .update(payload)
          .eq("id", existing.id)
          .eq("user_id", userId)
      : await supabase.from("cart_items").insert(payload);
    if (error) throw error;
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setCart(readGuestCart());
    }
  }, []);

  useEffect(() => {
    if (!user) {
      activeUserId.current = null;
      setWishlist([]);
      if (initialized.current) setCart(readGuestCart());
      return;
    }
    if (!supabase || activeUserId.current === user.id) return;
    activeUserId.current = user.id;
    let cancelled = false;
    const guestCart = readGuestCart();

    void (async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, product_id, product_slug, quantity, photo_name, attachments")
        .eq("user_id", user.id);
      if (error || cancelled) return;
      const remoteCart = fromRows((data ?? []) as CartRow[]);
      const merged = guestCart.reduce<CartLine[]>((lines, guestLine) => {
        const index = lines.findIndex((line) =>
          sameLine(line, guestLine.slug, guestLine.photoName, guestLine.productId),
        );
        if (index === -1) return [...lines, guestLine];
        return lines.map((line, i) =>
          i === index ? { ...line, quantity: line.quantity + guestLine.quantity } : line,
        );
      }, remoteCart);
      try {
        await Promise.all(merged.map((line) => persistRemoteLine(line, user.id)));
      } catch {
        // Keep the guest cart intact so an unavailable backend cannot lose a customer's items.
        return;
      }
      if (cancelled) return;
      window.localStorage.removeItem(GUEST_CART_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setCart(merged);
      invalidateCart();
    })();

    return () => {
      cancelled = true;
    };
  }, [invalidateCart, persistRemoteLine, user]);

  useEffect(() => {
    if (!user || !supabase) return;
    let active = true;
    void supabase
      .from("wishlist")
      .select("products(slug)")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error || !active) return;
        setWishlist(
          (data as unknown as { products: { slug: string }[] | null }[])
            .map((item) => item.products?.[0]?.slug)
            .filter((slug): slug is string => Boolean(slug)),
        );
      });
    return () => {
      active = false;
    };
  }, [user]);

  const openLogin = useCallback((action?: () => void) => {
    setAfterLogin(() => action);
    setLoginOpen(true);
  }, []);
  const completeLogin = useCallback(() => {
    setLoginOpen(false);
    afterLogin?.();
    setAfterLogin(undefined);
  }, [afterLogin]);

  const toggleWishlist = useCallback(
    (slug: string) => {
      if (!user || !supabase) return;
      const isSaved = wishlist.includes(slug);
      setWishlist((items) => (isSaved ? items.filter((item) => item !== slug) : [...items, slug]));
      void (async () => {
        const { data: product, error } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (error || !product) throw error ?? new Error("Product not found");
        const result = isSaved
          ? await supabase
              .from("wishlist")
              .delete()
              .eq("user_id", user.id)
              .eq("product_id", product.id)
          : await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
        if (result.error) throw result.error;
      })().catch(() =>
        setWishlist((items) =>
          isSaved ? [...items, slug] : items.filter((item) => item !== slug),
        ),
      );
    },
    [user, wishlist],
  );

  const commit = useCallback(
    (next: CartLine[], changed?: CartLine, removed?: CartLine) => {
      setCart(next);
      invalidateCart();
      if (!user) {
        writeGuestCart(next);
        return;
      }
      if (!supabase) return;
      if (removed) {
        let deletion = supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_slug", removed.slug);
        deletion = removed.productId
          ? deletion.eq("product_id", removed.productId)
          : deletion.is("product_id", null);
        deletion = removed.photoName
          ? deletion.eq("photo_name", removed.photoName)
          : deletion.is("photo_name", null);
        void deletion.then(() => invalidateCart());
      }
      if (changed)
        void persistRemoteLine(changed, user.id)
          .then(invalidateCart)
          .catch(() => undefined);
    },
    [invalidateCart, persistRemoteLine, user],
  );

  const addToCart = useCallback(
    (
      slug: string,
      quantity: number,
      photoName?: string,
      attachments?: CartAttachment[],
      productId?: string,
    ) => {
      if (quantity <= 0) return;
      setCart((current) => {
        const existing = current.find((line) => sameLine(line, slug, photoName, productId));
        const changed = existing
          ? { ...existing, quantity: existing.quantity + quantity }
          : { slug, quantity, photoName, attachments, productId };
        const next = existing
          ? current.map((line) => (sameLine(line, slug, photoName, productId) ? changed : line))
          : [...current, changed];
        if (!user) writeGuestCart(next);
        else if (user && supabase)
          void persistRemoteLine(changed, user.id)
            .then(invalidateCart)
            .catch(() => undefined);
        invalidateCart();
        return next;
      });
    },
    [invalidateCart, persistRemoteLine, user],
  );

  const updateCartQuantity = useCallback(
    (slug: string, photoName: string | undefined, quantity: number, productId?: string) => {
      const current = cart;
      const target = current.find((line) => sameLine(line, slug, photoName, productId));
      if (!target) return;
      commit(
        quantity <= 0
          ? current.filter((line) => line !== target)
          : current.map((line) => (line === target ? { ...line, quantity } : line)),
        quantity <= 0 ? undefined : { ...target, quantity },
        quantity <= 0 ? target : undefined,
      );
    },
    [cart, commit],
  );

  const removeFromCart = useCallback(
    (slug: string, photoName?: string, productId?: string) => {
      const target = cart.find((line) => sameLine(line, slug, photoName, productId));
      if (target)
        commit(
          cart.filter((line) => line !== target),
          undefined,
          target,
        );
    },
    [cart, commit],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    invalidateCart();
    if (!user) writeGuestCart([]);
    else if (supabase)
      void supabase.from("cart_items").delete().eq("user_id", user.id).then(invalidateCart);
  }, [invalidateCart, user]);

  const value = useMemo(
    () => ({
      isSignedIn: Boolean(user),
      signOut: () => void signOut(),
      loginOpen,
      openLogin,
      closeLogin: () => setLoginOpen(false),
      completeLogin,
      wishlist,
      toggleWishlist,
      cart,
      cartItemCount: cart.reduce((count, line) => count + line.quantity, 0),
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      addToCart,
      cart,
      clearCart,
      completeLogin,
      loginOpen,
      openLogin,
      removeFromCart,
      signOut,
      toggleWishlist,
      updateCartQuantity,
      user,
      wishlist,
    ],
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

// This hook intentionally shares the provider's context from this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}
