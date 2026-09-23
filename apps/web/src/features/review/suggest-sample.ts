export const DAILY_SAMPLE_SIZE = 5;

type Candidate = { replyId: string; authorId: string; reviewed: boolean };

// Picks today's remaining reviews round-robin across specialists, starting with whoever has been
// reviewed least recently, so five reviews a day still cover the whole team over a week.
export function suggestSample(
  candidates: Candidate[],
  recentReviewsByAuthor: Map<string, number>,
): Set<string> {
  const remaining = DAILY_SAMPLE_SIZE - candidates.filter((c) => c.reviewed).length;
  if (remaining <= 0) return new Set();

  const byAuthor = new Map<string, string[]>();
  for (const candidate of candidates.filter((c) => !c.reviewed)) {
    byAuthor.set(candidate.authorId, [
      ...(byAuthor.get(candidate.authorId) ?? []),
      candidate.replyId,
    ]);
  }

  const authors = [...byAuthor.keys()].sort(
    (a, b) => (recentReviewsByAuthor.get(a) ?? 0) - (recentReviewsByAuthor.get(b) ?? 0),
  );

  const picked = new Set<string>();
  for (let round = 0; picked.size < remaining; round++) {
    const pickedThisRound = authors
      .map((author) => byAuthor.get(author)?.[round])
      .filter((replyId): replyId is string => replyId !== undefined)
      .slice(0, remaining - picked.size);
    if (pickedThisRound.length === 0) break;
    pickedThisRound.forEach((replyId) => picked.add(replyId));
  }
  return picked;
}
