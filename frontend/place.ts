/**
 * The before/after panel — the app's one real screen.
 *
 * Presentation rules that are not cosmetic:
 *
 *  - GAINS READ AS LOUDLY AS LOSSES. The repo's standing instruction is that
 *    overstating losses would discredit the real ones, and the honest headline
 *    for this plan is a near service-neutral redesign. So the delta gets a
 *    colour in both directions and the same weight of type, and both sides'
 *    absolute numbers are always on screen next to it.
 *  - ROUTE LISTS ARE SHOWN, NOT DIFFED INTO A SCORE. Renumbering is not
 *    replacement (the 61A–D become the 60X/61X/62X), so a naive "3 routes lost"
 *    count off these two lists would be mostly renumbering. They sit side by
 *    side with that said in the open.
 *  - EVERY NUMBER SAYS WHICH DAY TYPE IT IS. A place that keeps its weekday
 *    buses and loses the weekend reads as untouched on a weekday-only screen,
 *    and 152 locations are in exactly that position. The day control lives in
 *    the toolbar rather than in this panel because it now governs the citywide
 *    layer too, and two independent day selectors would let the map and the
 *    panel show different days at the same time.
 */
import { esc, clock, signed, pct } from './utils';
import { PKEYS, PERIOD_LABEL, Day, PlaceResult, DayService } from './types';

let current: PlaceResult | null = null;
let day: Day = 'weekday';

export function activeDay(): Day {
  return day;
}

export function setDay(d: Day, rerender = true) {
  day = d;
  if (rerender && current) render(current);
}

export function renderEmpty(el: HTMLElement) {
  el.innerHTML = `
    <div class="empty">
      <h2>What changes here?</h2>
      <p>Every dot is a location, coloured by what the Proposed Final Network
         does to the buses within a short walk of it. Pan and zoom to read a
         neighbourhood; the legend counts what is on screen.</p>
      <p>Click a dot — or anywhere on the map — for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar: some places keep every weekday bus and
         lose the weekend entirely.</p>
    </div>`;
}

function tierBadge(before: boolean, after: boolean): string {
  if (before && after) return `<span class="tier keep">hourly or better, before and after</span>`;
  if (!before && after) return `<span class="tier gain">rises to hourly or better</span>`;
  if (before && !after) return `<span class="tier loss">drops below hourly</span>`;
  return `<span class="tier none">below hourly, before and after</span>`;
}

function periodRows(before: DayService, after: DayService): string {
  const max = Math.max(
    1,
    ...PKEYS.map((k) => Math.max(before.periods[k] ?? 0, after.periods[k] ?? 0)),
  );
  return PKEYS.map((k) => {
    const b = before.periods[k] ?? 0;
    const a = after.periods[k] ?? 0;
    const d = a - b;
    const cls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
    return `
      <tr>
        <th>${PERIOD_LABEL[k]}</th>
        <td class="bar">
          <span class="b-now" style="width:${(b / max) * 100}%"></span>
          <span class="b-prop" style="width:${(a / max) * 100}%"></span>
        </td>
        <td class="n">${b}</td>
        <td class="n">${a}</td>
        <td class="n ${cls}">${d === 0 ? '·' : signed(d)}</td>
      </tr>`;
  }).join('');
}

function routeList(routes: string[]): string {
  if (!routes.length) return `<span class="muted">none</span>`;
  return routes.map((r) => `<span class="route">${esc(r)}</span>`).join(' ');
}

function spanLine(s: DayService): string {
  if (s.first == null) return '<span class="muted">no service</span>';
  return `${clock(s.first)} – ${clock(s.last)}`;
}

/** Best (smallest) median headway across directions, for the summary line. */
function bestMedian(s: DayService): number | null {
  const vals = Object.values(s.headways)
    .map((h) => h.median)
    .filter((v): v is number => v != null);
  return vals.length ? Math.min(...vals) : null;
}

export function render(p: PlaceResult) {
  current = p;
  const el = document.getElementById('panel')!;
  const before = p.current.days[day];
  const after = p.proposed.days[day];
  const delta = after.trips - before.trips;
  const dcls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  const label = p.place?.hood || p.place?.muni || 'this location';
  const bm = bestMedian(before), am = bestMedian(after);

  el.innerHTML = `
    <div class="place-head">
      <h2>${esc(label)}</h2>
      <div class="muted">
        ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} · within ${p.radius} m
      </div>
    </div>

    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${before.trips}</div>
      </div>
      <div class="hl-arrow">→</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${after.trips}</div>
      </div>
      <div class="hl-delta ${dcls}">
        ${delta === 0 ? 'no change' : `${signed(delta)} trips`}
        <div class="muted">${pct(before.trips, after.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${day === 'weekday' ? 'weekday' : day}, both directions</div>

    <div class="tiers">${tierBadge(before.hourly, after.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">Δ</th></tr></thead>
      <tbody>${periodRows(before, after)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${spanLine(before)} <span class="muted">→</span> ${spanLine(after)}</dd>
      <dt>Typical wait, better direction, 6am–6pm</dt>
      <dd>${bm == null ? '—' : `${bm} min`} <span class="muted">→</span> ${am == null ? '—' : `${am} min`}</dd>
      <dt>Stops within ${p.radius} m</dt>
      <dd>${p.current.stops.length} <span class="muted">→</span> ${p.proposed.stops.length}</dd>
    </dl>

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${routeList(before.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${routeList(after.routes)}</div>
      <p class="note">Renumbering is not replacement — the 61A–D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`;
}
