import { BrandMark } from "@/components/ui/brand-mark";
import { ScorePill } from "@/components/ui/score-pill";
import { SeverityDot } from "@/components/ui/severity-dot";
import { formatDay, toDay } from "@/lib/dates";
import { acknowledgeReview } from "@/server/actions/feedback";
import type { FeedbackItem } from "@/server/queries/my-feedback";

export function FeedbackCard({ item }: { item: FeedbackItem }) {
  const firstName = item.reviewerName.split(" ")[0];

  return (
    <article
      className={`flex flex-col gap-4 rounded-box border bg-base-100 px-6 py-5 ${
        item.acknowledged ? "border-base-300" : "border-secondary/50"
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
            <span className="font-medium text-base-content">
              <BrandMark brand={item.brand} />
            </span>
            <span>Sent {formatDay(toDay(new Date(item.sentAt)))}</span>
          </p>
          <h2 className="text-lg">{item.subject}</h2>
        </div>
        <ScorePill score={item.score} />
      </header>

      {item.flags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="What was off">
          {item.flags.map((flag) => (
            <li
              key={flag.label}
              className="inline-flex items-center gap-2 rounded-field bg-base-200 px-2.5 py-1 text-sm"
            >
              <SeverityDot severity={flag.severity} />
              {flag.label}
            </li>
          ))}
        </ul>
      )}

      {item.note && (
        <figure className="flex flex-col gap-1 border-l-2 border-base-300 pl-4">
          <blockquote className="max-w-[68ch] font-reading text-reading">{item.note}</blockquote>
          <figcaption className="text-sm text-muted">{item.reviewerName}</figcaption>
        </figure>
      )}

      <details className="group text-sm">
        <summary className="cursor-pointer text-muted hover:text-base-content">
          See the conversation
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="rounded-box bg-base-300/50 px-4 py-3">
            <p className="mb-1 text-xs text-muted">{item.customerName} wrote</p>
            <p className="font-reading whitespace-pre-line">{item.customerMessage}</p>
          </div>
          <div className="rounded-box border border-base-300 px-4 py-3">
            <p className="mb-1 text-xs text-muted">You replied</p>
            <p className="font-reading whitespace-pre-line">{item.replyBody}</p>
          </div>
        </div>
      </details>

      {!item.acknowledged && (
        <form action={acknowledgeReview} className="flex items-center justify-between gap-3">
          <input type="hidden" name="reviewId" value={item.reviewId} />
          <span className="text-sm text-muted">{firstName} will see that you read this.</span>
          <button type="submit" className="btn btn-secondary btn-sm">
            Mark as read
          </button>
        </form>
      )}
    </article>
  );
}
