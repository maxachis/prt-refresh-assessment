/**
 * One line saying which question the panel underneath is answering.
 *
 * This exists because the controls moved onto the map. While they sat
 * directly above the panel, the framing was legible by position: the day and
 * the walk radius a number was measured at were two centimetres above the
 * number. Off in the map's toolbar they are no longer anywhere near it, and a
 * panel read on its own -- scrolled, screenshotted, or with the toolbar
 * ignored -- would be a set of figures with no measurement attached.
 *
 * That is not a cosmetic loss here. The one-seat view can be showing either of
 * two different measurements (the published day-free answer, or a day-typed
 * one that is not what `data/oneseat_change.csv` counts), and convention 13
 * requires anything quoting a one-seat number to say which. The legend says it
 * for the map; this says it for the panel, and the two are worded alike so a
 * reader comparing them sees one statement rather than two.
 *
 * Kept as a pure string so it can be tested without a DOM, like the legend's
 * counting helpers.
 */
import { esc } from './utils';
import { Day } from './types';

const SEP = ' · ';

export interface QuestionState {
  view: string;
  day: Day;
  radius: number;
  /** Whether the one-seat question has been restricted to `day`. */
  oneSeatRestricted: boolean;
  /** What the destination-taking views are measuring to, already named. */
  destination: string;
}

const VIEW_LABEL: Record<string, string> = {
  dots: 'Locations',
  surface: 'Surface',
  both: 'Locations + surface',
  corridors: 'Streets',
  oneseat: 'One-seat ride',
  journey: 'Travel time',
};

/**
 * What to call the view where there is only room for its name.
 *
 * The phone toolbar closes into a single button, and that button has to say
 * which view is up -- it is the only thing on screen naming it while the
 * controls are shut. Same labels as the line below, so the button and the
 * state line cannot come to call the same view two things.
 */
export function viewLabel(view: string): string {
  return VIEW_LABEL[view] ?? view;
}

const DAY_WORD: Record<Day, string> = {
  weekday: 'a weekday',
  saturday: 'a Saturday',
  sunday: 'a Sunday',
};

/** Views that measure to somewhere, and so have to name it. */
const TAKES_DESTINATION = ['oneseat', 'journey'];

/**
 * The walk radius applies to the panel, not to the layer.
 *
 * So it stays on the line for Streets -- whose map ignores it, but whose
 * click still opens the walk-access panel -- and comes off only for the
 * travel-time view, where the panel is an itinerary and every walk in it was
 * measured by the router rather than by this control.
 */
function usesRadius(view: string): boolean {
  return view !== 'journey';
}

export function questionLine(s: QuestionState): string {
  const parts = [VIEW_LABEL[s.view] ?? s.view];
  if (TAKES_DESTINATION.includes(s.view)) parts[0] += ` to ${s.destination}`;
  parts.push(s.view === 'oneseat' && !s.oneSeatRestricted
    ? 'any day' : DAY_WORD[s.day]);
  if (usesRadius(s.view)) parts.push(`${s.radius} m walk`);
  return parts.join(SEP);
}

/**
 * The same line, with the view carrying the weight.
 *
 * Escaped rather than interpolated raw: a dropped pin's name is a pair of
 * coordinates today, but it is the reader's, and this is a string built from
 * it.
 */
export function questionLineHTML(s: QuestionState): string {
  const [head, ...rest] = questionLine(s).split(SEP);
  return `<b>${esc(head)}</b>${rest.map((r) => SEP + esc(r)).join('')}`;
}
