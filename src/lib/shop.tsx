import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type CartAttachment = {
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  storagePath: string | null;
  publicUrl: string | null;
};

type CartLine = {
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
};

const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = "graphix-vibe-shop";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const { signOut, user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [afterLogin, setAfterLogin] = useState<(() => void) | undefined>();

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as {
        wishlist?: string[];
        cart?: CartLine[];
      };
      setCart(saved.cart ?? []);
    } catch {
      // A blocked or malformed storage entry should not prevent shopping.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart }));
  }, [cart, ready]);

  useEffect(() => {
    if (!user || !supabase) {
      setWishlist([]);
      return;
    }

    let active = true;
    supabase
      .from("wishlist")
      .select("products(slug)")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error || !active) return;
        const slugs = (data as unknown as { products: { slug: string }[] | null }[])
          .map((item) => item.products?.[0]?.slug)
          .filter((slug): slug is string => Boolean(slug));
        setWishlist(slugs);
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
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (productError || !product) throw productError ?? new Error("Product not found");

        const { error } = isSaved
          ? await supabase
              .from("wishlist")
              .delete()
              .eq("user_id", user.id)
              .eq("product_id", product.id)
          : await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
        if (error) throw error;
      })().catch(() => {
        setWishlist((items) =>
          isSaved ? [...items, slug] : items.filter((item) => item !== slug),
        );
      });
    },
    [user, wishlist],
  );

  const addToCart = useCallback(
    (
      slug: string,
      quantity: number,
      photoName?: string,
      attachments?: CartAttachment[],
      productId?: string,
    ) => {
      setCart((lines) => {
        const existing = lines.find(
          (line) =>
            line.slug === slug &&
            line.productId === productId &&
            (line.photoName ?? "") === (photoName ?? ""),
        );
        return existing
          ? lines.map((line) =>
              line.slug === slug &&
              line.productId === productId &&
              (line.photoName ?? "") === (photoName ?? "")
                ? { ...line, quantity: line.quantity + quantity }
                : line,
            )
          : [...lines, { slug, quantity, photoName, productId, attachments }];
      });

      if (!user || !supabase || !attachments?.length) return;
      void (async () => {
        const cartKey = `${slug}-${productId ?? "standard"}-${Date.now()}`;
        const { error } = await supabase.from("product_uploads").insert(
          attachments.map((attachment) => ({
            product_id: productId,
            cart_item_key: cartKey,
            uploaded_by: user.id,
            file_name: attachment.fileName,
            storage_path: attachment.storagePath,
            public_url: attachment.publicUrl,
            mime_type: attachment.mimeType,
            size_bytes: attachment.sizeBytes,
          })),
        );
        if (error) throw error;
      })().catch(() => undefined);
    },
    [user],
  );

  const updateCartQuantity = useCallback(
    (slug: string, photoName: string | undefined, quantity: number, productId?: string) => {
      setCart((lines) =>
        quantity <= 0
          ? lines.filter(
              (line) =>
                line.slug !== slug ||
                line.productId !== productId ||
                (line.photoName ?? "") !== (photoName ?? ""),
            )
          : lines.map((line) =>
              line.slug === slug &&
              line.productId === productId &&
              (line.photoName ?? "") === (photoName ?? "")
                ? { ...line, quantity }
                : line,
            ),
      );
    },
    [],
  );

  const removeFromCart = useCallback((slug: string, photoName?: string, productId?: string) => {
    setCart((lines) =>
      lines.filter(
        (line) =>
          line.slug !== slug ||
          line.productId !== productId ||
          (line.photoName ?? "") !== (photoName ?? ""),
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      isSignedIn: Boolean(user),
      signOut: () => {
        void signOut();
      },
      loginOpen,
      openLogin,
      closeLogin: () => setLoginOpen(false),
      completeLogin,
      wishlist,
      toggleWishlist,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
    }),
    [
      addToCart,
      cart,
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

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}
