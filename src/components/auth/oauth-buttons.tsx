"use client";

import { signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  return (
    <form action={signInWithGoogle}>
      <Button type="submit" variant="outline" className="w-full">
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 11v2.8h3.9c-.2 1-.9 1.9-1.8 2.5v2h2.9c1.7-1.6 2.7-3.9 2.7-6.6 0-.6-.1-1.2-.2-1.7H12Z"
          />
          <path
            fill="currentColor"
            d="M12 20c2.4 0 4.5-.8 6-2.2l-2.9-2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3.9v2C5.4 18 8.5 20 12 20Z"
          />
          <path
            fill="currentColor"
            d="M6.9 12.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.2H3.9C3.3 8.3 3 9.6 3 11s.3 2.7.9 3.8l3-1.9Z"
          />
          <path
            fill="currentColor"
            d="M12 6.4c1.3 0 2.5.5 3.4 1.3l2.6-2.6C16.5 3.7 14.4 3 12 3 8.5 3 5.4 5 3.9 7.2l3 2c.7-2.2 2.7-3.8 5.1-3.8Z"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}
