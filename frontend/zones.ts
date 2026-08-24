/**
 * The on-demand zones — an overlay, not a sixth view.
 *
 * Every other layer on this map measures fixed-route service, and none of them
 * can see an on-demand zone: a zone has no stops and no timetable, so ground
 * inside one whose bus is withdrawn is painted as a total loss by the dots,
 * the surface and the streets alike. 23% of the area losing all fixed-route
 * service is inside a zone. Drawing that ground solid red with nothing over it
 * is a half-truth a reader would repeat, and PRT would be right to object.
 *
 * Three decisions follow, and each is about not overcorrecting:
 *
 *  - IT IS AN OVERLAY, SO IT SITS ON TOP OF THE LOSS RATHER THAN REPLACING IT.
 *    A separate view would let a reader see the zones *instead of* the change,
 *    which is the mirror-image error: it would answer "what does the plan
 *    offer here" while hiding "what does it take away". Both have to be on
 *    screen together or neither claim is safe.
 *  - NOTHING IS NETTED OFF. No count, percentage or bucket anywhere in the app
 *    changes when this is switched on. A zone is not coverage — it is an offer
 *    of a van — and the moment a zone cancels a loss in a number, the number
 *    has silently decided a question the reader should be deciding.
 *  - THE VEHICLE COUNT IS PART OF THE LABEL, NOT A DETAIL BEHIND ONE. One to
 *    three vans for 15-48 km2, 7am-9pm, is the whole difference between a
 *    replacement and a fallback, and a zone drawn as a plain shaded blob
 *    implies the former. So the count leads the popup, and the legend note
 *    carries it citywide.
 *
 * COLOUR sits outside the change palette on purpose. Red means gone and blue
 * means gained everywhere else on this map; an amber or orange zone would read
 * as a third value on that same scale — "partly gone" — which is exactly the
 * netting-off this layer refuses to do. Violet belongs to no scale here, so it
 * reads as an annotation over the data rather than as more data.
 */
import { OnDemandLayer, OnDemandZone, OnDemandTotals } from './types';
import { fetchJSON, esc } from './utils';

const SRC = 'ondemand';
const FILL = 'ondemand-fill';
const LINE = 'ondemand-line';

/** Outside the red/blue change scale on purpose — see the module docstring. */
export const ZONE_COLOR = '#7c5cd6';

let data: OnDemandLayer | null = null;
let visible = false;

export function layerData(): OnDemandLayer | null {
  return data;
}

export function isVisible(): boolean {
  return visible;
}

/** One MultiPolygon feature per zone, coordinates passed through unchanged. */
export function toGeoJSON(layer: OnDemandLayer) {
  return {
    type: 'FeatureCollection' as const,
    features: layer.zones.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'MultiPolygon' as const, coordinates: z.geometry },
      properties: {
        name: z.name,
        vehicles_weekday: z.vehicles_weekday,
        weekday_hours: z.weekday_hours,
        zone_km2: z.zone_km2,
        lost_km2_inside: z.lost_km2_inside,
      },
    })),
  };
}

/** "3 vans" / "1 van", or an honest blank when the plan file gives no count. */
export function vanCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'an unstated number of vehicles';
  return n === 1 ? '1 vehicle' : `${n} vehicles`;
}

/**
 * The hover label for one zone.
 *
 * Leads with what the zone is offered, not with its name, because the name is
 * already legible on the map and the offer is the thing a reader has no way to
 * infer. The lost-area figure follows, so the sentence a reader assembles is
 * "this much ground loses its bus, and this is what arrives instead" — which
 * is the comparison, rather than either half alone.
 */
export function zoneLabel(z: Partial<OnDemandZone>): string {
  const lost = z.lost_km2_inside;
  const area = z.zone_km2;
  const lostLine = lost === null || lost === undefined ? '' :
    `<div class="muted">${lost.toFixed(1)} km² of it loses all fixed-route ` +
    `service under the plan</div>`;
  return `<strong>${esc(z.name ?? 'On-demand zone')}</strong>`
    + `<div>Proposed on-demand service: ${vanCount(z.vehicles_weekday)}`
    + `${area ? ` for ${area.toFixed(0)} km²` : ''}`
    + `${z.weekday_hours ? `, ${esc(z.weekday_hours)} weekdays` : ''}</div>`
    + lostLine;
}

/**
 * The citywide sentence for the legend.
 *
 * Both halves or neither: the share of lost ground a zone is offered for is
 * the reassuring half, and the vehicles-per-square-kilometre is the half that
 * says what the offer is worth. Quoting the first alone would be the
 * netting-off this layer exists to avoid, one sentence rather than one number.
 *
 * IT LEADS WITH THE SHARE, NOT THE SQUARE KILOMETRES INSIDE ZONES, and that is
 * not a style choice. `totals.lost_km2_inside` is a sum of per-zone figures the
 * published CSV has already rounded, so it lands on 18.35 where
 * `analyze_coverage_area.py` measures the union of the same ground and prints
 * 18.3 — a 0.05 km² artifact of adding rounded rows, and a reader who saw 18.4
 * here and 18.3 in the findings would rightly wonder which to trust. The share
 * and the denominator both survive rounding intact, so the sentence is built
 * from those, and the absolute stays in the API for anyone who wants it.
 */
export function zoneNoteHTML(t: OnDemandTotals): string {
  const share = t.lost_pct_inside === null
    ? `${t.lost_km2_inside.toFixed(1)} km² of the ground that loses all `
      + `fixed-route service is inside one`
    : `${Math.round(t.lost_pct_inside)}% of the `
      + `${t.lost_km2_citywide!.toFixed(1)} km² that loses all fixed-route `
      + `service is inside one`;
  return `<div class="lg-foot">${t.zones} proposed on-demand zones. ${share}. `
    + `All ten together run ${t.vehicles_weekday} vehicles over `
    + `${t.zone_km2.toFixed(0)} km², 7am–9pm — a fallback, not a replacement. `
    + `Nothing on this map is netted off against them.</div>`;
}

export function initZoneLayer(map: maplibregl.Map, beforeId?: string) {
  map.addSource(SRC, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } as any,
  });
  // Fill first, then the outline over it: an outline alone reads as another
  // line layer beside the streets view, and the fill is also what gives the
  // hover a target across the whole zone rather than only on its edge.
  //
  // THE WASH IS DELIBERATELY FAINTER THAN IT WANTS TO BE. It lies on top of
  // the surface, whose colour IS its value -- buses per day against today --
  // so every point of opacity here shifts a reading a reader is meant to take
  // off the ramp. The dashes carry the boundary; the fill only has to say
  // "inside", and at 0.08 it does that without repainting the layer it is
  // annotating.
  map.addLayer({
    id: FILL, type: 'fill', source: SRC,
    layout: { visibility: 'none' },
    paint: { 'fill-color': ZONE_COLOR, 'fill-opacity': 0.08 },
  }, beforeId);
  map.addLayer({
    id: LINE, type: 'line', source: SRC,
    layout: { visibility: 'none', 'line-join': 'round' },
    paint: {
      'line-color': ZONE_COLOR,
      'line-width': 2,
      'line-opacity': 0.9,
      // Dashed, so the boundary reads as "the area this is offered in" rather
      // than as a route or a hard edge on the ground. A zone boundary is a
      // service-planning line, not a street.
      'line-dasharray': [3, 2],
    },
  }, beforeId);
}

export async function loadZoneLayer(map: maplibregl.Map) {
  data = await fetchJSON<OnDemandLayer>('/api/zones');
  (map.getSource(SRC) as maplibregl.GeoJSONSource).setData(toGeoJSON(data) as any);
  return data;
}

export function setZoneVisible(map: maplibregl.Map, on: boolean) {
  visible = on;
  for (const id of [FILL, LINE]) {
    map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  }
}

export const ZONE_LAYERS = [FILL, LINE];
