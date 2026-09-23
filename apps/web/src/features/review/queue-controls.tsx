import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { formatDay, shiftDay, yesterday } from "@/lib/dates";
import type { BrandSummary } from "@/server/session";
import { queueHref, type QueueContext } from "./routes";

export function DayNavigation({ context }: { context: QueueContext }) {
  const canGoForward = context.day < yesterday();

  return (
    <div className="join">
      <Link
        href={queueHref({ ...context, day: shiftDay(context.day, -1) })}
        className="btn join-item btn-sm"
      >
        Previous day
      </Link>
      {canGoForward ? (
        <Link
          href={queueHref({ ...context, day: shiftDay(context.day, 1) })}
          className="btn join-item btn-sm"
        >
          Next day
        </Link>
      ) : (
        <span className="btn btn-disabled join-item btn-sm" aria-disabled>
          Next day
        </span>
      )}
    </div>
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
