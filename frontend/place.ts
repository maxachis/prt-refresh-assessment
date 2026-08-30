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
import { esc, clock, duration, signed, pct } from './utils';
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
  return `${clock(s.first)}–${clock(s.last)}`;
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
    const detail = v.status === 'here'
      ? '<div class="muted">no one-seat ride needed</div>'
      : routePair(v.current, v.proposed);
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

/**
 * One before-and-after row of the facts list.
 *
 * Three fixed columns rather than a run of text, so that a reader comparing
 * four rows reads down two columns instead of hunting for the arrow in each
 * of them. Rows with no proposed half -- boardings -- are deliberately not
 * built this way: an empty right column would read as a fall to zero.
 */
function compare(before: string, after: string,
                 verdict: Verdict = null): string {
  const same = before === after ? ' same' : '';
  const graded = verdict ? ` ${verdict}` : '';
  return `<dd class="cmp${same}"><span class="cmp-a">${before}</span>`
    + `<span class="cmp-arrow muted">→</span>`
    + `<span class="cmp-b${graded}">${after}</span></dd>`;
}

/**
 * Better or worse, for the one row that can be graded.
 *
 * Not "up" and "down": the wait is the only figure on the panel whose
 * arithmetic runs against its meaning, a bigger number being a worse service,
 * so grading it by the sign of the change would paint a doubled headway in
 * the green that means gained service everywhere else here. The stop count is
 * deliberately never graded -- convention 3, a vanished stop id is stop
 * consolidation far more often than it is a lost bus -- and neither is the
 * first-and-last pair, whose two ends move in opposite directions.
 */
type Verdict = 'better' | 'worse' | null;

function grade(before: number | null, after: number | null,
               better: 'less' | 'more'): Verdict {
  if (before == null || after == null || before === after) return null;
  const rose = after > before;
  return rose === (better === 'more') ? 'better' : 'worse';
}

/** Minutes from the first bus of the day to the last, or nothing. */
function span(s: DayService): number | null {
  return s.first == null || s.last == null ? null : s.last - s.first;
}

/**
 * Both networks' route lists, today on the left and the plan on the right.
 *
 * Two columns rather than two stacked rows, matching the facts list above:
 * the lists are compared, and a comparison read across a fixed gap beats one
 * read down a page. This used to be one row per side, on the grounds that at
 * Downtown each side runs to fourteen routes and a single wrapped run makes
 * the two indistinguishable -- still true, and what a column each answers:
 * neither list can bleed into the other's space.
 */
export function routePair(current: string[], proposed: string[]): string {
  const both = new Set(current.filter((r) => proposed.includes(r)));
  return `<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${markedRoutes(current, both, 'now')}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${markedRoutes(proposed, both, 'prop')}</div>
    </div>`;
}

/**
 * One side's routes, each marked by which networks run it.
 *
 * In the panel's own colours -- blue for today, orange for the plan -- and
 * never in the red and green that mean service lost and gained in the
 * headline above. This is a difference between two lists of route names, and
 * convention 1 is emphatic that such a difference is not a change in service:
 * the 61A-D become the 60X/61X/62X, and a red pill would call that a loss.
 */
function markedRoutes(routes: string[], both: Set<string>,
                      side: 'now' | 'prop'): string {
  if (!routes.length) return `<span class="muted">none</span>`;
  return routes.map((r) => {
    const mark = both.has(r) ? 'both' : `only-${side}`;
    return `<span class="route ${mark}">${esc(r)}</span>`;
  }).join(' ');
}

/** PRT writes a municipality as "Ross township (Allegheny, PA)". */
const COUNTY_SUFFIX = /\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/;

/** The county the reader has already assumed, and so does not need told. */
const ASSUMED_COUNTY = 'Allegheny';

/**
 * What to call the clicked point in a heading.
 *
 * The county is dropped where it is the one the whole map is in -- 5,726 of
 * the 5,751 labelled stops -- and kept where it is not. Those 25 stops are
 * exactly the ones where the "who lives here" block goes silent, the equity
 * work being Allegheny-only, so the parenthesis does double duty there: it is
 * the only thing on the panel that says why a figure is missing. The state
 * abbreviation goes either way; nothing here is outside Pennsylvania.
 *
 * Display only. The API keeps PRT's label verbatim, because `place_residents`
 * keys the census rollup off it.
 */
export function placeLabel(p: PlaceResult): string {
  const muni = p.place?.muni?.trim() ?? '';
  const county = COUNTY_SUFFIX.exec(muni)?.[1];
  const short = county === ASSUMED_COUNTY ? muni.replace(COUNTY_SUFFIX, '')
    : county ? `${muni.replace(COUNTY_SUFFIX, '')} (${county})`
    : muni;
  return p.place?.hood || short || 'this location';
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
  return `<dt>Boardings</dt><dd>${value}${gap}</dd>`;
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
  // The one thing about the first and last bus that can be graded: a longer
  // day is more service, where a later first bus and a later last bus pull in
  // opposite directions and so cannot be. It is the distance between the two
  // ends, not the hours a bus is useful -- the period table above is where a
  // midday hole shows up.
  const bs = span(before), as = span(after);

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
      <dt>First and last</dt>
      ${compare(spanLine(before), spanLine(after))}
      <dt>Hours between</dt>
      ${compare(duration(bs), duration(as), grade(bs, as, 'more'))}
      <dt>Typical wait</dt>
      ${compare(bm == null ? '—' : `${bm} min`, am == null ? '—' : `${am} min`,
                grade(bm, am, 'less'))}
      <dt>Stops within ${p.radius} m</dt>
      ${compare(String(p.current.stops.length), String(p.proposed.stops.length))}
      ${boardingsFact(before.boardings, d)}
    </dl>
    ${boardingsNote(before.boardings)}

    ${middle}

    ${residentsBlock(p.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${routePair(before.routes, after.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A–D become the
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
