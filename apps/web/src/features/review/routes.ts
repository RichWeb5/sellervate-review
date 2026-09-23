import type { Route } from "next";

export type QueueContext = { day: string; brand?: string };

function contextParams({ day, brand }: QueueContext) {
  const params = new URLSearchParams({ day });
  if (brand) params.set("brand", brand);
  return params;
}

export function queueHref(context: QueueContext, options: { done?: boolean } = {}): Route {
  const params = contextParams(context);
  if (options.done) params.set("done", "1");
  return `/queue?${params}` as Route;
}

export function replyHref(replyId: string, context: QueueContext): Route {
  return `/replies/${replyId}?${contextParams(context)}` as Route;
}
