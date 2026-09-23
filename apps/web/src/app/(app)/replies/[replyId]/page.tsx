import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { isDay, yesterday } from "@/lib/dates";
import { BrandGuide } from "@/features/review/brand-guide";
import { ReplyDocument } from "@/features/review/reply-document";
import { ReviewForm } from "@/features/review/review-form";
import { queueHref } from "@/features/review/routes";
import { getReplyForReview } from "@/server/queries/reply-for-review";
import { requireViewer } from "@/server/session";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function ReviewReplyPage({
  params,
  searchParams,
}: PageProps<"/replies/[replyId]">) {
  const [{ replyId }, query, viewer] = await Promise.all([params, searchParams, requireViewer()]);
  if (!UUID.test(replyId)) notFound();

  const reply = await getReplyForReview(viewer, replyId);
  if (!reply) notFound();

  const context = {
    day: isDay(query.day) ? query.day : yesterday(),
    brand: typeof query.brand === "string" ? query.brand : undefined,
  };

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col items-start gap-3">
        <Link href={queueHref(context)} className="btn -ml-3 gap-2 btn-ghost font-normal btn-sm">
          <ArrowLeftIcon />
          Back to the queue
        </Link>
        <h1 className="text-2xl">{reply.subject}</h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-6">
          <ReplyDocument reply={reply} />
          <BrandGuide brand={reply.brand} />
        </div>
        <div className="lg:sticky lg:top-8">
          <ReviewForm key={reply.replyId} reply={reply} context={context} />
        </div>
      </div>
    </div>
  );
}
