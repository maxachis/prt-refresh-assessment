import { describe, it, expect } from 'vitest';
import {
  Snap, SNAPS, snapHeight, nearestSnap, snapAfterTap, mapBottomPadding,
  PEEK_PX,
} from './sheet';

// A tall phone and a short one, because the peek stop is the one that has to
// behave differently on each: a fixed 176 px is a fifth of an iPhone and half
// of a landscape one.
const TALL = 844;
const SHORT = 390;

describe('snapHeight', () => {
  it('rises through the three stops', () => {
    const heights = SNAPS.map((s) => snapHeight(s, TALL));
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
  });

  it('gives the peek stop a fixed height on a tall screen', () => {
    expect(snapHeight('peek', TALL)).toBe(PEEK_PX);
  });

  // The peek stop exists to leave the map readable. Held at 176 px on a
  // landscape phone it would be nearly half the window, so it yields.
  it('caps the peek stop on a short screen', () => {
    expect(snapHeight('peek', SHORT)).toBeLessThan(PEEK_PX);
    expect(snapHeight('peek', SHORT)).toBeLessThan(SHORT * 0.35);
  });

  it('never lets the sheet cover the map completely', () => {
    expect(snapHeight('full', TALL)).toBeLessThan(TALL);
  });
});

describe('nearestSnap', () => {
  it('takes the stop a slow drag ended closest to', () => {
    for (const snap of SNAPS) {
      expect(nearestSnap(snapHeight(snap, TALL) + 4, TALL, 0)).toBe(snap);
    }
  });

  it('rounds a drag between two stops to the nearer', () => {
    const mid = (snapHeight('peek', TALL) + snapHeight('half', TALL)) / 2;
    expect(nearestSnap(mid - 20, TALL, 0)).toBe('peek');
    expect(nearestSnap(mid + 20, TALL, 0)).toBe('half');
  });

  // A flick is a statement of direction, not of position: the reader who
  // throws the sheet upward from the peek means "open it", even though their
  // finger left the glass a long way short of the half stop.
  it('follows a fast flick past the stop it stopped near', () => {
    const justAbovePeek = snapHeight('peek', TALL) + 10;
    expect(nearestSnap(justAbovePeek, TALL, 1.2)).toBe('half');
    expect(nearestSnap(justAbovePeek, TALL, 0.05)).toBe('peek');
  });

  it('flicks downward as readily as upward', () => {
    const justBelowFull = snapHeight('full', TALL) - 10;
    expect(nearestSnap(justBelowFull, TALL, -1.2)).toBe('half');
  });

  it('cannot flick past either end', () => {
    expect(nearestSnap(snapHeight('full', TALL), TALL, 3)).toBe('full');
    expect(nearestSnap(snapHeight('peek', TALL), TALL, -3)).toBe('peek');
  });

  it('clamps a drag that ran past the ends', () => {
    expect(nearestSnap(-500, TALL, 0)).toBe('peek');
    expect(nearestSnap(TALL * 2, TALL, 0)).toBe('full');
  });
});

describe('snapAfterTap', () => {
  // Tapping the handle is the discoverable half of the gesture: dragging is
  // for readers who know sheets, tapping is for everyone else, so it has to
  // reach every stop and come back without a second control.
  it('climbs a stop at a time and returns to the peek', () => {
    const seen: Snap[] = [];
    let at: Snap = 'peek';
    for (let i = 0; i < 3; i++) { at = snapAfterTap(at); seen.push(at); }
    expect(seen).toEqual(['half', 'full', 'peek']);
  });
});

describe('mapBottomPadding', () => {
  // What the padding is for: the point the reader clicked has to stay in the
  // strip of map the sheet is not covering.
  it('keeps a clicked point clear of a peeking sheet', () => {
    expect(mapBottomPadding(PEEK_PX, TALL)).toBe(PEEK_PX);
  });

  // Padding as large as the sheet would drive the point into the last few
  // pixels of visible map, which is worse than a little overlap.
  it('stops short of the sheet once the sheet owns most of the window', () => {
    const full = snapHeight('full', TALL);
    expect(mapBottomPadding(full, TALL)).toBeLessThan(full);
    expect(mapBottomPadding(full, TALL)).toBeLessThanOrEqual(TALL * 0.45);
  });
});
