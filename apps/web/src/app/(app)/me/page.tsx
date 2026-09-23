import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackCard } from "@/features/feedback/feedback-card";
import { getMyFeedback } from "@/server/queries/my-feedback";
import { requireViewer } from "@/server/session";

export default async function MyFeedbackPage() {
  const viewer = await requireViewer();

  const feedback = await getMyFeedback(viewer);
  const unread = feedback.filter((item) => !item.acknowledged);
  const read = feedback.filter((item) => item.acknowledged);
  const average =
    feedback.length > 0
      ? feedback.reduce((sum, item) => sum + item.score, 0) / feedback.length
      : null;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl">Your feedback</h1>
        {average !== null && (
          <p className="text-muted">
            {feedback.length} of your replies have been reviewed, with an average of{" "}
            {average.toFixed(1)} out of 5. Only you and your leads can see this page.
          </p>
        )}
      </header>

      {feedback.length === 0 ? (
        <EmptyState title="No reviews yet">
          When your lead reviews one of your replies, the score and what they wrote show up here.
        </EmptyState>
      ) : (
        <>
          <FeedbackSection
            title={`New (${unread.length})`}
            items={unread}
            empty="You have read everything."
          />
          <FeedbackSection title="Read" items={read} />
        </>
      )}
    </div>
  );
}

function FeedbackSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getMyFeedback>>;
  empty?: string;
}) {
  if (items.length === 0 && !empty) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        items.map((item) => <FeedbackCard key={item.reviewId} item={item} />)
      )}
    </section>
  );
}
