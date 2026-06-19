import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeNext } from "@/lib/redirects";

// Handles email confirmation + password-recovery links (token_hash flow).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // `next` is attacker-controllable, so allowlist it to in-app paths only.
  const next = safeNext(searchParams.get("next"));

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // `next` is already allowlisted to an in-app path by safeNext().
      // react-doctor-disable-next-line react-doctor/clickjacking-redirect-risk
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/sign-in?error=invalid_or_expired_link", request.url)
  );
}
