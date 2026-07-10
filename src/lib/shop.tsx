import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { findProduct, type Product } from "@/lib/products";

type CartLine = { slug: string; quantity: number; photoName?: string };

type ShopContextValue = {
  isSignedIn: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
  loginOpen: boolean;
  openLogin: (afterLogin?: () => void) => void;
  closeLogin: () => void;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  cart: CartLine[];
  addToCart: (slug: string, quantity: number, photoName?: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = "graphix-vibe-shop";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [afterLogin, setAfterLogin] = useState<(() => void) | undefined>();

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as {
        email?: string;
        wishlist?: string[];
        cart?: CartLine[];
      };
      setEmail(saved.email ?? null);
      setWishlist(saved.wishlist ?? []);
      setCart(saved.cart ?? []);
    } catch {
      // A blocked or malformed storage entry should not prevent shopping.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, wishlist, cart }));
  }, [cart, email, ready, wishlist]);

  const openLogin = useCallback((action?: () => void) => {
    setAfterLogin(() => action);
    setLoginOpen(true);
  }, []);

  const signIn = useCallback(
    (nextEmail: string) => {
      setEmail(nextEmail);
      setLoginOpen(false);
      afterLogin?.();
      setAfterLogin(undefined);
    },
    [afterLogin],
  );

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((items) =>
      items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug],
    );
  }, []);

  const addToCart = useCallback((slug: string, quantity: number, photoName?: string) => {
    setCart((lines) => {
      const existing = lines.find((line) => line.slug === slug && line.photoName === photoName);
      return existing
        ? lines.map((line) =>
            line.slug === slug && line.photoName === photoName
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          )
        : [...lines, { slug, quantity, photoName }];
    });
  }, []);

  const value = useMemo(
    () => ({
      isSignedIn: Boolean(email),
      signIn,
      signOut: () => setEmail(null),
      loginOpen,
      openLogin,
      closeLogin: () => setLoginOpen(false),
      wishlist,
      toggleWishlist,
      cart,
      addToCart,
    }),
    [addToCart, cart, email, loginOpen, openLogin, signIn, toggleWishlist, wishlist],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}

export function wishlistProducts(wishlist: string[]): Product[] {
  return wishlist.map(findProduct).filter((product): product is Product => Boolean(product));
}
