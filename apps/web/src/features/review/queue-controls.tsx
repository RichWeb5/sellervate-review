import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { CalendarIcon, ChevronDownIcon } from "@/components/ui/icons";
import { formatDay, formatShortDay, yesterday } from "@/lib/dates";
import type { QueueDay } from "@/server/queries/review-queue";
import type { BrandSummary } from "@/server/session";
import { queueHref, type QueueContext } from "./routes";

export function DayPicker({ days, context }: { days: QueueDay[]; context: QueueContext }) {
  if (days.length === 0) return null;

  return (
    <details className="dropdown dropdown-end">
      <summary
        aria-label={`Change day, showing ${formatDay(context.day)}`}
        className="btn gap-2 font-normal btn-sm"
      >
        <CalendarIcon />
        {formatShortDay(context.day)}
        <ChevronDownIcon />
      </summary>
      <nav
        aria-label="Recent days with replies"
        className="dropdown-content z-10 mt-2 max-h-80 w-64 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
      >
        <ul className="flex flex-col">
          {days.map((entry) => {
            const active = entry.day === context.day;
            return (
              <li key={entry.day}>
                <Link
                  href={queueHref({ ...context, day: entry.day })}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-field px-3 py-2 text-sm ${
                    active ? "bg-base-200 font-semibold" : "hover:bg-base-200"
                  }`}
                >
                  <span>{formatShortDay(entry.day)}</span>
                  <span
                    className={
                      entry.pending > 0 ? "font-medium text-secondary" : "text-xs text-muted"
                    }
                  >
                    {entry.pending > 0 ? `${entry.pending} to review` : "All reviewed"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </details>
  );
}

export function BrandFilter({
  brands,
  activeBrand,
  day,
}: {
  brands: BrandSummary[];
  activeBrand: BrandSummary | null;
  day: string;
}) {
  if (brands.length < 2) return null;

  const tabClass = (active: boolean) =>
    `rounded-field px-3 py-1.5 text-sm transition-colors ${
      active ? "bg-base-100 font-semibold shadow-sm" : "text-muted hover:text-base-content"
    }`;

  return (
    <nav
      aria-label="Filter by brand"
      className="flex flex-wrap gap-1 rounded-box bg-base-300/60 p-1"
    >
      <Link href={queueHref({ day })} className={tabClass(activeBrand === null)}>
        All brands
      </Link>
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={queueHref({ day, brand: brand.slug })}
          className={tabClass(activeBrand?.id === brand.id)}
        >
          <BrandMark brand={brand} />
        </Link>
      ))}
    </nav>
  );
}

export function dayHeading(day: string) {
  return day === yesterday() ? `Yesterday, ${formatDay(day)}` : formatDay(day);
}
