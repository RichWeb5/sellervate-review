const toneByScore: Record<number, string> = {
  1: "bg-critical/12 text-critical",
  2: "bg-critical/12 text-critical",
  3: "bg-major/14 text-major",
  4: "bg-success/12 text-success",
  5: "bg-success/12 text-success",
};

export function ScorePill({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-baseline rounded-field px-2 py-0.5 text-sm font-semibold tabular-nums ${toneByScore[score]}`}
    >
      {score}
      <span className="text-xs font-normal opacity-70">/5</span>
    </span>
  );
}
