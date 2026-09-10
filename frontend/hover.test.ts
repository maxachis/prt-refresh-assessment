import { describe, it, expect, vi } from 'vitest';
import { initHover } from './hover';

function fakeMap(visible: Record<string, boolean>, hits: any[] = []) {
  const on: Record<string, any> = {};
  const canvas = { style: { cursor: '' } };
  return {
    on: (type: string, cb: any) => { on[type] = cb; },
    getLayer: (id: string) => (id in visible ? { id } : undefined),
    getLayoutProperty: (id: string, _p: string) =>
      (visible[id] ? 'visible' : 'none'),
    queryRenderedFeatures: vi.fn(() => hits),
    getCanvas: () => canvas,
    fire: (type: string, e: any) => on[type](e),
    canvas,
  } as any;
}

const popup = () => {
  const calls: string[] = [];
  return {
    calls,
    setLngLat() { return this; },
    setHTML(h: string) { calls.push(h); return this; },
    addTo() { return this; },
    remove: vi.fn(),
  } as any;
};

const move = (x = 10, y = 20) => ({ point: { x, y }, lngLat: { lng: 1, lat: 2 } });
const feature = (layer: string, id: any, name = 'x') => ({
  layer: { id: layer }, id, properties: { name },
  geometry: { coordinates: [1, 2] },
});

describe('initHover', () => {
  it('asks the map once per pointer move, not once per layer', () => {
    // The whole point: MapLibre runs a hit test for every listener bound to
    // every layer, which was 19 of them per move across six layers.
    const map = fakeMap({ a: true, b: true });
    initHover(map, popup(), [
      { layer: 'a', html: () => 'A' }, { layer: 'b', html: () => 'B' }]);
    map.fire('mousemove', move());
    expect(map.queryRenderedFeatures).toHaveBeenCalledTimes(1);
  });

  it('does not hit-test a layer the current view is not drawing', () => {
    const map = fakeMap({ a: true, b: false });
    initHover(map, popup(), [
      { layer: 'a', html: () => 'A' }, { layer: 'b', html: () => 'B' }]);
    map.fire('mousemove', move());
    expect(map.queryRenderedFeatures.mock.calls[0][1])
      .toEqual({ layers: ['a'] });
  });

  it('skips the hit test entirely when no hoverable layer is on screen', () => {
    const map = fakeMap({ a: false });
    initHover(map, popup(), [{ layer: 'a', html: () => 'A' }]);
    map.fire('mousemove', move());
    expect(map.queryRenderedFeatures).not.toHaveBeenCalled();
  });

  it('routes the top feature to the spec that owns its layer', () => {
    const map = fakeMap({ a: true, b: true }, [feature('b', 7)]);
    const p = popup();
    initHover(map, p, [
      { layer: 'a', html: () => 'A' },
      { layer: 'b', html: (f: any) => `B${f.id}` }]);
    map.fire('mousemove', move());
    expect(p.calls).toEqual(['B7']);
    expect(map.canvas.style.cursor).toBe('pointer');
  });

  it('leaves the tooltip alone while the pointer stays on one feature', () => {
    // A drag delivers a pointer event per frame; rebuilding the same HTML on
    // each of them is work with nothing to show for it.
    const map = fakeMap({ a: true }, [feature('a', 7)]);
    const p = popup();
    initHover(map, p, [{ layer: 'a', html: (f: any) => `A${f.id}` }]);
    map.fire('mousemove', move(10, 20));
    map.fire('mousemove', move(11, 21));
    expect(p.calls).toEqual(['A7']);
  });

  it('redraws it when the pointer crosses to another feature', () => {
    const hits = [feature('a', 7)];
    const map = fakeMap({ a: true }, hits as any);
    const p = popup();
    initHover(map, p, [{ layer: 'a', html: (f: any) => `A${f.id}` }]);
    map.fire('mousemove', move());
    hits[0] = feature('a', 8);
    map.fire('mousemove', move());
    expect(p.calls).toEqual(['A7', 'A8']);
  });

  it('clears the cursor and the tooltip on bare ground', () => {
    const map = fakeMap({ a: true }, [feature('a', 7)]);
    const p = popup();
    initHover(map, p, [{ layer: 'a', html: () => 'A' }]);
    map.fire('mousemove', move());
    map.queryRenderedFeatures.mockReturnValue([]);
    map.fire('mousemove', move());
    expect(map.canvas.style.cursor).toBe('');
    expect(p.remove).toHaveBeenCalled();
  });

  it('takes no tooltip for an answer without keeping a stale one up', () => {
    // `html` returning null is "this feature has nothing to say yet" -- the
    // dot layers do it before their data has loaded.
    const map = fakeMap({ a: true }, [feature('a', 7)]);
    const p = popup();
    initHover(map, p, [{ layer: 'a', html: () => null }]);
    map.fire('mousemove', move());
    expect(p.calls).toEqual([]);
    expect(p.remove).toHaveBeenCalled();
  });

  it('reopens a tooltip that something else closed', () => {
    // A view switch closes the tooltip without the pointer moving, and the
    // pointer is then still over the same dot. Without the reset the "same
    // feature, nothing to do" shortcut would keep it shut for good.
    const map = fakeMap({ a: true }, [feature('a', 7)]);
    const p = popup();
    const clearHover = initHover(map, p, [{ layer: 'a', html: () => 'A' }]);
    map.fire('mousemove', move());
    clearHover();
    map.fire('mousemove', move());
    expect(p.calls).toEqual(['A', 'A']);
  });
});
