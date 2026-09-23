export default function MyFeedbackLoading() {
  return (
    <div className="flex max-w-3xl flex-col gap-6" aria-busy aria-label="Loading your feedback">
      <div className="h-8 w-56 animate-pulse rounded bg-base-300" />
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 px-6 py-5"
        >
          <div className="h-3 w-40 animate-pulse rounded bg-base-300" />
          <div className="h-5 w-72 animate-pulse rounded bg-base-300" />
          <div className="h-3 w-full animate-pulse rounded bg-base-200" />
        </div>
      ))}
    </div>
  );
}
