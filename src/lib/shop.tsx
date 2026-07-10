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

type CartLine = { slug: string; quantity: number; photoName?: string };

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
  addToCart: (slug: string, quantity: number, photoName?: string) => void;
  updateCartQuantity: (slug: string, photoName: string | undefined, quantity: number) => void;
  removeFromCart: (slug: string, photoName?: string) => void;
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ wishlist, cart }));
  }, [cart, ready, wishlist]);

  const openLogin = useCallback((action?: () => void) => {
    setAfterLogin(() => action);
    setLoginOpen(true);
  }, []);

  const completeLogin = useCallback(() => {
    setLoginOpen(false);
    afterLogin?.();
    setAfterLogin(undefined);
  }, [afterLogin]);

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

  const updateCartQuantity = useCallback(
    (slug: string, photoName: string | undefined, quantity: number) => {
      setCart((lines) =>
        quantity <= 0
          ? lines.filter((line) => line.slug !== slug || line.photoName !== photoName)
          : lines.map((line) =>
              line.slug === slug && line.photoName === photoName ? { ...line, quantity } : line,
            ),
      );
    },
    [],
  );

  const removeFromCart = useCallback((slug: string, photoName?: string) => {
    setCart((lines) => lines.filter((line) => line.slug !== slug || line.photoName !== photoName));
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
