/**
 * The legend, which is also the summary and also the filter.
 *
 * It carries the counts for what is currently on screen, so panning the map is
 * the interaction rather than clicking dots one at a time: "in view, 41
 * locations lose all service and 88 at least double" is the sentence a reader
 * wants for their own neighbourhood, and it is a sentence they can screenshot.
 *
 * Counts are of LOCATIONS, never of people, and the wording says so. A dot is
 * a place where a bus stops, not the ridership at it — 5,751 of them carry a
 * boardings figure, and weighting the map by that figure is a different map
 * with a different caveat (PRT's own disclaimer puts the stop-level numbers up
 * to 30% low).
 */
import { esc } from './utils';
import {
  Day, ChangeLayer, SurfaceLayer, CorridorLayer, CorridorKlass, OneSeatLayer,
} from './types';
import { STYLE, countInBounds, isHidden } from './change';
import {
  RAMP, GONE_COLOR, NEW_COLOR, summariseInBounds,
} from './surface';
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

/**
 * The surface's key and in-view area, when the surface is on screen.
 *
 * A continuous strip rather than a list of swatches, deliberately: swatches
 * would imply the ramp has categories, and the categories in this app are
 * published criteria with counts behind them. The two steps below the strip
 * are the exceptions — losing all service and gaining service where there was
 * none are outcomes, not points on a scale.
 *
 * The area line reports km2 and says "of ground", because the whole hazard of
 * an area map is being read as a population map: a square kilometre of
 * hillside paints exactly like a square kilometre of Brookline.
 */
export function surfaceKey(
  layer: SurfaceLayer, day: Day,
  bounds: { west: number; south: number; east: number; north: number },
) {
  const cellKm2 = (layer.cell_m * layer.cell_m) / 1e6;
  const km = summariseInBounds(
    layer.cells, layer.days.indexOf(day),
    bounds.west, bounds.south, bounds.east, bounds.north,
    layer.origin, cellKm2);
  const n = (v: number) => v.toFixed(v < 10 ? 1 : 0);
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
      <div class="lg-area">
        <span><b>${n(km.gone)}</b> km² lose all service</span>
        <span><b>${n(km.less)}</b> km² less</span>
        <span><b>${n(km.more)}</b> km² more</span>
        <span><b>${n(km.new)}</b> km² new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
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
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't —
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`;
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
      } at both ends — <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`
    : `No day type enters this — a route serves a place or it doesn't — so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;

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
      ${dayNote} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`;
}

/**
 * The key for the four marks a click puts on the map: the pin, the walk
 * circle, and one dot per stop in each network.
 *
 * It sits under the layer key rather than in the panel because that is where a
 * reader looks to ask what a colour on the map means, and unlike everything
 * above it, these marks are the same in every view that answers at a point.
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
    <span><i class="sw-prop"></i>stop proposed</span>`;
}

export function renderLegend(
  el: HTMLElement, layer: ChangeLayer, day: Day,
  bounds: { west: number; south: number; east: number; north: number },
  surface?: SurfaceLayer | null,
) {
  const keys = layer.buckets.map((b) => b.key);
  const counts = countInBounds(
    layer.points, layer.days.indexOf(day), keys,
    bounds.west, bounds.south, bounds.east, bounds.north);

  const shown = visible(layer);
  const total = shown.reduce((n, b) => n + counts[b.key], 0);

  el.innerHTML = `
    <div class="lg-head">
      <b>${total.toLocaleString()}</b> locations in view
      <span class="muted">· ${DAY_WORD[day]} · ${layer.radius} m walk</span>
    </div>
    ${shown.map((b) => `
      <button class="lg-row ${isHidden(b.key) ? 'off' : ''}" data-bucket="${esc(b.key)}"
              aria-pressed="${!isHidden(b.key)}">
        <i style="background:${STYLE[b.key]?.color ?? '#666'}"></i>
        <span class="lg-lab">${esc(b.label)}</span>
        <span class="lg-n">${counts[b.key].toLocaleString()}</span>
      </button>`).join('')}
    ${surface ? surfaceKey(surface, day, bounds) : ''}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`;
}
