import { describe, it, expect } from 'vitest';
import {
  sortPlaces, toGeoJSON, blockGroupKlass, blockGroupMagnitude,
  placesListHTML, KLASS_COLOR, SCOPE_NOTE,
} from './places';
import { GONE_COLOR, NEW_COLOR } from './surface';
import { PlaceSummary, PlaceDetail } from './types';

function summary(overrides: Partial<PlaceSummary> = {}): PlaceSummary {
  return {
    key: 'baldwin borough',
    place: 'Baldwin borough',
    changed_block_groups: 5,
    block_groups: 12,
    residents_lost: 9613,
    residents_gained: 0,
    residents_total: 24_100,
    share_lost: 9613 / 24_100,
    share_gained: 0,
    lat: 40.35, lon: -79.97,
    ...overrides,
  };
}

describe('sortPlaces', () => {
  const baldwin = summary({ key: 'baldwin', residents_lost: 9613, share_lost: 0.399 });
  const reserve = summary({ key: 'reserve', residents_lost: 2706, share_lost: 0.851 });
  const list = [baldwin, reserve];

  it('by count, ranks by residents_lost descending -- the API order', () => {
    expect(sortPlaces(list, 'count').map((p) => p.key)).toEqual(['baldwin', 'reserve']);
  });

  it('by share, the two orders disagree', () => {
    // The whole reason this control exists: Reserve is 9th by count and 1st
    // by share, and a count-only ranking buries it.
    expect(sortPlaces(list, 'share').map((p) => p.key)).toEqual(['reserve', 'baldwin']);
  });

  it('does not mutate the list it was handed', () => {
    const copy = [...list];
    sortPlaces(list, 'share');
    expect(list).toEqual(copy);
  });

  it('puts a null share last rather than treating it as zero', () => {
    const noTotal = summary({ key: 'no-total', residents_lost: 1, share_lost: null });
    const some = summary({ key: 'some', residents_lost: 1, share_lost: 0.01 });
    expect(sortPlaces([noTotal, some], 'share').map((p) => p.key)).toEqual(['some', 'no-total']);
  });
});

describe('blockGroupKlass / blockGroupMagnitude', () => {
  it('classes a block group by whichever side dominates', () => {
    expect(blockGroupKlass({ residents_lost: 231, residents_gained: 0 })).toBe('lost');
    expect(blockGroupKlass({ residents_lost: 0, residents_gained: 500 })).toBe('gained');
  });

  it('breaks a tie toward lost, so a wash never reads as a gain', () => {
    expect(blockGroupKlass({ residents_lost: 50, residents_gained: 50 })).toBe('lost');
  });

  it('takes the magnitude of whichever side is drawn', () => {
    expect(blockGroupMagnitude({ residents_lost: 231, residents_gained: 0 })).toBe(231);
    expect(blockGroupMagnitude({ residents_lost: 0, residents_gained: 500 })).toBe(500);
  });
});

describe('toGeoJSON', () => {
  function detail(): PlaceDetail {
    return {
      ...summary(),
      changed: [
        { geoid: '420031408001', lat: 40.434, lon: -79.911, residents_lost: 231, residents_gained: 0 },
        { geoid: '420031414002', lat: 40.424, lon: -79.923, residents_lost: 0, residents_gained: 40 },
      ],
    };
  }

  it('produces one Point feature per changed block group', () => {
    const gj = toGeoJSON(detail());
    expect(gj.features).toHaveLength(2);
    expect(gj.features.every((f) => f.geometry.type === 'Point')).toBe(true);
  });

  it('carries the geoid and klass as properties, coordinates as [lon, lat]', () => {
    const gj = toGeoJSON(detail());
    expect(gj.features[0].geometry.coordinates).toEqual([-79.911, 40.434]);
    expect(gj.features[0].properties.geoid).toBe('420031408001');
    expect(gj.features[0].properties.klass).toBe('lost');
    expect(gj.features[1].properties.klass).toBe('gained');
  });
});

describe('KLASS_COLOR', () => {
  it('reuses the surface palette, so a reader who learned red-means-gone here does not relearn it', () => {
    expect(KLASS_COLOR.lost).toBe(GONE_COLOR);
    expect(KLASS_COLOR.gained).toBe(NEW_COLOR);
  });
});

describe('placesListHTML', () => {
  const list = [
    summary({ key: 'baldwin', place: 'Baldwin borough', residents_lost: 9613, share_lost: 0.399 }),
    summary({ key: 'reserve', place: 'Reserve township', residents_lost: 2706, share_lost: 0.851 }),
  ];

  it('lists every place, ranked in the order it was handed', () => {
    const html = placesListHTML(list, 'count', null);
    const baldwinAt = html.indexOf('Baldwin borough');
    const reserveAt = html.indexOf('Reserve township');
    expect(baldwinAt).toBeGreaterThan(-1);
    expect(baldwinAt).toBeLessThan(reserveAt);
  });

  it('marks each row selectable by key', () => {
    const html = placesListHTML(list, 'count', null);
    expect(html).toContain('data-select-place="baldwin"');
    expect(html).toContain('data-select-place="reserve"');
  });

  it('marks the selected place, and only that one', () => {
    const html = placesListHTML(list, 'count', 'reserve');
    const rows = html.split('<button type="button" class="place-row').slice(1);
    const reserveRow = rows.find((r) => r.includes('data-select-place="reserve"'))!;
    const baldwinRow = rows.find((r) => r.includes('data-select-place="baldwin"'))!;
    expect(reserveRow.startsWith(' selected"')).toBe(true);
    expect(baldwinRow.startsWith('"')).toBe(true);
  });

  it('shows both loss and gain, but only loss decides the rank', () => {
    const withGain = [summary({
      key: 'ross', place: 'Ross township', residents_lost: 6508, residents_gained: 2581,
    })];
    const html = placesListHTML(withGain, 'count', null);
    expect(html).toContain('6,508');
    expect(html).toContain('2,581');
  });

  it('states the residual and the scope, per convention 12', () => {
    // The view's whole reason to exist is not to imply it totals the county:
    // 151 of 68,989 residents live beyond 2 km of a labelled stop and take no
    // place name, so they cannot appear in this list.
    expect(placesListHTML(list, 'count', null)).toContain(SCOPE_NOTE);
  });
});
