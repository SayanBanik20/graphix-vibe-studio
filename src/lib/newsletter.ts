import { supabase } from "@/lib/supabase";

export type NewsletterSubscriptionResult = {
  ok: boolean;
  error?: string;
};

export async function subscribeToNewsletter(
  email: string,
  source?: string,
): Promise<NewsletterSubscriptionResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, error: "Email is required." };
  }

  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { error } = await supabase.from("newsletter_subscriptions").upsert(
    {
      email: normalizedEmail,
      source: source?.trim() || null,
    },
    { onConflict: "email" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
