import Link from "next/link";
import { ScorePill } from "@/components/ui/score-pill";
import { SeverityDot } from "@/components/ui/severity-dot";
import { formatDay } from "@/lib/dates";
import { replyHref } from "@/features/review/routes";
import type { RecurringIssue, ReportedReview } from "@/server/queries/brand-report";

export function RecurringIssues({ issues }: { issues: RecurringIssue[] }) {
  if (issues.length === 0) {
    return <p className="text-sm text-muted">No issues flagged in these weeks.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {issues.map((issue) => (
        <li key={issue.label} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2">
            <SeverityDot severity={issue.severity} />
            {issue.label}
          </span>
          <span className="text-muted tabular-nums">
            {issue.count} {issue.count === 1 ? "time" : "times"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ReviewLog({
  reviews,
  brandSlug,
}: {
  reviews: ReportedReview[];
  brandSlug: string;
}) {
  return (
    <ul className="flex flex-col divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
      {reviews.map((review) => (
        <li key={review.reviewId}>
          <Link
            href={replyHref(review.replyId, { day: review.sentDay, brand: brandSlug })}
            className="grid gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:bg-base-200/60 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="flex flex-wrap gap-x-3 text-sm text-muted">
                <span>{formatDay(review.sentDay)}</span>
                <span>{review.authorName}</span>
                <span>
                  {review.authorName.split(" ")[0]}{" "}
                  {review.acknowledged ? "read it" : "has not read it yet"}
                </span>
              </p>
              <p className="font-semibold">{review.subject}</p>
              {review.flags.length > 0 && (
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {review.flags.map((flag) => (
                    <span key={flag.label} className="inline-flex items-center gap-1.5">
                      <SeverityDot severity={flag.severity} />
                      {flag.label}
                    </span>
                  ))}
                </p>
              )}
              {review.note && (
                <p className="line-clamp-2 font-reading text-sm text-muted">{review.note}</p>
              )}
            </div>
            <div className="flex items-start sm:justify-end">
              <ScorePill score={review.score} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
