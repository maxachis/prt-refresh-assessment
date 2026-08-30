export function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing element #${id}`);
  return el;
}

export async function fetchJSON<T = any>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) {
    let detail = r.statusText;
    try { detail = (await r.json()).detail ?? detail; } catch { /* not JSON */ }
    throw new Error(detail);
  }
  return r.json();
}

/** Escape text destined for innerHTML. Stop names come from PRT, not from us. */
export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  ));
}

/**
 * Minutes on the 4:00–28:00 axis to a clock face.
 *
 * The axis runs past midnight — 25:30 is 1:30am — so anything at or past 24:00
 * folds back and is marked, rather than being rendered as an impossible hour.
 */
export function clock(min: number | null): string {
  if (min == null) return '—';
  const wrapped = min % 1440;
  const h = Math.floor(wrapped / 60), m = Math.round(wrapped % 60);
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

/**
 * A number of minutes as a length of time.
 *
 * For the gap between the first bus and the last, which is a duration rather
 * than a point on the clock the way `clock` renders -- 1398 minutes is not
 * 11:18pm, it is 23 hours and 18 minutes of the day with a bus in it.
 */
export function duration(min: number | null): string {
  if (min == null) return '—';
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

/** A signed count, with the sign always shown so gains read as loudly as losses. */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export function pct(from: number, to: number): string {
  if (!from) return to ? 'new' : '—';
  return `${to >= from ? '+' : ''}${(((to - from) / from) * 100).toFixed(1)}%`;
}
