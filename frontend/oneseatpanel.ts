/**
 * The one-seat view's own panel — "can a rider get from here to there without
 * changing bus?", answered as the whole screen rather than as a row.
 *
 * Why this exists as a separate panel at all. The Locations and Surface views
 * share one report because they are the same measurement drawn two ways: a
 * quantity of service, answered at a point. The one-seat question is a
 * different unit (convention 13) — a connection, with no day type and no
 * clock on it — and while it shared that report the two pins were visibly
 * unequal: clicking the origin rewrote the panel, and moving the destination
 * changed one row far down the scroll. A reader could reasonably conclude the
 * destination marker did nothing. It does the most of anything on screen.
 *
 * So the presentation rules here are all versions of one rule — the
 * destination is the subject of the sentence:
 *
 *  - THE DESTINATION IS THE HEADING. Moving the marker retitles the panel.
 *  - THE VERDICT IS THE HEADLINE, not a number. The other panels put today
 *    and proposed side by side because they count something; this one is
 *    keeps / gains / loses, in the map's own colours so the panel and the dot
 *    under the reader's pin cannot appear to disagree.
 *  - THE ROUTE LISTS ARE DIFFED, not merely printed. Both sides in full is
 *    what makes "loses its one-seat ride to Downtown" checkable, and it stays;
 *    but at Downtown that is fourteen numbers against fourteen, and asking a
 *    reader to spot the difference by eye is asking them not to. What was
 *    lost, kept and gained is already computed server-side and was going
 *    unused.
 *  - SERVICE HERE IS COLLAPSED, NOT DROPPED. "Loses the Oakland ride, and the
 *    corridor drops from 84 buses to 71" is one thought. The summary line
 *    carries the trip counts so the fact is on screen closed; opening it gives
 *    the full report the Locations view leads with.
 *  - THE OTHER DESTINATIONS ARE A CONTROL. They are how a reader discovers
 *    there are others, and switching costs a click here rather than a hunt in
 *    the toolbar on the map.
 */
import { esc } from './utils';
import { Day, OneSeatDay, OneSeatStatus, OneSeatVerdict, PlaceResult } from './types';
import { Destination } from './oneseat';
import { placeLabel, routeList, serviceBodyHTML, serviceSummaryText } from './place';

/**
 * The headline sentence per verdict.
 *
 * Longer than the chip words the shared report uses (`ONESEAT_WORD` in
 * `place.ts`), because those sit beside a destination name and these are the
 * first thing on the panel — and because `here` needs to explain itself
 * rather than read as a fifth outcome.
 */
export const VERDICT_SENTENCE: Record<OneSeatStatus, string> = {
  keeps: 'Keeps its one-seat ride',
  gains: 'Gains a one-seat ride',
  loses: 'Loses its one-seat ride',
  none: 'No one-seat ride, before or after',
  here: 'You are already there',
};

const VERDICT_NOTE: Record<OneSeatStatus, string> = {
  keeps: 'Some single route serves both ends today and still does under the plan.',
  gains: 'No single route serves both ends today; one does under the plan.',
  loses: 'A single route serves both ends today; none does under the plan.',
  none: 'Reaching it means changing bus on both networks — for Oakland that is '
      + 'most of the county, before and after.',
  here: 'This point is inside the destination, so no one-seat ride is needed to '
      + 'reach it.',
};

const DAY_WORD: Record<string, string> = {
  weekday: 'a weekday',
  saturday: 'a Saturday',
  sunday: 'a Sunday',
};

/**
 * The verdict for wherever the map is currently measuring to.
 *
 * A dropped pin is identified by having no key rather than by being first in
 * the list: the server puts it first today, but the named destinations travel
 * with it and the panel should not break if that order ever changes.
 */
export function activeVerdict(p: PlaceResult,
                              dest: Destination): OneSeatVerdict | null {
  const verdicts = p.oneseat ?? [];
  if ('lat' in dest) return verdicts.find((v) => v.key === null) ?? null;
  return verdicts.find((v) => v.key === dest.key) ?? null;
}

/** One side of the diff, omitted entirely when it is empty. */
function diffRow(label: string, routes: string[]): string {
  if (!routes.length) return '';
  return `<div class="rrow"><span class="rlab">${label}</span>${routeList(routes)}</div>`;
}

/**
 * What changed, as three lists instead of two.
 *
 * Nothing here is a count. A "one route lost" score off these lists would be
 * mostly renumbering (the 61A–D become the 60X/61X/62X), which is the same
 * trap the shared report's route note warns about.
 */
function diffHTML(v: OneSeatVerdict): string {
  const rows = diffRow('kept', v.kept) + diffRow('lost', v.lost)
    + diffRow('gained', v.gained);
  if (!rows) return '';
  // The renumbering warning only belongs where both halves are on screen: it
  // is about mistaking one for the other, and with only one there is nothing
  // to mistake.
  const note = v.lost.length && v.gained.length
    ? `Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.` : '';
  return `
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${rows}
      <p class="note">These are the routes serving both this spot and the
         destination — not everything that stops here. ${note}</p>
    </div>`;
}

/** Both sides in full: the verdict above is a sentence somebody will screenshot. */
function sidesHTML(v: OneSeatVerdict): string {
  return `
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      <div class="rrow"><span class="rlab">today</span>${routeList(v.current)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${routeList(v.proposed)}</div>
    </div>`;
}

/** The other destinations: a verdict apiece, and a click to switch to one. */
function othersHTML(p: PlaceResult, active: OneSeatVerdict): string {
  const others = (p.oneseat ?? []).filter((v) => v !== active && v.key !== null);
  if (!others.length) return '';
  const rows = others.map((v) => `
    <button class="os-other" data-goto-dest="${esc(v.key!)}">
      <span class="os-name">${esc(v.name)}</span>
      <span class="os-status ${esc(v.status)}">${STATUS_WORD[v.status]}</span>
    </button>`).join('');
  return `
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${rows}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`;
}

/** The chip words, matching the shared report so the two never diverge. */
const STATUS_WORD: Record<OneSeatStatus, string> = {
  here: 'you are here',
  keeps: 'keeps',
  gains: 'gains',
  loses: 'loses',
  none: 'no ride either way',
};

/** Which of the two measurements produced the verdict — never left implied. */
function measureNote(day: OneSeatDay): string {
  return day === 'any'
    ? `Counted on any calendar, which is the published measure — no day type
       enters it.`
    : `Restricted to routes running on ${DAY_WORD[day] ?? day}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`;
}

export function oneSeatPanelHTML(p: PlaceResult, dest: Destination,
                                 day: Day): string {
  const v = activeVerdict(p, dest);
  // An old refresh.db has no destination table and returns no verdicts. The
  // caller falls back to the shared report rather than heading a panel with a
  // blank destination.
  if (!v) return '';

  const osDay = p.oneseat_day ?? 'any';
  const body = v.status === 'here' ? '' : diffHTML(v) + sidesHTML(v);

  return `
    <div class="place-head">
      <h2>One-seat ride to ${esc(v.name)}</h2>
      <div class="muted">
        from ${esc(placeLabel(p))} · ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} ·
        within ${p.radius} m
      </div>
    </div>

    <div class="os-verdict ${esc(v.status)}">${VERDICT_SENTENCE[v.status]}</div>
    <p class="note">${VERDICT_NOTE[v.status]} ${measureNote(osDay)}</p>

    ${body}

    ${othersHTML(p, v)}

    <details class="svc">
      <summary>Service at this spot: ${serviceSummaryText(p, day)}</summary>
      ${serviceBodyHTML(p, day)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs — a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`;
}

/**
 * Before anything has been clicked.
 *
 * This is the case that read worst under the shared report: with no origin on
 * the map, the destination marker had nothing at all to point at. Naming the
 * destination here means moving it visibly does something on an empty panel.
 */
export function oneSeatPromptHTML(destLabel: string): string {
  return `
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${esc(destLabel)}</b> without changing bus — red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this — which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`;
}
