import type { BrandSummary } from "@/server/session";

// Each brand keeps its accent everywhere so a lead always knows which client they are judging for.
export function BrandMark({ brand }: { brand: Pick<BrandSummary, "name" | "accentColor"> }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: brand.accentColor }}
      />
      {brand.name}
    </span>
  );
}
