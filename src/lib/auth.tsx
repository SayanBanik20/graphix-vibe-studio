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

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

type AuthResult = { error: string | null; session: Session | null; user: User | null };

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  const loadProfile = useCallback(async (authUser: User | null) => {
    if (!supabase || !authUser) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
    setProfile(data as UserProfile | null);
  }, []);

  const ensureProfile = useCallback(async (authUser: User | null) => {
    if (!supabase || !authUser) return;

    // First, check if the user already exists
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .single();

    if (!existingProfile) {
      // If no user exists, try to insert (only if we have permissions)
      // We'll just rely on the database trigger instead of upserting here
      // because the trigger already creates the profile on signup!
    }

    await loadProfile(authUser);
  }, [loadProfile]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await ensureProfile(nextUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await ensureProfile(nextUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [ensureProfile, loadProfile]);

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
      profile,
      loading,
      configured: Boolean(supabase),
      isAdmin: profile?.role === "admin",
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithGoogle,
    }),
    [loading, signIn, signInWithGoogle, signOut, signUp, user, resetPassword, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
