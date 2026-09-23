import "server-only";
import { dayRange, shiftDay } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { suggestSample } from "@/features/review/suggest-sample";
import type { BrandSummary, Viewer } from "@/server/session";

export type QueueItem = {
  replyId: string;
  brand: BrandSummary;
  authorId: string;
  authorName: string;
  customerName: string;
  subject: string;
  body: string;
  sentAt: string;
  responseMinutes: number | null;
  score: number | null;
  suggested: boolean;
};

export type ReviewQueue = {
  brands: BrandSummary[];
  activeBrand: BrandSummary | null;
  items: QueueItem[];
};

const SAMPLING_WINDOW_DAYS = 14;

export async function getReviewQueue(
  viewer: Viewer,
  { day, brand }: { day: string; brand?: string },
): Promise<ReviewQueue> {
  const activeBrand = viewer.leads.find((b) => b.slug === brand) ?? null;
  const brandIds = activeBrand ? [activeBrand.id] : viewer.leads.map((b) => b.id);
  if (brandIds.length === 0) return { brands: viewer.leads, activeBrand, items: [] };

  const supabase = await createSupabaseServerClient();
  const { start, end } = dayRange(day);

  const [replies, recentReviews] = await Promise.all([
    supabase
      .from("replies")
      .select(
        `id, body, sent_at, response_minutes, author_id,
         brand:brands!replies_brand_id_fkey (id, slug, name, accent_color),
         author:profiles!replies_author_id_fkey (full_name),
         conversation:conversations!replies_conversation_id_brand_id_fkey (subject, customer_name),
         reviews (score, reviewer_id)`,
      )
      .in("brand_id", brandIds)
      .gte("sent_at", start)
      .lt("sent_at", end)
      .order("sent_at"),
    supabase
      .from("reviews")
      .select("replies!inner (author_id, brand_id)")
      .in("replies.brand_id", brandIds)
      .gte("created_at", dayRange(shiftDay(day, -SAMPLING_WINDOW_DAYS)).start),
  ]);
  if (replies.error) throw replies.error;
  if (recentReviews.error) throw recentReviews.error;

  const recentReviewsByAuthor = new Map<string, number>();
  for (const { replies: reply } of recentReviews.data) {
    recentReviewsByAuthor.set(
      reply.author_id,
      (recentReviewsByAuthor.get(reply.author_id) ?? 0) + 1,
    );
  }

  const rows = replies.data.map((reply) => ({
    reply,
    ownReview: reply.reviews.find((review) => review.reviewer_id === viewer.id) ?? null,
  }));

  const suggested = suggestSample(
    rows.map(({ reply, ownReview }) => ({
      replyId: reply.id,
      authorId: reply.author_id,
      reviewed: ownReview !== null,
    })),
    recentReviewsByAuthor,
  );

  const items = rows.map(({ reply, ownReview }) => ({
    replyId: reply.id,
    brand: {
      id: reply.brand.id,
      slug: reply.brand.slug,
      name: reply.brand.name,
      accentColor: reply.brand.accent_color,
    },
    authorId: reply.author_id,
    authorName: reply.author.full_name,
    customerName: reply.conversation.customer_name,
    subject: reply.conversation.subject,
    body: reply.body,
    sentAt: reply.sent_at,
    responseMinutes: reply.response_minutes,
    score: ownReview?.score ?? null,
    suggested: suggested.has(reply.id),
  }));

  return { brands: viewer.leads, activeBrand, items };
}

export function nextToReview(queue: ReviewQueue, afterReplyId: string): QueueItem | null {
  const pending = queue.items.filter(
    (item) => item.score === null && item.replyId !== afterReplyId,
  );
  return pending.find((item) => item.suggested) ?? pending[0] ?? null;
}
