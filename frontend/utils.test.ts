import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  clock, duration, signed, pct, esc, fetchJSONOnce, forgetFetched,
} from './utils';

describe('clock', () => {
  it('renders ordinary times', () => {
    expect(clock(6 * 60)).toBe('6:00am');
    expect(clock(12 * 60)).toBe('12:00pm');
    expect(clock(13 * 60 + 5)).toBe('1:05pm');
    expect(clock(0)).toBe('12:00am');
  });

  it('folds the 4:00-28:00 axis back onto a clock face', () => {
    // 25:30 on the axis is 1:30am the next morning, not an impossible hour.
    expect(clock(25 * 60 + 30)).toBe('1:30am');
    expect(clock(27 * 60)).toBe('3:00am');
  });

  it('renders no service as a dash rather than midnight', () => {
    expect(clock(null)).toBe('—');
  });
});

describe('signed', () => {
  it('always shows the sign, so gains read as loudly as losses', () => {
    expect(signed(12)).toBe('+12');
    expect(signed(-12)).toBe('-12');
    expect(signed(0)).toBe('0');
  });
});

describe('pct', () => {
  it('computes a signed percentage change', () => {
    expect(pct(100, 120)).toBe('+20.0%');
    expect(pct(100, 80)).toBe('-20.0%');
    expect(pct(100, 100)).toBe('+0.0%');
  });

  it('does not divide by zero where there is no service today', () => {
    expect(pct(0, 40)).toBe('new');
    expect(pct(0, 0)).toBe('—');
  });
});

describe('esc', () => {
  it('escapes stop names before they reach innerHTML', () => {
    expect(esc('A & B <script>')).toBe('A &amp; B &lt;script&gt;');
  });

  it('renders null and undefined as empty, not as the word', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
  });
});


describe('duration', () => {
  it('reads a long span as hours and minutes', () => {
    expect(duration(1398)).toBe('23h 18m');
  });

  it('drops the hours from a span shorter than one', () => {
    expect(duration(45)).toBe('45m');
  });

  it('has nothing to say where no bus runs', () => {
    expect(duration(null)).toBe('—');
  });
});

describe('fetchJSONOnce', () => {
  const real = globalThis.fetch;
  let calls: string[] = [];

  beforeEach(() => {
    calls = [];
    forgetFetched();
    globalThis.fetch = ((url: string) => {
      calls.push(url);
      return Promise.resolve({
        ok: true, statusText: 'OK', json: () => Promise.resolve({ url }),
      });
    }) as any;
  });
  afterEach(() => { globalThis.fetch = real; });

  // The map's two walk radii are precomputed tables, so the second visit to
  // one a reader has already seen is the same bytes over the same wire. The
  // 400 m dot layer is ~150 KB gzipped and half a second; toggling to 150 m
  // and back paid it three times.
  it('fetches a URL once however often it is asked for', async () => {
    const a = await fetchJSONOnce('/api/change?radius=400');
    const b = await fetchJSONOnce('/api/change?radius=400');
    expect(calls).toEqual(['/api/change?radius=400']);
    expect(b).toBe(a);
  });

  it('keeps the two radii apart', async () => {
    await fetchJSONOnce('/api/change?radius=400');
    await fetchJSONOnce('/api/change?radius=150');
    expect(calls).toEqual(['/api/change?radius=400', '/api/change?radius=150']);
  });

  // A reader who double-clicks the radius switch, or a view that asks for the
  // surface while the first ask is still in the air, must not open a second
  // 1.3 MB request: the promise is what is held, not the answer.
  it('shares one request between callers that overlap', async () => {
    const [a, b] = await Promise.all([
      fetchJSONOnce('/api/surface?radius=400'),
      fetchJSONOnce('/api/surface?radius=400'),
    ]);
    expect(calls).toHaveLength(1);
    expect(b).toBe(a);
  });

  // A cached failure would be permanent: the map would refuse to load a layer
  // for the rest of the session because one request lost the network.
  it('does not remember a failure', async () => {
    globalThis.fetch = (() => Promise.reject(new Error('offline'))) as any;
    await expect(fetchJSONOnce('/api/change?radius=400')).rejects.toThrow('offline');
    globalThis.fetch = ((url: string) => {
      calls.push(url);
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ url }) });
    }) as any;
    await expect(fetchJSONOnce('/api/change?radius=400')).resolves.toBeTruthy();
    expect(calls).toEqual(['/api/change?radius=400']);
  });
});
