import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Star,
  PenTool,
  Package,
  Palette,
  Award,
  Instagram,
} from "lucide-react";
import heroImg from "@/assets/hero-frame.jpg";
import { getProducts } from "@/lib/products";

export const Route = createFileRoute("/")({
  loader: () => getProducts(),
  head: () => ({
    meta: [
      { title: "Graphix Vibe — Handcrafted Gifts & Brand Design Studio, Mumbai" },
      {
        name: "description",
        content:
          "Premium personalized gifts, branding, and printed keepsakes. 1000+ pieces delivered across India by founder Manasvi Goklani.",
      },
      { property: "og:title", content: "Graphix Vibe — Handcrafted Gifts & Brand Design Studio" },
      {
        property: "og:description",
        content:
          "Premium personalized gifts, branding, and printed keepsakes from a Mumbai studio.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "1,000+", label: "Pieces delivered" },
  { value: "5.0", label: "Client rating" },
  { value: "48hr", label: "Design turnaround" },
  { value: "Pan-India", label: "Shipping" },
];

const services = [
  {
    icon: PenTool,
    title: "Logo & Identity",
    copy: "Wordmarks, monograms, and full visual systems that carry weight.",
  },
  {
    icon: Package,
    title: "Personalized Gifts",
    copy: "Hand-finished keepsakes made-to-order in our Mumbai studio.",
  },
  {
    icon: Palette,
    title: "Print & Packaging",
    copy: "Business cards, invitations, packaging — sweated to the millimetre.",
  },
  {
    icon: Sparkles,
    title: "Corporate Branding",
    copy: "Launch decks, merch, campaign creatives — a full brand OS.",
  },
];

const testimonials = [
  {
    name: "Ananya S.",
    role: "Founder, Petal & Post",
    quote:
      "The identity system Manasvi built for us felt like our brand had finally exhaled. Every asset is museum-precise.",
  },
  {
    name: "Rohit M.",
    role: "Groom, Wedding client",
    quote: "The keepsake hamper made my wife cry — in the best way. The craft is astonishing.",
  },
  {
    name: "Priya K.",
    role: "Marketing Lead, Kite Studio",
    quote:
      "We've briefed three agencies. Graphix Vibe was the only one that shipped work I didn't need to rewrite.",
  },
];

function Home() {
  const products = Route.useLoaderData();
  const featured = products.slice(0, 4);
  const [activeFeature, setActiveFeature] = useState(0);
  const featuredProduct = featured[activeFeature];

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveFeature((current) => (current + 1) % featured.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, [featured.length]);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-64 h-96 w-96 rounded-full bg-accent/25 blur-3xl"
        />
        <div className="site-container grid items-center gap-12 pb-24 pt-16 md:grid-cols-2 md:pb-32 md:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Est. Mumbai · 1000+ delivered
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Design that <em className="font-normal text-gradient">feels like a gift</em>,
              delivered like an heirloom.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Graphix Vibe is a creative studio for personalized gifts, brand identities, and
              printed keepsakes. Every piece is drawn, printed, and packed by hand in our Mumbai
              studio.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Explore the collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-4 text-sm font-medium hover:bg-muted"
              >
                Meet the studio
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-gradient opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-elegant">
              <img
                src={featuredProduct?.image ?? heroImg}
                alt={featuredProduct?.name ?? "A signature Graphix Vibe photo frame in hand"}
                width={1408}
                height={1600}
                className="h-[560px] w-full object-cover md:h-[640px]"
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 p-4 backdrop-blur-xl">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Featured now
                  </div>
                  <div className="font-display text-xl">{featuredProduct?.name}</div>
                </div>
                <Link
                  to="/product/$slug"
                  params={{ slug: featuredProduct?.slug ?? "signature-photo-frame" }}
                  className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
                >
                  View <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="absolute bottom-2 right-6 flex gap-1.5">
                {featured.map((product, index) => (
                  <button
                    key={product.slug}
                    onClick={() => setActiveFeature(index)}
                    aria-label={`Show ${product.name}`}
                    className={`h-2 rounded-full transition-all ${activeFeature === index ? "w-7 bg-primary" : "w-2 bg-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="site-container py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              The Collection
            </div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Pieces our clients love.</h2>
          </div>
          <Link
            to="/shop"
            className="hidden shrink-0 items-center gap-2 text-sm font-medium hover:text-primary md:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.slug}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl bg-muted">
                <img
                  src={p.image}
                  alt={p.name}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-background">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {p.category}
                  </div>
                  <div className="mt-1 font-display text-lg leading-tight">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {p.rating.toFixed(1)}{" "}
                    ({p.reviewCount})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{p.price.toLocaleString("en-IN")}</div>
                  {p.compareAt && (
                    <div className="text-xs text-muted-foreground line-through">
                      ₹{p.compareAt.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-surface">
        <div className="site-container py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Studio Services
              </div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                A full creative practice, not a template shop.
              </h2>
            </div>
            <p className="max-w-lg text-muted-foreground md:justify-self-end">
              From a single business card to a full brand system, we approach every commission with
              the same care — strategy first, craft always.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="hover-lift group rounded-2xl border border-border bg-background p-8"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-6 font-display text-xl">{s.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="site-container py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Kind Words
          </div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Trusted by founders, families, and everyone in between.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="surface-panel p-8 shadow-soft">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-6 font-display text-lg leading-snug">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="site-container pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-12 text-background md:p-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-gradient opacity-40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-accent/40 blur-3xl"
          />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-end">
            <div>
              <Award className="h-8 w-8 text-accent" />
              <h2 className="mt-6 font-display text-4xl leading-tight md:text-6xl">
                Have something special in mind?
              </h2>
              <p className="mt-6 max-w-lg text-background/70">
                Weddings, launches, corporate gifting, or a one-of-a-kind keepsake — we take on a
                limited number of custom commissions each month.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-background px-7 py-4 text-sm font-medium text-foreground hover:opacity-90"
              >
                Start a project <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://www.instagram.com/graphix_vibe"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-background/30 px-7 py-4 text-sm font-medium hover:bg-background/10"
              >
                <Instagram className="h-4 w-4" /> @graphix_vibe
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
