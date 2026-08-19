/**
 * Map layers: the walk circle, and the stops each network puts inside it.
 *
 * Both networks' stops are drawn at once, offset by colour rather than shown
 * one at a time. The thing a reader needs to see is that these are two
 * different stop inventories over the same ground — PRT renumbers, consolidates
 * and nudges stops across intersections — and a toggle would hide exactly that.
 */
import { StopRef } from './types';

const NOW = '#4aa3ff';
const PROP = '#ffa23a';

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

  map.addLayer({
    id: 'walk-fill', type: 'fill', source: 'walk',
    paint: { 'fill-color': '#8fb7ff', 'fill-opacity': 0.12 },
  });
  map.addLayer({
    id: 'walk-line', type: 'line', source: 'walk',
    paint: { 'line-color': '#8fb7ff', 'line-width': 1.5, 'line-dasharray': [2, 2] },
  });

  // Proposed sits under current so that where a stop survives in both feeds the
  // blue "today" dot reads on top of the orange halo, rather than one network
  // appearing to have deleted a stop that is merely underneath.
  map.addLayer({
    id: 'stops-prop-c', type: 'circle', source: 'stops-prop',
    paint: {
      'circle-radius': 7, 'circle-color': PROP,
      'circle-opacity': 0.85, 'circle-stroke-width': 1,
      'circle-stroke-color': '#3a2a10',
    },
  });
  map.addLayer({
    id: 'stops-now-c', type: 'circle', source: 'stops-now',
    paint: {
      'circle-radius': 4, 'circle-color': NOW,
      'circle-stroke-width': 1, 'circle-stroke-color': '#0d2036',
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
      popup.setLngLat(e.lngLat)
        .setHTML(`<b>${p.name}</b><br>${p.side === 'current' ? 'today' : 'proposed'}
                  · stop ${p.stop_id} · ${p.metres} m`)
        .addTo(map);
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
}
