"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { contractSchema } from "@/lib/validations";

export type ActionResult = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  // `userId` is the server-verified session id from supabase.auth.getUser(),
  // never a client-supplied value, and ownership is also enforced by RLS.
  // react-doctor-disable-next-line react-doctor/supabase-client-owned-authz-field
  return { supabase, userId: user.id };
}

export async function createContract(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = contractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { musician_id, title, description, event_date, venue, city, budget } =
    parsed.data;
  const { supabase, userId } = await requireUserId();

  if (musician_id === userId) {
    return { error: "You can't contract yourself." };
  }

  const { error } = await supabase.from("contracts").insert({
    requester_id: userId,
    musician_id,
    title,
    description: description || null,
    event_date: event_date || null,
    venue: venue || null,
    city: city || null,
    budget: budget ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/contracts");
  return { ok: true };
}

export async function setContractStatus(contractId: string, status: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("contracts")
    .update({ status: status as never })
    .eq("id", contractId);
  if (error) return { error: error.message };
  revalidatePath("/contracts");
  revalidatePath("/dashboard");
  return { ok: true };
}
