"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { SubmitButton } from "./submit-button";
import { OAuthButtons } from "./oauth-buttons";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { FieldError } from "./field-error";

export function SignUpForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});

  if (state.message) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
        <FormSuccess message={state.message} />
        <Link href="/sign-in" className="text-foreground text-sm font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Join Jammers</h2>
        <p className="text-muted-foreground text-sm">
          Create your account in seconds.
        </p>
      </div>

      <OAuthButtons />
      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <form action={action} className="space-y-4">
        <FormError message={state.error} />

        <div className="space-y-2">
          <Label>I'm joining as a…</Label>
          <RadioGroup
            name="account_type"
            defaultValue="musician"
            className="grid gap-2"
          >
            {ACCOUNT_TYPES.map((t) => (
              <Label
                key={t.value}
                htmlFor={`acc-${t.value}`}
                className={cn(
                  "border-input hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5",
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                )}
              >
                <RadioGroupItem id={`acc-${t.value}`} value={t.value} className="mt-0.5" />
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="text-muted-foreground block text-xs">
                    {t.description}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" placeholder="Ana Rivas" required />
            <FieldError errors={state.fieldErrors?.full_name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="anarivas" required />
            <FieldError errors={state.fieldErrors?.username} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@band.com" autoComplete="email" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <FieldError errors={state.fieldErrors?.password} />
        </div>

        <SubmitButton>Create account</SubmitButton>
        <p className="text-muted-foreground text-center text-xs">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
