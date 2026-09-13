// Small presentational helpers. Pure, build-time only.

export function relativeTime(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const day = 86_400_000;
  const days = Math.round(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function compact(n: number): string {
  if (n < 1000) return String(n);
  return (n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "") + "k";
}

const STATUS_GLYPH: Record<string, string> = {
  done: "●",
  partial: "◐",
  todo: "○",
};
export function statusGlyph(s: string): string {
  return STATUS_GLYPH[s] ?? "○";
}

const PLANNED = "Planned";

const STATUS_LABEL: Record<string, string> = {
  done: "Done",
  partial: "In progress",
  todo: PLANNED,
};

export function statusLabel(s: string): string {
  // The fallback is the constant, not another lookup. A lookup used as a
  // default can itself be absent, so the `string` this function promises was
  // resting on a key being in the table above — and it names the same word the
  // `todo` row does, so the two cannot drift apart.
  return STATUS_LABEL[s] ?? PLANNED;
}
