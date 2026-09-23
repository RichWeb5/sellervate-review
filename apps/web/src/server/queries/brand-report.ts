import "server-only";
import { dayRange, shiftDay, toDay, weekStart, yesterday } from "@/lib/dates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Severity } from "@/server/queries/reply-for-review";
import type { BrandSummary } from "@/server/session";

export const REPORT_WEEKS = 6;

export type ReportedReview = {
  reviewId: string;
  replyId: string;
  score: number;
  note: string | null;
  sentDay: string;
  subject: string;
  authorName: string;
  reviewerName: string;
  acknowledged: boolean;
  flags: { label: string; severity: Severity }[];
};

export type WeekSummary = {
  weekStart: string;
  reviewCount: number;
  averageScore: number | null;
  criticalCount: number;
};

export type RecurringIssue = { label: string; severity: Severity; count: number };

export type BrandReport = {
  weeks: WeekSummary[];
  recurringIssues: RecurringIssue[];
  reviews: ReportedReview[];
};

// Weeks are grouped by when the reply went out, not when it was reviewed,
// so a slow review week does not make the team look worse or better than it was.
export async function getBrandReport(brand: BrandSummary): Promise<BrandReport> {
  const supabase = await createSupabaseServerClient();
  const firstWeek = shiftDay(weekStart(yesterday()), -7 * (REPORT_WEEKS - 1));

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, score, note,
       reviewer:profiles!reviews_reviewer_id_fkey (full_name),
       review_flags (criteria (label, severity)),
       review_acknowledgements (acknowledged_at),
       reply:replies!inner (id, sent_at, brand_id,
         author:profiles!replies_author_id_fkey (full_name),
         conversation:conversations!replies_conversation_id_brand_id_fkey (subject))`,
    )
    .eq("reply.brand_id", brand.id)
    .gte("reply.sent_at", dayRange(firstWeek).start);
  if (error) throw error;

  const reviews = data
    .map((review) => ({
      reviewId: review.id,
      replyId: review.reply.id,
      score: review.score,
      note: review.note,
      sentDay: toDay(new Date(review.reply.sent_at)),
      subject: review.reply.conversation.subject,
      authorName: review.reply.author.full_name,
      reviewerName: review.reviewer.full_name,
      acknowledged: review.review_acknowledgements !== null,
      flags: review.review_flags.map(({ criteria }) => ({
        label: criteria.label,
        severity: criteria.severity,
      })),
    }))
    .sort((a, b) => b.sentDay.localeCompare(a.sentDay));

  return {
    weeks: summariseWeeks(reviews, firstWeek),
    recurringIssues: countIssues(reviews),
    reviews,
  };
}

function summariseWeeks(reviews: ReportedReview[], firstWeek: string): WeekSummary[] {
  return Array.from({ length: REPORT_WEEKS }, (_, index) => {
    const start = shiftDay(firstWeek, 7 * index);
    const inWeek = reviews.filter((review) => weekStart(review.sentDay) === start);
    return {
      weekStart: start,
      reviewCount: inWeek.length,
      averageScore:
        inWeek.length > 0 ? inWeek.reduce((sum, r) => sum + r.score, 0) / inWeek.length : null,
      criticalCount: inWeek.filter((r) => r.flags.some((flag) => flag.severity === "critical"))
        .length,
    };
  }).reverse();
}

function countIssues(reviews: ReportedReview[]): RecurringIssue[] {
  const counts = new Map<string, RecurringIssue>();
  for (const flag of reviews.flatMap((review) => review.flags)) {
    const current = counts.get(flag.label) ?? { ...flag, count: 0 };
    counts.set(flag.label, { ...current, count: current.count + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
