import { describe, it, expect } from 'vitest';
import { circle, movedLeaders, stopPopupHtml } from './mapview';

// The server decides membership of a radius with the equirectangular metric in
// refresh/query.py (METERS_PER_DEGREE = 111_320, longitude scaled by cos lat).
// The drawn ring has to agree with it, or stops render outside a circle that
// the numbers say contains them.
const M_PER_DEG = 111_320;

function metresFrom(lat: number, lon: number, p: [number, number]) {
  const coslat = Math.cos((lat * Math.PI) / 180);
  const dLat = (p[1] - lat) * M_PER_DEG;
  const dLon = (p[0] - lon) * M_PER_DEG * coslat;
  return Math.hypot(dLat, dLon);
}

describe('circle', () => {
  const LAT = 40.4406, LON = -79.9959;

  it('puts every vertex at the requested radius', () => {
    const ring = circle(LAT, LON, 400).geometry.coordinates[0];
    for (const p of ring) {
      expect(metresFrom(LAT, LON, p as [number, number])).toBeCloseTo(400, 0);
    }
  });

  it('scales longitude by cos(lat) rather than drawing an ellipse', () => {
    const ring = circle(LAT, LON, 400).geometry.coordinates[0];
    const lons = ring.map((p) => p[0]), lats = ring.map((p) => p[1]);
    const widthDeg = Math.max(...lons) - Math.min(...lons);
    const heightDeg = Math.max(...lats) - Math.min(...lats);
    // In degrees the circle is WIDER than it is tall, at this latitude by 1/cos.
    expect(widthDeg / heightDeg).toBeCloseTo(1 / Math.cos((LAT * Math.PI) / 180), 2);
  });

  it('closes the ring', () => {
    const ring = circle(LAT, LON, 150).geometry.coordinates[0];
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it('honours the 150 m sensitivity radius too', () => {
    const ring = circle(LAT, LON, 150).geometry.coordinates[0];
    expect(metresFrom(LAT, LON, ring[0] as [number, number])).toBeCloseTo(150, 0);
  });
});

// A stop the plan keeps but moves draws twice -- ink where the pole stands
// today, an orange ring where the plan puts it -- and past a few metres those
// two marks separate on screen. What joins them back up is a dashed leader and
// a hover line that names the distance; without either, the ring reads as a
// stop the plan is adding beside one it left alone.
describe('a pole the plan moves', () => {
  const MOVED = {
    stop_id: '1772', name: 'MT PLEASANT RD + COLBY ST',
    lat: 40.4831227, lon: -80.0040302, metres: 54, new_place: false,
    moved_m: 21, moved_lat: 40.48325, moved_lon: -80.00386,
  };
  const STILL = {
    stop_id: '1773', name: 'MT PLEASANT RD + NORTHVIEW HTS SCHOOL',
    lat: 40.48189, lon: -80.00278, metres: 148, new_place: false,
  };

  it('draws a leader from today\'s pole to the proposed one', () => {
    const lines = movedLeaders([MOVED, STILL]);
    expect(lines).toHaveLength(1);
    expect(lines[0].geometry.coordinates).toEqual([
      [MOVED.moved_lon, MOVED.moved_lat], [MOVED.lon, MOVED.lat],
    ]);
  });

  it('draws nothing for a pole the plan leaves alone', () => {
    expect(movedLeaders([STILL])).toEqual([]);
  });

  // Two distances can land on one hover, and unlabelled they read as one
  // number: Max read a stop's "2 m" as how far the plan moved it, when it is
  // how far the stop is from where he clicked.
  it('names what each distance on the hover is measured from', () => {
    const html = stopPopupHtml({ ...MOVED, side: 'proposed' });
    expect(html).toContain('54 m from the pin');
    expect(html).toContain('moved 21 m from where it stands today');
  });

  it('says how far it moved, on the mark the reader hovers', () => {
    expect(stopPopupHtml({ ...MOVED, side: 'proposed' }))
      .toContain('moved 21 m from where it stands today');
  });

  it('says nothing about moving where nothing moved', () => {
    const html = stopPopupHtml({ ...STILL, side: 'proposed' });
    expect(html).toContain('proposed');
    expect(html).not.toContain('moved');
  });
});
