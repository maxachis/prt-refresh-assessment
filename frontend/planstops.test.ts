import { describe, it, expect } from 'vitest';
import { toGeoJSON, MIN_ZOOM } from './planstops';

// Homewood Avenue: the pole the plan keeps at Frankstown FS, and the one it
// adds 48 m away at Idlewild. Only the first has a dot on the change layer --
// the second is inside the 150 m that makes them one location -- which is why
// this layer exists.
const STOPS: [number, number, string, string][] = [
  [40.4577, -79.8951, '20044', 'HOMEWOOD AVE + FRANKSTOWN FS'],
  [40.4581, -79.8960, '20045', 'HOMEWOOD AVE + IDLEWILD'],
];

describe('the plan-stops layer', () => {
  it('draws one point per pole, carrying its name for the hover', () => {
    const fc = toGeoJSON(STOPS);
    expect(fc.features).toHaveLength(2);
    expect(fc.features[1].geometry.coordinates).toEqual([-79.8960, 40.4581]);
    expect(fc.features[1].properties).toEqual({
      stop_id: '20045', name: 'HOMEWOOD AVE + IDLEWILD',
    });
  });

  // 5,413 poles drawn over the whole county is a smear at city zoom, and the
  // question it answers -- does the plan put a stop on this street -- is a
  // street-level one. So the layer only paints once the streets are apart.
  it('waits for street zoom', () => {
    expect(MIN_ZOOM).toBeGreaterThanOrEqual(13);
  });
});
