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

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        navigate({ to: "/" });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError || !profile) {
        console.error("[auth] callback profile lookup failed", profileError);
        navigate({ to: "/" });
        return;
      }
      console.info("[auth] callback success");
      navigate({ to: profile.role === "admin" ? "/admin" : "/" });
    })();
  }, [navigate]);

  return null;
}
