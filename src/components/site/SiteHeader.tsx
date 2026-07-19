import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Menu, X, ShoppingBag, Search, Heart, UserRound } from "lucide-react";
import logo from "@/assets/graphix-vibe-logo.jpg";
import { getProducts } from "@/lib/products";
import { useShop } from "@/lib/shop";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<
    Array<{
      slug: string;
      name: string;
      tagline: string;
      price: number;
      image: string;
      category: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { cartItemCount, isSignedIn, openLogin, wishlist } = useShop();
  const { isAdmin } = useAuth();

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await getProducts();
        if (active) setProducts(data);
      } catch {
        if (active) setProducts([]);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return [];

    return products
      .filter((product) => {
        const haystack = `${product.name} ${product.tagline} ${product.category}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [products, searchValue]);

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const query = searchValue.trim();
    setShowSuggestions(false);
    navigate({ to: "/shop", search: { q: query } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="site-container flex items-center justify-between gap-3 py-3">
        <Link to="/" className="flex min-w-[180px] items-center gap-3">
          <img
            src={logo}
            alt="Graphix Vibe"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover shadow-soft"
          />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight">Graphix Vibe</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Creative Studio
            </div>
          </div>
        </Link>

        <nav className="hidden flex-1 justify-center md:flex">
          <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/90 px-2 py-2 shadow-sm backdrop-blur">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "text-foreground bg-muted" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex min-w-[180px] items-center justify-end gap-2">
          <div className="relative hidden md:block">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center gap-2 rounded-full border border-border/70 bg-muted/70 px-3 py-2 shadow-sm transition-colors focus-within:border-primary/60 focus-within:bg-background"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setShowSuggestions(event.target.value.trim().length > 0);
                }}
                onFocus={() => setShowSuggestions(searchValue.trim().length > 0)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                placeholder="Search products"
                className="w-36 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground md:w-44"
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
                <div className="max-h-72 overflow-auto p-2">
                  {suggestions.map((product) => (
                    <Link
                      key={product.slug}
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      onClick={() => {
                        setSearchValue("");
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{product.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {product.tagline}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{product.price.toLocaleString("en-IN")}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Search"
            onClick={() => navigate({ to: "/shop", search: { q: "" } })}
            className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden rounded-full p-2 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative hidden rounded-full p-2 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {cartItemCount}
              </span>
            )}
          </Link>
          {isSignedIn ? (
            isAdmin ? (
              <Link
                to="/admin"
                className="hidden items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 md:inline-flex"
              >
                <UserRound className="h-4 w-4" /> Admin dashboard
              </Link>
            ) : (
              <Link
                to="/orders"
                className="hidden items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 md:inline-flex"
              >
                <UserRound className="h-4 w-4" /> My account
              </Link>
            )
          ) : (
            <button
              onClick={() => openLogin()}
              className="hidden items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 md:inline-flex"
            >
              <UserRound className="h-4 w-4" /> Sign in
            </button>
          )}
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="site-container flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-base text-foreground/80 hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
            {isSignedIn ? (
              isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
                >
                  <UserRound className="h-4 w-4" /> Admin dashboard
                </Link>
              ) : (
                <Link
                  to="/orders"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
                >
                  <UserRound className="h-4 w-4" /> My account
                </Link>
              )
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  openLogin();
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
              >
                <UserRound className="h-4 w-4" /> Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
