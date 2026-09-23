import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDay, isDay, yesterday } from "@/lib/dates";
import { BrandFilter, DayPicker, dayHeading } from "@/features/review/queue-controls";
import { QueueList } from "@/features/review/queue-list";
import { queueHref } from "@/features/review/routes";
import { DAILY_SAMPLE_SIZE } from "@/features/review/suggest-sample";
import { getRecentDays, getReviewQueue } from "@/server/queries/review-queue";
import { requireViewer } from "@/server/session";

export default async function QueuePage({ searchParams }: PageProps<"/queue">) {
  const viewer = await requireViewer();

  const params = await searchParams;
  const day = isDay(params.day) ? params.day : yesterday();
  const brand = typeof params.brand === "string" ? params.brand : undefined;
  const context = { day, brand };

  const [queue, recentDays] = await Promise.all([
    getReviewQueue(viewer, context),
    getRecentDays(viewer, context),
  ]);
  const latestDay = recentDays.find((entry) => entry.day !== day)?.day ?? null;
  const reviewedCount = queue.items.filter((item) => item.score !== null).length;
  const dailyTarget = Math.min(DAILY_SAMPLE_SIZE, queue.items.length);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">Replies sent</p>
            <h1 className="text-2xl">{dayHeading(day)}</h1>
          </div>
          <DayPicker days={recentDays} context={context} />
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
            latestDay && (
              <Link href={queueHref({ ...context, day: latestDay })} className="btn btn-sm">
                Go to {formatDay(latestDay)}
              </Link>
            )
          }
        >
          {latestDay
            ? "Pick another day from the calendar button, or jump to the latest one with replies."
            : "There are no recent replies for these brands."}
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="rounded-field bg-base-100 px-3 py-1 text-sm font-semibold tabular-nums shadow-sm">
              {Math.min(reviewedCount, dailyTarget)} of {dailyTarget} reviewed
            </span>
            <p className="text-sm text-muted">
              {reviewedCount >= dailyTarget
                ? "You have reviewed enough for this day. Anything else is a bonus."
                : `${queue.items.length} replies went out. Start with the suggested ones: they spread your reviews across the team.`}
            </p>
          </div>
          <QueueList items={queue.items} context={context} />
        </>
      )}
    </div>
  );
}
