/**
 * The toolbar's search box: a stop, a route or a place, found by name.
 *
 * Everything else on the map is reached by looking — pan until the corner
 * you mean is under the cursor, then click it. That is fine for a reader who
 * knows where a corner is on a map and hopeless for one who knows it as
 * "Brownsville at Nobles", and it is the second reader this site is for. So
 * the box finds a thing by its name and then does whatever the map would
 * have done had the reader found it by eye: a stop is asked about exactly as
 * a map click asks (convention 2, the kerb), a place is flown to, a route
 * is drawn. It NEVER changes the reader's view — a pick answers in the view
 * they are in, because the view is the question and the box is only how
 * they pointed.
 *
 * THE QUERY GOES BY POST, and that is the one decision here that is not
 * cosmetic. The deployed site keeps an access log of request URIs
 * (`deploy/README.md`), and people type their home address into a box like
 * this one. A `GET /api/search?q=` would write every address to disk on the
 * box, masked reader address or not; a POST body is never logged.
 *
 * Three groups rather than one ranked list, because the three results are
 * different units and a pick on each does a different thing. A reader who
 * typed "61" wants to see the routes matching it separated from the stops
 * on 61st Street, not interleaved by some score.
 *
 * What a row's tag says, and does not say. A stop's tag names the networks
 * that have a pole of that name — "today · plan", "today", or "plan". A stop
 * on today's side alone is one the plan removes OR renames, and the box
 * cannot tell which from a name match; one on the plan's side alone is one
 * it adds. The tag is deliberately not "removed": what happens at that kerb
 * is decided when it is clicked, by the same code a map click runs, and a
 * verdict in the list would be a second, weaker measurement of the same
 * thing.
 *
 * The decisions — the request, the tags, the row order, the highlight, the
 * camera move — are pure so they can be tested without a DOM, like
 * `dropdown.ts` and `legend.ts`. `initSearch` at the bottom is the wiring.
 */
import { esc } from './utils';
import { SearchResponse, SearchPlace, SearchStop, SearchRoute, Side } from './types';
import { SIDE_WORD } from './stoproutes';

/** Where the text goes. POST — see the module comment; never put `q` in a URL. */
const SEARCH_URL = '/api/search';

/** Rows per group. Enough to disambiguate, few enough to fit under the box. */
export const SEARCH_LIMIT = 8;

/**
 * How long the box waits after a keystroke before asking. Long enough that a
 * word typed at speed is one request, short enough not to feel laggy.
 */
export const SEARCH_DEBOUNCE_MS = 150;

/** One character is a question: "6" is already the start of a route list. */
export const SEARCH_MIN_CHARS = 1;

/**
 * What a stop's tag calls each network. Short, because the tag is the
 * right-hand column of a narrow list, and these two words are the ones the
 * rest of the site uses for the two sides.
 */
export const NETWORK_TAG: Record<Side, string> = { current: 'today', proposed: 'plan' };

const TAG_SEP = ' · ';

/** The three headings, in the order the groups are listed and walked. */
const GROUP_HEADING = { places: 'Places', stops: 'Stops', routes: 'Routes' } as const;

const NOTHING_FOUND = 'Nothing found';

/** The prefix of each option's id, for `aria-activedescendant`. */
const OPTION_ID = 'search-opt-';

// --------------------------------------------------------------------------
// the request
// --------------------------------------------------------------------------

export function searchRequest(q: string, limit = SEARCH_LIMIT): { url: string; init: RequestInit } {
  return {
    url: SEARCH_URL,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, limit }),
    },
  };
}

// --------------------------------------------------------------------------
// the tags
// --------------------------------------------------------------------------

/**
 * "Squirrel Hill South · today · plan" — the place, then the networks, never
 * a verdict. The place is the boundary that CONTAINS the corner (convention
 * 6), and it is there because PRT reuses one stop name at corners kilometres
 * apart; without it two identical rows sit in the list with nothing to tell
 * them apart. Null outside every boundary, and then the tag is the networks.
 */
export function stopTag(sides: Side[], place: string | null = null): string {
  const ordered: Side[] = ['current', 'proposed'];
  const networks = ordered.filter((s) => sides.includes(s)).map((s) => NETWORK_TAG[s]);
  return [place, ...networks].filter(Boolean).join(TAG_SEP);
}

/** "today · Murray": the network the route is on, then its long name. */
export function routeTag(r: SearchRoute): string {
  return [SIDE_WORD[r.side], r.long_name].filter(Boolean).join(TAG_SEP);
}

// --------------------------------------------------------------------------
// the rows
// --------------------------------------------------------------------------

export type Row =
  | { kind: 'place'; place: SearchPlace }
  | { kind: 'stop'; stop: SearchStop }
  | { kind: 'route'; route: SearchRoute };

/**
 * Every result in one list, in the order the headings show them.
 *
 * The keyboard walks this list and a click reports an index into it, so the
 * order here is the one truth about "which row is third"; the HTML is built
 * from the same list so the two cannot disagree.
 */
export function rows(r: SearchResponse): Row[] {
  const byGroup: Record<Group, Row[]> = {
    places: r.places.map((place): Row => ({ kind: 'place', place })),
    stops: r.stops.map((stop): Row => ({ kind: 'stop', stop })),
    routes: r.routes.map((route): Row => ({ kind: 'route', route })),
  };
  return groupOrder(r.q).flatMap((g) => byGroup[g]);
}

type Group = keyof typeof GROUP_HEADING;

/**
 * Which group leads. Places, stops, routes -- except that a query starting
 * with a digit is a route number to anyone typing it, and PRT's
 * "BUTLER ST + #6130"-style stop names would otherwise put two stops above
 * the whole 61 family. The routes move to the top; nothing is dropped.
 */
export function groupOrder(q: string): Group[] {
  return /^\d/.test(q.trim()) ? ['routes', 'places', 'stops'] : ['places', 'stops', 'routes'];
}

/**
 * Which row the arrows land on next. Wraps at either end: the list spans
 * three groups, and an ArrowDown that stopped dead at the last place would
 * read as there being no stops.
 */
export function nextHighlight(current: number | null, step: 1 | -1, count: number): number | null {
  if (count === 0) return null;
  if (current === null) return step > 0 ? 0 : count - 1;
  return (current + step + count) % count;
}

// --------------------------------------------------------------------------
// the list
// --------------------------------------------------------------------------

function rowFace(row: Row): { name: string; tag: string } {
  switch (row.kind) {
    case 'place': return { name: row.place.name, tag: row.place.kind };
    case 'stop': return { name: row.stop.name, tag: stopTag(row.stop.sides, row.stop.place) };
    case 'route': return { name: row.route.short_name, tag: routeTag(row.route) };
  }
}

function optionHTML(row: Row, idx: number, highlighted: boolean): string {
  const { name, tag } = rowFace(row);
  return `<div id="${OPTION_ID}${idx}" role="option" aria-selected="${highlighted}"`
    + ` class="sr-row${highlighted ? ' hl' : ''}" data-idx="${idx}">`
    + `<span class="sr-name">${esc(name)}</span>`
    + `<span class="sr-tag">${esc(tag)}</span></div>`;
}

/**
 * The listbox: three headed groups, a group with nothing in it omitted, and
 * one line when all three are empty — an empty box under a typed word reads
 * as the search not having run.
 */
export function resultsHTML(r: SearchResponse, highlight: number | null): string {
  const all = rows(r);
  if (all.length === 0) return `<div class="sr-empty">${NOTHING_FOUND}</div>`;
  const kindOf: Record<Group, Row['kind']> = { places: 'place', stops: 'stop', routes: 'route' };
  let idx = 0;
  return groupOrder(r.q).map((group) => {
    const own = all.filter((row) => row.kind === kindOf[group]);
    if (own.length === 0) return '';
    const options = own.map((row) => optionHTML(row, idx, idx++ === highlight)).join('');
    return `<div class="sr-group" role="group" aria-label="${GROUP_HEADING[group]}">`
      + `<div class="sr-head">${GROUP_HEADING[group]}</div>${options}</div>`;
  }).join('');
}

// --------------------------------------------------------------------------
// moving the map to a picked stop
// --------------------------------------------------------------------------

/**
 * Below this the map is a county and a stop is a pixel; the dot a pick
 * opens the panel for has to be findable on screen, so the map comes in.
 */
const STOP_ZOOMED_OUT_BELOW = 14;

/** Where a pick lands the map when it has to move it: the street, not the block. */
const STOP_ZOOM_TO = 15;

export interface ViewBounds { west: number; south: number; east: number; north: number }
export interface MapView { zoom: number; bounds: ViewBounds }
export interface LatLon { lat: number; lon: number }
export interface CameraTarget extends LatLon { zoom: number }

/**
 * Where to ease the map before asking about a picked stop, or null to leave
 * it where it is.
 *
 * Only when the stop is off screen or the map is zoomed out past reading a
 * corner: a reader who has already framed the neighbourhood and is picking
 * stops from the list should not have the map jump under each one.
 */
export function easeTarget(view: MapView, point: LatLon): CameraTarget | null {
  const { bounds } = view;
  const onScreen = point.lon >= bounds.west && point.lon <= bounds.east
    && point.lat >= bounds.south && point.lat <= bounds.north;
  if (onScreen && view.zoom >= STOP_ZOOMED_OUT_BELOW) return null;
  return { lat: point.lat, lon: point.lon, zoom: Math.max(view.zoom, STOP_ZOOM_TO) };
}

// --------------------------------------------------------------------------
// the wiring
// --------------------------------------------------------------------------

export interface SearchElements {
  /** The `.controls` group, which is the unit the open state is kept on. */
  group: HTMLElement;
  input: HTMLInputElement;
  list: HTMLElement;
  /**
   * A button outside the group that focuses the box -- the phone's one-tap
   * way in. Named so the outside-click closer can let it be: its click
   * reaches `document` after the focus it caused has reopened the list,
   * and would otherwise shut what it had just opened.
   */
  opener?: HTMLElement;
}

export interface SearchOptions {
  elements: SearchElements;
  /** Asks the server; injected so the wiring does not own `fetch`. */
  search: (q: string) => Promise<SearchResponse>;
  onPick: (row: Row) => void;
}

/** The class the stylesheet opens the list under; shared with `dropdown.ts`'s groups. */
const OPEN_CLASS = 'open';

/**
 * Wire the box: type-ahead, the keyboard, and the two ways to close it.
 *
 * Every keystroke restarts a short timer, and only the request the timer
 * fires is sent — so a word typed at speed is one request, not one per
 * letter. A response is applied only if it is for the latest text
 * (`seq`, the same guard `main.ts` puts on a click): a slow answer for "car"
 * must not paint over the rows for "carrick" that arrived first.
 *
 * Picking clears the highlight and closes the list but keeps the text: the
 * reader may want to pick the next row for the same word, and the text is
 * what says what the map is now showing them.
 */
export function initSearch({ elements, search, onPick }: SearchOptions): { focus(): void } {
  const { group, input, list, opener } = elements;
  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let current: SearchResponse | null = null;
  let highlight: number | null = null;

  const setOpen = (on: boolean) => {
    group.classList.toggle(OPEN_CLASS, on);
    input.setAttribute('aria-expanded', String(on));
    if (!on) {
      highlight = null;
      input.removeAttribute('aria-activedescendant');
    }
  };

  const paint = () => {
    if (!current) return;
    list.innerHTML = resultsHTML(current, highlight);
    if (highlight === null) input.removeAttribute('aria-activedescendant');
    else {
      input.setAttribute('aria-activedescendant', `${OPTION_ID}${highlight}`);
      list.querySelector(`[data-idx="${highlight}"]`)?.scrollIntoView({ block: 'nearest' });
    }
  };

  const ask = (q: string) => {
    const mine = ++seq;
    void search(q).then((r) => {
      if (mine !== seq) return;         // a newer keystroke already won
      current = r;
      highlight = null;
      paint();
      setOpen(true);
    }).catch(() => {
      if (mine !== seq) return;
      // A failed search is an empty one as far as the reader can tell; the
      // line under the box says so rather than the list going quiet.
      current = { q, places: [], stops: [], routes: [] };
      highlight = null;
      paint();
      setOpen(true);
    });
  };

  const pick = (idx: number) => {
    if (!current) return;
    const row = rows(current)[idx];
    if (!row) return;
    setOpen(false);
    onPick(row);
  };

  input.addEventListener('input', () => {
    if (timer) clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < SEARCH_MIN_CHARS) {
      // Cleared: nothing to show, and a request in flight for the previous
      // text must not reopen the list over an empty box.
      seq++;
      current = null;
      setOpen(false);
      return;
    }
    timer = setTimeout(() => ask(q), SEARCH_DEBOUNCE_MS);
  });

  // Re-opens the last answer on focus, so tabbing back to the box after a
  // pick offers the same rows without retyping.
  input.addEventListener('focus', () => {
    if (current && input.value.trim().length >= SEARCH_MIN_CHARS) setOpen(true);
  });

  input.addEventListener('keydown', (e) => {
    const count = current ? rows(current).length : 0;
    const open = group.classList.contains(OPEN_CLASS);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open && current) setOpen(true);
      highlight = nextHighlight(highlight, e.key === 'ArrowDown' ? 1 : -1, count);
      paint();
    } else if (e.key === 'Enter') {
      if (open && highlight !== null) {
        e.preventDefault();
        pick(highlight);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        // Only when it took something: with the list already shut, Escape
        // belongs to whoever is listening above -- the phone sheet closes
        // on it.
        e.stopPropagation();
        setOpen(false);
      }
      input.blur();
    }
  });

  // A click on a row picks it. `mousedown` rather than `click`, and the
  // default prevented, so the input does not blur -- and the list does not
  // close -- before the click lands.
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-idx]');
    if (row) pick(Number(row.dataset.idx));
  });

  // Clicking anywhere outside the group closes it, as `dropdown.ts` does
  // for the folded groups: two things open on the map at once is one too
  // many, and a list left hanging over the map covers the dots it names.
  document.addEventListener('click', (e) => {
    if (!group.classList.contains(OPEN_CLASS)) return;
    const target = e.target as Node;
    if (group.contains(target) || opener?.contains(target)) return;
    setOpen(false);
  });

  return {
    focus() {
      input.focus();
      input.select();
    },
  };
}
