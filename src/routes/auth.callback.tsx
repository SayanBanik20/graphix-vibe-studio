import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      console.error("[auth] callback failed: Supabase client unavailable");
      navigate({ to: "/" });
      return;
    }

    void (async () => {
      console.info("[auth] callback started");
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        console.error("[auth] callback failed", { error, errorDescription });
        navigate({ to: "/" });
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("[auth] exchange code failed", exchangeError);
          navigate({ to: "/" });
          return;
        }
      }

      await supabase.auth.getSession();
      console.info("[auth] callback success");
      navigate({ to: "/" });
    })();
  }, [navigate]);

  return null;
}
