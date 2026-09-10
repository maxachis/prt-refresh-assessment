import { describe, it, expect } from 'vitest';
import {
  canvasScale, drawsInSoftware, fadeMs, readMachine,
  DEFAULT_FADE_MS, MAX_SCALE, SOFTWARE_SCALE,
  basemapStyle, VECTOR_STYLE_URL, RASTER_TILES, RASTER_LABEL_TILES,
  RASTER_MAX_ZOOM, RASTER_BASEMAP_READY, rasterBasemapStyle,
} from './hardware';

describe('drawsInSoftware', () => {
  it('names the CPU rasterisers the site is actually read on', () => {
    // The first is Max's VM verbatim, the second Chrome's own fallback.
    expect(drawsInSoftware('llvmpipe, or similar')).toBe(true);
    expect(drawsInSoftware('Google SwiftShader')).toBe(true);
    expect(drawsInSoftware('Microsoft Basic Render Driver')).toBe(true);
  });

  it('gives an unrecognised name the benefit of the doubt', () => {
    // Wrong in the safe direction: a machine misread as hardware loses some
    // frames, where one misread as software loses every reader their sharpness.
    expect(drawsInSoftware('Apple M2')).toBe(false);
    expect(drawsInSoftware('Mali-G57 MC2')).toBe(false);
    expect(drawsInSoftware(null)).toBe(false);
  });
});

describe('canvasScale', () => {
  it('asks a software renderer for one pixel per CSS pixel', () => {
    expect(canvasScale({ renderer: 'llvmpipe, or similar', dpr: 2 }))
      .toBe(SOFTWARE_SCALE);
  });

  it('caps a high-density screen where the returns stop being visible', () => {
    // A phone at 3 fills 2.25x the fragments of the same map at 2.
    expect(canvasScale({ renderer: 'Adreno (TM) 640', dpr: 3 })).toBe(MAX_SCALE);
  });

  it('never asks for more pixels than the screen has', () => {
    expect(canvasScale({ renderer: 'Apple M2', dpr: 1 })).toBe(1);
    expect(canvasScale({ renderer: 'llvmpipe', dpr: 1 })).toBe(1);
  });
});

describe('fadeMs', () => {
  it('drops the fade animation where every frame is drawn by the CPU', () => {
    expect(fadeMs({ renderer: 'llvmpipe, or similar', dpr: 1 })).toBe(0);
  });

  it('leaves it alone on hardware', () => {
    expect(fadeMs({ renderer: 'Apple M2', dpr: 2 })).toBe(DEFAULT_FADE_MS);
  });
});

describe('readMachine', () => {
  const win = (gl: any, dpr = 2) => ({
    devicePixelRatio: dpr,
    document: { createElement: () => ({ getContext: () => gl }) },
  });

  it('reads the unmasked renderer where the browser offers one', () => {
    const gl = {
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 37446 }),
      getParameter: (p: number) => (p === 37446 ? 'llvmpipe, or similar' : 'x'),
    };
    expect(readMachine(win(gl))).toEqual(
      { renderer: 'llvmpipe, or similar', dpr: 2 });
  });

  it('falls back to the masked name when the extension is refused', () => {
    const gl = { RENDERER: 7937, getExtension: () => null,
                 getParameter: (p: number) => (p === 7937 ? 'WebKit WebGL' : 'x') };
    expect(readMachine(win(gl)).renderer).toBe('WebKit WebGL');
  });

  it('reads a browser with no WebGL at all as hardware, not as broken', () => {
    expect(readMachine(win(null))).toEqual({ renderer: null, dpr: 2 });
  });

  it('survives a browser that throws instead of answering', () => {
    const win2 = { devicePixelRatio: 3,
                   document: { createElement: () => { throw new Error('no'); } } };
    expect(readMachine(win2)).toEqual({ renderer: null, dpr: 3 });
  });
});

describe('which basemap a machine is given', () => {
  const machine = (renderer: string | null) => ({ renderer, dpr: 1 });

  it('gives a machine with a graphics chip the vector style', () => {
    expect(basemapStyle(machine('Apple M2'))).toBe(VECTOR_STYLE_URL);
  });

  it('gives a browser that will not name its renderer the vector style', () => {
    expect(basemapStyle(machine(null))).toBe(VECTOR_STYLE_URL);
  });

  it('gives a CPU rasteriser the raster style, once a tile source is settled', () => {
    const style = rasterBasemapStyle() as any;
    expect(style.layers.every((l: any) => l.type === 'raster')).toBe(true);
    expect(basemapStyle(machine('llvmpipe, or similar')))
      .toBe(RASTER_BASEMAP_READY ? style : VECTOR_STYLE_URL);
  });

  it('leaves every reader on the vector style while no source is settled', () => {
    // Three tile services were measured and none may be used as it stands --
    // see `RASTER_BASEMAP_READY`. Until one is chosen the slower map is the
    // one that ships, because it is the legible one.
    expect(RASTER_BASEMAP_READY).toBe(false);
    expect(basemapStyle(machine('llvmpipe'))).toBe(VECTOR_STYLE_URL);
  });

  it('draws the ground, and the names with it where a source needs a second layer', () => {
    const style = rasterBasemapStyle() as any;
    expect(style.sources['basemap'].tiles).toEqual(RASTER_TILES);
    // Esri's canvas needed a second, transparent label layer; OSM's style
    // carries its own. Either way every basemap layer is beneath every mark
    // this site adds, because those are added to the map afterwards.
    expect(style.layers.map((l: any) => l.source))
      .toEqual(RASTER_LABEL_TILES.length ? ['basemap', 'basemap-labels'] : ['basemap']);
  });

  it('says where the tiles run out, so MapLibre never asks past them', () => {
    const style = rasterBasemapStyle() as any;
    for (const src of Object.values(style.sources) as any[]) {
      expect(src.maxzoom).toBe(RASTER_MAX_ZOOM);
    }
    // Declared because a tile service may answer past its coverage with a
    // picture rather than a 404 -- Esri's canvas returns a grey image reading
    // "Map data not yet available", with a 200, which MapLibre drew as a map.
    expect(RASTER_MAX_ZOOM).toBeGreaterThan(0);
  });

  it('names the tiles it borrows, on every raster source it builds', () => {
    const style = rasterBasemapStyle() as any;
    for (const src of Object.values(style.sources) as any[]) {
      expect(src.attribution).toMatch(/OpenStreetMap/);
    }
  });
});
