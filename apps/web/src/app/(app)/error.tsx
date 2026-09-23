"use client";

export default function SignedInError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex max-w-xl flex-col items-start gap-3 rounded-box border border-error/30 bg-base-100 px-6 py-8">
      <h1 className="text-lg">This page could not load its data</h1>
      <p className="text-muted">
        The database did not answer. If you are running this locally, check that Supabase is up with{" "}
        <code className="font-mono text-sm">pnpm db:start</code>, then try again.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary btn-sm">
        Try again
      </button>
    </div>
  );
}
