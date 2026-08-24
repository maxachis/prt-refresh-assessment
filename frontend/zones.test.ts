import { describe, it, expect } from 'vitest';
import {
  toGeoJSON, zoneLabel, zoneNoteHTML, vanCount, styleZoneToggle,
  ZONE_COLOR, ZONE_INK, ZONE_TOGGLE_BG,
} from './zones';
import { GONE_COLOR, NEW_COLOR } from './surface';
import { OnDemandLayer, OnDemandZone, OnDemandTotals } from './types';

function zone(overrides: Partial<OnDemandZone> = {}): OnDemandZone {
  return {
    name: 'McKeesport',
    vehicles_weekday: 2,
    weekday_hours: '7:00-21:00',
    days: ['0000001', '0000010', '1111100'],
    hidden_in_remix: true,
    zone_km2: 18.4,
    fixed_route_km2_now: 9.1,
    fixed_route_km2_proposed: 7.0,
    lost_km2_inside: 2.3,
    gained_km2_inside: 0.2,
    geometry: [[[[-79.86, 40.34], [-79.86, 40.36], [-79.83, 40.36], [-79.86, 40.34]]]],
    ...overrides,
  };
}

function totals(overrides: Partial<OnDemandTotals> = {}): OnDemandTotals {
  return {
    zones: 10,
    vehicles_weekday: 22,
    zone_km2: 254.0,
    lost_km2_inside: 18.6,
    lost_km2_citywide: 80.14,
    lost_pct_inside: 23.2,
    ...overrides,
  };
}

function layer(zones: OnDemandZone[] = [zone()]): OnDemandLayer {
  return { zones, totals: totals() };
}

describe('toGeoJSON', () => {
  it('produces one MultiPolygon feature per zone', () => {
    const gj = toGeoJSON(layer([zone(), zone({ name: 'Penn Hills' })]));
    expect(gj.features).toHaveLength(2);
    expect(gj.features.every((f) => f.geometry.type === 'MultiPolygon')).toBe(true);
  });

  it('carries coordinates through exactly as the API sent them', () => {
    const z = zone();
    const gj = toGeoJSON(layer([z]));
    expect(gj.features[0].geometry.coordinates).toEqual(z.geometry);
  });

  it('carries the vehicle count onto the feature, so the map can label it', () => {
    const gj = toGeoJSON(layer());
    expect(gj.features[0].properties.vehicles_weekday).toBe(2);
  });
});

describe('ZONE_COLOR', () => {
  it('is outside the change palette, so a zone never reads as "partly gone"', () => {
    expect(ZONE_COLOR).not.toBe(GONE_COLOR);
    expect(ZONE_COLOR).not.toBe(NEW_COLOR);
  });
});

describe('vanCount', () => {
  it('reads as a count, singular and plural', () => {
    expect(vanCount(1)).toBe('1 vehicle');
    expect(vanCount(3)).toBe('3 vehicles');
  });

  it('says the count is unstated rather than implying zero', () => {
    expect(vanCount(null)).toContain('unstated');
    expect(vanCount(null)).not.toContain('0');
  });
});

describe('zoneLabel', () => {
  it('leads with what the plan offers here, not with the name alone', () => {
    const html = zoneLabel(zone());
    expect(html).toContain('McKeesport');
    expect(html).toContain('2 vehicles');
    expect(html).toContain('7:00-21:00');
  });

  it('states the lost ground inside the zone beside the offer', () => {
    expect(zoneLabel(zone())).toContain('2.3 km²');
  });

  it('omits the lost line rather than printing a blank figure', () => {
    const html = zoneLabel(zone({ lost_km2_inside: null }));
    expect(html).not.toContain('loses all fixed-route');
  });

  it('escapes a zone name rather than injecting it', () => {
    const html = zoneLabel(zone({ name: '<img src=x>' }));
    expect(html).not.toContain('<img');
  });
});

describe('zoneNoteHTML', () => {
  it('gives the reassuring half and the qualifying half in one sentence', () => {
    const html = zoneNoteHTML(totals());
    expect(html).toContain('23%');          // of lost ground offered a van
    expect(html).toContain('22 vehicles');  // ...and what the van amounts to
    expect(html).toContain('fallback');
  });

  it('quotes the share and the denominator, never the summed square kilometres',
    () => {
      // 18.35 is a sum of rounded rows; the published union figure is 18.3.
      // Printing 18.4 beside a findings document that says 18.3 is the one
      // way this note could undermine what it is here to support.
      const html = zoneNoteHTML(totals());
      expect(html).toContain('80.1 km²');
      expect(html).not.toContain('18.6');
      expect(html).not.toContain('18.4');
    });

  it('says nothing is netted off, because nothing is', () => {
    expect(zoneNoteHTML(totals())).toContain('netted off');
  });

  it('takes the overlay colour, so it reads as a key and not as a footnote', () => {
    // It lands directly under the active view's own grey footnote; in the same
    // grey the two read as one paragraph about one layer.
    const html = zoneNoteHTML(totals());
    expect(html).toContain('lg-zone');
    expect(html).toContain(ZONE_INK);
    expect(html).toContain(ZONE_COLOR);
  });

  it('drops the percentage when there is no denominator, rather than showing 0%', () => {
    const html = zoneNoteHTML(totals({ lost_km2_citywide: null, lost_pct_inside: null }));
    expect(html).not.toContain('0%');
    expect(html).toContain('18.6 km²');   // the absolute is the fallback only
  });
});

describe('styleZoneToggle', () => {
  /** Enough of an element for a function that only writes three style
   *  properties — the suite runs in node, with no DOM (see legend.test.ts). */
  function button() {
    return { style: { color: '', background: '', boxShadow: '' } } as
      unknown as HTMLElement;
  }

  it('lights the control in the colour of the shapes it draws', () => {
    const b = button();
    styleZoneToggle(b, true);
    expect(b.style.background).toBe(ZONE_TOGGLE_BG);
    expect(b.style.boxShadow).toContain(ZONE_COLOR);
  });

  it('hands the styling back when off, rather than leaving a dimmed violet', () => {
    const b = button();
    styleZoneToggle(b, true);
    styleZoneToggle(b, false);
    expect(b.style.background).toBe('');
    expect(b.style.color).toBe('');
    expect(b.style.boxShadow).toBe('');
  });
});
