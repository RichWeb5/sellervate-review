"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDay } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { queueHref, replyHref } from "@/features/review/routes";
import { getReviewQueue, nextToReview } from "@/server/queries/review-queue";
import { requireViewer } from "@/server/session";

const reviewSchema = z.object({
  replyId: z.uuid(),
  score: z.coerce.number().int().min(1).max(5),
  note: z.string().max(2000),
  criterionIds: z.array(z.uuid()),
  day: z.string().refine(isDay),
  brand: z.string().optional(),
});

export type SaveReviewState = { error?: string };

export async function saveReview(
  _previous: SaveReviewState,
  formData: FormData,
): Promise<SaveReviewState> {
  const parsed = reviewSchema.safeParse({
    replyId: formData.get("replyId"),
    score: formData.get("score"),
    note: formData.get("note") ?? "",
    criterionIds: formData.getAll("criterionId"),
    day: formData.get("day"),
    brand: formData.get("brand") || undefined,
  });
  if (!parsed.success) {
    const missingScore = parsed.error.issues.some((issue) => issue.path[0] === "score");
    return {
      error: missingScore ? "Pick a score from 1 to 5 first." : "Some of the review is invalid.",
    };
  }

  const { replyId, score, note, criterionIds, day, brand } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("save_review", {
    target_reply: replyId,
    new_score: score,
    new_note: note,
    flagged_criteria: criterionIds,
  });
  if (error) return { error: "The review was not saved. You can only review brands you lead." };

  const viewer = await requireViewer();
  const next = nextToReview(await getReviewQueue(viewer, { day, brand }), replyId);

  revalidatePath("/queue");
  redirect(
    next ? replyHref(next.replyId, { day, brand }) : queueHref({ day, brand }, { done: true }),
  );
}
