import { describe, it, expect, vi } from 'vitest';
import {
  sortPlaces, toGeoJSON, blockGroupKlass, blockGroupMagnitude,
  placesListHTML, placesKeyHTML, KLASS_COLOR, SCOPE_NOTE,
  SHARE_BANDS, shareOpacity, fillOpacityExpr, fillColorExpr, setPlacesFill,
  placeTooltipHTML, SHARE_MIN_RESIDENTS, DEFAULT_PLACE_FILL, BOUNDARY_LAYER,
  SERVICE_BANDS, serviceOpacity, serviceField, firstBusPlaces,
} from './places';
import { GONE_COLOR, NEW_COLOR } from './surface';
import {
  PlaceSummary, PlaceDetail, PlaceBoundaryProperties, BoundariesGeoJSON,
  PlaceBoundaryFeature,
} from './types';

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

describe('shareOpacity / SHARE_BANDS', () => {
  it('gives null and zero the same fully-transparent band -- "no data" and "no loss" must both read as nothing to see', () => {
    expect(shareOpacity(null)).toBe(0);
    expect(shareOpacity(0)).toBe(0);
    expect(shareOpacity(null)).toBe(shareOpacity(0));
  });

  it('shades the published examples into the bands their share falls in', () => {
    // Penn Hills municipality, 7.9% -- the second-lowest band.
    expect(shareOpacity(0.079)).toBe(SHARE_BANDS[2].opacity);
    // Baldwin borough 39.7%, Reserve township 85.1% and Bon Air 93.1% all
    // clear the top band's 30% floor.
    expect(shareOpacity(0.397)).toBe(SHARE_BANDS[4].opacity);
    expect(shareOpacity(0.851)).toBe(SHARE_BANDS[4].opacity);
    expect(shareOpacity(0.931)).toBe(SHARE_BANDS[4].opacity);
  });

  it('shades a small nonzero share into the lowest visible band, not the transparent one', () => {
    expect(shareOpacity(0.01)).toBe(SHARE_BANDS[1].opacity);
    expect(shareOpacity(0.01)).toBeGreaterThan(0);
  });

  it('opacity climbs monotonically from band to band, so the ramp never doubles back', () => {
    const opacities = SHARE_BANDS.map((b) => b.opacity);
    for (let i = 1; i < opacities.length; i++) {
      expect(opacities[i]).toBeGreaterThan(opacities[i - 1]);
    }
  });
});

describe('fillOpacityExpr', () => {
  it('reads share_lost off the feature for the lost reading, treating a missing value as zero', () => {
    const expr = fillOpacityExpr('lost');
    expect(expr[0]).toBe('step');
    expect(expr[1]).toEqual(['coalesce', ['get', 'share_lost'], 0]);
  });

  it('reads share_gained off the feature for the gained reading', () => {
    const expr = fillOpacityExpr('gained');
    expect(expr[1]).toEqual(['coalesce', ['get', 'share_gained'], 0]);
  });

  it('carries every band opacity from SHARE_BANDS, base first, in ascending order, for either reading', () => {
    for (const fill of ['lost', 'gained'] as const) {
      const expr = fillOpacityExpr(fill);
      const opacitiesInExpr = [expr[2], expr[4], expr[6], expr[8], expr[10]];
      expect(opacitiesInExpr).toEqual(SHARE_BANDS.map((b) => b.opacity));
    }
  });
});

describe('setPlacesFill', () => {
  // A fake map that only records what the two readings would ask it to
  // paint -- this is the whole reason `fillOpacityExpr` and `KLASS_COLOR` are
  // exported as pure lookups rather than only used inline in `initPlacesLayer`.
  function fakeMap() {
    return { setPaintProperty: vi.fn() };
  }

  it('paints the loss colour and the loss share bands for "lost"', () => {
    const map = fakeMap();
    setPlacesFill(map as any, 'lost');
    expect(map.setPaintProperty).toHaveBeenCalledWith(BOUNDARY_LAYER, 'fill-color', KLASS_COLOR.lost);
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      BOUNDARY_LAYER, 'fill-opacity', fillOpacityExpr('lost'));
  });

  it('paints the gain colour and the gain share bands for "gained"', () => {
    const map = fakeMap();
    setPlacesFill(map as any, 'gained');
    expect(map.setPaintProperty).toHaveBeenCalledWith(BOUNDARY_LAYER, 'fill-color', KLASS_COLOR.gained);
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      BOUNDARY_LAYER, 'fill-opacity', fillOpacityExpr('gained'));
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
    const html = placesListHTML(list, 'count', null, 'lost');
    const baldwinAt = html.indexOf('Baldwin borough');
    const reserveAt = html.indexOf('Reserve township');
    expect(baldwinAt).toBeGreaterThan(-1);
    expect(baldwinAt).toBeLessThan(reserveAt);
  });

  it('marks each row selectable by key', () => {
    const html = placesListHTML(list, 'count', null, 'lost');
    expect(html).toContain('data-select-place="baldwin"');
    expect(html).toContain('data-select-place="reserve"');
  });

  it('marks the selected place, and only that one', () => {
    const html = placesListHTML(list, 'count', 'reserve', 'lost');
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
    const html = placesListHTML(withGain, 'count', null, 'lost');
    expect(html).toContain('6,508');
    expect(html).toContain('2,581');
  });

  it('states the residual and the scope, per convention 12', () => {
    // The view's whole reason to exist is not to imply it totals the county:
    // 151 of 68,989 residents live beyond 2 km of a labelled stop and take no
    // place name, so they cannot appear in this list.
    expect(placesListHTML(list, 'count', null, 'lost')).toContain(SCOPE_NOTE);
  });

  it('draws a fill-mode control below the sort control, defaulting to losses active', () => {
    const html = placesListHTML(list, 'count', null, 'lost');
    const sortAt = html.indexOf('place-sort');
    const fillAt = html.indexOf('place-fill');
    expect(fillAt).toBeGreaterThan(sortAt);
    expect(html).toContain('data-place-fill="lost"');
    expect(html).toContain('data-place-fill="gained"');
    expect(html).toContain('Losses');
    expect(html).toContain('Gains');
    const lostBtnAt = html.indexOf('data-place-fill="lost"');
    const gainedBtnAt = html.indexOf('data-place-fill="gained"');
    // "active" sits between the two buttons' own markers only when it is the
    // lost button carrying it -- the substring check below pins that.
    const between = html.slice(lostBtnAt, gainedBtnAt);
    expect(between).toContain('active');
  });

  it('marks gains active instead when the fill mode is gained', () => {
    const html = placesListHTML(list, 'count', null, 'gained');
    const lostBtnAt = html.indexOf('data-place-fill="lost"');
    const gainedBtnAt = html.indexOf('data-place-fill="gained"');
    const from = html.slice(gainedBtnAt, gainedBtnAt + 60);
    expect(from).toContain('active');
    const lostSpan = html.slice(lostBtnAt, lostBtnAt + 60);
    expect(lostSpan).not.toContain('active');
  });
});

describe('SCOPE_NOTE', () => {
  // Places are now assigned by boundary containment, not by nearest labelled
  // stop -- the old "151 residents beyond 2 km" residual no longer exists,
  // and the note has to say the new true thing instead of the old one.
  it('says every resident is in a named place, not that some are excluded', () => {
    expect(SCOPE_NOTE).not.toContain('beyond 2 km');
    expect(SCOPE_NOTE).not.toContain('151');
    expect(SCOPE_NOTE.toLowerCase()).toContain('every');
    expect(SCOPE_NOTE.toLowerCase()).toContain('allegheny');
  });

  it('still says the figures are day-free and do not move with the day switch', () => {
    expect(SCOPE_NOTE.toLowerCase()).toContain('day-free');
  });

  it('still says an under-100-resident place is shown without a share', () => {
    expect(SCOPE_NOTE).toContain('100');
    expect(SCOPE_NOTE.toLowerCase()).toContain('share');
  });
});

describe('placesKeyHTML', () => {
  it('draws a legend row for every visible share band, stating its bound', () => {
    const html = placesKeyHTML(null, 'lost');
    for (const band of SHARE_BANDS) {
      if (band.opacity === 0) continue; // the "nothing to see" band has no swatch
      expect(html).toContain(band.label);
    }
  });

  it('does not give the transparent band its own swatch row', () => {
    const html = placesKeyHTML(null, 'lost');
    const zeroBand = SHARE_BANDS.find((b) => b.opacity === 0)!;
    expect(html).not.toContain(zeroBand.label);
  });

  it('still carries the points key, so the fill never replaces it', () => {
    const html = placesKeyHTML(null, 'lost');
    expect(html).toContain('loses more than it gains');
    expect(html).toContain('gains more than it loses');
  });

  it('describes losses, in the loss colour, when mapping losses', () => {
    const html = placesKeyHTML(null, 'lost');
    expect(html.toLowerCase()).toContain('lose all buses');
    expect(html.toLowerCase()).not.toContain('gain a bus');
    // The header's own swatch text is drawn in the loss colour.
    const bandRow = html.split('lg-static')[1];
    expect(bandRow).toContain(KLASS_COLOR.lost);
  });

  it('describes gains, in the gain colour, when mapping gains', () => {
    const html = placesKeyHTML(null, 'gained');
    expect(html.toLowerCase()).toContain('gain a bus');
    expect(html.toLowerCase()).not.toContain('lose all buses');
    const bandRow = html.split('lg-static')[1];
    expect(bandRow).toContain(KLASS_COLOR.gained);
  });

  it('keeps saying the fill is coloured by share, not by count, in either mode', () => {
    for (const fill of ['lost', 'gained'] as const) {
      const html = placesKeyHTML(null, fill);
      expect(html).toContain('coloured by SHARE');
      expect(html).not.toContain('coloured by count');
    }
  });

  it('never spells the old "every bus" phrasing', () => {
    for (const fill of ['lost', 'gained'] as const) {
      expect(placesKeyHTML(null, fill).toLowerCase()).not.toContain('every bus');
    }
  });
});

describe('placeTooltipHTML', () => {
  function props(overrides: Partial<PlaceBoundaryProperties> = {}): PlaceBoundaryProperties {
    return {
      key: 'ross township', place: 'Ross township', kind: 'township',
      changed_block_groups: 4, block_groups: 20,
      residents_lost: 6119, residents_gained: 1952,
      residents_total: 32_386, share_lost: 6119 / 32_386, share_gained: 1952 / 32_386,
      service_weekday_now: 88, service_weekday_proposed: 96, service_weekday_pct: 9.1,
      service_weekday_rail_now: false, service_weekday_rail_proposed: false,
      service_saturday_now: 40, service_saturday_proposed: 40, service_saturday_pct: 0,
      service_saturday_rail_now: false, service_saturday_rail_proposed: false,
      service_sunday_now: 20, service_sunday_proposed: 20, service_sunday_pct: 0,
      service_sunday_rail_now: false, service_sunday_rail_proposed: false,
      ...overrides,
    };
  }

  it('names the place in bold and its kind', () => {
    const html = placeTooltipHTML(props(), 'lost');
    expect(html).toContain('<b>Ross township</b>');
    expect(html).toContain('township');
  });

  it('escapes the place name', () => {
    const html = placeTooltipHTML(props({ place: '<script>alert(1)</script>' }), 'lost');
    expect(html).not.toContain('<script>');
  });

  it('shows the loss count and share, and the gain count and share, with the total as the denominator', () => {
    const html = placeTooltipHTML(props(), 'lost');
    expect(html).toContain('6,119');
    expect(html).toContain('18.9%'); // 6119 / 32386
    expect(html).toContain('1,952');
    expect(html).toContain('6.0%'); // 1952 / 32386
    expect(html).toContain('32,386');
    expect(html).toContain('4');
  });

  it('omits the gain line entirely when nobody gains a bus', () => {
    const html = placeTooltipHTML(props({ residents_gained: 0, share_gained: 0 }), 'lost');
    expect(html.toLowerCase()).not.toContain('gain');
  });

  it('withholds the share below SHARE_MIN_RESIDENTS and says why', () => {
    const html = placeTooltipHTML(props({ share_lost: null }), 'lost');
    expect(html).toContain(String(SHARE_MIN_RESIDENTS));
  });

  it('states a single clear line, naming the population, when nothing here changes', () => {
    const html = placeTooltipHTML(props({
      changed_block_groups: 0, residents_lost: 0, residents_gained: 0,
      share_lost: null, share_gained: null, residents_total: 8549,
    }), 'lost');
    expect(html).toContain('8,549');
    expect(html.toLowerCase()).toContain('none');
    expect(html).not.toContain('0 lose');
    expect(html).not.toContain('0 gain');
  });

  it('leads with losses when mapping losses, and with gains when mapping gains', () => {
    const p = props();
    const lostFirst = placeTooltipHTML(p, 'lost');
    const gainedFirst = placeTooltipHTML(p, 'gained');
    expect(lostFirst.indexOf('6,119')).toBeLessThan(lostFirst.indexOf('1,952'));
    expect(gainedFirst.indexOf('1,952')).toBeLessThan(gainedFirst.indexOf('6,119'));
  });

  it('uses "all buses", never the old "every bus" phrasing', () => {
    expect(placeTooltipHTML(props(), 'lost').toLowerCase()).not.toContain('every bus');
  });
});

// --- "Service" fill mode: signed percent change in a place's own bus
// trips, on the toolbar's active day. Everything below this line is new.

function serviceProps(overrides: Partial<PlaceBoundaryProperties> = {}): PlaceBoundaryProperties {
  return {
    key: 'ross township', place: 'Ross township', kind: 'township',
    changed_block_groups: 4, block_groups: 20,
    residents_lost: 6119, residents_gained: 1952,
    residents_total: 32_386, share_lost: 6119 / 32_386, share_gained: 1952 / 32_386,
    service_weekday_now: 88, service_weekday_proposed: 96, service_weekday_pct: 9.1,
    service_weekday_rail_now: false, service_weekday_rail_proposed: false,
    service_saturday_now: 40, service_saturday_proposed: 40, service_saturday_pct: 0,
    service_saturday_rail_now: false, service_saturday_rail_proposed: false,
    service_sunday_now: 20, service_sunday_proposed: 20, service_sunday_pct: 0,
    service_sunday_rail_now: false, service_sunday_rail_proposed: false,
    ...overrides,
  };
}

function boundaryFeature(props: PlaceBoundaryProperties): PlaceBoundaryFeature {
  return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: [] }, properties: props };
}

describe('serviceField', () => {
  it('builds the property name query.boundaries emits for one day and stat', () => {
    expect(serviceField('weekday', 'pct')).toBe('service_weekday_pct');
    expect(serviceField('saturday', 'now')).toBe('service_saturday_now');
    expect(serviceField('sunday', 'rail_proposed')).toBe('service_sunday_rail_proposed');
  });
});

describe('SERVICE_BANDS / serviceOpacity', () => {
  it('gives a null percent (the undefined-change hole) the same silent band as an actual near-zero change', () => {
    expect(serviceOpacity(null)).toBe(SERVICE_BANDS[0].opacity);
    expect(serviceOpacity(0)).toBe(SERVICE_BANDS[0].opacity);
    expect(serviceOpacity(null)).toBe(serviceOpacity(0));
  });

  it('is symmetric: the same magnitude bands a gain the same as an equal-sized loss', () => {
    for (const pct of [5, 20, 45, 90]) {
      expect(serviceOpacity(pct)).toBe(serviceOpacity(-pct));
    }
  });

  it('shades the published examples into the bands their magnitude falls in', () => {
    // Brackenridge borough +1060%, North Fayette township +216%, Millvale
    // borough +82% -- all well past the top 60% break.
    expect(serviceOpacity(1060)).toBe(SERVICE_BANDS[SERVICE_BANDS.length - 1].opacity);
    expect(serviceOpacity(216)).toBe(SERVICE_BANDS[SERVICE_BANDS.length - 1].opacity);
    expect(serviceOpacity(82)).toBe(SERVICE_BANDS[SERVICE_BANDS.length - 1].opacity);
    // Plum borough -84%, and the seven places at exactly -100%.
    expect(serviceOpacity(-84)).toBe(SERVICE_BANDS[SERVICE_BANDS.length - 1].opacity);
    expect(serviceOpacity(-100)).toBe(SERVICE_BANDS[SERVICE_BANDS.length - 1].opacity);
  });

  it('opacity climbs monotonically from band to band, so the ramp never doubles back', () => {
    const opacities = SERVICE_BANDS.map((b) => b.opacity);
    for (let i = 1; i < opacities.length; i++) {
      expect(opacities[i]).toBeGreaterThan(opacities[i - 1]);
    }
  });
});

describe('fillOpacityExpr for service', () => {
  it('reads the abs of the active day\'s pct field, coalescing null to zero', () => {
    const expr = fillOpacityExpr('service', 'weekday');
    expect(expr[0]).toBe('step');
    expect(expr[1]).toEqual(['abs', ['coalesce', ['get', 'service_weekday_pct'], 0]]);
  });

  it('reads a different day\'s field when asked for one', () => {
    const expr = fillOpacityExpr('service', 'saturday');
    expect(expr[1]).toEqual(['abs', ['coalesce', ['get', 'service_saturday_pct'], 0]]);
  });

  it('carries every band opacity from SERVICE_BANDS, base first, in ascending order', () => {
    const expr = fillOpacityExpr('service', 'weekday');
    const opacitiesInExpr = [expr[2], expr[4], expr[6], expr[8]];
    expect(opacitiesInExpr).toEqual(SERVICE_BANDS.map((b) => b.opacity));
  });
});

describe('fillColorExpr', () => {
  it('is a flat swatch for the two residents readings, same as KLASS_COLOR', () => {
    expect(fillColorExpr('lost')).toBe(KLASS_COLOR.lost);
    expect(fillColorExpr('gained')).toBe(KLASS_COLOR.gained);
  });

  it('is a per-feature expression for service, since the colour itself varies by feature', () => {
    const expr = fillColorExpr('service', 'weekday');
    expect(Array.isArray(expr)).toBe(true);
    expect(JSON.stringify(expr)).toContain('service_weekday_pct');
    expect(JSON.stringify(expr)).toContain(GONE_COLOR);
    expect(JSON.stringify(expr)).toContain(NEW_COLOR);
  });
});

describe('setPlacesFill for service', () => {
  function fakeMap() {
    return { setPaintProperty: vi.fn() };
  }

  it('paints the diverging colour and opacity expressions for the given day', () => {
    const map = fakeMap();
    setPlacesFill(map as any, 'service', 'saturday');
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      BOUNDARY_LAYER, 'fill-color', fillColorExpr('service', 'saturday'));
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      BOUNDARY_LAYER, 'fill-opacity', fillOpacityExpr('service', 'saturday'));
  });
});

describe('firstBusPlaces', () => {
  function boundaries(features: PlaceBoundaryFeature[]): BoundariesGeoJSON {
    return { type: 'FeatureCollection', features };
  }

  it('names places with no bus today and some proposed -- the undefined-change hole', () => {
    const pine = serviceProps({
      place: 'Pine township',
      service_weekday_now: 0, service_weekday_proposed: 19, service_weekday_pct: null,
    });
    const ross = serviceProps({ place: 'Ross township' }); // has weekday service on both sides
    const result = firstBusPlaces(boundaries([boundaryFeature(pine), boundaryFeature(ross)]), 'weekday');
    expect(result).toEqual(['Pine township']);
  });

  it('does not name a place with no bus on either side -- that is "no change", not an undefined one', () => {
    const untouched = serviceProps({
      place: 'Nowhere township',
      service_weekday_now: 0, service_weekday_proposed: 0, service_weekday_pct: null,
    });
    expect(firstBusPlaces(boundaries([boundaryFeature(untouched)]), 'weekday')).toEqual([]);
  });

  it('reads a different day\'s fields when asked for one', () => {
    const weekendOnly = serviceProps({
      place: 'Harrison township',
      service_weekday_now: 10, service_weekday_proposed: 12, service_weekday_pct: 20,
      service_saturday_now: 0, service_saturday_proposed: 8, service_saturday_pct: null,
    });
    expect(firstBusPlaces(boundaries([boundaryFeature(weekendOnly)]), 'weekday')).toEqual([]);
    expect(firstBusPlaces(boundaries([boundaryFeature(weekendOnly)]), 'saturday')).toEqual(['Harrison township']);
  });
});

describe('placesListHTML in service mode', () => {
  const list = [
    summary({ key: 'baldwin', place: 'Baldwin borough', residents_lost: 9613, share_lost: 0.399 }),
  ];

  it('draws a third button labelled "Service"', () => {
    const html = placesListHTML(list, 'count', null, 'service');
    expect(html).toContain('data-place-fill="service"');
    expect(html).toContain('Service');
  });

  it('marks service active, and only that one, when the fill mode is service', () => {
    const html = placesListHTML(list, 'count', null, 'service');
    const serviceBtnAt = html.indexOf('data-place-fill="service"');
    const from = html.slice(serviceBtnAt, serviceBtnAt + 60);
    expect(from).toContain('active');
    const lostBtnAt = html.indexOf('data-place-fill="lost"');
    expect(html.slice(lostBtnAt, lostBtnAt + 60)).not.toContain('active');
  });

  it('states that this reading, unlike the two residents readings, moves with the day switch', () => {
    const serviceHtml = placesListHTML(list, 'count', null, 'service');
    expect(serviceHtml.toLowerCase()).toContain('day switch');
  });

  it('does not print that sentence in the other two modes', () => {
    const lostHtml = placesListHTML(list, 'count', null, 'lost');
    const gainedHtml = placesListHTML(list, 'count', null, 'gained');
    expect(lostHtml.toLowerCase()).not.toContain('moves with the');
    expect(gainedHtml.toLowerCase()).not.toContain('moves with the');
  });
});

describe('placesKeyHTML in service mode', () => {
  function boundaries(features: PlaceBoundaryFeature[]): BoundariesGeoJSON {
    return { type: 'FeatureCollection', features };
  }

  it('draws a legend row per visible SERVICE_BANDS band, for both directions', () => {
    const html = placesKeyHTML(null, 'service', 'weekday', boundaries([]));
    expect(html).toContain('fewer trips');
    expect(html).toContain('more trips');
  });

  it('states the null-hole places in words rather than shading them', () => {
    const pine = boundaryFeature(serviceProps({
      place: 'Pine township',
      service_weekday_now: 0, service_weekday_proposed: 19, service_weekday_pct: null,
    }));
    const html = placesKeyHTML(null, 'service', 'weekday', boundaries([pine]));
    expect(html).toContain('Pine township');
    expect(html).toContain('cannot be shown as a percentage');
    expect(html).toContain('1 place');
  });

  it('names up to three null-hole places and counts the rest', () => {
    const names = ['Harrison township', 'Brackenridge borough', 'Verona borough', 'Oakmont borough', 'Swisshelm Park'];
    const feats = names.map((place) => boundaryFeature(serviceProps({
      place, service_saturday_now: 0, service_saturday_proposed: 8, service_saturday_pct: null,
    })));
    const html = placesKeyHTML(null, 'service', 'saturday', boundaries(feats));
    expect(html).toContain('5 places');
    expect(html).toContain('Harrison township');
    expect(html).toContain('Brackenridge borough');
    expect(html).toContain('Verona borough');
    expect(html).not.toContain('Oakmont borough');
    expect(html).toContain('2 more');
  });

  it('says nothing about the null hole when there is none on that day', () => {
    const html = placesKeyHTML(null, 'service', 'weekday', boundaries([]));
    expect(html).not.toContain('cannot be shown as a percentage');
  });
});

describe('placeTooltipHTML in service mode', () => {
  it('shows now, proposed and the signed percent, naming the day type', () => {
    const html = placeTooltipHTML(serviceProps(), 'service', 'weekday');
    expect(html).toContain('88');
    expect(html).toContain('96');
    expect(html.toLowerCase()).toContain('weekday');
  });

  it('names the T when a place loses its last bus but rail still calls -- Bethel Park', () => {
    const bethelPark = serviceProps({
      place: 'Bethel Park municipality', kind: 'municipality',
      service_weekday_now: 46, service_weekday_proposed: 0, service_weekday_pct: -100,
      service_weekday_rail_now: true, service_weekday_rail_proposed: true,
    });
    const html = placeTooltipHTML(bethelPark, 'service', 'weekday');
    expect(html.toLowerCase()).toContain('loses all buses');
    expect(html.toLowerCase()).toContain('the t still calls here');
  });

  it('does not claim a train still calls where none does -- Reserve township', () => {
    const reserve = serviceProps({
      place: 'Reserve township', kind: 'township',
      service_weekday_now: 56, service_weekday_proposed: 0, service_weekday_pct: -100,
      service_weekday_rail_now: false, service_weekday_rail_proposed: false,
    });
    const html = placeTooltipHTML(reserve, 'service', 'weekday');
    expect(html.toLowerCase()).toContain('loses all buses');
    expect(html.toLowerCase()).not.toContain('still calls here');
  });

  it('says a place gets its first bus, with no percentage, in the null-hole case', () => {
    const pine = serviceProps({
      place: 'Pine township',
      service_weekday_now: 0, service_weekday_proposed: 19, service_weekday_pct: null,
    });
    const html = placeTooltipHTML(pine, 'service', 'weekday');
    expect(html.toLowerCase()).toContain('first bus');
    expect(html).toContain('19');
    expect(html).not.toMatch(/-?\d+(\.\d+)?%/);
  });
});
