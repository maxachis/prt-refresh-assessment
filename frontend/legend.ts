/**
 * The legend, which is also the summary and also the filter.
 *
 * It carries the counts for what is currently on screen, so panning the map is
 * the interaction rather than clicking dots one at a time: "in view, 41
 * locations lose all service and 88 at least double" is the sentence a reader
 * wants for their own neighbourhood, and it is a sentence they can screenshot.
 *
 * Counts are of LOCATIONS unless the reader asks for riders, and the wording
 * always says which. A dot is a place where a bus stops, not the ridership at
 * it; 6,075 of the 6,284 published dots carry a boardings figure (209 are
 * UNKNOWN, never zero), and counting those instead is a second denominator
 * over the same dots rather than a correction to the first (convention 15).
 * The two answer the same question in opposite tones — 633 locations
 * stranded, 0.8% of boardings — so the switch between them is
 * visible in the key and the caveats travel with the number rather than
 * sitting in the methods list.
 */
import { esc } from './utils';
import {
  Day, ChangeLayer, SurfaceLayer, CorridorLayer, CorridorKlass, OneSeatLayer,
  Weight, SurfaceUnit, PopulationLayer,
} from './types';
import {
  STYLE, countIn, countNewPlacesIn, NEW_PLACE_KEY, countRemovedIn, REMOVED_KEY,
  sumRidersIn, isHidden, viewportScope, selectionScope,
} from './change';
import {
  RAMP, GONE_COLOR, NEW_COLOR, summariseInBounds,
} from './surface';
import { summarisePopulationInBounds } from './population';
import { KLASS_COLOR, pavementPct } from './corridor';
import {
  STATUS_STYLE, STATUS_ORDER, countInBounds as countOneSeatInBounds,
  destinationLabel, ANY_DAY,
} from './oneseat';

const DAY_WORD: Record<Day, string> = {
  weekday: 'a weekday',
  saturday: 'a Saturday',
  sunday: 'a Sunday',
};

/**
 * Buckets in reading order, worst first.
 *
 * `none` is dropped: a location with no bus on either side on this day type is
 * not an outcome of the plan, and listing it would put "no service either way"
 * beside the real findings as though it were one.
 */
function visible(layer: ChangeLayer) {
  return layer.buckets.filter((b) => b.key !== 'none');
}

const UNIT_LABEL: Record<SurfaceUnit, string> = { area: 'Ground', people: 'People' };

/**
 * The area line's four figures, in km², labelled "of ground" — convention
 * 10's warning made explicit: a square kilometre of hillside paints exactly
 * like a square kilometre of Brookline.
 */
function areaLines(
  layer: SurfaceLayer, day: Day,
  bounds: { west: number; south: number; east: number; north: number },
) {
  const cellKm2 = (layer.cell_m * layer.cell_m) / 1e6;
  const km = summariseInBounds(
    layer.cells, layer.days.indexOf(day),
    bounds.west, bounds.south, bounds.east, bounds.north,
    layer.origin, cellKm2);
  const n = (v: number) => v.toFixed(v < 10 ? 1 : 0);
  return `
      <div class="lg-area">
        <span><b>${n(km.gone)}</b> km² lose all service</span>
        <span><b>${n(km.less)}</b> km² less</span>
        <span><b>${n(km.more)}</b> km² more</span>
        <span><b>${n(km.new)}</b> km² new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`;
}

/**
 * The area line's population counterpart — the same in-view test, but
 * residents rather than square kilometres, and PopulationLayer's own four
 * classes rather than the ramp's outcomes (lost/gained/kept/none, not
 * gone/less/more/new). Nothing paints during the fetch, so a caller with no
 * layer yet gets a muted "loading…" rather than a row of zeroes that would
 * read as a finding — nobody has lost or gained anything, the data simply
 * has not arrived.
 */
function populationLines(
  day: Day,
  bounds: { west: number; south: number; east: number; north: number },
  population: PopulationLayer | null | undefined,
) {
  const note = '<div class="lg-ends" style="margin-top:4px">where people live '
    + 'in view — 2020 census, counted at home, not where they board</div>';
  if (!population) {
    return `<div class="lg-area"><span class="muted">loading…</span></div>${note}`;
  }
  const people = summarisePopulationInBounds(
    population.cells, population.days.indexOf(day),
    bounds.west, bounds.south, bounds.east, bounds.north, population.origin);
  const n = (v: number) => Math.round(v).toLocaleString();
  return `
      <div class="lg-area">
        <span><b>${n(people.lost)}</b> people lose all service</span>
        <span><b>${n(people.gained)}</b> gain service</span>
        <span><b>${n(people.kept)}</b> keep a bus</span>
        <span><b>${n(people.none)}</b> have no bus either way</span>
      </div>
      ${note}`;
}

/**
 * What the surface's numbers say when the reader has painted a selection.
 *
 * They say nothing, and say so. Ground and people are measured over 100 m
 * cells, which have no stops to be selected: leaving them counting the
 * viewport while the dots above them counted 42 painted stops would put two
 * different scopes in one key, one of them silently — the same trap
 * docs/worklog/the-site-has-two-numbers-that-look-like-people.md is about, at
 * a smaller scale. So the ramp stays (it is a key, and still true of what is
 * painted) and the figures go.
 */
const SCOPED_SURFACE_NOTE = `
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected — a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;

/**
 * The surface's key and in-view figures, when the surface is on screen.
 *
 * A continuous strip rather than a list of swatches, deliberately: swatches
 * would imply the ramp has categories, and the categories in this app are
 * published criteria with counts behind them. The two steps below the strip
 * are the exceptions — losing all service and gaining service where there was
 * none are outcomes, not points on a scale.
 *
 * Below the strip is a second switch, Ground vs People — the same idea as the
 * change legend's Locations/Riders switch, and for the same reason
 * (convention 15): the surface can report square kilometres or residents over
 * the identical cells, and neither is a correction to the other, so the
 * reader is told which one they are looking at rather than left to assume.
 */
export function surfaceKey(opts: {
  layer: SurfaceLayer;
  day: Day;
  bounds: { west: number; south: number; east: number; north: number };
  unit: SurfaceUnit;
  population?: PopulationLayer | null;
  /** Whether a painted selection has narrowed the counts above this key. */
  scoped?: boolean;
}) {
  const { layer, day, bounds, unit, population, scoped = false } = opts;
  const gradient = RAMP.map(([stop, color]) =>
    `${color} ${((stop + 2) / 4 * 100).toFixed(1)}%`).join(', ');

  return `
    <div class="lg-ramp">
      <div class="lg-lab">Surface — buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${gradient})"></div>
      <div class="lg-ends"><span>¼ or less</span><span>same</span><span>4× or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${GONE_COLOR}"></i>loses all service</span>
        <span><i style="background:${NEW_COLOR}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${(Object.keys(UNIT_LABEL) as SurfaceUnit[]).map((u) => `
          <button data-surface-unit="${u}" aria-pressed="${unit === u}"
                  class="${unit === u ? 'active' : ''}">${UNIT_LABEL[u]}</button>`).join('')}
      </div>
      ${scoped ? SCOPED_SURFACE_NOTE
                : unit === 'people' ? populationLines(day, bounds, population)
                                    : areaLines(layer, day, bounds)}
    </div>`;
}

const CORRIDOR_ORDER: CorridorKlass[] = ['lost', 'added', 'kept'];

const CORRIDOR_LABEL: Record<CorridorKlass, string> = {
  lost: 'loses its bus',
  added: 'gains a bus',
  kept: 'keeps its bus',
};

/** Plain day names for the corridor header -- "weekday", not "a weekday". */
const CORRIDOR_DAY_LABEL: Record<Day, string> = {
  weekday: 'weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/**
 * The corridor legend: three swatches, citywide kilometres, and the loss and
 * gain as a share of today's pavement.
 *
 * Every other legend in this app counts what's in view, because panning is
 * the interaction. This one can't: the API has no radius or bounds parameter
 * and hands back the whole city's kilometres for the day type asked for, so
 * summing only the runs currently on screen would silently redefine what the
 * number means relative to the dots and the surface. Said explicitly rather
 * than left for the reader to assume from the other two views.
 */
export function renderCorridorLegend(el: HTMLElement, layer: CorridorLayer) {
  const { lostPct, addedPct } = pavementPct(layer.km);
  const n = (v: number) => v.toFixed(1);
  const total = layer.km.kept + layer.km.lost + layer.km.added;
  const totalStr = total.toLocaleString(undefined,
    { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  el.innerHTML = `
    <div class="lg-head">
      <b>${totalStr}</b> km of street, citywide — ${CORRIDOR_DAY_LABEL[layer.day]}
    </div>
    ${CORRIDOR_ORDER.map((k) => `
      <div class="lg-row lg-static">
        <i style="background:${KLASS_COLOR[k]}"></i>
        <span class="lg-lab">${esc(CORRIDOR_LABEL[k])}</span>
        <span class="lg-n">${n(layer.km[k])} km</span>
      </div>`).join('')}
    <div class="lg-area">
      <span><b>${n(lostPct)}%</b> of today's pavement lost</span>
      <span><b>${n(addedPct)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A street either has a bus on it or it doesn't, so
      there is no walk radius here. A street can lose its only bus while the
      block beside it keeps one: for what a rider can still reach on foot, see
      Stop-by-stop or Surface.</div>`;
}

/**
 * The one-seat legend: five statuses, counted in view, with the destination in
 * the header.
 *
 * Two things it has to say that no other legend here does.
 *
 * WHICH DAY IT ANSWERED FOR, IF ANY. By default this is not a day-type answer
 * at all: a route serves a place or it does not, which is the published
 * method, and a reader who has been switching Weekday/Saturday all session
 * will otherwise assume the day control governs this too. When they do
 * restrict it to a day, the legend has to say so twice over -- which day, and
 * that those counts are no longer the published ones -- because the number
 * beside "loses its one-seat ride" is the thing that gets quoted. The honest
 * consequence of either -- a surviving ride may be hourly -- is the footnote.
 *
 * IT COUNTS RAIL. Said out loud because every other number on this screen
 * excludes it, and a reader comparing the two would otherwise be comparing
 * different universes without being told.
 */
export function renderOneSeatLegend(
  el: HTMLElement, layer: OneSeatLayer,
  bounds: { west: number; south: number; east: number; north: number },
) {
  const keys = layer.statuses.map((s) => s.key);
  const counts = countOneSeatInBounds(
    layer.points, keys, bounds.west, bounds.south, bounds.east, bounds.north);
  const label = (k: string) => layer.statuses.find((s) => s.key === k)?.label ?? k;
  const total = STATUS_ORDER.reduce((n, k) => n + (counts[k] ?? 0), 0);
  const to = destinationLabel(layer);
  const restricted = layer.day && layer.day !== ANY_DAY;
  const dayNote = restricted
    ? `Restricted to routes running on ${DAY_WORD[layer.day as Day]
      } at both ends — <b>not</b> the published answer, which counts a route
      calling here on any calendar.`
    : `No day type enters this, as published — a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;

  el.innerHTML = `
    <div class="lg-head">
      One-seat ride to <b>${esc(to)}</b>
      <span class="muted">· ${total.toLocaleString()} locations in view
      · ${layer.radius} m walk${restricted
        ? ` · ${DAY_WORD[layer.day as Day]}` : ' · any day'}</span>
    </div>
    ${STATUS_ORDER.map((k) => `
      <div class="lg-row lg-static">
        <i style="background:${STATUS_STYLE[k].color}"></i>
        <span class="lg-lab">${esc(label(k))}</span>
        <span class="lg-n">${(counts[k] ?? 0).toLocaleString()}</span>
      </div>`).join('')}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${STATUS_ORDER.map((k) =>
        `${(layer.counts[k] ?? 0).toLocaleString()} ${esc(label(k))}`).join(' · ')}
    </div>
    <div class="lg-foot">Can a rider reach ${esc(to)} without transferring?
      ${dayNote} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines — without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`;
}

/**
 * The key for the four marks a click puts on the map: the pin, the walk
 * circle, and one dot per stop in each network.
 *
 * It sits under the layer key rather than in the panel because that is where a
 * reader looks to ask what a colour on the map means, and unlike everything
 * above it, these marks are the same in every view that answers at a point.
 *
 * Three stop swatches, not two. The map draws each network's stops
 * independently, so a location both networks stop at is not a third colour
 * but the two marks on top of each other -- a blue dot inside an orange ring
 * -- and inside a walk circle that is usually the commonest mark there. A key
 * with only the two ingredients leaves the reader to derive it, and the
 * derivation they are likelier to make is that something has been drawn
 * twice. It says "same spot" because that is the condition: PRT renumbers and
 * nudges stops across intersections, and a kept stop moved twenty metres
 * draws as two separate dots, correctly.
 *
 * Swatches only, deliberately. What the marks *mean* -- that two stop
 * inventories are drawn over the same ground, and that a stop both networks
 * keep draws as one mark rather than two -- stays in the panel beside the
 * stop count it explains, so there is one explanation rather than two of
 * different lengths that drift apart.
 *
 * The heading is the exception to swatches-only, and it is load-bearing: the
 * layer keys above use a red and a blue of their own (losing all service,
 * gaining it), so without a line saying this group is about the pin, one box
 * would carry two reds meaning different things. That collision is already on
 * the map -- a red pin lands among red dots -- but a key that reproduced it
 * silently would be the place a reader gets it wrong.
 */
export function pinKeyHTML(radius: number) {
  return `
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${radius} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`;
}

/**
 * The head line's subject, which is also what the toggle switches.
 *
 * "3 locations in view" and "525 weekday boardings in view" are the same dots
 * counted two ways, and the wording has to make which one is on screen
 * impossible to miss — a reader who screenshots the wrong one has quoted a
 * different finding than they think.
 */
const WEIGHT_LABEL: Record<Weight, string> = {
  locations: 'Locations',
  riders: 'Riders',
};

/**
 * The caveats that travel with a boardings figure, in the legend itself.
 *
 * Not in the methods list, where the other caveats live: this one changes what
 * the number on screen means rather than qualifying it, and the number is
 * designed to be screenshotted. All three are convention 15.
 *
 * Two different absences, and running them together was the old defect. A
 * location the plan adds a stop to CANNOT carry a boardings figure -- no bus
 * stops there, so nobody has boarded there -- and it is now a hollow dot with
 * its own row above, so this line names it as the reason the whole weighting
 * is one-sided. A stop that stands today and has no figure is a gap in the
 * usage extract, which is a smaller and duller fact; it is held out of every
 * bucket total rather than added as a zero, and it is said second.
 */
function riderFoot(unmeasured: number, newPlaces: number) {
  const n = newPlaces.toLocaleString();
  const places = `${n} location${newPlaces === 1 ? '' : 's'} in view`;
  const gain = newPlaces === 1 ? 'gains' : 'gain';
  const gains = newPlaces
    ? `<b>${places}</b> ${gain} a stop where none stands today: no boardings to `
      + 'weigh. This counts what is at risk, never what is gained.'
    : 'Boardings exist only where a bus stops today, so this counts what is at '
      + 'risk, never what is gained.';
  const gaps = unmeasured
    ? ` ${unmeasured.toLocaleString()} stop${unmeasured === 1 ? ' has' : 's have'}`
      + ' no figure in the extract, and are left out rather than counted as none.'
    : '';
  // Its own class because the phone layout hides `.lg-foot` for room: this
  // one is not a footnote, it is what the number above it means, and the
  // stylesheet exempts it by name.
  return `<div class="lg-foot lg-foot-riders">${gains}${gaps}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`;
}

/**
 * Why a street the plan adds stops to can have no dot on it.
 *
 * The point set is every stop a bus calls at today, plus the proposed stops
 * with nothing within the walk radius today (`query.change_points`). Infill --
 * a stop the plan adds a couple of hundred metres from one that already exists
 * -- earns neither, so the gain lands in the colour of the neighbouring dot
 * and the new stop's own kerb stays bare. That is the honest drawing of a
 * walk-access question, and it reads as an omission: two separate readers,
 * PPT and PRT, have now taken bare ground beside a recoloured dot as the
 * plan's new service missing from the data.
 *
 * The first sentence has to name both halves of that set, not just the stops
 * that exist today. The blue bucket a row above is precisely the half that
 * does not sit at a stop today, so "a dot sits where a bus stops today" would
 * be contradicted by the key it is printed under -- and a reader who noticed
 * would be right to trust the rest of the box less.
 *
 * In both weightings, unlike the caveats above it. A rider counting boardings
 * is likelier to make this reading than one counting dots, not less, because
 * the added stops have no boardings either and so cannot show up in the tally
 * at all.
 *
 * It names Streets because that view answers the question this one raises --
 * McMonagle Avenue has no dot and draws blue there -- and a caveat that only
 * says what the map cannot show leaves the reader where it found them.
 *
 * The threshold it names is 150 m, not the walk radius, and the difference is
 * the whole of what changed on 2026-09-08: a dot is its own place when no
 * stop stands within a SHORT walk of it, which is a question about poles, and
 * not when nothing serves it within a QUARTER MILE, which is a question about
 * access. At the old threshold 400 of the 521 stops the plan adds drew no
 * mark and McMonagle Avenue looked untouched.
 */
function infillFoot() {
  return `<div class="lg-foot">Dots mark today's stops, plus the places the plan
    puts a stop where none stands within 150 m. A stop the plan takes away is
    drawn as a cross instead of a colour — for what the buses near it do, read
    the dots around it. A stop added right beside an existing one changes a
    dot's colour rather than adding one; Streets colours the pavement itself,
    and shows the rest.</div>`;
}

/**
 * What a removed stop does and does not mean, printed under the mark's row.
 *
 * The row above says how many stops in view the plan takes away. Left at that,
 * the natural reading is that each one is a corner losing its bus, and the
 * numbers say otherwise: of the 972 stops the plan removes countywide, 245
 * have another stop inside a 400 m walk and 193 more inside 800 m. The 534
 * with nothing inside 800 m are the ones worth the alarm, and they only read
 * as alarming if the other 438 are not counted alongside them.
 *
 * Countywide rather than in view, and it says so, because the split is a fact
 * about the plan rather than about the reader's viewport. The panel prints the
 * walk to the replacement for the stops beside a click, which is where the
 * in-view version of this question gets answered.
 *
 * The distances are walks over the pedestrian network (`refresh.walking`), not
 * straight lines -- the river and the hillsides make those two different
 * numbers here, and it is the walk a rider actually makes.
 */
function removedFoot(n: number) {
  if (!n) return '';
  return `<div class="lg-foot">A removed stop is not the same as a corner
    losing its bus: countywide, of the 972 stops the plan removes, 245 have
    another stop within a 400 m walk and 193 more within 800 m. The remaining
    534 have none.</div>`;
}

/**
 * The key for the dots drawn hollow: places the plan puts a stop where none
 * stands within 150 m today.
 *
 * A row, not a sentence, because this is a mark on the map and every other
 * mark on the map has a swatch here. Prose was where it started and it was the
 * wrong place: a reader who meets an unfamiliar mark looks at the key.
 *
 * WHY IT IS NOT A BUCKET, and why it took three tries to get here. These dots
 * used to carry a bucket colour with a ring drawn round them, so Grant Avenue
 * in Millvale read "doubled or better" AND "no stop within 150 m today" at
 * once. Max called that incongruous on 2026-09-08 and it is: both marks are
 * true and they measure different footprints -- the colour is every bus within
 * a QUARTER MILE, the ring is the pole itself -- and a key naming only one
 * distance leaves the reader to resolve a contradiction that was never there.
 * So the colour goes. A location with no stop today has no service today to
 * compare against, which is exactly what the buckets compare; it is a category
 * of dot, not a seventh outcome, and it is counted here rather than there.
 *
 * WHY HOLLOW AND NOT AN EIGHTH COLOUR. That was the intent, and the palette is
 * full. Searching the colours that hold the basemap contrast band the ramp
 * uses (2.9-4.2 against Positron), the best separation any candidate reaches
 * from all seven existing inks -- measured across normal vision and the three
 * dichromacies with `cvd.deltaE` -- is 14.6, against the 40 the ramp's own
 * sign-crossing pairs are held to, and its nearest neighbour is the `new`
 * blue, the one dot it must never be confused with. Going darker buys
 * separation (a near-black navy reaches 37.9) at 15:1 contrast, which would
 * make the plan's added stops the loudest mark on a map that also shows 633
 * locations losing every bus -- overstating gains, which this repo forbids.
 * The fill channel is free and carries no position on a loss-gain ramp: a
 * filled dot is a stop that stands today, a hollow one is a stop the plan
 * adds. It survives every colour deficiency because it is not a colour.
 *
 * WHAT THE ROW GIVES UP. These dots no longer report what happens to the
 * buses within a walk of them, and for 137 of the weekday 258 at 400 m that
 * was a real reading: 14 sit where the plan is ALSO thinning service, Mt Royal
 * Blvd opposite Ebonhurst Manor going from 42 buses within a quarter mile to
 * 10. The trade is that the reading was never legible while it contradicted
 * the mark beside it. Streets and the answer panel still carry it.
 *
 * IT IS A SWITCH, unlike the ring it replaces. The ring annotated a dot that
 * stayed on screen, so hiding it would have hidden a fact about a visible dot;
 * these ARE dots, in no bucket, so they answer to their own toggle
 * (`change.NEW_PLACE_KEY`) exactly as every colour does. They also join the
 * head line's total, because they are locations in view that no coloured row
 * counts.
 *
 * The row is dropped when the scope holds none, and unlike the bucket rows
 * above it does not stay at zero: a reader cannot tell "does not happen here"
 * from "cannot happen here" for a category that has no counterfactual, and an
 * empty row would invite the first reading. At the 150 m walk setting these
 * are also every dot in the `new` bucket, because there "no bus nearby" and
 * "no pole nearby" are the same sentence.
 */
function newPlaceRow(n: number) {
  if (!n) return '';
  const off = isHidden(NEW_PLACE_KEY);
  return `
    <button class="lg-row ${off ? 'off' : ''}" data-bucket="${NEW_PLACE_KEY}"
            aria-pressed="${!off}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${n.toLocaleString()}</span>
    </button>`;
}

/**
 * The stops the plan takes away — a mark, under the marks heading.
 *
 * SEPARATED FROM THE COLOUR ROWS ON PURPOSE, and since 2026-09-09 the
 * separation is exclusive: these dots are counted HERE AND NOWHERE ELSE. A
 * stop the plan removes is drawn as a cross instead of a coloured dot, so the
 * rows above describe the stops that stay and this row describes the stops
 * that go. The column adds up, which is the whole reason Max asked for it —
 * the two channels on one dot produced stops that were crossed out and
 * coloured "new service" on the same Saturday.
 *
 * The heading survives that change because the mark is still not an outcome:
 * "the plan removes this stop" is a fact about the pole, and what the buses
 * nearby do is on screen in the dots around it rather than in this row.
 *
 * It DOES follow the Riders switch, unlike before. With these dots out of the
 * buckets, a key counting boardings would otherwise drop the riders at every
 * stop PRT is removing — the most at-risk figure the view has — from both the
 * rows and the head total.
 */
function removedRow(n: number, cell: string) {
  if (!n) return '';
  const off = isHidden(REMOVED_KEY);
  return `
    <button class="lg-row ${off ? 'off' : ''}" data-bucket="${REMOVED_KEY}"
            aria-pressed="${!off}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${cell}</span>
    </button>`;
}

/**
 * The two marks, under one heading: what becomes of the stop itself.
 *
 * They belong together because they are the same question with two answers --
 * the plan puts a pole here, the plan takes this one away -- and that question
 * is not the one the coloured rows above answer. Split across the key, the ring
 * read as an eighth outcome and the cross as a seventh; under one heading, the
 * key says plainly that it counts in two channels: colour for the buses within
 * a walk, mark for the pole. Max asked for this on 2026-09-09.
 *
 * The heading appears only when at least one of the two marks is in scope, and
 * each row drops out on its own when its own count is zero.
 */
function marksBlock(newPlaces: number, removed: number, removedCell: string) {
  if (!newPlaces && !removed) return '';
  return `
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${newPlaceRow(newPlaces)}
      ${removedRow(removed, removedCell)}
    </div>`;
}

export interface LegendOptions {
  layer: ChangeLayer;
  day: Day;
  bounds: { west: number; south: number; east: number; north: number };
  /** Locations, or the riders who board at them. */
  weight: Weight;
  surface?: SurfaceLayer | null;
  /** Ground, or the people who live on it. Only meaningful with `surface`. */
  unit?: SurfaceUnit;
  /** The surface's population reading; absent until it has been fetched. */
  population?: PopulationLayer | null;
  /**
   * The dots the reader has painted, if any.
   *
   * A non-empty set replaces the viewport as the scope of every count here,
   * and the head line says so rather than leaving "in view" over a number
   * that is no longer of the view. Nothing else about the counting changes:
   * a bucket hidden in the key still reports its total, and a stop with no
   * ridership record is still named rather than added as a zero.
   */
  selection?: ReadonlySet<string> | null;
}

export function renderLegend(el: HTMLElement, opts: LegendOptions) {
  const {
    layer, day, bounds, weight, surface, unit = 'area', population, selection,
  } = opts;
  const keys = layer.buckets.map((b) => b.key);
  const dayIndex = layer.days.indexOf(day);
  const { west, south, east, north } = bounds;
  const shown = visible(layer);

  const painted = selection && selection.size > 0 ? selection : null;
  const scope = painted
    ? selectionScope(painted) : viewportScope(west, south, east, north);

  const counts = countIn(layer.points, dayIndex, keys, scope);
  const newPlaces = countNewPlacesIn(layer.points, scope);
  const removed = countRemovedIn(layer.points, scope);
  const tally = weight === 'riders'
    ? sumRidersIn(layer.points, dayIndex, keys, scope)
    : null;

  // An em dash, not a 0: a bucket whose locations in view all lack a ridership
  // record has nothing to report, which is not the same as reporting nothing.
  const cell = (key: string) => (tally
    ? (tally.measured[key] ? Math.round(tally.riders[key]).toLocaleString() : '—')
    : counts[key].toLocaleString());
  // The same rule for the cross's row: an em dash where the usage extract has
  // no figure for any removed stop in scope, never a 0.
  const removedCell = tally
    ? (tally.removedMeasured
        ? Math.round(tally.removedRiders).toLocaleString() : '—')
    : removed.toLocaleString();

  // Not "weekday boardings": the muted suffix beside it already names the day
  // type, and the head line is the one that gets screenshotted, so saying it
  // twice costs the room the caveat needs.
  // "at N stops you selected", not "in view": a painted scope is the one
  // thing on this key nobody else can reproduce by looking at the same
  // screen, so the number never appears without saying it was hand-picked.
  const where = painted
    ? `at ${painted.size.toLocaleString()} selected stop${painted.size === 1 ? '' : 's'}`
    : 'in view';
  // Every dot in scope: coloured, hollow or crossed. Neither the added places
  // nor the removed stops are in a bucket, so a total built from the coloured
  // rows alone would undercount what is on screen. The boardings total gains
  // the removed stops and never the added places -- riders at a stop PRT is
  // taking away are observed, riders at a stop nobody has boarded cannot be
  // (convention 15).
  const locations = shown.reduce((n, b) => n + counts[b.key], 0)
    + newPlaces + removed;
  const head = tally
    ? `<b>${Math.round(shown.reduce((n, b) => n + tally.riders[b.key], 0)
        + tally.removedRiders)
        .toLocaleString()}</b> daily boardings ${where}`
    : painted
      ? `<b>${locations.toLocaleString()}</b>
         of ${painted.size.toLocaleString()} selected stops`
      : `<b>${locations.toLocaleString()}</b>
         locations in view`;

  el.innerHTML = `
    <div class="lg-head">
      ${head}
      <span class="muted">· ${DAY_WORD[day]} · ${layer.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${(Object.keys(WEIGHT_LABEL) as Weight[]).map((w) => `
        <button data-weight="${w}" aria-pressed="${weight === w}"
                class="${weight === w ? 'active' : ''}">${WEIGHT_LABEL[w]}</button>`).join('')}
    </div>
    ${shown.map((b) => `
      <button class="lg-row ${isHidden(b.key) ? 'off' : ''}" data-bucket="${esc(b.key)}"
              aria-pressed="${!isHidden(b.key)}">
        <i style="background:${STYLE[b.key]?.color ?? '#666'}"></i>
        <span class="lg-lab">${esc(b.label)}</span>
        <span class="lg-n">${cell(b.key)}</span>
      </button>`).join('')}
    ${marksBlock(newPlaces, removed, removedCell)}
    ${surface ? surfaceKey({
      layer: surface, day, bounds, unit, population, scoped: !!painted,
    }) : ''}
    ${tally ? riderFoot(tally.unmeasured, newPlaces) : `
    <div class="lg-foot">Buses per day within the walk radius, both
      directions — counting locations, not riders.</div>`}
    ${infillFoot()}
    ${removedFoot(removed)}
    ${painted ? `
    <div class="lg-foot">The stops you painted, not everything on screen —
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>` : ''}`;
}
