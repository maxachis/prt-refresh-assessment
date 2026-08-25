import { describe, it, expect } from 'vitest';
import { questionLine, questionLineHTML, viewLabel } from './statebar';

const BASE = {
  view: 'dots',
  day: 'weekday' as const,
  radius: 400,
  oneSeatRestricted: false,
  destination: 'Downtown',
};

describe('questionLine', () => {
  it('names the view, the day and the walk radius', () => {
    expect(questionLine(BASE)).toBe('Locations · a weekday · 400 m walk');
  });

  it('carries the chosen day and radius', () => {
    expect(questionLine({ ...BASE, day: 'saturday', radius: 150 }))
      .toBe('Locations · a Saturday · 150 m walk');
  });

  it('names both layers when the surface is drawn over the dots', () => {
    expect(questionLine({ ...BASE, view: 'both' }))
      .toBe('Locations + surface · a weekday · 400 m walk');
  });

  // The street view has no walk radius on the map, but the panel a click
  // opens is still the walk-access panel, so the radius stays on the line.
  it('keeps the radius on Streets, where the panel still uses it', () => {
    expect(questionLine({ ...BASE, view: 'corridors' }))
      .toBe('Streets · a weekday · 400 m walk');
  });

  // The published one-seat answer has no day type. Saying "a weekday" here
  // would attach the map to a measurement it is not making.
  it('says the one-seat answer is day-free unless the reader opted in', () => {
    expect(questionLine({ ...BASE, view: 'oneseat' }))
      .toBe('One-seat ride to Downtown · any day · 400 m walk');
  });

  it('names the day once the one-seat question is restricted to one', () => {
    expect(questionLine({ ...BASE, view: 'oneseat', oneSeatRestricted: true,
                          day: 'sunday' }))
      .toBe('One-seat ride to Downtown · a Sunday · 400 m walk');
  });

  // A journey's walking is the router's own, not the access radius, so a
  // radius on this line would be a number the answer never used.
  it('drops the radius from a timed trip, which does not use one', () => {
    expect(questionLine({ ...BASE, view: 'journey', destination: 'Oakland' }))
      .toBe('Travel time to Oakland · a weekday');
  });

  it('uses whatever the destination is called, pin included', () => {
    expect(questionLine({ ...BASE, view: 'journey',
                          destination: '40.4406, -79.9959' }))
      .toBe('Travel time to 40.4406, -79.9959 · a weekday');
  });
});

describe('questionLineHTML', () => {
  it('leads with the view, and escapes what the reader typed into a pin', () => {
    expect(questionLineHTML({ ...BASE, view: 'journey',
                              destination: '<b>40.4</b>' }))
      .toBe('<b>Travel time to &lt;b&gt;40.4&lt;/b&gt;</b> · a weekday');
  });
});

describe('viewLabel', () => {
  // The phone toolbar shuts into one button carrying this, so it has to agree
  // with the state line rather than being a second set of names for the same
  // six views.
  it('names a view the way the state line names it', () => {
    for (const view of ['dots', 'surface', 'both', 'corridors', 'oneseat', 'journey']) {
      expect(questionLine({ ...BASE, view }).startsWith(viewLabel(view))).toBe(true);
    }
  });

  it('falls back to the raw key rather than going blank', () => {
    expect(viewLabel('nonesuch')).toBe('nonesuch');
  });
});
