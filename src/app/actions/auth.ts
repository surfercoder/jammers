"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { safeNext } from "@/lib/redirects";
import {
  signUpSchema,
  signInSchema,
  emailSchema,
  passwordSchema,
} from "@/lib/validations";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

async function siteOrigin() {
  const h = await headers();
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    h.get("origin") ??
    `https://${h.get("host")}`
  );
}

// signUp is a public entry point: it must be callable by signed-out visitors,
// so there is intentionally no auth gate. Supabase rate-limits sign-ups.
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password, username, full_name, account_type } = parsed.data;
  const [supabase, origin] = await Promise.all([createClient(), siteOrigin()]);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name, account_type },
      emailRedirectTo: `${origin}/auth/confirm?next=/explore`,
    },
  });
  if (error) return { error: error.message };

  return {
    message:
      "Almost there — check your inbox to confirm your email, then sign in.",
  };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const next = safeNext(formData.get("next") as string | null);
  revalidatePath("/", "layout");
  // `next` is already allowlisted to an in-app path by safeNext().
  // react-doctor-disable-next-line react-doctor/clickjacking-redirect-risk
  redirect(next);
}

// requestPasswordReset is a public entry point: people who are locked out are
// signed out by definition, so an auth gate would defeat the feature.
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const [supabase, origin] = await Promise.all([createClient(), siteOrigin()]);
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/confirm?next=/reset-password` }
  );
  if (error) return { error: error.message };
  return {
    message: "If that email exists, we've sent a reset link. Check your inbox.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your reset link has expired — request a new one." };
  }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  redirect("/explore");
}

export async function signOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle() {
  const [supabase, origin] = await Promise.all([createClient(), siteOrigin()]);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/explore` },
  });
  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }
  if (data.url) redirect(data.url);
}
