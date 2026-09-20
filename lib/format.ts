export function formatNum(n: number): string {
  return Math.floor(n).toLocaleString("ja-JP");
}

export function formatJa(n: number): string {
  const oku = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const rest = n % 10_000;
  const parts: string[] = [];
  if (oku > 0) parts.push(`${oku.toLocaleString("ja-JP")}億`);
  if (man > 0) parts.push(`${man.toLocaleString("ja-JP")}万`);
  if (rest > 0 || parts.length === 0) parts.push(`${rest.toLocaleString("ja-JP")}`);
  return parts.join("");
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function currentMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

export function monthLabel(key: string): string {
  return `${Number(key.split("-")[1])}月`;
}
