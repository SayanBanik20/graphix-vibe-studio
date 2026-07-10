import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import logo from "@/assets/graphix-vibe-logo.jpg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Graphix Vibe" width={40} height={40} className="h-10 w-10 rounded-full object-cover shadow-soft" />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight">Graphix Vibe</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Creative Studio</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button aria-label="Search" className="hidden rounded-full p-2 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/shop" className="hidden items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 md:inline-flex">
            <ShoppingBag className="h-4 w-4" /> Shop now
          </Link>
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="rounded-full p-2 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
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
            <Link to="/shop" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
              <ShoppingBag className="h-4 w-4" /> Shop now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
