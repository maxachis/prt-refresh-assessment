import { describe, it, expect } from 'vitest';
import { triggerFace, nextOpen, OptionFace } from './dropdown';

const opt = (label: string, over: Partial<OptionFace> = {}): OptionFace => ({
  label, active: false, disabled: false, armed: false, ...over,
});

describe('triggerFace', () => {
  it('wears the active option', () => {
    const face = triggerFace([opt('400 m'), opt('150 m', { active: true })]);
    expect(face.label).toBe('150 m');
  });

  // The walk radius is disabled under Streets, and a trigger that stayed
  // clickable would open a menu of two greyed-out choices -- the same silent
  // control the disabling exists to prevent.
  it('is disabled when the active option is', () => {
    const face = triggerFace([
      opt('400 m', { active: true, disabled: true }),
      opt('150 m', { disabled: true }),
    ]);
    expect(face.disabled).toBe(true);
  });

  // "Pick a point" reads "click the map…" while the map is waiting for the
  // click, and the trigger is the only part of the control on screen then.
  it('carries the armed state and its label', () => {
    const face = triggerFace([
      opt('Downtown'),
      opt('click the map…', { active: true, armed: true }),
    ]);
    expect(face).toEqual({ label: 'click the map…', disabled: false, armed: true });
  });

  it('falls back to the first option when nothing is active', () => {
    expect(triggerFace([opt('Weekday'), opt('Saturday')]).label).toBe('Weekday');
  });
});

describe('nextOpen', () => {
  it('opens a closed group from its trigger', () => {
    expect(nextOpen(null, { kind: 'trigger', group: 'view' })).toBe('view');
  });

  it('closes the open group from its own trigger', () => {
    expect(nextOpen('view', { kind: 'trigger', group: 'view' })).toBeNull();
  });

  // One menu at a time: two open lists over the map is two questions being
  // asked at once, and the second trigger is a clearer "close the first"
  // than a click on empty map is.
  it('moves from one group to another without passing through closed', () => {
    expect(nextOpen('view', { kind: 'trigger', group: 'day' })).toBe('day');
  });

  it('closes on a pick, a click elsewhere, or Escape', () => {
    expect(nextOpen('view', { kind: 'pick' })).toBeNull();
    expect(nextOpen('view', { kind: 'outside' })).toBeNull();
    expect(nextOpen('view', { kind: 'escape' })).toBeNull();
  });

  it('stays closed when nothing was open', () => {
    expect(nextOpen(null, { kind: 'outside' })).toBeNull();
  });
});
