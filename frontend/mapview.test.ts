import { describe, it, expect } from 'vitest';
import { circle } from './mapview';

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
