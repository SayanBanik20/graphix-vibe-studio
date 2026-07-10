import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="font-display text-4xl font-semibold tracking-tight">Graphix Vibe</div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Made to be remembered.
          </div>
          <p className="mt-4 max-w-sm text-lg leading-8 text-muted-foreground">
            Personalized gifts and considered creative work for the moments that matter most.
          </p>
          <a
            href="https://www.instagram.com/graphix_vibe"
            target="_blank"
            rel="noreferrer"
            aria-label="Graphix Vibe on Instagram"
            className="mt-7 inline-grid h-12 w-12 place-items-center rounded-full border border-border bg-background hover:text-primary"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Collection
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-primary">
                Shop all
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-primary">
                Best sellers
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-primary">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                Order history
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Experience
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link to="/about" className="hover:text-primary">
                Our studio
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Custom orders
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Help & support
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact us
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Get in touch
          </div>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              Mumbai, Maharashtra, India
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <a href="mailto:hello@graphixvibe.in" className="hover:text-primary">
                hello@graphixvibe.in
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <a href="tel:+919000000000" className="hover:text-primary">
                +91 90000 00000
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Graphix Vibe. All rights reserved.</span>
          <span>Secure checkout · Made with intention</span>
        </div>
      </div>
    </footer>
  );
}
