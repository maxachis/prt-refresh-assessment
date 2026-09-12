import { describe, it, expect } from 'vitest';
import { feedbackHref, VIEW_PLACEHOLDER } from './feedback';

const TEMPLATE =
  'https://docs.google.com/forms/d/e/X/viewform?usp=pp_url&entry.1={view}';

describe('feedbackHref', () => {
  it('percent-encodes the view URL\'s ?, &, = and # so they cannot be read as the form\'s own parameters', () => {
    const viewUrl = 'https://prt-refresh.lemaliconsulting.com/?view=dots&day=weekday#x';
    expect(feedbackHref(TEMPLATE, viewUrl)).toBe(
      'https://docs.google.com/forms/d/e/X/viewform?usp=pp_url&entry.1='
      + 'https%3A%2F%2Fprt-refresh.lemaliconsulting.com%2F%3Fview%3Ddots'
      + '%26day%3Dweekday%23x');
  });

  it('leaves the rest of the template untouched', () => {
    const href = feedbackHref(TEMPLATE, 'https://x/');
    expect(href!.startsWith('https://docs.google.com/forms/d/e/X/viewform?usp=pp_url&entry.1='))
      .toBe(true);
  });

  // The server refuses to start on such a template, so this is only ever
  // reached by a hand-edited /api/meta; even then the link must not throw,
  // because it is refreshed from the same function that writes the address
  // bar, and an exception there would break every click.
  it('returns null, never throws, when the template carries no placeholder', () => {
    expect(feedbackHref('https://docs.google.com/forms/d/e/X/viewform', 'https://x/'))
      .toBeNull();
  });

  it('exports the placeholder token so callers can match refresh/feedback.py', () => {
    expect(VIEW_PLACEHOLDER).toBe('{view}');
  });
});
