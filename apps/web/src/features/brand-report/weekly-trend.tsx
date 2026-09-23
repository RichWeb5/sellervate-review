import { formatDay } from "@/lib/dates";
import type { WeekSummary } from "@/server/queries/brand-report";

// A table, not a chart: the numbers are what a lead reads out to a client.
export function WeeklyTrend({ weeks }: { weeks: WeekSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr className="text-muted">
            <th className="font-medium">Week of</th>
            <th className="text-right font-medium">Reviewed</th>
            <th className="font-medium">Average score</th>
            <th className="text-right font-medium">With a critical issue</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.weekStart}>
              <td>{formatDay(week.weekStart)}</td>
              <td className="text-right tabular-nums">{week.reviewCount}</td>
              <td>
                {week.averageScore === null ? (
                  <span className="text-muted">No reviews</span>
                ) : (
                  <ScoreBar score={week.averageScore} />
                )}
              </td>
              <td className="text-right tabular-nums">
                {week.reviewCount > 0 ? (
                  <span className={week.criticalCount > 0 ? "font-semibold text-critical" : ""}>
                    {week.criticalCount}
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-3">
      <span className="w-8 tabular-nums">{score.toFixed(1)}</span>
      <span aria-hidden className="h-1.5 w-24 overflow-hidden rounded-full bg-base-200">
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </span>
    </span>
  );
}
