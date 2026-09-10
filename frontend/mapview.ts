/**
 * Map layers: the walk circle, and the stops each network puts inside it.
 *
 * Both networks' stops are drawn at once, offset by colour rather than shown
 * one at a time. The thing a reader needs to see is that these are two
 * different stop inventories over the same ground — PRT renumbers, consolidates
 * and nudges stops across intersections — and a toggle would hide exactly that.
 */
import { StopRef } from './types';

/**
 * The mark for a stop today, in ink rather than the app's "today" blue.
 *
 * These marks are painted over the Stop-by-stop dots, and in blue they were
 * being read as dots: a worst-case ΔE of 16.4 from the `new service` bucket
 * and 11.0 from `doubled or better`, so clicking a location scattered what
 * looked like new-service dots across the map. Max reported that on
 * 2026-09-09. Ink clears every bucket by 39.7 or more, and
 * `cvd.test.ts` holds it there.
 *
 * Blue still means today everywhere the map does not draw: the panel's trip
 * chart, its route lists, and the Travel-time view. The convention is intact
 * where nothing can be mistaken for a bucket, and dropped where something can.
 */
export const NOW = '#15181e';
/**
 * And a stop the plan proposes -- now a RING around a core, not a disc.
 *
 * As a filled orange dot this had the same defect as the blue one, ΔE 16.7
 * from "halved or worse", which is the worse direction to be wrong in: it
 * says the plan cut service at a corner where it is proposing a stop. Drawn
 * as a ring, the orange never claims the middle of a mark, and what a reader
 * reads as the mark's colour is the core.
 */
export const PROP = '#ffa23a';

/**
 * The core of a proposed stop: white where nothing stands there today.
 *
 * This is what makes one mark carry both feeds. The CORE says today -- ink
 * for a stop that stands, white for ground the plan is adding one to -- and
 * the RING says the plan stops here. So a kept stop is an ink core in an
 * orange ring, a new one is an empty orange ring, and a stop only today has
 * no ring at all. Max asked for the proposed mark to take a core on
 * 2026-09-09; giving it the same ink core would have made "the plan adds a
 * stop" and "both networks stop here" the same picture, which is the one
 * distinction this key exists to draw.
 */
export const PROP_CORE = '#ffffff';

/**
 * Circle geometry for the walk radius, since MapLibre has no metre-radius fill.
 *
 * Uses the same equirectangular constant as the server's radius test
 * (111,320 m per degree, longitude scaled by cos(lat)). If the two ever drift
 * apart, the drawn circle stops being the circle the numbers were computed in,
 * and stops start appearing just outside a ring that supposedly contains them.
 * `mapview.test.ts` pins the constant.
 */
export function circle(lat: number, lon: number, metres: number, steps = 96) {
  const coords: [number, number][] = [];
  const dLat = metres / 111_320;
  const dLon = metres / (111_320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    coords.push([lon + dLon * Math.cos(t), lat + dLat * Math.sin(t)]);
  }
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
    properties: {},
  };
}

function fc(features: any[]) {
  return { type: 'FeatureCollection' as const, features };
}

/**
 * The dashed leaders between a pole the plan keeps and where it moves it.
 *
 * The two marks are painted at their own coordinates, so past a few metres
 * (`query.STOP_MOVED_M`) they stop composing into one mark and read as two
 * separate stops — one of them looking like a stop the plan is adding. The
 * leader says they are the same pole; the hover line says how far.
 */
export function movedLeaders(stops: StopRef[]) {
  return stops
    .filter((s) => s.moved_m != null)
    .map((s) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [[s.moved_lon!, s.moved_lat!], [s.lon, s.lat]],
      },
      properties: { stop_id: s.stop_id, moved_m: s.moved_m },
    }));
}

/** What a mark around the pin says when the reader hovers it. */
export function stopPopupHtml(p: any) {
  const side = p.side === 'current' ? 'today' : 'proposed';
  const moved = p.moved_m != null
    ? `<br>moved ${p.moved_m} m from where it stands today` : '';
  return `<b>${p.name}</b><br>${side} · stop ${p.stop_id} · ${p.metres} m${moved}`;
}

function stopFeatures(stops: StopRef[], side: string) {
  return stops.map((s) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [s.lon, s.lat] },
    properties: { ...s, side },
  }));
}

export function initMapLayers(map: maplibregl.Map) {
  map.addSource('walk', { type: 'geojson', data: fc([]) });
  map.addSource('stops-now', { type: 'geojson', data: fc([]) });
  map.addSource('stops-prop', { type: 'geojson', data: fc([]) });
  map.addSource('stop-moves', { type: 'geojson', data: fc([]) });

  map.addLayer({
    id: 'walk-fill', type: 'fill', source: 'walk',
    paint: { 'fill-color': '#8fb7ff', 'fill-opacity': 0.12 },
  });
  map.addLayer({
    id: 'walk-line', type: 'line', source: 'walk',
    paint: { 'line-color': '#8fb7ff', 'line-width': 1.5, 'line-dasharray': [2, 2] },
  });

  // Under both marks, so the leader runs behind the poles it joins rather
  // than across them. Orange because it belongs to the plan's mark: it is the
  // plan that moved the pole.
  map.addLayer({
    id: 'stop-moves-l', type: 'line', source: 'stop-moves',
    paint: {
      'line-color': PROP, 'line-width': 1.5, 'line-dasharray': [2, 2],
    },
  });

  // Proposed sits under current so that where a stop survives in both feeds the
  // ink "today" core fills the orange ring, rather than one network appearing
  // to have deleted a stop that is merely underneath. The two layers compose
  // into one mark on purpose: ring for the plan, core for today.
  map.addLayer({
    id: 'stops-prop-c', type: 'circle', source: 'stops-prop',
    paint: {
      'circle-radius': 7, 'circle-color': PROP_CORE,
      'circle-stroke-width': 3, 'circle-stroke-color': PROP,
    },
  });
  map.addLayer({
    id: 'stops-now-c', type: 'circle', source: 'stops-now',
    paint: {
      'circle-radius': 4, 'circle-color': NOW,
      // A near-white casing, not a dark one: the mark is ink now, and in the
      // Both view it lands on surface cells dark enough to swallow it.
      'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,.9)',
    },
  });

  const popup = new maplibregl.Popup({ closeButton: false, offset: 10 });
  for (const layer of ['stops-now-c', 'stops-prop-c']) {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
    map.on('mousemove', layer, (e: any) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties;
      popup.setLngLat(e.lngLat).setHTML(stopPopupHtml(p)).addTo(map);
    });
  }
}

export function showPlace(
  map: maplibregl.Map,
  lat: number, lon: number, radius: number,
  nowStops: StopRef[], propStops: StopRef[],
) {
  (map.getSource('walk') as maplibregl.GeoJSONSource)
    .setData(fc([circle(lat, lon, radius)]) as any);
  (map.getSource('stops-now') as maplibregl.GeoJSONSource)
    .setData(fc(stopFeatures(nowStops, 'current')) as any);
  (map.getSource('stops-prop') as maplibregl.GeoJSONSource)
    .setData(fc(stopFeatures(propStops, 'proposed')) as any);
  (map.getSource('stop-moves') as maplibregl.GeoJSONSource)
    .setData(fc(movedLeaders(propStops)) as any);
}
