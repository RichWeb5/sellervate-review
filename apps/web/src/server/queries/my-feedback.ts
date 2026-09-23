import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Severity } from "@/server/queries/reply-for-review";
import type { BrandSummary, Viewer } from "@/server/session";

export type FeedbackItem = {
  reviewId: string;
  score: number;
  note: string | null;
  reviewedAt: string;
  reviewerName: string;
  acknowledged: boolean;
  flags: { label: string; severity: Severity }[];
  brand: BrandSummary;
  subject: string;
  customerName: string;
  customerMessage: string;
  replyBody: string;
  sentAt: string;
};

const SEVERITY_ORDER: Severity[] = ["critical", "major", "minor"];

// Filtered to the viewer's own replies: RLS already hides colleagues' work from specialists,
// but a person who also leads a brand would otherwise see their whole team's reviews here.
export async function getMyFeedback(viewer: Viewer): Promise<FeedbackItem[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, score, note, created_at,
       reviewer:profiles!reviews_reviewer_id_fkey (full_name),
       review_flags (criteria (label, severity)),
       review_acknowledgements (acknowledged_at),
       reply:replies!inner (body, sent_at, author_id,
         brand:brands!replies_brand_id_fkey (id, slug, name, accent_color),
         conversation:conversations!replies_conversation_id_brand_id_fkey (subject, customer_name, customer_message))`,
    )
    .eq("reply.author_id", viewer.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.map((review) => ({
    reviewId: review.id,
    score: review.score,
    note: review.note,
    reviewedAt: review.created_at,
    reviewerName: review.reviewer.full_name,
    acknowledged: review.review_acknowledgements !== null,
    flags: review.review_flags
      .map(({ criteria }) => ({ label: criteria.label, severity: criteria.severity }))
      .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)),
    brand: {
      id: review.reply.brand.id,
      slug: review.reply.brand.slug,
      name: review.reply.brand.name,
      accentColor: review.reply.brand.accent_color,
    },
    subject: review.reply.conversation.subject,
    customerName: review.reply.conversation.customer_name,
    customerMessage: review.reply.conversation.customer_message,
    replyBody: review.reply.body,
    sentAt: review.reply.sent_at,
  }));
}
