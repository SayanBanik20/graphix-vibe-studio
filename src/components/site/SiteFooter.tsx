import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-3xl font-semibold tracking-tight">
            Made with intention. <span className="text-gradient">Delivered with care.</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Graphix Vibe is a Mumbai-based creative studio crafting personalized gifts, brand identities, and printed
            keepsakes for people who believe details matter.
          </p>
          <form className="mt-8 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-primary"
              aria-label="Email"
            />
            <button className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90">
              Subscribe
            </button>
          </form>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary">Shop</Link></li>
            <li><Link to="/about" className="hover:text-primary">The Studio</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Studio</div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Mumbai, India</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-primary" /> hello@graphixvibe.in</li>
            <li>
              <a href="https://www.instagram.com/graphix_vibe" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                <Instagram className="h-4 w-4 text-primary" /> @graphix_vibe
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} Graphix Vibe. All rights reserved.</div>
          <div>Founded by Manasvi Goklani · Mumbai</div>
        </div>
      </div>
    </footer>
  );
}
