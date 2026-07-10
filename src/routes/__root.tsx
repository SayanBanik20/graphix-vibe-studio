import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { LoginDialog } from "../components/site/LoginDialog";
import { ShopProvider } from "../lib/shop";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <div className="font-display text-8xl tracking-tight text-gradient">404</div>
      <h2 className="mt-4 font-display text-2xl">This page slipped away.</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The link you followed may be broken, or the page moved. Let's get you back to something
        beautiful.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Return home
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Something went sideways.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing, or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Graphix Vibe — Premium Personalized Gifts & Brand Design Studio" },
      {
        name: "description",
        content:
          "Mumbai-based creative studio for personalized gifts, branding, and print. Handcrafted keepsakes and identity systems by Manasvi Goklani.",
      },
      { name: "author", content: "Graphix Vibe" },
      { property: "og:title", content: "Graphix Vibe — Premium Personalized Gifts & Brand Design" },
      {
        property: "og:description",
        content: "Handcrafted keepsakes, personalized gifts and brand identities from Mumbai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ShopProvider>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
          <LoginDialog />
        </div>
      </ShopProvider>
    </QueryClientProvider>
  );
}
