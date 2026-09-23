"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { SeverityDot } from "@/components/ui/severity-dot";
import { saveReview, type SaveReviewState } from "@/server/actions/review";
import type { Criterion, ReplyForReview, Severity } from "@/server/queries/reply-for-review";
import type { QueueContext } from "./routes";

// Anchors keep a 3 meaning the same thing on Monday and on Friday, and between leads.
const SCORES = [
  { value: 1, label: "Harmful", hint: "Could cost us the account" },
  { value: 2, label: "Poor", hint: "Needs to be redone" },
  { value: 3, label: "Acceptable", hint: "Gets by, with gaps" },
  { value: 4, label: "Good", hint: "What we expect" },
  { value: 5, label: "Exemplary", hint: "Show it to new joiners" },
] as const;

const SEVERITY_GROUPS: { severity: Severity; title: string }[] = [
  { severity: "critical", title: "Critical" },
  { severity: "major", title: "Major" },
  { severity: "minor", title: "Minor" },
];

export function ReviewForm({ reply, context }: { reply: ReplyForReview; context: QueueContext }) {
  const [state, formAction, pending] = useActionState<SaveReviewState, FormData>(saveReview, {});
  const [score, setScore] = useState<number | null>(reply.ownReview?.score ?? null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        formRef.current?.requestSubmit();
        return;
      }
      const typing = (event.target as HTMLElement).closest("textarea, input[type='text']");
      if (!typing && /^[1-5]$/.test(event.key)) setScore(Number(event.key));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-6 rounded-box border border-base-300 bg-base-100 p-5"
    >
      <input type="hidden" name="replyId" value={reply.replyId} />
      <input type="hidden" name="day" value={context.day} />
      {context.brand && <input type="hidden" name="brand" value={context.brand} />}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">How good was this reply?</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {SCORES.map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-field border px-1 py-2 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-secondary ${
                score === value
                  ? "border-primary bg-primary text-primary-content"
                  : "border-base-300 hover:border-primary"
              }`}
            >
              <input
                type="radio"
                name="score"
                value={value}
                checked={score === value}
                onChange={() => setScore(value)}
                className="sr-only"
              />
              <span className="text-lg font-semibold tabular-nums">{value}</span>
              <span className="text-xs">{label}</span>
            </label>
          ))}
        </div>
        <p className="min-h-5 text-sm text-muted">
          {score ? SCORES[score - 1].hint : "Press 1 to 5, or pick one."}
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-semibold">What was off?</legend>
        {SEVERITY_GROUPS.map(({ severity, title }) => (
          <CriteriaGroup
            key={severity}
            title={title}
            severity={severity}
            criteria={reply.criteria.filter((criterion) => criterion.severity === severity)}
            flaggedIds={reply.ownReview?.flaggedIds ?? []}
          />
        ))}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">Note for {reply.authorName.split(" ")[0]}</span>
        <textarea
          name="note"
          rows={4}
          maxLength={2000}
          defaultValue={reply.ownReview?.note}
          placeholder="What should they do differently next time?"
          className="textarea w-full font-reading"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted">Ctrl + Enter saves</span>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : reply.ownReview ? "Update and go to next" : "Save and go to next"}
        </button>
      </div>
    </form>
  );
}

function CriteriaGroup({
  title,
  severity,
  criteria,
  flaggedIds,
}: {
  title: string;
  severity: Severity;
  criteria: Criterion[];
  flaggedIds: string[];
}) {
  if (criteria.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-2 text-xs font-medium text-muted">
        <SeverityDot severity={severity} />
        {title}
      </p>
      {criteria.map((criterion) => (
        <label
          key={criterion.id}
          className="flex cursor-pointer items-start gap-3 rounded-field px-2 py-1.5 hover:bg-base-200"
        >
          <input
            type="checkbox"
            name="criterionId"
            value={criterion.id}
            defaultChecked={flaggedIds.includes(criterion.id)}
            className="checkbox mt-0.5 checkbox-sm"
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium">
              {criterion.label}
              {criterion.brandSpecific && (
                <span className="font-normal text-muted"> (this brand)</span>
              )}
            </span>
            <span className="text-xs text-muted">{criterion.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
