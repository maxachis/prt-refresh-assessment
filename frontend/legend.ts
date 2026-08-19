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
import { Day, ChangeLayer, SurfaceLayer } from './types';
import { STYLE, countInBounds, isHidden } from './change';
import {
  RAMP, GONE_COLOR, NEW_COLOR, summariseInBounds,
} from './surface';

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
