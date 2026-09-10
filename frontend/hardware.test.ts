import { describe, it, expect } from 'vitest';
import {
  canvasScale, drawsInSoftware, fadeMs, readMachine,
  DEFAULT_FADE_MS, MAX_SCALE, SOFTWARE_SCALE,
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
