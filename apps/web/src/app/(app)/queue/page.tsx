import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { isDay, shiftDay, yesterday } from "@/lib/dates";
import { BrandFilter, DayNavigation, dayHeading } from "@/features/review/queue-controls";
import { QueueList } from "@/features/review/queue-list";
import { queueHref } from "@/features/review/routes";
import { DAILY_SAMPLE_SIZE } from "@/features/review/suggest-sample";
import { getReviewQueue } from "@/server/queries/review-queue";
import { requireViewer } from "@/server/session";

export default async function QueuePage({ searchParams }: PageProps<"/queue">) {
  const viewer = await requireViewer();
  if (viewer.leads.length === 0) notFound();

  const params = await searchParams;
  const day = isDay(params.day) ? params.day : yesterday();
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const context = { day, brand };

  const queue = await getReviewQueue(viewer, context);
  const reviewedCount = queue.items.filter((item) => item.score !== null).length;
  const suggestedCount = queue.items.filter((item) => item.suggested).length;

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">Replies sent</p>
            <h1 className="text-2xl">{dayHeading(day)}</h1>
          </div>
          <DayNavigation context={context} />
        </div>
        <BrandFilter brands={queue.brands} activeBrand={queue.activeBrand} day={day} />
      </header>

      {params.done === "1" && (
        <p role="status" className="rounded-box bg-success/10 px-4 py-3 text-sm text-success">
          That was the last one waiting in this list. Nice work.
        </p>
      )}

      {queue.items.length === 0 ? (
        <EmptyState
          title="No replies went out that day"
          action={
            <Link href={queueHref({ ...context, day: shiftDay(day, -1) })} className="btn btn-sm">
              Go to the previous day
            </Link>
          }
        >
          Weekends and quiet days look like this. Earlier days may still have replies waiting.
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted">
            {queue.items.length} replies went out. You reviewed {reviewedCount}
            {suggestedCount > 0
              ? `, and ${suggestedCount} more are suggested to reach ${DAILY_SAMPLE_SIZE}, spread across the specialists reviewed least lately.`
              : "."}
          </p>
          <QueueList items={queue.items} context={context} />
        </>
      )}
    </div>
  );
}
