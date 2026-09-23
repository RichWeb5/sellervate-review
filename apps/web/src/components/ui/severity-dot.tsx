import type { Severity } from "@/server/queries/reply-for-review";

const colorBySeverity: Record<Severity, string> = {
  critical: "bg-critical",
  major: "bg-major",
  minor: "bg-minor",
};

export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span aria-hidden className={`size-2 shrink-0 rounded-full ${colorBySeverity[severity]}`} />
  );
}
