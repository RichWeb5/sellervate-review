import { formatDuration, formatTime } from "@/lib/dates";
import type { ReplyForReview } from "@/server/queries/reply-for-review";

export function ReplyDocument({ reply }: { reply: ReplyForReview }) {
  return (
    <article className="flex flex-col gap-4">
      <section className="flex flex-col gap-2 rounded-box bg-base-300/50 px-5 py-4">
        <p className="text-sm text-muted">{reply.customerName} wrote</p>
        <p className="font-reading text-reading whitespace-pre-line">{reply.customerMessage}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 px-6 py-5">
        <p className="text-sm text-muted">
          {reply.authorName} replied at {formatTime(reply.sentAt)}
          {reply.responseMinutes !== null &&
            `, ${formatDuration(reply.responseMinutes)} after the customer wrote`}
        </p>
        <p className="max-w-[68ch] font-reading text-reading whitespace-pre-line">{reply.body}</p>
      </section>
    </article>
  );
}
