import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Viewer } from "@/server/session";

export type Severity = "critical" | "major" | "minor";

export type Criterion = {
  id: string;
  label: string;
  description: string;
  severity: Severity;
  brandSpecific: boolean;
};

export type ReplyForReview = {
  replyId: string;
  body: string;
  sentAt: string;
  responseMinutes: number | null;
  authorName: string;
  subject: string;
  customerName: string;
  customerMessage: string;
  brand: {
    id: string;
    slug: string;
    name: string;
    accentColor: string;
    voiceSummary: string;
    procedures: string[];
  };
  criteria: Criterion[];
  ownReview: { score: number; note: string; flaggedIds: string[] } | null;
};

export async function getReplyForReview(
  viewer: Viewer,
  replyId: string,
): Promise<ReplyForReview | null> {
  const supabase = await createSupabaseServerClient();

  const { data: reply, error } = await supabase
    .from("replies")
    .select(
      `id, body, sent_at, response_minutes, brand_id,
       brand:brands!replies_brand_id_fkey (id, slug, name, accent_color, voice_summary, procedures),
       author:profiles!replies_author_id_fkey (full_name),
       conversation:conversations!replies_conversation_id_brand_id_fkey (subject, customer_name, customer_message)`,
    )
    .eq("id", replyId)
    .maybeSingle();
  if (error) throw error;
  if (!reply || !viewer.leads.some((brand) => brand.id === reply.brand_id)) return null;

  const [criteria, ownReview] = await Promise.all([
    supabase
      .from("criteria")
      .select("id, label, description, severity, brand_id")
      .is("archived_at", null)
      .or(`brand_id.is.null,brand_id.eq.${reply.brand_id}`)
      .order("position"),
    supabase
      .from("reviews")
      .select("score, note, review_flags (criterion_id)")
      .eq("reply_id", replyId)
      .eq("reviewer_id", viewer.id)
      .maybeSingle(),
  ]);
  if (criteria.error) throw criteria.error;
  if (ownReview.error) throw ownReview.error;

  return {
    replyId: reply.id,
    body: reply.body,
    sentAt: reply.sent_at,
    responseMinutes: reply.response_minutes,
    authorName: reply.author.full_name,
    subject: reply.conversation.subject,
    customerName: reply.conversation.customer_name,
    customerMessage: reply.conversation.customer_message,
    brand: {
      id: reply.brand.id,
      slug: reply.brand.slug,
      name: reply.brand.name,
      accentColor: reply.brand.accent_color,
      voiceSummary: reply.brand.voice_summary,
      procedures: reply.brand.procedures
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean),
    },
    criteria: criteria.data.map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      description: criterion.description,
      severity: criterion.severity,
      brandSpecific: criterion.brand_id !== null,
    })),
    ownReview: ownReview.data && {
      score: ownReview.data.score,
      note: ownReview.data.note ?? "",
      flaggedIds: ownReview.data.review_flags.map((flag) => flag.criterion_id),
    },
  };
}
