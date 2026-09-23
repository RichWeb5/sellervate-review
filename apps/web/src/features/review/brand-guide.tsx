import { BrandMark } from "@/components/ui/brand-mark";
import type { ReplyForReview } from "@/server/queries/reply-for-review";

// The brand's own standard sits next to the reply so every review is judged against the same rules.
export function BrandGuide({ brand }: { brand: ReplyForReview["brand"] }) {
  return (
    <section
      className="flex flex-col gap-3 rounded-box border-l-4 bg-base-100 px-5 py-4"
      style={{ borderLeftColor: brand.accentColor }}
    >
      <h2 className="text-base">
        How <BrandMark brand={brand} /> wants replies
      </h2>
      <p className="text-sm text-muted">{brand.voiceSummary}</p>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm marker:text-muted">
        {brand.procedures.map((procedure) => (
          <li key={procedure}>{procedure}</li>
        ))}
      </ol>
    </section>
  );
}
