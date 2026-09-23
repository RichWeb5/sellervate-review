export default function QueueLoading() {
  return (
    <div className="flex max-w-5xl flex-col gap-6" aria-busy aria-label="Loading replies">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 animate-pulse rounded bg-base-300" />
        <div className="h-8 w-72 animate-pulse rounded bg-base-300" />
      </div>
      <div className="flex flex-col divide-y divide-base-300 rounded-box border border-base-300 bg-base-100">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2 px-5 py-4">
            <div className="h-3 w-48 animate-pulse rounded bg-base-300" />
            <div className="h-4 w-64 animate-pulse rounded bg-base-300" />
            <div className="h-3 w-full animate-pulse rounded bg-base-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
