import { describe, it, expect } from 'vitest';
import {
  circle, clearPlace, movedLeaders, showPlace, stopPopupHtml, viewHasWalkRadius,
} from './mapview';

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

  // Only one distance belongs on the hover. How far a stop is from the pin is
  // there on screen -- the reader can see the gap, and the walk radius is
  // drawn around it -- and printing it beside "moved 21 m" made two numbers
  // read as one. How far the plan shifted a pole is the one nothing else can
  // show, because today's pole and the plan's are two marks.
  it('leaves the distance from the pin to the map', () => {
    const html = stopPopupHtml({ ...MOVED, side: 'proposed' });
    expect(html).not.toContain('54');
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

/** A map stub that records what each source was last given. */
function fakeMap() {
  const data: Record<string, any> = {};
  return {
    data,
    getSource: (id: string) => ({ setData: (d: any) => { data[id] = d; } }),
  };
}

describe('marks that outlive the click that drew them', () => {
  const STOP = {
    stop_id: '1773', name: 'MT PLEASANT RD + NORTHVIEW HTS SCHOOL',
    lat: 40.48189, lon: -80.00278, metres: 148, new_place: false,
  };
  // A pole the plan shifts, so the leader source has something in it too --
  // that being the one a partial clear would leave behind.
  const MOVED = {
    stop_id: '1772', name: 'MT PLEASANT RD + COLBY ST',
    lat: 40.4831227, lon: -80.0040302, metres: 54, new_place: false,
    moved_m: 21, moved_lat: 40.48325, moved_lon: -80.00386,
  };
  const SOURCES = ['walk', 'stops-now', 'stops-prop', 'stop-moves'];

  it('erases every mark a click drew, not only the circle', () => {
    const map = fakeMap();
    showPlace(map as any, 40.4406, -79.9959, 400, [STOP], [MOVED]);
    for (const id of SOURCES) expect(map.data[id].features.length).toBeGreaterThan(0);

    clearPlace(map as any);
    for (const id of SOURCES) expect(map.data[id].features).toEqual([]);
  });

  // The marks answer "what stands within this walk of the pin", so they belong
  // to the views that ask that. A corridor is a piece of street (convention
  // 11), a journey's walk is the router's own, and a place is measured at its
  // own census blocks -- none of them has a walk radius for a circle to mean.
  it('knows which views a walk circle means anything in', () => {
    for (const v of ['dots', 'surface', 'both', 'oneseat']) {
      expect(viewHasWalkRadius(v)).toBe(true);
    }
    for (const v of ['corridors', 'journey', 'places']) {
      expect(viewHasWalkRadius(v)).toBe(false);
    }
  });
});

describe('a mark inside the pin, over a dot the pin hides', () => {
  const STOP = {
    stop_id: '1773', name: 'MT PLEASANT RD + NORTHVIEW HTS SCHOOL',
    lat: 40.48189, lon: -80.00278, metres: 148, new_place: false,
    side: 'current',
  };

  it('still says what the pole is', () => {
    const html = stopPopupHtml(STOP, 'about the same · 203 → 213 buses');
    expect(html).toContain(STOP.name);
    expect(html).toContain('stop 1773');
  });

  it('adds what the location underneath it does', () => {
    const html = stopPopupHtml(STOP, 'about the same · 203 → 213 buses');
    expect(html).toContain('about the same · 203 → 213 buses');
  });

  it('says nothing extra where there is no dot under the mark', () => {
    expect(stopPopupHtml(STOP, null)).toBe(stopPopupHtml(STOP));
  });
});
