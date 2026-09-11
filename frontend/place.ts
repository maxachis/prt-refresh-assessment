/**
 * The before/after panel — the app's one real screen.
 *
 * Presentation rules that are not cosmetic:
 *
 *  - EVERY NUMBER SAYS WHICH UNIT IT IS MEASURED AT. Since 2026-09-10 the
 *    panel can hold two: the kerb a reader clicked, which is what the dot's
 *    colour and its hover count, and the 400 m walk around it, which is what
 *    `docs/answers/` publishes. At a downtown corner those are 167 → 179 and
 *    1,591 → 2,178, so an unlabelled headline is a misquote waiting to be
 *    screenshotted. Each block wears its own scope, no block mixes rows from
 *    the other's unit, and the place head carries the radius only when the
 *    radius is the panel's one scope.
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
  Boardings, PlacePopulation, StopRef, KerbResult,
} from './types';

/**
 * How a block of numbers says which unit it is measured at.
 *
 * Every figure on this panel belongs to one of two scopes and none of them
 * may appear without its own — the kerb and the walk radius differ by an
 * order of magnitude at a downtown corner (167 buses against 1,591), and an
 * unlabelled number is the one that gets screenshotted. The words are here
 * rather than at the call sites so the same phrase reaches the headline, the
 * boardings row and the block heading.
 */
const AT_THIS_STOP = 'at this stop';
const withinWalk = (radius: number) => `within ${radius} m`;

/**
 * What the headline may claim about directions, which is not always both.
 *
 * A radius is a circle and a one-way pair puts a route's two directions on
 * two streets, so "both directions" was a promise the count did not keep at
 * one location in seven. The clause is chosen from the measurement rather
 * than fixed in the template, and at a kerb — one side of one street — there
 * is no honest directional claim to make at all, so it carries none.
 */
const BOTH_DIRECTIONS = 'both directions';
const ONE_OR_BOTH_DIRECTIONS = 'one or both directions';

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
      <p><b>Stop-by-stop</b> draws one dot per stop a bus calls at today,
         coloured by what the plan does to the buses at that stop — its own
         kerb, not the neighbourhood around it. Each dot says one thing:
         either the plan takes this stop away — a red cross, on every day of
         the week — or the stop stays and the colour tells you whether it
         gains or loses buses. A hollow ring is a stop the plan adds, drawn
         wherever the plan adds it. To see what a crossed-out stop leaves
         behind, read the dots around it. Its key counts those stops, or — on
         the Riders setting — the boardings PRT records at them, which is the
         same map read as who is affected rather than where. Boardings exist
         only where a bus stops today, so that reading can weigh what is at
         risk and never what is gained.
         <b>Surface</b> asks the other half: not what happens at one kerb but
         what a rider can reach on foot, comparing the buses within a short
         walk at every point on a 100 m grid, so it can also show ground the
         plan adds a bus to — but it is extent, not people: a hillside counts
         like a city block. A stop can lose its buses while the ground around
         it keeps them, and the two views are how you tell.</p>
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
 * The county is dropped where it is the one the whole map is in -- 6,050 of
 * the 6,075 labelled stops (209 of the 6,284 published locations carry no
 * PRT label at all, a renumbering with no unambiguous match) -- and kept
 * where it is not. Those 25 stops are exactly the ones where the "who lives
 * here" block goes silent, the equity work being Allegheny-only, so the
 * parenthesis does double duty there: it is
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
/**
 * How many of the plan's stops here stand where no stop stands today.
 *
 * The panel's half of the map's ring. A reader who sees a ringed dot and
 * clicks it for detail was, until this line, told what happens to the buses
 * within a walk and nothing whatever about the stop -- which is the fact that
 * brought them there, and the fact three separate readers have gone looking
 * for since the plan was published.
 *
 * Phrased "N of M" rather than as a bare count because the interesting figure
 * is the share: two of three proposed stops being new says something a "2"
 * beside a "10" does not. The server decides it, through the one predicate the
 * map's own point set uses (`query.is_new_place`), so this cannot call a stop
 * new that the map draws as an infill of its neighbour.
 *
 * Absent, not zero, where nothing qualifies. The commonest corner in the city
 * has the plan re-serving stops that already stand, and printing a 0 there
 * answers a question the reader has not asked.
 */
function newPlacesFact(stops: StopRef[]): string {
  const n = stops.filter((s) => s.new_place).length;
  if (!n) return '';
  // No distance in the label since 2026-09-10. The question is about a pole,
  // not a location: a stop the plan adds is one the plan adds, wherever it
  // stands relative to the kerb up the block. The only carve-out left is a
  // renumbered kerb (`query.STOP_SAME_POLE_M`), which is convention 3 rather
  // than a threshold a reader has to hold in their head.
  return `<dt>Stops the plan adds</dt>
    <dd>${n} of ${stops.length}</dd>`;
}

/**
 * How many of today's stops here the plan takes away, and how far the walk to
 * a replacement is.
 *
 * The panel's half of the map's red cross, and the mirror of the ring above.
 * It answers the question a reader standing at a crossed-out dot actually has,
 * which the coloured headline cannot: the colour describes every bus within
 * the walk radius, and a stop can be removed at a corner where the radius
 * gains service.
 *
 * The distances are walks over the pedestrian network, not straight lines, and
 * a stop with nothing inside an 800 m walk is named as such rather than given
 * a number -- it is the case that matters most and the one a truncated figure
 * would hide. Where the stops removed here disagree about that, the panel
 * prints the range rather than picking one.
 *
 * Absent, not zero, where nothing qualifies: at most corners the plan removes
 * no stop, and a "0" there answers a question the reader has not asked.
 */
function removedStopsFact(stops: StopRef[]): string {
  const gone = stops.filter((s) => s.removed);
  if (!gone.length) return '';
  const walks = gone.map((s) => s.replacement_walk_m)
    .filter((m): m is number => m != null);
  const stranded = gone.length - walks.length;
  const near = walks.length
    ? (walks.length === 1 || Math.min(...walks) === Math.max(...walks)
        ? `nearest stop a ${Math.round(walks[0]).toLocaleString()} m walk`
        : `nearest stop a ${Math.round(Math.min(...walks)).toLocaleString()}–`
          + `${Math.round(Math.max(...walks)).toLocaleString()} m walk`)
    : '';
  const none = stranded
    ? `${walks.length ? `${stranded} with ` : ''}no other stop within an`
      + ' 800 m walk'
    : '';
  const note = [near, none].filter(Boolean).join('; ');
  return `<dt>Stops the plan removes</dt>
    <dd>${gone.length} of ${stops.length}<div class="muted">${note}</div></dd>`;
}

/**
 * How many of the routes here a rider can only board one way.
 *
 * The row exists because the headline above it used to say "both directions"
 * of a count that at one location in seven includes a route in one direction
 * only: the 61A/B/C and the 71B run the Fifth/Forbes one-way pair, so the
 * circle round a pin in Crawford-Roberts catches four of today's seven routes
 * inbound and nothing outbound. Absent rather than zero where neither network
 * has one, on the commonest kind of corner there is — the same rule the added
 * and removed stop rows follow.
 *
 * Not a loss and not graded: a rider who can board one way really can board
 * one way, and both networks are measured in the same circle. What it warns
 * about is the edge — convention 4's radius sensitivity, one direction of one
 * route at a time.
 */
function oneDirectionFact(before: DayService, after: DayService): string {
  const now = before.one_direction_routes ?? [];
  const prop = after.one_direction_routes ?? [];
  if (!now.length && !prop.length) return '';
  const of = (part: string[], all: string[]) =>
    `${part.length} of ${all.length}`;
  return `
      <dt>Routes in one direction only${methodLink('one-direction')}</dt>
      ${compare(of(now, before.routes), of(prop, after.routes))}`;
}

function boardingsFact(b: Boardings | null, d: Day, scope: string): string {
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
  return `<dt>Boardings ${esc(scope)}</dt><dd>${value}${gap}</dd>`;
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
         residents lose all buses
         <span class="muted">·</span>
         <b>${Math.round(pop.gained).toLocaleString()}</b> gain one</p>`
    : `<p class="people-n">Nobody in ${place} loses or gains all buses under
         the plan.</p>`;
  // The actual fix for the Squirrel Hill South problem: this figure is
  // measured for the whole named place, not the walk circle four lines
  // above it, and the Places view is where that figure gets a screen of its
  // own -- ranked against every other place, with its own map of the block
  // groups behind it. The key comes from the server, which looked the place
  // up by it; deriving it here instead would put `query.place_key`'s rules
  // in two languages, where a change to one sends this link to the wrong
  // place with nothing failing loudly enough to notice.
  const key = esc(pop.key);
  return `
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${key}">${place}</button>
      </h3>
      ${body}
      <p class="note">The whole of ${place}, any day of the week — it does not
        move with the day above.${methodLink('place-population')}</p>
    </div>`;
}

/**
 * The two trip counts and the delta between them, under the scope they were
 * measured at.
 *
 * The scope is a required argument rather than a default, because this is the
 * biggest type on the panel and there are now two of it on screen: an
 * unscoped headline is exactly the number a reader carries away wrong.
 *
 * `directions` is the clause after the scope, and it is optional because one
 * of the two blocks has nothing true to say there: a kerb is one side of one
 * street. Passed as a phrase rather than a flag so the call site reads as the
 * sentence it produces.
 */
function headlineHTML(before: DayService, after: DayService,
                      d: Day, scope: string,
                      { directions }: { directions?: string } = {}): string {
  const delta = after.trips - before.trips;
  const dcls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
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
    <div class="sub">buses per ${dayWord(d)} ${esc(scope)}${
      directions ? `, ${esc(directions)}` : ''}</div>`;
}

/** The seven periods the headline above sums over. Scope-free by itself. */
function periodTableHTML(before: DayService, after: DayService): string {
  return `
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">Δ</th></tr></thead>
      <tbody>${periodRows(before, after)}</tbody>
    </table>`;
}

/**
 * The rows of the facts list that describe service rather than geography.
 *
 * Shared by both scopes: the first bus, the length of the day and the typical
 * wait mean the same thing at a kerb and at a walk radius, where the stop
 * counts, the removals and the residents below them are answers about an
 * area and stay in the block that has one.
 */
function serviceFactsRows(before: DayService, after: DayService): string {
  const bm = bestMedian(before), am = bestMedian(after);
  // The one thing about the first and last bus that can be graded: a longer
  // day is more service, where a later first bus and a later last bus pull in
  // opposite directions and so cannot be. It is the distance between the two
  // ends, not the hours a bus is useful -- the period table above is where a
  // midday hole shows up.
  const bs = span(before), as = span(after);
  return `
      <dt>First and last</dt>
      ${compare(spanLine(before), spanLine(after))}
      <dt>Hours between</dt>
      ${compare(duration(bs), duration(as), grade(bs, as, 'more'))}
      <dt>Typical wait</dt>
      ${compare(bm == null ? '—' : `${bm} min`, am == null ? '—' : `${am} min`,
                grade(bm, am, 'less'))}`;
}

/** Both networks' route lists, under a heading that says at what scope. */
function routesBlockHTML(before: DayService, after: DayService,
                         heading: string): string {
  return `
    <div class="routes">
      <h3>${esc(heading)}</h3>
      ${routePair(before.routes, after.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A–D become the
         60X/61X/62X.${methodLink('location-not-route')}</p>
    </div>`;
}

/**
 * What the plan does to the buses at the one stop a reader clicked.
 *
 * The panel's half of the move Stop-by-stop made on 2026-09-10. The dots'
 * colour, their tooltip and the key all count the kerb; this block was still
 * missing, so a click printed the 400 m walk — 1,591 → 2,178 at a downtown
 * dot whose own kerb carries 167 — and swung by hundreds when the click moved
 * a block. Two units, one screen, and nothing saying which was which.
 *
 * EVERY FIGURE HERE IS SCOPED TO THE STOP, and the block carries no
 * radius-based row at all. The stop counts, the removals, the additions and
 * the residents are answers about an area; they stay below, under the walk
 * radius's own heading. That separation is the whole point of showing both:
 * the gap between the two headlines is legible only if each says what it is.
 *
 * It is NOT a published figure, and says so. `data/coverage_change.csv` and
 * `docs/answers/` publish the location — convention 2 — and this block would
 * misquote them by an order of magnitude if it were read as theirs.
 *
 * AND IT CLAIMS NOTHING ABOUT DIRECTIONS. Its headline said "both directions"
 * until 2026-09-10, which at a kerb is wrong by construction rather than
 * occasionally: a kerb is one side of one street, so most of what calls there
 * calls one way, and the poles within 25 m of it may or may not include the
 * opposite one. There is no short true clause, so the sentence stops at the
 * scope — "buses per weekday at this stop" — and the one-direction row stays
 * in the walk-radius block, where it is news.
 */
export function kerbBlockHTML(k: KerbResult, d: Day): string {
  const before = k.current.days[d];
  const after = k.proposed.days[d];
  const poles = k.names.length ? k.names.join(' · ') : `stop ${k.stop_id}`;
  return `
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${esc(poles)}
        <span class="muted">· PRT stop ${esc(k.stop_id)}</span></div>
      ${headlineHTML(before, after, d, AT_THIS_STOP)}
      <div class="tiers">${tierBadge(before.hourly, after.hourly)}</div>
      ${periodTableHTML(before, after)}
      <dl class="facts">
        ${serviceFactsRows(before, after)}
        ${boardingsFact(before.boardings, d, AT_THIS_STOP)}
      </dl>
      ${boardingsNote(before.boardings)}
      ${routesBlockHTML(before, after, 'Routes calling at this stop')}
      <p class="note">This kerb only — every pole within ${k.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${methodLink('kerb')}</p>
    </section>`;
}

/**
 * Everything this app knows about the service at a point, minus the heading.
 *
 * Split out of `render` so the one-seat panel can carry the same numbers under
 * its own question without a second copy of them drifting from this one.
 *
 * The walk radius throughout — convention 4's quarter mile, the published
 * unit. Its scope is now stated on the headline rather than only in the place
 * head above it, because the kerb block can sit between the two.
 */
export function serviceBodyHTML(p: PlaceResult, d: Day, middle = ''): string {
  const before = p.current.days[d];
  const after = p.proposed.days[d];

  // "Both directions" only where the circle really caught both of every
  // route's; otherwise the honest clause, on either network's evidence.
  const oneWay = before.one_direction_routes?.length
    || after.one_direction_routes?.length;

  return `
    ${headlineHTML(before, after, d, withinWalk(p.radius),
                   { directions: oneWay ? ONE_OR_BOTH_DIRECTIONS
                                        : BOTH_DIRECTIONS })}

    <div class="tiers">${tierBadge(before.hourly, after.hourly)}</div>

    ${periodTableHTML(before, after)}
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
      <span><i class="sw-walk"></i> the ${p.radius} m walk</span>
      <span><i class="sw-pin"></i> where you clicked</span>
    </div>
    <div class="key-note">A stop both networks keep draws as an ink dot in an
      orange ring; a dashed line joins a pole the plan moves to where it stands
      today. Two marks with no line are a renumbering.</div>

    <dl class="facts">
      ${serviceFactsRows(before, after)}
      ${oneDirectionFact(before, after)}
      <dt>Stops within ${p.radius} m</dt>
      ${compare(String(p.current.stops.length), String(p.proposed.stops.length))}
      ${removedStopsFact(p.current.stops)}
      ${newPlacesFact(p.proposed.stops)}
      ${boardingsFact(before.boardings, d, withinWalk(p.radius))}
    </dl>
    ${boardingsNote(before.boardings)}

    ${middle}

    ${residentsBlock(p.population)}

    ${routesBlockHTML(before, after, 'Routes serving this spot')}`;
}

/**
 * Whether the panel leads with the stop under the click.
 *
 * True only in the views that actually draw a stop for a reader to have
 * clicked — Stop-by-stop and the combined view. Surface, Streets, one-seat,
 * travel time and Places ask questions with no kerb in them, and a stop
 * headline there would answer something the map on screen is not showing.
 * The other half of the test is the server's: `kerb` is null where no pole
 * stands within 25 m, decided on the ground rather than by a screen hit, so
 * an `at=` link opens the same panel at every zoom.
 */
export interface PanelScope { withKerb?: boolean }

/**
 * The whole panel for a clicked point, as HTML.
 *
 * Separate from `render` so the block order can be tested without a DOM,
 * which is how everything else in this module is checked.
 */
export function panelHTML(p: PlaceResult, d: Day,
                          { withKerb = false }: PanelScope = {}): string {
  const kerb = withKerb ? p.kerb ?? null : null;
  // The place head carries the radius only when it is the panel's one scope.
  // Hung over a kerb headline it would label the wrong number -- the trap
  // this whole change is about, one line further up.
  const where = kerb
    ? `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`
    : `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} · within ${p.radius} m`;
  return `
    <div class="place-head">
      <h2>${esc(placeLabel(p))}</h2>
      <div class="muted">${where}</div>
    </div>
    ${kerb ? kerbBlockHTML(kerb, d) : ''}
    ${kerb ? `<h3 class="scope-head">Within a ${p.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>` : ''}
    ${serviceBodyHTML(p, d, oneSeatBlock(p.oneseat ?? [], p.oneseat_day ?? 'any'))}`;
}

export function render(p: PlaceResult, scope: PanelScope = {}) {
  document.getElementById('panel')!.innerHTML = panelHTML(p, day, scope);
}
