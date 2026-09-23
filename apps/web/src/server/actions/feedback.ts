"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireViewer } from "@/server/session";

const UNIQUE_VIOLATION = "23505";

export async function acknowledgeReview(formData: FormData) {
  const reviewId = z.uuid().parse(formData.get("reviewId"));
  const viewer = await requireViewer();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("review_acknowledgements")
    .insert({ review_id: reviewId, profile_id: viewer.id });
  if (error && error.code !== UNIQUE_VIOLATION) throw error;

  revalidatePath("/me");
}
