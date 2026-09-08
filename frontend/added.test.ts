import { describe, it, expect } from 'vitest';
import {
  toGeoJSON, countInBounds, hoverHTML, ADDED_STOP_COLOR,
} from './added';
import { NEW_COLOR } from './surface';
import { STYLE } from './change';
import { AddedStop } from './types';

const STOPS: AddedStop[] = [
  {
    stop_id: '10010339', name: 'McMonagle Ave + N Meadowcroft Ave',
    lat: 40.400897, lon: -80.04878, routes: ['34'],
    trips: { weekday: 19, saturday: 15, sunday: 14 },
  },
  {
    stop_id: '10010427', name: 'McFarland Rd + Dell Ave',
    lat: 40.391375, lon: -80.044538, routes: ['34'],
    trips: { weekday: 19, saturday: 15, sunday: 14 },
  },
];

describe('toGeoJSON', () => {
  it('produces one point per added stop, with its trips per day type', () => {
    const gj = toGeoJSON(STOPS);
    expect(gj.features).toHaveLength(2);
    expect(gj.features[0].geometry.coordinates).toEqual([-80.04878, 40.400897]);
    expect(gj.features[0].properties.weekday).toBe(19);
    expect(gj.features[0].properties.sunday).toBe(14);
  });

  // A ring carries a name and a timetable and nothing else: no bucket, no
  // boardings, no change figure. Anything that looked like one would invite
  // the reading the layer exists to prevent, that these are measured
  // locations.
  it('carries no bucket, boardings or change figure', () => {
    const props = toGeoJSON(STOPS).features[0].properties;
    for (const key of ['bucket', 'riders', 'boardings', 'cur', 'prop']) {
      expect(props).not.toHaveProperty(key);
    }
  });
});

describe('countInBounds', () => {
  it('counts the stops on screen, the way the bucket rows above it do', () => {
    expect(countInBounds(STOPS, -80.05, 40.39, -80.04, 40.41)).toBe(2);
    expect(countInBounds(STOPS, -80.05, 40.40, -80.04, 40.41)).toBe(1);
    expect(countInBounds(STOPS, -80.10, 40.50, -80.09, 40.51)).toBe(0);
  });
});

describe('hoverHTML', () => {
  it('names the stop, its routes and its calls on the selected day', () => {
    const p = { name: 'McMonagle Ave + Banksville Rd', routes: '34',
      weekday: 19, saturday: 15, sunday: 14 };
    expect(hoverHTML(p, 'weekday')).toContain('19 calls on a weekday');
    expect(hoverHTML(p, 'sunday')).toContain('14 calls on a Sunday');
  });

  // The one thing every hover here has to say, because the mark is otherwise
  // indistinguishable in kind from the dots it sits among.
  it('says the stop is one the plan adds', () => {
    expect(hoverHTML({ name: 'X', routes: '34', weekday: 1 }, 'weekday'))
      .toContain('a stop the plan adds');
  });
});

describe('the ring colour', () => {
  it('is the blue the surface and the street view already use for a gain', () => {
    expect(ADDED_STOP_COLOR).toBe(NEW_COLOR);
  });

  // Shape, not hue, is what separates a ring from the ramp -- which matters
  // because the ring deliberately shares its blue with the `new` bucket. A
  // reader tells them apart by filled-versus-hollow, and the map does the
  // same: the ramp is drawn with `circle-color`, this with a stroke.
  it('is the same blue as the new-service bucket, so shape has to do the work', () => {
    expect(STYLE.new.color).toBe(ADDED_STOP_COLOR);
  });
});
