import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import founder from "@/assets/founder.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Studio — About Graphix Vibe" },
      { name: "description", content: "Meet Manasvi Goklani, founder of Graphix Vibe. A Mumbai creative studio for branding, gifts, and print, with 1000+ pieces delivered across India." },
      { property: "og:title", content: "The Studio — About Graphix Vibe" },
      { property: "og:description", content: "A Mumbai creative studio for branding, personalized gifts, and print." },
    ],
  }),
  component: About,
});

const timeline = [
  { year: "2020", title: "A sketchbook and a laptop", copy: "Manasvi begins taking on identity work from a corner of her Mumbai bedroom." },
  { year: "2022", title: "The studio opens", copy: "Graphix Vibe grows into a small team of designers and craftspeople." },
  { year: "2024", title: "1,000+ pieces delivered", copy: "Personalized gifts, brand systems, and print work shipped across India." },
  { year: "Today", title: "Building the next chapter", copy: "New collections, a growing waitlist, and a studio that still answers every email personally." },
];

function About() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">The Studio</div>
        <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
          Design as a form of <em className="font-normal text-gradient">generosity</em>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Graphix Vibe was founded by Mumbai-based designer Manasvi Goklani on a simple belief: that a well-made object,
          arriving unexpectedly, can shift the shape of someone's day.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-5 md:items-center">
        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-[2rem] border border-border shadow-soft">
            <img src={founder} alt="Manasvi Goklani, founder of Graphix Vibe" width={1000} height={1200} className="w-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Founder</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Manasvi Goklani</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              I started Graphix Vibe because I wanted a studio that treated a wedding hamper with the same rigor as a
              tech launch identity. Every brief lands on my desk. Every proof passes my eye before it ships.
            </p>
            <p>
              We work with founders, families, and creative businesses across India. The projects are small and large,
              corporate and deeply personal — the standard is the same.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
              Work with the studio <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://www.instagram.com/graphix_vibe" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted">
              See our work
            </a>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Milestones</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Four years, one obsession.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {timeline.map((t) => (
              <div key={t.year} className="rounded-2xl border border-border bg-background p-8">
                <div className="font-display text-3xl text-gradient">{t.year}</div>
                <div className="mt-4 font-display text-lg">{t.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{t.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
