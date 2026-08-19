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
import { Day, ChangeLayer } from './types';
import { STYLE, countInBounds, isHidden } from './change';

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

export function renderLegend(
  el: HTMLElement, layer: ChangeLayer, day: Day,
  bounds: { west: number; south: number; east: number; north: number },
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
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`;
}
