"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import { OAuthButtons } from "./oauth-buttons";
import { FormError } from "./form-error";
import { FieldError } from "./field-error";

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to keep the music going.
        </p>
      </div>

      <OAuthButtons />
      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <form action={action} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <FormError message={state.error} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@band.com" autoComplete="email" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground text-xs">
              Forgot?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
          <FieldError errors={state.fieldErrors?.password} />
        </div>
        <SubmitButton>Sign in</SubmitButton>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        New to Jammers?{" "}
        <Link href="/sign-up" className="text-foreground font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
