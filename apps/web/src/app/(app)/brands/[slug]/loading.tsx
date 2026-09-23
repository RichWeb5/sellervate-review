export default function BrandReportLoading() {
  return (
    <div className="flex max-w-5xl flex-col gap-8" aria-busy aria-label="Loading the brand report">
      <div className="h-8 w-48 animate-pulse rounded bg-base-300" />
      <div className="h-64 animate-pulse rounded-box bg-base-100" />
      <div className="h-40 animate-pulse rounded-box bg-base-100" />
    </div>
  );
}
