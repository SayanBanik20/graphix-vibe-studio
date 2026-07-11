import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getAuthRedirectUrl, supabase } from "@/lib/supabase";

type AuthResult = { error: string | null; session: Session | null; user: User | null };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const notConfigured = { error: "Supabase is not configured yet.", session: null, user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  const ensureProfile = useCallback(async (authUser: User | null) => {
    if (!supabase || !authUser) return;

    const profilePayload = {
      id: authUser.id,
      email: authUser.email ?? "",
      full_name:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        authUser.user_metadata?.display_name ??
        null,
      phone: authUser.user_metadata?.phone ?? null,
      avatar_url: authUser.user_metadata?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("users").upsert(profilePayload, { onConflict: "id" });
    if (error) {
      console.error("[auth] profile sync failed", error);
      if (error.message.toLowerCase().includes("avatar_url")) {
        await supabase.from("users").upsert(
          {
            id: authUser.id,
            email: authUser.email ?? "",
            full_name:
              authUser.user_metadata?.full_name ??
              authUser.user_metadata?.name ??
              authUser.user_metadata?.display_name ??
              null,
            phone: authUser.user_metadata?.phone ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (nextUser) await ensureProfile(nextUser);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) await ensureProfile(nextUser);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [ensureProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return notConfigured;
      console.info("[auth] sign-in started");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("[auth] sign-in failed", error);
        return { error: error?.message ?? null, session: null, user: null };
      }
      console.info("[auth] sign-in success");
      if (data.user) await ensureProfile(data.user);
      return { error: null, session: data.session, user: data.user };
    },
    [ensureProfile],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return notConfigured;
      const redirectTo = getAuthRedirectUrl();
      console.info("[auth] sign-up started", { redirectTo });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        console.error("[auth] sign-up failed", error);
        return { error: error?.message ?? null, session: null, user: null };
      }
      console.info("[auth] sign-up success");
      if (data.user) await ensureProfile(data.user);
      return { error: null, session: data.session, user: data.user };
    },
    [ensureProfile],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return notConfigured;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    return { error: error?.message ?? null, session: null, user: null };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return notConfigured;
    const redirectTo = getAuthRedirectUrl();
    console.info("[auth] google sign-in started", { redirectTo });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.error("[auth] google sign-in failed", error);
      return { error: error?.message ?? null, session: null, user: null };
    }
    console.info("[auth] google sign-in redirect prepared");
    return { error: null, session: null, user: null };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured: Boolean(supabase),
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithGoogle,
    }),
    [loading, signIn, signInWithGoogle, signOut, signUp, user, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
