import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { useShop } from "@/lib/shop";
import { useAuth } from "@/lib/auth";

export function LoginDialog() {
  const { closeLogin, completeLogin, loginOpen } = useShop();
  const { authRequestPending, resetPassword, signIn, signInWithGoogle, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!loginOpen) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const { error, profile } = await signIn(email, password);
    if (error) return setMessage(error);
    completeLogin();
    navigate({ to: profile?.role === "admin" ? "/admin" : "/" });
  }

  async function register() {
    setMessage(null);
    const { error, session } = await signUp(email, password);
    if (error) return setMessage(error);
    if (session) completeLogin();
    else setMessage("Account created. Check your email to confirm your account.");
  }

  async function forgotPassword() {
    setMessage(null);
    const { error } = await resetPassword(email);
    setMessage(error ?? "Password reset instructions have been sent to your email.");
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-3xl bg-background p-7 shadow-elegant sm:p-8"
      >
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Close sign in"
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="login-title" className="font-display text-3xl">
          Welcome back
        </h2>
        <p className="mt-1 text-muted-foreground">Sign in to save favorites and place orders.</p>
        <button
          type="button"
          disabled={authRequestPending}
          onClick={() => {
            void signInWithGoogle().then(({ error }) => {
              if (error) setMessage(error);
            });
          }}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background hover:opacity-90"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-primary">
            G
          </span>
          Continue with Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          or continue with email
        </div>
        <label className="block text-sm font-medium">
          Email address
          <span className="relative mt-2 block">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none focus:border-primary"
            />
          </span>
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <span className="relative mt-2 block">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-11 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground"
            >
              <>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</>
            </button>
          </span>
        </label>
        <button
          type="button"
          disabled={authRequestPending}
          onClick={() => {
            void forgotPassword();
          }}
          className="mt-3 block w-full text-right text-sm text-muted-foreground hover:text-foreground"
        >
          Forgot your password?
        </button>
        {message && (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {message}
          </p>
        )}
        <button
          disabled={authRequestPending}
          className="mt-7 w-full rounded-full bg-foreground px-5 py-3.5 font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authRequestPending ? "Please wait…" : "Sign in"}
        </button>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <button
            type="button"
            disabled={authRequestPending}
            onClick={() => {
              void register();
            }}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
}
