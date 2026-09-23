// Days are UTC calendar days. Brands in other time zones are a V2 concern.
const DAY_MS = 86_400_000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function yesterday(): string {
  return toDay(new Date(Date.now() - DAY_MS));
}

export function shiftDay(day: string, days: number): string {
  return toDay(new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS));
}

export function weekStart(day: string): string {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  return shiftDay(day, -((weekday + 6) % 7));
}

export function isDay(value: unknown): value is string {
  return typeof value === "string" && DAY_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

export function dayRange(day: string) {
  return { start: `${day}T00:00:00Z`, end: `${shiftDay(day, 1)}T00:00:00Z` };
}

export function formatDay(day: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export function formatShortDay(day: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `${hours} h`;
}
