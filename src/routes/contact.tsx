import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, Clock, Instagram, Send } from "lucide-react";

import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Graphix Vibe Studio, Mumbai" },
      { name: "description", content: "Talk to Graphix Vibe about personalized gifts, branding, print, or a custom commission. Based in Mumbai, shipping across India." },
      { property: "og:title", content: "Contact Graphix Vibe" },
      { property: "og:description", content: "Talk to Graphix Vibe about branding, personalized gifts, and custom commissions." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!supabase) {
      setStatus("Contact form storage is unavailable until Supabase is configured.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      project_type: String(form.get("project_type") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    const { error } = await supabase.from("contact_submissions").insert(payload);
    if (error) {
      setStatus(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Say Hello</div>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
          Let's make <em className="font-normal text-gradient">something</em> together.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Personal gift, wedding hamper, brand identity, or a wild idea we haven't tried yet — tell us the story and
          we'll come back within one working day.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-5">
        <form onSubmit={handleSubmit} className="surface-panel md:col-span-3 p-8 md:p-12">
          {sent ? (
            <div className="grid min-h-[300px] place-items-center text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-white">
                  <Send className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-3xl">Message sent.</h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Thank you — we'll be in touch shortly. In the meantime, browse the shop or peek at our Instagram.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your name</span>
                  <input
                    required
                    name="name"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project type</span>
                <select
                  name="project_type"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option>Personalized gift</option>
                  <option>Wedding / event</option>
                  <option>Brand identity</option>
                  <option>Print & packaging</option>
                  <option>Corporate gifting</option>
                  <option>Something else</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tell us more</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background hover:opacity-90">
                Send message <Send className="h-4 w-4" />
              </button>
              {status && <p className="text-sm text-muted-foreground">{status}</p>}
            </div>
          )}
        </form>

        <aside className="md:col-span-2">
          <div className="rounded-2xl border border-border p-8">
            <div className="font-display text-2xl">The studio</div>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-primary" /><div><div className="text-foreground font-medium">Mumbai, India</div><div className="text-muted-foreground">Studio visits by appointment only</div></div></li>
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-primary" /><a href="mailto:hello@graphixvibe.in" className="text-foreground hover:text-primary">hello@graphixvibe.in</a></li>
              <li className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-primary" /><div><div className="text-foreground font-medium">Mon – Sat</div><div className="text-muted-foreground">10:00 – 19:00 IST</div></div></li>
              <li className="flex items-start gap-3"><Instagram className="mt-0.5 h-5 w-5 text-primary" /><a href="https://www.instagram.com/graphix_vibe" target="_blank" rel="noreferrer" className="text-foreground hover:text-primary">@graphix_vibe</a></li>
            </ul>
          </div>
          <div className="mt-6 rounded-2xl bg-brand-gradient p-8 text-white shadow-elegant">
            <div className="font-display text-2xl leading-tight">Custom commissions</div>
            <p className="mt-3 text-sm text-white/85">
              We take on a limited number of bespoke projects each month. Tell us your timeline and we'll let you know
              if we can fit it in.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
