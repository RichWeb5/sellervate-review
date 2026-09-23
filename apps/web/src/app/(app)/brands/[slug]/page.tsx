import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/ui/brand-mark";
import { EmptyState } from "@/components/ui/empty-state";
import { yesterday } from "@/lib/dates";
import { RecurringIssues, ReviewLog } from "@/features/brand-report/review-log";
import { WeeklyTrend } from "@/features/brand-report/weekly-trend";
import { queueHref } from "@/features/review/routes";
import { getBrandReport, REPORT_WEEKS } from "@/server/queries/brand-report";
import { requireViewer } from "@/server/session";

export default async function BrandReportPage({ params }: PageProps<"/brands/[slug]">) {
  const [{ slug }, viewer] = await Promise.all([params, requireViewer()]);
  const brand = viewer.leads.find((lead) => lead.slug === slug);
  if (!brand) notFound();

  const report = await getBrandReport(brand);

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">Last {REPORT_WEEKS} weeks</p>
          <h1 className="text-2xl">
            <BrandMark brand={brand} />
          </h1>
        </div>
        <Link href={queueHref({ day: yesterday(), brand: brand.slug })} className="btn btn-sm">
          Review yesterday&apos;s replies
        </Link>
      </header>

      {report.reviews.length === 0 ? (
        <EmptyState title={`No ${brand.name} replies reviewed yet`}>
          Reviews you record in the queue build this page: the weekly trend, what keeps going wrong,
          and every note you wrote.
        </EmptyState>
      ) : (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="flex flex-col gap-3">
              <h2 className="text-base">How it is going, week by week</h2>
              <WeeklyTrend weeks={report.weeks} />
            </section>
            <section className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-5">
              <h2 className="text-base">What keeps going wrong</h2>
              <RecurringIssues issues={report.recurringIssues} />
            </section>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-base">Every review, newest first</h2>
            <ReviewLog reviews={report.reviews} brandSlug={brand.slug} />
          </section>
        </>
      )}
    </div>
  );
}
