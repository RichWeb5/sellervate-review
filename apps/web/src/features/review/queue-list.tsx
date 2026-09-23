import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { ScorePill } from "@/components/ui/score-pill";
import { formatDuration, formatTime } from "@/lib/dates";
import type { QueueItem } from "@/server/queries/review-queue";
import { replyHref, type QueueContext } from "./routes";

export function QueueList({ items, context }: { items: QueueItem[]; context: QueueContext }) {
  return (
    <ul className="flex flex-col divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-100">
      {items.map((item) => (
        <li key={item.replyId}>
          <QueueRow item={item} context={context} />
        </li>
      ))}
    </ul>
  );
}

function QueueRow({ item, context }: { item: QueueItem; context: QueueContext }) {
  return (
    <Link
      href={replyHref(item.replyId, context)}
      className="grid gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:bg-base-200/60 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="font-medium text-base-content">
            <BrandMark brand={item.brand} />
          </span>
          <span>{item.authorName}</span>
          <span>
            {formatTime(item.sentAt)}
            {item.responseMinutes !== null &&
              `, answered in ${formatDuration(item.responseMinutes)}`}
          </span>
        </div>
        <p className="font-semibold">{item.subject}</p>
        <p className="line-clamp-2 font-reading text-sm text-muted">{item.body}</p>
      </div>

      <div className="flex items-start sm:justify-end">
        {item.score !== null ? (
          <ScorePill score={item.score} />
        ) : item.suggested ? (
          <span className="rounded-field bg-secondary/10 px-2 py-0.5 text-sm font-medium text-secondary">
            Suggested
          </span>
        ) : null}
      </div>
    </Link>
  );
}
