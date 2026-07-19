import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getAuthRedirectUrl, supabase } from "@/lib/supabase";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

type AuthResult = {
  error: string | null;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
};

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
  authRequestPending: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const notConfigured = {
  error: "Supabase is not configured yet.",
  session: null,
  user: null,
  profile: null,
};

function readableAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("email rate limit")) {
    return "Too many email requests were sent. Please wait a few minutes before trying again.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [authRequestPending, setAuthRequestPending] = useState(false);
  const authRequestInFlight = useRef(false);

  const loadProfile = useCallback(async (authUser: User | null): Promise<UserProfile | null> => {
    if (!supabase || !authUser) {
      setProfile(null);
      return null;
    }
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, phone, avatar_url, role, created_at, updated_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      console.error("[auth] profile lookup failed", error);
      setProfile(null);
      return null;
    }

    if (!data) {
      const { error: profileCreateError } = await supabase.rpc("ensure_current_user_profile");
      if (profileCreateError) {
        console.error("[auth] missing profile recovery failed", profileCreateError);
        setProfile(null);
        return null;
      }

      const { data: recoveredProfile, error: recoveryError } = await supabase
        .from("users")
        .select("id, email, full_name, phone, avatar_url, role, created_at, updated_at")
        .eq("id", authUser.id)
        .maybeSingle();
      if (recoveryError || !recoveredProfile) {
        console.error("[auth] recovered profile lookup failed", recoveryError);
        setProfile(null);
        return null;
      }
      const nextProfile = recoveredProfile as UserProfile;
      setProfile(nextProfile);
      return nextProfile;
    }

    const nextProfile = data as UserProfile;
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const ensureProfile = useCallback(
    async (authUser: User | null) => loadProfile(authUser),
    [loadProfile],
  );

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
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") return;
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

  const runAuthRequest = useCallback(async <T,>(request: () => Promise<T>): Promise<T | null> => {
    if (authRequestInFlight.current) return null;
    authRequestInFlight.current = true;
    setAuthRequestPending(true);
    try {
      return await request();
    } finally {
      authRequestInFlight.current = false;
      setAuthRequestPending(false);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return notConfigured;
      console.info("[auth] sign-in started");
      const response = await runAuthRequest(() =>
        supabase.auth.signInWithPassword({ email, password }),
      );
      if (!response)
        return {
          error: "An authentication request is already in progress.",
          session: null,
          user: null,
          profile: null,
        };
      const { data, error } = response;
      if (error) {
        console.error("[auth] sign-in failed", error);
        return {
          error: readableAuthError(error.message),
          session: null,
          user: null,
          profile: null,
        };
      }
      console.info("[auth] sign-in success");
      const profile = data.user ? await ensureProfile(data.user) : null;
      if (data.user && !profile) {
        return {
          error: "Your account profile could not be loaded. Please try again or contact support.",
          session: data.session,
          user: data.user,
          profile: null,
        };
      }
      return { error: null, session: data.session, user: data.user, profile };
    },
    [ensureProfile, runAuthRequest],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return notConfigured;
      const redirectTo = getAuthRedirectUrl();
      console.info("[auth] sign-up started", { redirectTo });
      const response = await runAuthRequest(() =>
        supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        }),
      );
      if (!response)
        return {
          error: "An authentication request is already in progress.",
          session: null,
          user: null,
          profile: null,
        };
      const { data, error } = response;
      if (error) {
        console.error("[auth] sign-up failed", error);
        return {
          error: readableAuthError(error.message),
          session: null,
          user: null,
          profile: null,
        };
      }
      console.info("[auth] sign-up success");
      const profile = data.user ? await ensureProfile(data.user) : null;
      return { error: null, session: data.session, user: data.user, profile };
    },
    [ensureProfile, runAuthRequest],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!supabase) return notConfigured;
      const response = await runAuthRequest(() =>
        supabase.auth.resetPasswordForEmail(email, { redirectTo: getAuthRedirectUrl() }),
      );
      if (!response)
        return {
          error: "An authentication request is already in progress.",
          session: null,
          user: null,
          profile: null,
        };
      return {
        error: response.error ? readableAuthError(response.error.message) : null,
        session: null,
        user: null,
        profile: null,
      };
    },
    [runAuthRequest],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return notConfigured;
    const redirectTo = getAuthRedirectUrl();
    console.info("[auth] google sign-in started", { redirectTo });
    const response = await runAuthRequest(() =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      }),
    );
    if (!response)
      return {
        error: "An authentication request is already in progress.",
        session: null,
        user: null,
        profile: null,
      };
    const { error } = response;
    if (error) {
      console.error("[auth] google sign-in failed", error);
      return { error: readableAuthError(error.message), session: null, user: null, profile: null };
    }
    console.info("[auth] google sign-in redirect prepared");
    return { error: null, session: null, user: null, profile: null };
  }, [runAuthRequest]);

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
      authRequestPending,
    }),
    [
      authRequestPending,
      loading,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      user,
      resetPassword,
      profile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
