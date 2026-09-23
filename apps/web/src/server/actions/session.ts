"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoEmails } from "@/server/demo-accounts";

const signInSchema = z.object({ email: z.enum(demoEmails) });

export async function signInAs(formData: FormData) {
  const { email } = signInSchema.parse({ email: formData.get("email") });
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password: env.DEMO_PASSWORD });
  if (error) throw new Error(`Could not sign in as ${email}: ${error.message}`);

  redirect("/");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
