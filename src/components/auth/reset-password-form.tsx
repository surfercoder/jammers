"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import { FormError } from "./form-error";
import { FieldError } from "./field-error";

export function ResetPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    updatePassword,
    {}
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Set a new password</h2>
        <p className="text-muted-foreground text-sm">
          Choose a strong password you'll remember.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <FormError message={state.error} />
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <FieldError errors={state.fieldErrors?.password} />
        </div>
        <SubmitButton>Update password</SubmitButton>
      </form>
    </div>
  );
}
