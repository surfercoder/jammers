"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { FieldError } from "./field-error";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <FormError message={state.error} />
        <FormSuccess message={state.message} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@band.com" autoComplete="email" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <SubmitButton>Send reset link</SubmitButton>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/sign-in" className="text-foreground font-medium hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
