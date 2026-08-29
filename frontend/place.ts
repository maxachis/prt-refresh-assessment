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
 *    panel show different days at the same time. That toolbar sits on the map
 *    now, well away from these numbers, which is what the state line above the
 *    panel is for: see `statebar.ts`.
 */
import { esc, clock, signed, pct } from './utils';
import {
  PKEYS, PERIOD_LABEL, Day, PlaceResult, DayService, OneSeatVerdict, OneSeatDay,
  Boardings, PlacePopulation,
} from './types';

let day: Day = 'weekday';

export function activeDay(): Day {
  return day;
}

/**
 * Set the day type these panels count in.
 *
 * Deliberately does not redraw: which panel is on screen is the view's call,
 * not this module's, and `main.renderPanel` makes it from the answer already
 * fetched. This module rendering itself would have the one-seat view flash the
 * report it replaced on every day change.
 */
export function setDay(d: Day) {
  day = d;
}

export function renderEmpty(el: HTMLElement) {
  el.innerHTML = `
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
      <p><b>Locations</b> draws one dot per place a bus stops today, coloured
         by what the plan does to the buses within a short walk. Its key counts
         those places, or — on the Riders setting — the boardings PRT records
         at them, which is the same map read as who is affected rather than
         where. Boardings exist only where a bus stops today, so that reading
         can weigh what is at risk and never what is gained.
         <b>Surface</b> measures that same walk-access comparison at every
         point on a 100 m grid, so it can also show ground the plan adds a bus
         to — but it is extent, not people: a hillside counts like a city
         block.</p>
      <p><b>Streets</b> takes no walk radius at all: it colours the street
         itself by whether any bus runs on it today, under the plan, or both.
         Route numbers never enter that call — a street is served or it isn't,
         regardless of which route does the serving on either side. A place
         can keep full walk access while a specific street loses its only bus,
         if a parallel block a minute's walk away picks up the trip instead:
         real loss of pavement, possibly no loss of access.</p>
      <p><b>One-seat</b> asks a different kind of question again: from each
         place, can a rider still reach Downtown, Oakland or a point you pick
         <em>without transferring</em>? No day type and no travel time enter
         that — a route serves a place or it doesn't — so a surviving one-seat
         ride may still be hourly on a Sunday. It is also the only view that
         counts the T and the inclines, which are unchanged by the Refresh but
         are how much of the South Hills reaches Downtown.</p>
      <p><b>Travel time</b> is the only view here with a clock on it: how many
         minutes the trip from a point to Downtown, Oakland or a point you pick
         actually takes, on each network, with the wait for the bus counted in.
         It is timed from every minute of the morning peak rather than from one
         chosen departure, and it is schedule against schedule — the proposed
         network has no observed running times and never will.</p>
      <p>Click anywhere on the map for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar on the map: some places keep every
         weekday bus and lose the weekend entirely. The line above this panel
         always says which day and which walk radius its numbers are
         measured at.</p>
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

export function routeList(routes: string[]): string {
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

/**
 * The one-seat verdicts for the named destinations.
 *
 * Sits in the panel whichever view is on screen, because it answers something
 * the trip counts above cannot: a corner can keep every bus it has and still
 * lose the ride that got it to Oakland without changing. By default it is
 * the only block here with no day type on it — a route serves a place or it
 * does not — and the note says so rather than letting the reader carry the
 * day control's meaning into it. It follows the one-seat view's own day
 * control when that is switched on, so a dot and the panel it opens never
 * answer different questions; the note then names the day instead.
 *
 * Both sides' route numbers are shown, never a bare verdict. "Loses its
 * one-seat ride to Oakland" is a sentence somebody will screenshot, and it
 * should arrive with the routes that make it checkable.
 */
const ONESEAT_WORD: Record<string, string> = {
  here: 'you are here',
  keeps: 'keeps a one-seat ride',
  gains: 'gains a one-seat ride',
  loses: 'loses its one-seat ride',
  none: 'no one-seat ride either way',
};

const ONESEAT_DAY_WORD: Record<string, string> = {
  weekday: 'a weekday',
  saturday: 'a Saturday',
  sunday: 'a Sunday',
};

function oneSeatBlock(verdicts: OneSeatVerdict[],
                      day: OneSeatDay = 'any'): string {
  if (!verdicts.length) return '';
  const rows = verdicts.map((v) => {
    const now = routeList(v.current);
    const prop = routeList(v.proposed);
    // One row per side, never both on one line: at Downtown each side lists
    // fourteen routes, and a single wrapped run makes the two indistinguishable
    // -- which is exactly the comparison this block exists to show.
    const detail = v.status === 'here'
      ? '<div class="muted">no one-seat ride needed</div>'
      : `<div class="rrow"><span class="rlab">today</span>${now}</div>
         <div class="rrow"><span class="rlab">proposed</span>${prop}</div>`;
    return `
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${esc(v.name)}</span>
          <span class="os-status ${esc(v.status)}">${ONESEAT_WORD[v.status] ?? v.status}</span>
        </div>
        <div class="os-routes">${detail}</div>
      </div>`;
  }).join('');

  return `
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${rows}
      <p class="note">${day === 'any'
          ? `One route serving both ends, on any calendar — the published
             measure.`
          : `Only routes running on ${ONESEAT_DAY_WORD[day] ?? day} — not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${methodLink('one-seat')}</p>
    </div>`;
}

/**
 * The way out of the panel and into the method for one figure.
 *
 * The panel keeps only the clause that changes how the number beside it
 * reads; provenance -- vintage, weighting, what the count is of -- lives once
 * in the method drawer and is reached from the figure rather than restated
 * under every one of them. Rendered as a button because it is a control on
 * this page, not a destination: `main.ts` opens the drawer at the matching
 * entry.
 */
function methodLink(id: string): string {
  return ` <button class="howto" data-caveat="${id}">method</button>`;
}

/** What to call the clicked point in a heading. */
export function placeLabel(p: PlaceResult): string {
  return p.place?.hood || p.place?.muni || 'this location';
}

/** How many buses, both directions, on the day type on screen. */
export function dayWord(d: Day): string {
  return d === 'weekday' ? 'weekday' : d;
}

/**
 * One line of service at a point, for a panel that is answering something else.
 *
 * The one-seat panel carries this collapsed rather than dropping it: "loses the
 * one-seat ride to Oakland, and the corridor drops from 84 buses to 71" is one
 * thought, and a reader who has to change view to finish it will quote half.
 */
export function serviceSummaryText(p: PlaceResult, d: Day): string {
  const before = p.current.days[d];
  const after = p.proposed.days[d];
  return `${before.trips} → ${after.trips} buses per ${dayWord(d)}`;
}

/**
 * The riders at the stops the panel is already drawing, or nothing.
 *
 * Deliberately not in the today → proposed headline above: there is no
 * proposed half and never will be, so a column standing empty beside a
 * today figure would read as a fall to zero rather than as an absence.
 */
function boardingsFact(b: Boardings | null, d: Day): string {
  if (!b) return '';
  const stops = b.measured + b.unmeasured;
  const gap = b.unmeasured
    ? `<div class="muted">${b.unmeasured} of the ${stops} stops
         ${b.unmeasured === 1 ? 'has' : 'have'} no count of their own</div>`
    : '';
  const value = b.total == null
    ? '<span class="muted">not counted here</span>'
    : `${Math.round(b.total).toLocaleString()}
       <span class="muted">on an average ${dayWord(d)}, today only</span>`;
  return `<dt>Boardings at those stops</dt><dd>${value}${gap}</dd>`;
}

/** What that figure does and does not say. Ships with it or not at all. */
function boardingsNote(b: Boardings | null): string {
  if (!b || b.total == null) return '';
  return `<p class="note">Today's stops only — the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${methodLink('boardings')}</p>`;
}

/**
 * The people of the place the reader clicked in, as the equity work counted
 * them.
 *
 * A place figure, deliberately: a point has no population worth quoting, and
 * a count inside the walk radius would be a fourth people-number on this site
 * disagreeing with the map key's reading of the same spot. It answers on
 * *any bus in a week*, so it does not move with the day switch above, and it
 * says so rather than looking like it should have.
 */
function residentsBlock(pop: PlacePopulation | null): string {
  if (!pop) return '';
  const place = esc(pop.place);
  const body = pop.lost || pop.gained
    ? `<p class="people-n"><b>${Math.round(pop.lost).toLocaleString()}</b>
         residents lose every bus
         <span class="muted">·</span>
         <b>${Math.round(pop.gained).toLocaleString()}</b> gain one</p>`
    : `<p class="people-n">Nobody in ${place} loses or gains every bus under
         the plan.</p>`;
  return `
    <div class="people">
      <h3>Who lives in ${place}</h3>
      ${body}
      <p class="note">The whole of ${place}, any day of the week — it does not
        move with the day above.${methodLink('place-population')}</p>
    </div>`;
}

/**
 * Everything this app knows about the service at a point, minus the heading.
 *
 * Split out of `render` so the one-seat panel can carry the same numbers under
 * its own question without a second copy of them drifting from this one.
 */
export function serviceBodyHTML(p: PlaceResult, d: Day, middle = ''): string {
  const before = p.current.days[d];
  const after = p.proposed.days[d];
  const delta = after.trips - before.trips;
  const dcls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const bm = bestMedian(before), am = bestMedian(after);

  return `
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
    <div class="sub">buses per ${dayWord(d)}, both directions</div>

    <div class="tiers">${tierBadge(before.hourly, after.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">Δ</th></tr></thead>
      <tbody>${periodRows(before, after)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
      <span><i class="sw-walk"></i> the ${p.radius} m walk</span>
      <span><i class="sw-pin"></i> where you clicked</span>
    </div>
    <div class="key-note">A stop both networks keep draws as a blue dot in an
      orange ring. Two marks mean the plan nudged it across the intersection —
      renumbering, not a change in service.</div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${spanLine(before)} <span class="muted">→</span> ${spanLine(after)}</dd>
      <dt>Typical wait, better direction, 6am–6pm</dt>
      <dd>${bm == null ? '—' : `${bm} min`} <span class="muted">→</span> ${am == null ? '—' : `${am} min`}</dd>
      <dt>Stops within ${p.radius} m</dt>
      <dd>${p.current.stops.length} <span class="muted">→</span> ${p.proposed.stops.length}</dd>
      ${boardingsFact(before.boardings, d)}
    </dl>
    ${boardingsNote(before.boardings)}

    ${middle}

    ${residentsBlock(p.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${routeList(before.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${routeList(after.routes)}</div>
      <p class="note">Renumbering is not replacement: the 61A–D become the
         60X/61X/62X.${methodLink('location-not-route')}</p>
    </div>`;
}

export function render(p: PlaceResult) {
  const el = document.getElementById('panel')!;

  el.innerHTML = `
    <div class="place-head">
      <h2>${esc(placeLabel(p))}</h2>
      <div class="muted">
        ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} · within ${p.radius} m
      </div>
    </div>
    ${serviceBodyHTML(p, day, oneSeatBlock(p.oneseat ?? [], p.oneseat_day ?? 'any'))}`;
}
