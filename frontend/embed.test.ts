import { describe, it, expect } from 'vitest';
import { isEmbedded, withEmbed, withoutEmbed, fullViewLabel } from './embed';

describe('isEmbedded', () => {
  it('is off unless the URL asks for it', () => {
    expect(isEmbedded('')).toBe(false);
    expect(isEmbedded('?view=dots&day=saturday')).toBe(false);
  });

  it('is on for the values a hand-written iframe src is likely to carry', () => {
    expect(isEmbedded('?embed=1')).toBe(true);
    expect(isEmbedded('?embed=true')).toBe(true);
    expect(isEmbedded('?view=dots&embed=1')).toBe(true);
  });

  it('is off for a value that says no', () => {
    // Someone turning an embed off by editing the src should get the whole
    // app back, not a stripped map that ignores them.
    expect(isEmbedded('?embed=0')).toBe(false);
    expect(isEmbedded('?embed=')).toBe(false);
  });
});

describe('withEmbed', () => {
  it('keeps the question and adds the mode', () => {
    const p = new URLSearchParams(withEmbed('?view=oneseat&dest=oakland'));
    expect(p.get('view')).toBe('oneseat');
    expect(p.get('dest')).toBe('oakland');
    expect(p.get('embed')).toBe('1');
  });

  it('does not stack a second copy on every control the reader touches', () => {
    expect(withEmbed(withEmbed('?view=dots'))).toBe(withEmbed('?view=dots'));
  });
});

describe('withoutEmbed', () => {
  it('drops the mode and nothing else', () => {
    expect(withoutEmbed('?view=surface&embed=1&day=sunday'))
      .toBe('?view=surface&day=sunday');
  });

  it('leaves an empty search empty rather than a bare question mark', () => {
    expect(withoutEmbed('?embed=1')).toBe('');
  });

  it('is a no-op on a search that never had it', () => {
    expect(withoutEmbed('?view=dots')).toBe('?view=dots');
  });
});

describe('fullViewLabel', () => {
  it('offers the whole map when nothing has been asked yet', () => {
    expect(fullViewLabel(null)).toMatch(/full map/i);
  });

  it('offers the answer for the place once one has', () => {
    // The panel that holds the answer is what an embed gives up, so the link
    // has to say that the answer exists and where it is.
    expect(fullViewLabel('Squirrel Hill')).toContain('Squirrel Hill');
    expect(fullViewLabel('Squirrel Hill')).toMatch(/answer/i);
  });
});
