import { describe, it, expect } from 'vitest';
import {
  activeVerdict, oneSeatPanelHTML, oneSeatPromptHTML, VERDICT_SENTENCE,
} from './oneseatpanel';
import { Day, DayService, PlaceResult, OneSeatVerdict, SideResult } from './types';

function service(over: Partial<DayService> = {}): DayService {
  return {
    trips: 84,
    periods: { am_6_9a: 12, mid_9a_3p: 30 },
    hourly: true,
    headways: { in: { median: 10, max_gap_6a_6p: 20 } },
    routes: ['61A', '61B'],
    first: 300,
    last: 1500,
    ...over,
  };
}

function side(name: SideResult['side'], trips: number): SideResult {
  return {
    side: name,
    stops: [],
    days: {
      weekday: service({ trips }),
      saturday: service({ trips: trips - 20 }),
      sunday: service({ trips: trips - 40 }),
    },
  };
}

function verdict(over: Partial<OneSeatVerdict> = {}): OneSeatVerdict {
  return {
    key: 'downtown',
    name: 'Downtown',
    lat: 40.4406,
    lon: -79.9959,
    status: 'loses',
    current: ['51', '61A'],
    proposed: ['51'],
    kept: ['51'],
    lost: ['61A'],
    gained: [],
    ...over,
  };
}

function place(verdicts: OneSeatVerdict[], over: Partial<PlaceResult> = {}): PlaceResult {
  return {
    lat: 40.4,
    lon: -80.01,
    radius: 400,
    current: side('current', 84),
    proposed: side('proposed', 71),
    change: {
      weekday: { trips: -13, hourly: [true, true] },
      saturday: { trips: -8, hourly: [true, false] },
      sunday: { trips: -4, hourly: [false, false] },
    },
    place: { muni: 'Pittsburgh', hood: 'Beechview' },
    oneseat: verdicts,
    oneseat_day: 'any',
    ...over,
  };
}

const DOWNTOWN = { key: 'downtown' };
const PIN = { lat: 40.45, lon: -79.95 };

describe('which destination the panel is answering for', () => {
  it('matches a named destination by key', () => {
    const p = place([verdict({ key: 'oakland', name: 'Oakland' }), verdict()]);
    expect(activeVerdict(p, DOWNTOWN)?.name).toBe('Downtown');
  });

  it('takes the keyless verdict when a pin is down', () => {
    // The server puts the dropped pin first and keeps the named two behind it,
    // so the pin is identified by having no key rather than by its position.
    const p = place([verdict({ key: null, name: 'the point you picked' }), verdict()]);
    expect(activeVerdict(p, PIN)?.key).toBeNull();
  });

  it('has no answer when the database predates the one-seat layer', () => {
    expect(activeVerdict(place([]), DOWNTOWN)).toBeNull();
  });
});

describe('the panel', () => {
  it('leads with the destination, so moving the pin rewrites the heading', () => {
    // The whole reason this panel exists: with the shared location report, the
    // destination marker changed one row far down the scroll.
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    const head = html.slice(0, html.indexOf('</h2>'));
    expect(head).toContain('Downtown');
  });

  it('leads with the verdict rather than a trip count', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toContain(VERDICT_SENTENCE.loses);
    expect(html.indexOf(VERDICT_SENTENCE.loses)).toBeLessThan(html.indexOf('84'));
  });

  it('names the place the reader clicked, not just its coordinates', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toContain('Beechview');
  });

  it('splits the two route lists into what is kept, lost and gained', () => {
    // The panel it replaces printed both sides in full and left the reader to
    // diff fourteen numbers against fourteen by eye.
    const v = verdict({
      current: ['51', '61A'], proposed: ['51', '75'],
      kept: ['51'], lost: ['61A'], gained: ['75'],
    });
    const html = oneSeatPanelHTML(place([v]), DOWNTOWN, 'weekday');
    expect(html).toMatch(/lost[\s\S]*61A/i);
    expect(html).toMatch(/gained[\s\S]*75/i);
  });

  it('omits an empty half of the diff rather than printing "none"', () => {
    const v = verdict({ status: 'keeps', lost: [], gained: [], kept: ['51'] });
    const html = oneSeatPanelHTML(place([v]), DOWNTOWN, 'weekday');
    expect(html).not.toContain('>gained<');
    expect(html).toContain('>kept<');
  });

  it('still shows both sides in full, so a screenshot is checkable', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toContain('61A');
    expect(html).toContain('today');
    expect(html).toContain('proposed');
  });

  it('keeps the service figures, collapsed rather than deleted', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toContain('<details');
    const summary = html.slice(html.indexOf('<details'), html.indexOf('</summary>'));
    expect(summary).toContain('84');
    expect(summary).toContain('71');
  });

  it('says the service summary is a weekday when a weekday is on screen', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'saturday');
    const summary = html.slice(html.indexOf('<details'), html.indexOf('</summary>'));
    expect(summary).toContain('saturday');
    expect(summary).toContain('64');    // 84 - 20
  });

  it('says the verdict counts no day type when the published measure is on', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toContain('any calendar');
  });

  it('says which day restricts the verdict when the reader has opted in', () => {
    const p = place([verdict({ day: 'sunday' })], { oneseat_day: 'sunday' });
    const html = oneSeatPanelHTML(p, DOWNTOWN, 'weekday');
    expect(html).toContain('Sunday');
    expect(html).toContain('not the published measure');
  });

  it('offers the other destinations as a switch, not just a report', () => {
    const p = place([
      verdict(),
      verdict({ key: 'oakland', name: 'Oakland', status: 'keeps' }),
    ]);
    const html = oneSeatPanelHTML(p, DOWNTOWN, 'weekday');
    expect(html).toContain('data-goto-dest="oakland"');
    expect(html).not.toContain('data-goto-dest="downtown"');
  });

  it('says the ride is the only figure here counting rail', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toMatch(/inclines/);
  });

  it('points at the travel-time view for how long and how often', () => {
    const html = oneSeatPanelHTML(place([verdict()]), DOWNTOWN, 'weekday');
    expect(html).toMatch(/travel time/i);
  });

  it('does not ask for a one-seat ride to where the reader already is', () => {
    const v = verdict({ status: 'here' });
    const html = oneSeatPanelHTML(place([v]), DOWNTOWN, 'weekday');
    expect(html).toContain(VERDICT_SENTENCE.here);
    expect(html).not.toMatch(/kept|lost|gained/i);
  });

  it('falls back to the shared report when the database has no verdicts', () => {
    // An old refresh.db serves the rest of the app; this view should degrade
    // rather than render a panel with an empty headline.
    expect(oneSeatPanelHTML(place([]), DOWNTOWN, 'weekday')).toBe('');
  });
});

describe('the prompt', () => {
  it('names the destination before anything has been clicked', () => {
    // The case that reads worst today: with no red pin down, the destination
    // marker appears to do nothing at all.
    expect(oneSeatPromptHTML('Downtown')).toContain('Downtown');
  });

  it('escapes a destination label rather than trusting it', () => {
    expect(oneSeatPromptHTML('<b>x</b>')).not.toContain('<b>x</b>');
  });
});

const _day: Day = 'weekday';
