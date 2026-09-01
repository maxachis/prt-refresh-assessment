import { $, fetchJSON, esc } from './utils';
import { initMapLayers, showPlace } from './mapview';
import { render, renderEmpty, setDay, activeDay, placeLabel } from './place';
import { oneSeatPanelHTML, oneSeatPromptHTML } from './oneseatpanel';
import {
  initChangeLayer, loadChangeLayer, setChangeDay, toggleBucket, resetBuckets,
  layerData, dotLabel,
} from './change';
import {
  renderLegend, renderCorridorLegend, renderOneSeatLegend, pinKeyHTML,
} from './legend';
import {
  initSurfaceLayer, loadSurfaceLayer, setSurfaceDay, setSurfaceVisible,
  layerData as surfaceData, isVisible as surfaceOn,
} from './surface';
import {
  loadPopulationLayer, layerData as populationData,
} from './population';
import {
  initCorridorLayer, loadCorridorLayer, setCorridorDay, setCorridorVisible,
  layerData as corridorData, isVisible as corridorOn,
} from './corridor';
import {
  initOneSeatLayer, loadOneSeatLayer, setOneSeatVisible, oneSeatDayFor,
  dayControlsShown,
  layerData as oneSeatData, isVisible as oneSeatOn,
  dotLabel as oneSeatDotLabel, HERE_COLOR, Destination, activeDestButton,
} from './oneseat';
import {
  initJourneyLayer, setJourneyVisible, drawJourney, journeyUrl,
  journeyPanelHTML, journeyPromptHTML, journeyKeyHTML,
  isVisible as journeyOn, journeyData, Point,
} from './journey';
import {
  initPlacesLayer, loadPlaces, loadBoundaries, selectPlace, setPlacesVisible,
  placesListHTML, placesKeyHTML, placeTooltipHTML, setPlacesFill,
  PlaceSort, PlaceFill, DEFAULT_PLACE_FILL, BOUNDARY_LAYER,
  layerData as placeDetail, listData as placesList, isVisible as placesOn,
  boundariesData,
} from './places';
import { questionLineHTML, viewLabel } from './statebar';
import {
  Camera, UrlState, isFramed, parseUrlState, toSearch,
} from './urlstate';
import { fullViewLabel, isEmbedded, withEmbed, withoutEmbed } from './embed';
import { initSheet, onLayoutFlip, Sheet } from './sheet';
import {
  PlaceResult, Day, OneSeatDay, JourneyResult, NamedDestination, Weight,
  SurfaceUnit,
} from './types';

const PGH: [number, number] = [-79.9959, 40.4406];
const PGH_ZOOM = 12;              // the county, near enough
const ORIGIN_COLOR = '#e2574c';   // the red "you asked here" pin

/**
 * The toolbar's controls, addressed by the attribute that carries their value.
 *
 * Named here because two things now need them: `segment` wires each row up,
 * and a link or an embed arriving with a question already in it has to press
 * the same buttons a reader would. Pressing them, rather than assigning the
 * variables behind them, is what keeps a linked view identical to a clicked
 * one -- every side effect a control has is in its handler, and there is no
 * second path that could acquire fewer of them.
 */
const CONTROL = {
  radius: 'data-radius',
  day: 'data-day',
  oneSeatDay: 'data-oneseat-day',
  view: 'data-view',
  dest: 'data-dest',
  placeFill: 'data-place-fill',
} as const;

/**
 * What this load was asked to open at, if a link or an embed said.
 *
 * Read before the map is constructed because the camera is a construction
 * argument: opening at the default view and then flying to the asked-for one
 * would fetch a countyful of tiles nobody wanted to see.
 */
const opening = parseUrlState(location.search);

/**
 * Whether this load is furniture in somebody else's page.
 *
 * Decided before the map is built, because it changes the map's own column:
 * the answer panel goes and the map takes the width. Adding the class after
 * MapLibre had measured its container would leave the canvas sized for a
 * window it no longer has, and a canvas resized behind the map's back puts
 * clicks on the wrong coordinates -- here, the wrong answer rather than
 * merely the wrong pixel.
 */
const embedded = isEmbedded(location.search);
if (embedded) $('app').classList.add('embed');

/**
 * Stands in for the sheet where there is no panel to move.
 *
 * An embed is often narrow enough to be in the phone layout, and the sheet
 * would otherwise go on reserving map padding and driving `--sheet-h` for a
 * drawer that is not on screen.
 */
const NO_SHEET: Sheet = { at: () => 'full', atLeast() { /* nothing to move */ } };

/** Where the map is looking, once someone has moved it. */
let camera: Camera | null = null;

let radius = 400;
let marker: maplibregl.Marker | null = null;
let last: { lat: number; lon: number } | null = null;
// The last answer, kept so the panel can be redrawn for a different view or a
// different day without asking the server the same question again.
let lastPlace: PlaceResult | null = null;
let seq = 0;   // guards against a slow response overwriting a newer click

// The one-seat view's destination. A named district by default; a dropped pin
// once the reader asks for one, which is the whole reason the layer computes
// its destination per request instead of at build time.
let dest: Destination = { key: 'downtown' };
let destMarker: maplibregl.Marker | null = null;
// While this is on, a map click sets the destination rather than opening the
// panel. It clears itself after one click: a mode that stays on is a mode a
// reader forgets they are in, and every later click would silently move the
// destination instead of answering "what changes here?".
let pinMode = false;

// Whether the one-seat view is restricted to the toolbar's day type. Off by
// default and deliberately its own control rather than the day buttons: the
// day-free answer is the published one, and a reader who switched to Saturday
// for the Locations view must not find the one-seat counts quietly off the
// figures `data/oneseat_change.csv` carries.
let oneSeatRestricted = false;

// What the change legend counts: the dots themselves, or the riders who board
// at them. A second denominator over one set of points (convention 15), and it
// lives here rather than in the toolbar because it changes how the key reads
// rather than which question the map is answering.
let weight: Weight = 'locations';

// What the surface key counts: ground, or the people who live on it. Lives
// here for the same reason `weight` does -- it changes how the surface's own
// key reads, not which question the surface is answering -- and it has no
// toolbar button of its own, only the switch drawn inside the key itself.
let surfaceUnit: SurfaceUnit = 'area';

// Which order the Places list is ranked in. Lives here for the same reason
// `weight` and `surfaceUnit` do: it changes how the list reads, not which
// question the view is answering, and it has no toolbar button -- unlike the
// fill beside it, which paints the map, this only reorders the panel's own
// rows, so its two buttons stay in the panel they reorder. Both orders are
// true and they disagree violently (Baldwin borough is 1st by count, Reserve
// township 1st by share), so this defaults to the more familiar of the two
// rather than the app picking a "right" one.
let placeSort: PlaceSort = 'count';

// The Places view's selected place, by its /api/places key, or null before
// anything has been picked. Kept here rather than only in `places.ts` so
// `syncUrl` can write it and a reload can restore it, the same way `dest`
// is kept here rather than only in `oneseat.ts`.
let selectedPlace: string | null = null;

// Which of the choropleth's three readings is on the map -- residents who
// lose all buses, residents who gain one, or the plan's own bus service.
// Unlike `placeSort` above, this one paints the map rather than the panel, so
// its segment lives in the toolbar (`#place-fill-controls`) with every other
// control that changes what is on the ground.
let placeFill: PlaceFill = DEFAULT_PLACE_FILL;

// Which view is on screen. Two of them — one-seat and travel time — take a
// destination, and one of those two answers on a click rather than on a load,
// so the click handler and the day control both have to know which is active.
let view = 'dots';

// The answer panel, as a bottom sheet on a phone and as an inert stub in the
// two-column layout. Created once the map exists, because moving it changes
// how much map is left to aim at.
let sheet: Sheet;

// The named destinations' centres, fetched once. The one-seat view measures to
// a district — 44 stops for Downtown, 93 for Oakland — but a journey has to
// have somewhere to arrive, so the travel-time view uses the centre of that
// same seed cloud. That is the identical point `analyze_travel_time.py`
// searches to, so "to Downtown" here is the published question rather than a
// second definition of Downtown.
let named: NamedDestination[] = [];

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/positron',
  center: opening.camera ? [opening.camera.lon, opening.camera.lat] : PGH,
  zoom: opening.camera?.zoom ?? PGH_ZOOM,
  // Embedded in someone else's page, the wheel is theirs: a reader scrolling
  // past a map they were not using should not have it swallow the scroll and
  // zoom out to the Atlantic. Ctrl+wheel and two fingers still work, and
  // MapLibre says so on the map the first time a plain scroll is refused.
  // Off when we are the whole page, where the wheel has nothing else to do.
  cooperativeGestures: isFramed(window),
  // Folded to its (i) button rather than spelled out along the bottom edge.
  // The credit is a condition of using the tiles and stays one tap away on
  // every screen; what it must not do on a phone is take a full-width band of
  // map directly above the sheet, which is where the map is thinnest.
  attributionControl: { compact: true },
});
map.addControl(new maplibregl.NavigationControl(), 'top-right');

map.on('load', () => {
  initMapLayers(map);
  initChangeLayer(map);      // after initMapLayers: it inserts beneath 'walk-fill'
  initSurfaceLayer(map, 'change-dots');   // under the dots, so 'Both' reads
  initCorridorLayer(map, 'change-dots');  // same slot; corridors and dots/surface are mutually exclusive
  initOneSeatLayer(map, 'walk-fill');     // the dots' own slot; the two never show together
  initJourneyLayer(map);                  // on top: two drawn trips, over everything
  initPlacesLayer(map, 'change-dots');    // same slot as corridors; mutually exclusive with dots/surface too
  renderPanel();

  map.on('click', (e: any) => {
    if (pinMode) {
      setDestination({ lat: e.lngLat.lat, lon: e.lngLat.lng });
      return;
    }
    // Places has no walk-radius click to answer (see `askAt`'s own early
    // return for this view) -- a click here selects a place instead, the
    // same effect as clicking its row in the list, so the choropleth is
    // clickable rather than a picture the reader can only look at.
    if (view === 'places') {
      const hit = map.queryRenderedFeatures(e.point, { layers: [BOUNDARY_LAYER] })[0];
      if (hit) void goToPlace(hit.properties!.key as string);
      return;
    }
    // Snap to a change dot when one is under the cursor, so the panel that
    // opens is measured at the same point the dot was coloured from. Clicking
    // a dot and getting a different answer to the one it is painted with is
    // the single worst thing this layer could do.
    const layers = ['change-dots', 'oneseat-dots'].filter((l) =>
      map.getLayoutProperty(l, 'visibility') !== 'none');
    const hit = map.queryRenderedFeatures(e.point, { layers })[0];
    const c = hit ? (hit.geometry as any).coordinates : [e.lngLat.lng, e.lngLat.lat];
    // The travel-time view answers on the click itself rather than from a
    // preloaded layer: both ends are the reader's, so there is nothing to
    // precompute and the panel is the whole answer. `askAt` decides which,
    // so a dragged pin and a click cannot diverge.
    askAt(c[1], c[0]);
  });

  // Hovering the choropleth indicates it is clickable, the same cue the dot
  // layers give -- see the mouseenter/mouseleave pairs below.
  map.on('mouseenter', BOUNDARY_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', BOUNDARY_LAYER, () => { map.getCanvas().style.cursor = ''; });

  const popup = new maplibregl.Popup({ closeButton: false, offset: 8 });
  map.on('mouseenter', 'change-dots', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'change-dots', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
  map.on('mousemove', 'change-dots', (e: any) => {
    const f = e.features?.[0];
    const d = layerData();
    if (!f || !d) return;
    popup.setLngLat((f.geometry as any).coordinates)
      .setHTML(dotLabel(f.properties, activeDay(), d.buckets)).addTo(map);
  });

  map.on('mouseenter', 'oneseat-dots', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'oneseat-dots', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
  map.on('mousemove', 'oneseat-dots', (e: any) => {
    const f = e.features?.[0];
    const d = oneSeatData();
    if (!f || !d) return;
    popup.setLngLat((f.geometry as any).coordinates)
      .setHTML(oneSeatDotLabel(f.properties, d)).addTo(map);
  });

  // The choropleth's own hover tooltip, sharing the one popup every other
  // layer uses. `placeFill` decides which reading leads (`placeTooltipHTML`'s
  // own doc), so this reads the module state directly rather than caching a
  // stale copy captured when the handler was wired. `activeDay()` is read
  // the same way, for the one reading ('service') that has a day of its own.
  map.on('mouseleave', BOUNDARY_LAYER, () => popup.remove());
  map.on('mousemove', BOUNDARY_LAYER, (e: any) => {
    const f = e.features?.[0];
    if (!f) return;
    popup.setLngLat(e.lngLat)
      .setHTML(placeTooltipHTML(f.properties, placeFill, activeDay())).addTo(map);
  });

  map.on('moveend', () => {
    // Recorded on every move, including the ones the app makes itself when it
    // fits a click's walk circle: what the link reproduces is what is on
    // screen, not only what was reached by dragging.
    const c = map.getCenter();
    camera = { lat: c.lat, lon: c.lng, zoom: map.getZoom() };
    refreshLegend();
    syncUrl();
  });

  // Radius is a control, not a constant: 400 m is the headline quarter-mile
  // access distance and 150 m the strict same-corner test, and where the two
  // disagree that disagreement is the finding (the station consolidations).
  segment(CONTROL.radius, (b) => {
    radius = Number(b.dataset.radius);
    void loadChangeLayer(map, radius, activeDay()).then(refreshLegend);
    if (surfaceData()) {
      void loadSurfaceLayer(map, radius, activeDay()).then(refreshLegend);
    }
    // Same lazy-refetch rule as the surface itself: only reload the
    // population lattice if a reader has already asked for it at least once.
    if (populationData()) {
      void loadPopulationLayer(radius).then(refreshLegend);
    }
    if (oneSeatData()) void reloadOneSeat();
    if (last) void load(last.lat, last.lon);
  });

  // Day type governs the citywide layer and the panel together. 152 locations
  // keep every weekday bus and lose the weekend entirely, and on a
  // weekday-only map they are invisible.
  segment(CONTROL.day, (b) => {
    const day = b.dataset.day as Day;
    setDay(day);
    // The panel carries the day type too -- as its headline in the Locations
    // and Surface views, and as the collapsed service summary under a one-seat
    // verdict -- so it is redrawn from the answer already in hand.
    if (view !== 'journey') renderPanel();
    setChangeDay(map, day);
    setSurfaceDay(map, day);
    // A journey has a day type of its own — a Sunday trip is a fair question
    // to ask, and the published one is the weekday peak — so the answer on
    // screen is re-timed rather than left showing yesterday's day type.
    if (view === 'journey' && last) void loadJourney(last.lat, last.lon);
    if (corridorData()) void setCorridorDay(map, day).then(refreshLegend);
    // The one-seat layer moves with the day only while the reader has asked
    // it to; off the toggle it stays on the published day-free answer, and
    // its legend says which of the two is on screen.
    if (oneSeatRestricted && oneSeatData()) {
      void reloadOneSeat();
      if (last) void load(last.lat, last.lon);
    }
    // The service reading is the one Places fill that has a day of its own
    // (`PlaceFill`'s docstring) -- the residents readings ignore this
    // control entirely, so only the paint needs redrawing here; the panel's
    // list and the SERVICE_DAY_NOTE it prints in that mode were already
    // handled by `renderPanel()` above, and the legend's own null-hole
    // sentence is redrawn by `refreshLegend()` below.
    if (placesOn() && placeFill === 'service') setPlacesFill(map, placeFill, day);
    refreshLegend();
  });

  // The one-seat view's own day control. A separate opt-in rather than a
  // fourth day button because the two answers are not the same measurement:
  // the day-free one is what the published figures count, and the day-typed
  // one exists because 152 locations keep every weekday bus and lose the
  // weekend. Restricting is additive — the reader chooses to leave the
  // published answer, and the legend tells them they have.
  segment(CONTROL.oneSeatDay, (b) => {
    oneSeatRestricted = b.dataset.oneseatDay === 'selected';
    refreshDayControls();
    void reloadOneSeat();
    if (last) void load(last.lat, last.lon);
  });

  // Locations, surface, both, or streets. The surface and the corridors are
  // both fetched on first use rather than at startup: the surface is ~48,500
  // cells against ~5,900 dots and the corridors are ~200 KB per day type, and
  // a reader who never switches views should not pay for either.
  segment(CONTROL.view, (b) => {
    const previous = view;
    view = b.dataset.view!;
    map.setLayoutProperty('change-dots', 'visibility',
      view === 'dots' || view === 'both' ? 'visible' : 'none');
    void showSurface(view === 'surface' || view === 'both');
    void showCorridors(view === 'corridors');
    void showOneSeat(view === 'oneseat');
    showJourney(view === 'journey', previous === 'journey');
    void showPlaces(view === 'places');
    // One-seat and the shared location report answer different questions from
    // the same fetched answer, so switching between them redraws rather than
    // refetches. Leaving the journey view is handled by `showJourney`, which
    // has to refetch: a timed trip is not in `lastPlace`.
    if (view !== 'journey' && previous !== 'journey'
        && (view === 'oneseat' || previous === 'oneseat')) {
      renderPanel({ scrollToTop: true });
    }
    // Neither the street view, the travel-time view nor Places has a walk
    // radius: a corridor is a piece of street, a journey's walk is the
    // router's own (`journey.CONSTANTS`), and a place is measured at every
    // one of its own census blocks, not inside a circle. Disabled rather
    // than left clickable and silently ignored.
    setRadiusEnabled(view !== 'corridors' && view !== 'journey' && view !== 'places');
    // The destination picker means something in two views, and a mode left
    // armed behind a hidden control is a click the reader cannot account for.
    const picksDestination = view === 'oneseat' || view === 'journey';
    $('dest-controls').classList.toggle('hidden', !picksDestination);
    $('oneseat-day-controls').classList.toggle('hidden', view !== 'oneseat');
    // The fill control means nothing outside Places -- it chooses which of a
    // place's own figures paints the map, and there is no such figure once
    // the view is asking a different question entirely. (The list's sort
    // control needs no line here: it is drawn inside the panel, which the
    // view switch replaces wholesale.)
    $('place-fill-controls').classList.toggle('hidden', view !== 'places');
    refreshDayControls();
    if (!picksDestination) setPinMode(false);
    showDestinationMarker();
  });

  // Where the one-seat view is measuring TO. Downtown and Oakland are the two
  // destinations BASE_CAMP asks about and the two the published place-level
  // answer covers; "pick a point" is the reason the layer applies its
  // destination per request rather than baking a list in at build time.
  segment(CONTROL.dest, (b) => {
    const key = b.dataset.dest!;
    if (key === 'pin') {
      setPinMode(true);
      return;
    }
    setPinMode(false);
    setDestination({ key });
  });

  // The choropleth's own losses/gains/service toggle -- see `PlaceFill`'s
  // docstring for why this switches the whole reading rather than blending
  // them. `applyOpening` can press this button (via `press(CONTROL.placeFill,
  // ...)`) before the Places layer has ever been loaded, since a link can
  // open straight onto a gains map; `setPlacesFill` calls
  // `map.setPaintProperty` on a layer that does not exist until `showPlaces`
  // creates it, so the repaint only happens once the layer is actually on
  // screen. Nothing is lost by skipping it here -- `showPlaces` already
  // applies whatever `placeFill` holds by the time it turns the layer on.
  segment(CONTROL.placeFill, (b) => {
    placeFill = b.dataset.placeFill as PlaceFill;
    if (placesOn()) setPlacesFill(map, placeFill, activeDay());
    renderPanel();
    refreshLegend();
    // 'service' is the one Places reading the day buttons mean anything
    // for (`dayControlsShown`'s own doc), so switching to or away from it
    // has to show or hide that row, not just repaint the map.
    refreshDayControls();
  });

  $('legend').addEventListener('click', (e) => {
    const w = (e.target as HTMLElement).closest<HTMLElement>('[data-weight]');
    if (w) {
      weight = w.dataset.weight as Weight;
      refreshLegend();
      syncUrl();
      return;
    }
    const u = (e.target as HTMLElement).closest<HTMLElement>('[data-surface-unit]');
    if (u) {
      surfaceUnit = u.dataset.surfaceUnit as SurfaceUnit;
      void showSurfaceUnit(surfaceUnit);
      syncUrl();
      return;
    }
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-bucket]');
    if (!row) return;
    toggleBucket(map, row.dataset.bucket!, activeDay());
    refreshLegend();
  });
  $('legend-reset').addEventListener('click', () => {
    resetBuckets(map, activeDay());
    refreshLegend();
  });

  // The key and the toolbar together were most of a phone's map. Collapsing
  // leaves the head line, which is the one that carries the count and the
  // measurement, so nothing on screen becomes unattributed.
  $('legend-collapse').addEventListener('click', () => {
    collapseLegend(!$('legend-box').classList.contains('collapsed'));
  });

  // The one-seat panel lists the destinations it is NOT measuring to, with
  // their verdicts, and each is a control: it is where a reader discovers the
  // others exist, so switching should not mean finding the toolbar again.
  $('panel').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-goto-dest]');
    if (b) setDestination({ key: b.dataset.gotoDest! });

    // A figure's provenance is written once, in the drawer. Opening it at the
    // top would leave the reader to find which of fourteen entries they asked
    // for, so the entry is scrolled to and marked.
    const m = (e.target as HTMLElement).closest<HTMLElement>('[data-caveat]');
    if (m) showCaveat(m.dataset.caveat!);

    // A row in the Places list.
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-select-place]');
    if (row) void goToPlace(row.dataset.selectPlace!);

    // The Places list's own count/share toggle. Delegated rather than bound
    // like the toolbar's segments, because this button is redrawn with every
    // `renderPanel` and a listener attached at load would die with the first
    // repaint. It reorders the rows and nothing else -- no repaint, and
    // nothing in the URL, since the ranking is how the answer is read rather
    // than which answer it is.
    const sort = (e.target as HTMLElement).closest<HTMLElement>('[data-sort-places]');
    if (sort) {
      placeSort = sort.dataset.sortPlaces as PlaceSort;
      renderPanel();
    }

    // The panel's population line, wherever it is on screen (`place.ts`'s
    // `data-goto-place`) -- the fix the whole view exists for. Switches view
    // by pressing the toolbar button rather than assigning `view` directly,
    // for the same reason `press` exists everywhere else: every side effect
    // the view control has lives in its own handler, and there is no second
    // path that could pick up fewer of them.
    const link = (e.target as HTMLElement).closest<HTMLElement>('[data-goto-place]');
    if (link) {
      if (view !== 'places') press(CONTROL.view, 'places');
      void goToPlace(link.dataset.gotoPlace!);
    }
  });

  $('side-toggle').addEventListener('click', toggleSide);

  // The map keeps padding under the sheet so that everything it centres or
  // fits lands in the strip of map the sheet is not covering. This is the
  // whole reason the sheet does not need to resize the map: the container is
  // always the full window, and only the usable middle of it moves.
  // An embed has no sheet, so it has no layout hook either -- and the key
  // still has to fold when the frame is narrow enough to be in the phone
  // layout. Expanded it was over half of a 340 px embed, which is most of the
  // map the embed exists to show; folded it keeps its head line, the sentence
  // carrying the count, the day and the walk radius.
  if (embedded) onLayoutFlip(collapseLegend);
  sheet = embedded ? NO_SHEET : initSheet({
    onMove(height, bottomPadding) {
      document.documentElement.style.setProperty('--sheet-h', `${height}px`);
      map.setPadding({ top: 0, right: 0, bottom: bottomPadding, left: 0 });
    },
    // On a phone the key is folded to its head line. Expanded it was 36% of
    // the map and it covered the centre, so the point a reader taps first was
    // the one point that was not the map. Folded it still carries the sentence
    // with the count, the day and the walk radius in it. Done on the layout
    // flip rather than once at startup, so a rotation into the phone layout
    // gets the same treatment a phone-sized load does.
    onLayoutChange: collapseLegend,
  });

  initControlSheet();

  refreshStateLine();
  refreshEmbedLink();
  if (!applyOpening(opening)) {
    void loadChangeLayer(map, radius, activeDay()).then(refreshLegend);
  }
  void loadMeta();
  void loadDestinations();
});

/**
 * Wire one segmented control: mark the clicked button active, then act.
 *
 * Every control in the toolbar goes through here, so the state line is
 * refreshed here too rather than in each handler -- the toolbar now sits on
 * the map, and the line is the only place the panel says what it is a panel
 * OF. A control that forgot to redraw it would leave the panel claiming a day
 * type or a walk radius that is no longer the one the numbers were measured
 * at.
 */
function segment(control: string, onPick: (b: HTMLButtonElement) => void) {
  const sel = `[${control}]`;
  document.querySelectorAll<HTMLButtonElement>(sel).forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll(sel).forEach((o) =>
        o.classList.toggle('active', o === b));
      onPick(b);
      refreshStateLine();
      syncUrl();
    });
  });
}

/**
 * Press one button of a segmented control, as a reader would.
 *
 * Returns whether there was one to press: a URL naming a view or a radius this
 * build does not have leaves the control where it was, rather than the link
 * failing outright.
 */
function press(control: string, value: string): boolean {
  const b = document.querySelector<HTMLButtonElement>(`[${control}="${value}"]`);
  b?.click();
  return b !== null;
}

/**
 * Open at the question a link or an embed asked for.
 *
 * Order matters: the radius, the day and the destination are set before the
 * view, so that switching to a view that fetches a layer fetches it once, at
 * the values asked for, instead of once at the defaults and again a moment
 * later.
 *
 * Returns whether the citywide change layer has already been fetched as a
 * side effect -- the radius and the day are the two controls that reload it,
 * and the caller's own opening fetch would otherwise duplicate theirs.
 */
function applyOpening(s: Partial<UrlState>): boolean {
  let loadedChangeLayer = false;
  if (s.radius !== undefined) {
    loadedChangeLayer = press(CONTROL.radius, String(s.radius)) || loadedChangeLayer;
  }
  if (s.day) loadedChangeLayer = press(CONTROL.day, s.day) || loadedChangeLayer;
  if (s.oneSeatRestricted !== undefined) {
    press(CONTROL.oneSeatDay, s.oneSeatRestricted ? 'selected' : 'any');
  }
  // No button to press: the weighting is drawn by the legend, which is
  // rendered after the layer arrives.
  if (s.weight) weight = s.weight;
  // Same reasoning, and no fetch here either -- `showSurface` above already
  // sees the final `surfaceUnit` by the time `view` is pressed below, so
  // opening straight onto People fetches the population lattice exactly once.
  if (s.surfaceUnit) surfaceUnit = s.surfaceUnit;
  // Unlike `weight` and `surfaceUnit` above, this one now has a button
  // (`#place-fill-controls`), pressed before `view` below for the same
  // reason the radius and day are: `showPlaces` reads `placeFill` when it
  // turns the layer on, so pressing it first paints the fill correctly on
  // the first frame instead of the default and then a second repaint.
  if (s.placeFill) press(CONTROL.placeFill, s.placeFill);
  if (s.dest) {
    // A dropped pin has no button to press; a named district does, and
    // pressing it lights the toolbar as well as moving the destination.
    if ('key' in s.dest) press(CONTROL.dest, s.dest.key);
    else setDestination(s.dest);
  }
  if (s.view) press(CONTROL.view, s.view);
  // Last, because it answers the question the controls above have just
  // finished describing.
  if (s.at) askAt(s.at.lat, s.at.lon);
  // Same reasoning as `s.at`: it answers a question the view above has to be
  // Places for it to mean anything, so it is pressed last too.
  if (s.place) void goToPlace(s.place);
  return loadedChangeLayer;
}

/**
 * Put the question on screen into the address bar.
 *
 * `replaceState`, never `push`: inside an iframe the two share a history stack
 * with the page around us, so pushing would quietly turn the host page's back
 * button into a control for our toolbar. Any hash is kept -- it is not ours.
 */
function syncUrl() {
  const state: UrlState = {
    view,
    day: activeDay(),
    radius,
    oneSeatRestricted,
    weight,
    surfaceUnit,
    dest,
    at: last,
    camera,
    place: selectedPlace,
    placeFill,
  };
  const search = toSearch(state);
  // The mode is not part of the question, so it is not in what `toSearch`
  // writes; put it back, or an embed would drop its own mode the first time
  // anyone touched a control -- invisibly, until the frame reloaded as the
  // whole app in a 300 px box.
  history.replaceState(null, '', (embedded ? withEmbed(search) : search) + location.hash);
  refreshEmbedLink(search);
}

/**
 * Point the corner link at the view on screen, and say what it offers.
 *
 * The link is the embed's only provenance and its only door to the method,
 * the caveats and the answer panel, so it tracks the question rather than
 * pointing at the county default. It goes to the FULL site: an "open the
 * full map" that opened another stripped map is the one thing it must not
 * do.
 */
function refreshEmbedLink(search = withoutEmbed(location.search)) {
  if (!embedded) return;
  const a = $('embed-link') as HTMLAnchorElement;
  a.href = `${location.pathname}${search}${location.hash}`;
  // A click has produced an answer even here -- the panel computed it, the
  // embed simply has nowhere to put it -- so the link says so, or the click
  // reads as having done nothing at all.
  const place = last ? (lastPlace ? placeLabel(lastPlace) : 'this point') : null;
  a.querySelector('.el-action')!.textContent = fullViewLabel(place);
}

/** Say, above the panel, which question the panel is answering. */
function refreshStateLine() {
  $('statebar').innerHTML = questionLineHTML({
    view, day: activeDay(), radius, oneSeatRestricted,
    destination: destinationName(),
  });
  refreshControlsButton();
}

/** Fold the key down to its head line, or open it back up. */
function collapseLegend(collapsed: boolean) {
  $('legend-box').classList.toggle('collapsed', collapsed);
  const b = $('legend-collapse');
  b.textContent = collapsed ? '+' : '–';
  b.title = collapsed ? 'Show the key' : 'Collapse the key';
  b.setAttribute('aria-expanded', String(!collapsed));
}

/**
 * The phone toolbar: one button that opens the lot, and three ways to shut it.
 *
 * The controls stay in one DOM in both layouts -- a strip on the map at
 * desktop width, a sheet down from the top edge on a phone -- so every handler
 * wired above applies to both and neither can gain a control the other lacks.
 * What changes is only where the box is and whether it is on screen.
 *
 * It does not close when a control is used, because these controls interact:
 * choosing the one-seat view is what makes the destination and the one-seat
 * day rows appear, and a sheet that shut on the first tap would hide the rows
 * that tap had just revealed.
 */
function initControlSheet() {
  const open = (on: boolean) => {
    $('app').classList.toggle('controls-open', on);
    $('controls-toggle').setAttribute('aria-expanded', String(on));
  };
  $('controls-toggle').addEventListener('click', () => {
    open(!$('app').classList.contains('controls-open'));
  });
  $('controls-scrim').addEventListener('click', () => open(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') open(false);
  });
}

/**
 * Say which view is up on the button the toolbar closes into.
 *
 * While the controls are shut this is the only thing on screen naming the
 * view, and the phone layout has no room for the state line to be the first
 * place a reader looks -- it is inside the sheet, which may be an inch tall.
 */
function refreshControlsButton() {
  $('controls-toggle').firstChild?.remove();
  $('controls-toggle').prepend(document.createTextNode(viewLabel(view)));
}

/**
 * Give the map the whole window, or the panel its column back.
 *
 * MapLibre sizes its canvas from the container it was handed, so a column
 * that changes width behind its back leaves the map rendering at the old size
 * -- clicks then land on the wrong coordinates, which on this map means the
 * wrong answer rather than merely the wrong pixel.
 */
function toggleSide() {
  const collapsed = $('app').classList.toggle('side-collapsed');
  const b = $('side-toggle');
  b.textContent = collapsed ? '›' : '‹';
  b.title = collapsed ? 'Show the panel' : 'Hide the panel';
  b.setAttribute('aria-expanded', String(!collapsed));
  map.resize();
}

/** The legend for whichever view is active. */
function refreshLegend() {
  renderLegendBody();
}

function renderLegendBody() {
  // "Show all" clears buckets hidden from the change legend's filter, which
  // has no counterpart here -- the corridor legend is a key, not a filter --
  // so the button is hidden rather than left clickable and silently inert.
  // "Show all" clears the change legend's bucket filter; neither the corridor
  // legend nor the one-seat legend has one, so the button is hidden rather
  // than left clickable and silently inert.
  $('legend-reset').classList.toggle('hidden',
    corridorOn() || oneSeatOn() || journeyOn() || placesOn());
  if (journeyOn()) {
    $('legend').innerHTML = journeyKeyHTML(journeyData());
    return;
  }
  if (placesOn()) {
    $('legend').innerHTML = placesKeyHTML(placeDetail(), placeFill, activeDay(), boundariesData());
    return;
  }
  if (corridorOn()) {
    const c = corridorData();
    if (c) renderCorridorLegend($('legend'), c);
    return;
  }
  if (oneSeatOn()) {
    const o = oneSeatData();
    if (!o) return;
    const ob = map.getBounds();
    renderOneSeatLegend($('legend'), o, {
      west: ob.getWest(), south: ob.getSouth(),
      east: ob.getEast(), north: ob.getNorth(),
    });
    return;
  }
  const d = layerData();
  if (!d) return;
  const b = map.getBounds();
  renderLegend($('legend'), {
    layer: d,
    day: activeDay(),
    bounds: {
      west: b.getWest(), south: b.getSouth(),
      east: b.getEast(), north: b.getNorth(),
    },
    weight,
    surface: surfaceOn() ? surfaceData() : null,
    unit: surfaceUnit,
    population: populationData(),
  });
}

/** Turn the surface on or off, loading it the first time it is asked for. */
async function showSurface(on: boolean) {
  if (on && !surfaceData()) {
    $('legend').classList.add('loading');
    try {
      await loadSurfaceLayer(map, radius, activeDay());
    } finally {
      $('legend').classList.remove('loading');
    }
  }
  setSurfaceVisible(map, on);
  // A link can open straight onto People (surfaceunit=people) before the
  // reader has ever clicked the switch, so the surface turning on is also a
  // moment the population lattice might need fetching.
  if (on && surfaceUnit === 'people') await ensurePopulationLoaded();
  refreshLegend();
}

/** Fetch the population lattice once, the first time People is asked for. */
async function ensurePopulationLoaded() {
  if (populationData()) return;
  $('legend').classList.add('loading');
  try {
    await loadPopulationLayer(radius);
  } finally {
    $('legend').classList.remove('loading');
  }
}

/**
 * Switch the surface key between Ground and People, fetching the population
 * lattice the first time it is asked for -- mirroring how `showSurface` lazily
 * loads the surface itself, so a reader who never touches the switch never
 * pays for either fetch.
 */
async function showSurfaceUnit(unit: SurfaceUnit) {
  if (unit === 'people' && surfaceOn()) await ensurePopulationLoaded();
  refreshLegend();
}

/** Turn the corridor layer on or off, loading it the first time it is asked for. */
async function showCorridors(on: boolean) {
  if (on && !corridorData()) {
    $('legend').classList.add('loading');
    try {
      await loadCorridorLayer(map, activeDay());
    } finally {
      $('legend').classList.remove('loading');
    }
  }
  setCorridorVisible(map, on);
  refreshLegend();
}

/**
 * Turn the Places view on or off, fetching the ranked list and the
 * choropleth's ~3.5 MB of boundaries once, the first time either is asked
 * for. Both requests fire together rather than one waiting on the other --
 * the list and the fill are two views of the same underlying figures, and
 * a reader opening the tab wants both on screen at once, not the fill
 * trailing in after the list has already rendered.
 */
async function showPlaces(on: boolean) {
  if (on && (!placesList() || !boundariesData())) {
    $('legend').classList.add('loading');
    try {
      await Promise.all([loadPlaces(), loadBoundaries(map)]);
    } finally {
      $('legend').classList.remove('loading');
    }
  }
  setPlacesVisible(map, on);
  // The fill mode can arrive from a URL before this view has ever been shown
  // (`applyOpening` sets `placeFill` before pressing `view`), so the paint is
  // brought into line with it here rather than assumed to still be the
  // layer's own default.
  if (on) setPlacesFill(map, placeFill, activeDay());
  // Leaving the view does not clear a selection -- the map layer just stops
  // being drawn -- so coming back re-renders the same list with the same row
  // marked, rather than losing the reader's place.
  if (on) renderPanel();
  refreshLegend();
}

/**
 * Select one place: draw its changed block groups, fly the map there, and
 * mark it in the ranked list.
 *
 * The single door into the Places view's selection, whether it was reached
 * by clicking a row, by the panel's own `data-goto-place` link (the fix
 * `docs/worklog/the-place-number-has-no-view-of-its-own.md` asks for), or by
 * opening a shared URL -- so all three end up with the same map, the same
 * panel and the same address bar.
 */
async function goToPlace(key: string) {
  selectedPlace = key;
  await withLoadingLegend(() => selectPlace(map, key));
  if (view === 'places') {
    renderPanel();
    // The list is 72 places long and ranked, so the one just selected is
    // usually off-screen -- especially arriving from the panel's population
    // line, which is the path this view exists to serve and which can land on
    // any place at all. Without this the reader is told a place was selected
    // by a map they are looking at and a highlight they are not.
    document.querySelector(`[data-select-place="${CSS.escape(key)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }
  refreshLegend();
  syncUrl();
}

/**
 * The walk radius has no meaning for the corridor view — a corridor is a
 * piece of street, not a catchment — so the control is disabled rather than
 * left clickable and silently ignored.
 */
function setRadiusEnabled(on: boolean) {
  document.querySelectorAll<HTMLButtonElement>('[data-radius]').forEach((b) => {
    b.disabled = !on;
  });
}

/**
 * Turn the travel-time view on or off.
 *
 * Nothing is fetched here, unlike every other view: both ends of a journey are
 * the reader's, so there is nothing to precompute and nothing to load until
 * they click. What the panel shows in the meantime is the prompt, which is
 * also where the "this takes a moment" warning lives.
 */
/**
 * Fill the panel with whichever answer the view on screen owns.
 *
 * Locations and Surface share one report because they are the same
 * measurement drawn two ways. One-seat does not: it asks about a connection
 * rather than a quantity, and its destination is the subject of the answer,
 * so it gets a panel where moving the destination marker rewrites the
 * heading. The travel-time view fills the panel itself, from its own request.
 */
function renderPanel({ scrollToTop = false } = {}) {
  // A new answer starts at its own top. The heading now carries the
  // destination and the line under it the verdict, so a panel left scrolled
  // where the last answer was read would open the next one below its own
  // headline. A day change is not a new answer and keeps the reader's place.
  if (scrollToTop) $('panel').scrollTop = 0;
  // The answer is what the corner link is offering to show in full, so the
  // link is refreshed wherever the answer is, rather than only where the URL
  // changes -- the URL is written when the click is made, which is before the
  // answer it names has arrived.
  refreshEmbedLink();
  // Places has no click-driven answer at all -- the ranked list IS the
  // answer, and selecting a row only changes which one is marked -- so it is
  // handled before the "nothing clicked yet" branch below, which exists for
  // every other view's empty state.
  if (view === 'places') {
    $('panel').innerHTML = placesListHTML(placesList() ?? [], placeSort, selectedPlace, placeFill);
    return;
  }
  if (!lastPlace) {
    if (view === 'oneseat') $('panel').innerHTML = oneSeatPromptHTML(destinationName());
    else renderEmpty($('panel'));
    return;
  }
  if (view === 'oneseat') {
    // Empty when the database predates the one-seat layer, in which case the
    // shared report still answers something rather than the view going blank.
    const html = oneSeatPanelHTML(lastPlace, dest, activeDay());
    if (html) {
      $('panel').innerHTML = html;
      return;
    }
  }
  render(lastPlace);
}

function showJourney(on: boolean, leaving = false) {
  setJourneyVisible(map, on);
  refreshLegend();
  if (!on) {
    // The panel belongs to the view that filled it. Leaving a timed trip on
    // screen under the Locations map would leave two different questions
    // answered side by side, with only the heading to say which is which.
    if (leaving) {
      if (last) void load(last.lat, last.lon);
      else renderPanel();
    }
    return;
  }
  if (journeyData() && last) {
    $('panel').innerHTML = journeyPanelHTML(journeyData()!, destinationName());
  } else {
    $('panel').innerHTML = journeyPromptHTML(destinationName());
  }
}

/**
 * Time one trip, from the clicked point to the chosen destination.
 *
 * This is the only request in the app measured in seconds rather than
 * milliseconds — two networks routed from scratch at two transfer radii, with
 * no cache possible — so the panel says what it is doing rather than dimming
 * and going quiet for three seconds.
 */
async function loadJourney(lat: number, lon: number) {
  const mine = ++seq;
  last = { lat, lon };
  syncUrl();
  placeMarker(lat, lon);

  const to = destinationPoint();
  const name = esc(destinationName());
  if (!to) {
    // The named destinations' centres have not arrived yet, and a click that
    // does nothing at all reads as a broken map.
    $('panel').innerHTML = `<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${name} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;
    return;
  }
  $('panel').innerHTML = `<div class="empty"><h2>Timing the trip…</h2>
    <p class="muted">Routing both networks from this point to
       ${name}, at two transfer distances. A few seconds.</p></div>`;

  try {
    const r = await fetchJSON<JourneyResult>(
      journeyUrl({ lat, lon }, to, activeDay()));
    if (mine !== seq) return;          // a newer click already won
    drawJourney(map, r);
    $('panel').innerHTML = journeyPanelHTML(r, name);
    refreshLegend();
    refreshEmbedLink();
  } catch (err) {
    if (mine !== seq) return;
    drawJourney(map, null);
    $('panel').innerHTML =
      `<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${(err as Error).message}</p></div>`;
  }
}

/**
 * Show or hide the day buttons for the view that is up.
 *
 * Called from both controls that can change the answer -- the view segment
 * and the one-seat day toggle -- rather than from the day buttons themselves,
 * which cannot hide their own row.
 */
function refreshDayControls() {
  $('day-controls').classList.toggle(
    'hidden', !dayControlsShown(view, oneSeatRestricted, placeFill));
}

/** Which day the one-seat question is being asked for right now. */
function oneSeatDay(): OneSeatDay {
  return oneSeatDayFor(oneSeatRestricted, activeDay());
}

/** Turn the one-seat layer on or off, loading it the first time it is asked for. */
async function showOneSeat(on: boolean) {
  if (on && !oneSeatData()) {
    await withLoadingLegend(() =>
      loadOneSeatLayer(map, radius, dest, oneSeatDay()));
  }
  setOneSeatVisible(map, on);
  refreshLegend();
}

/** Repaint the one-seat layer for the current destination, radius and day. */
async function reloadOneSeat() {
  await withLoadingLegend(() =>
    loadOneSeatLayer(map, radius, dest, oneSeatDay()));
  refreshLegend();
}

async function withLoadingLegend<T>(work: () => Promise<T>) {
  $('legend').classList.add('loading');
  try {
    return await work();
  } finally {
    $('legend').classList.remove('loading');
  }
}

/**
 * Point the destination-taking views at somewhere, named or dropped.
 *
 * Both the one-seat view and the travel-time view answer "to where?", and they
 * mean subtly different things by the same word: one-seat measures against
 * every stop of a district, a journey arrives at a single point. That is why
 * the marker is decided per view below rather than per destination here.
 */
function setDestination(next: Destination) {
  dest = next;
  setPinMode(false);
  syncDestinationButtons();
  showDestinationMarker();
  // A dragged marker reaches here without any button having been clicked, so
  // the state line and the address bar are redrawn here rather than only in
  // `segment`.
  refreshStateLine();
  syncUrl();
  if (view === 'journey') {
    if (last) void loadJourney(last.lat, last.lon);
    refreshLegend();
    return;
  }
  // The panel's verdicts are measured to this destination, so a moved marker
  // re-asks the question at the clicked point as well as recolouring the map.
  // With nothing clicked yet the one-seat panel is a prompt naming the
  // destination, which is redrawn here so that moving the marker visibly does
  // something on an empty panel.
  if (last) void load(last.lat, last.lon);
  else renderPanel({ scrollToTop: true });
  void reloadOneSeat();
}

/**
 * Show or hide the destination marker for the view on screen.
 *
 * A dropped pin always gets one — it is the only way to see what the map is
 * measuring to. A NAMED destination gets one in the travel-time view and not
 * in the one-seat view, because the two measure to different things: a journey
 * arrives at the centre of the district and the marker is where it arrives,
 * while the one-seat test is run against all 44 or 93 of Downtown's stops and
 * a single marker would invite the map to be read as though the district were
 * that one point.
 */
function showDestinationMarker() {
  const point = destinationPoint();
  const wanted = point !== null
    && (view === 'journey' || (view === 'oneseat' && 'lat' in dest));
  if (!wanted) {
    destMarker?.remove();
    destMarker = null;
    return;
  }
  if (!destMarker) {
    // Dragging this one moves the destination, which turns a named district
    // into a point of the reader's own -- the same thing "pick a point" does,
    // reached by dragging instead of by arming a mode. `setDestination` then
    // re-times the trip and re-lights the toolbar to match.
    destMarker = new maplibregl.Marker({ color: HERE_COLOR, draggable: true })
      .setLngLat([point!.lon, point!.lat]).addTo(map);
    destMarker.on('dragend', () => {
      const at = destMarker!.getLngLat();
      setDestination({ lat: at.lat, lon: at.lng });
    });
  } else {
    destMarker.setLngLat([point!.lon, point!.lat]).addTo(map);
  }
}

/**
 * Light the toolbar button for wherever we are now measuring to.
 *
 * Clicking a button lights it on its own; this exists for the destination
 * that moves without one being clicked -- a dragged marker.
 */
function syncDestinationButtons() {
  const lit = activeDestButton(dest);
  document.querySelectorAll<HTMLButtonElement>('[data-dest]').forEach((b) => {
    b.classList.toggle('active', b.dataset.dest === lit);
  });
}

/** Where the journey is timed TO: the dropped pin, or the district's centre. */
function destinationPoint(): Point | null {
  if ('lat' in dest) return { lat: dest.lat, lon: dest.lon };
  const key = dest.key;
  const match = named.find((d) => d.key === key);
  return match ? { lat: match.lat, lon: match.lon } : null;
}

/** What to call it in a sentence. */
function destinationName(): string {
  if ('lat' in dest) return `${dest.lat.toFixed(4)}, ${dest.lon.toFixed(4)}`;
  const key = dest.key;
  return named.find((d) => d.key === key)?.name ?? key;
}

/** Arm or disarm "the next map click sets the destination". */
function setPinMode(on: boolean) {
  pinMode = on;
  map.getCanvas().style.cursor = on ? 'crosshair' : '';
  document.querySelectorAll<HTMLButtonElement>('[data-dest="pin"]').forEach((b) => {
    b.classList.toggle('armed', on);
    b.textContent = on ? 'click the map…' : 'Pick a point';
  });
}

async function load(lat: number, lon: number) {
  const mine = ++seq;
  last = { lat, lon };
  syncUrl();
  $('panel').classList.add('loading');

  placeMarker(lat, lon);

  try {
    // Carry the dropped pin, if there is one, so the panel answers for the
    // destination the reader chose rather than only for Downtown and Oakland.
    const pin = 'lat' in dest
      ? `&dest_lat=${dest.lat.toFixed(6)}&dest_lon=${dest.lon.toFixed(6)}` : '';
    const p = await fetchJSON<PlaceResult>(
      `/api/place?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}&radius=${radius}`
      + `${pin}&oneseat_day=${oneSeatDay()}`);
    if (mine !== seq) return;       // a newer click already won
    showPlace(map, lat, lon, radius, p.current.stops, p.proposed.stops);
    showPinKey();
    lastPlace = p;
    renderPanel({ scrollToTop: true });
  } catch (err) {
    if (mine !== seq) return;
    $('panel').innerHTML =
      `<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${(err as Error).message}</p></div>`;
  } finally {
    if (mine === seq) $('panel').classList.remove('loading');
  }
}

/**
 * Reveal the key for the marks a click leaves on the map.
 *
 * Called where the marks are drawn rather than from the legend render, which
 * runs on every pan and every view switch: the marks outlive both, and the
 * key has to say the radius they were drawn at, not the one now selected in
 * the toolbar.
 */
function showPinKey() {
  $('pin-key').innerHTML = pinKeyHTML(radius);
  $('pin-key').classList.remove('hidden');
}

/**
 * The red pin: where the reader is asking from, on every view that asks.
 *
 * It is draggable, and dragging it re-asks the question rather than just
 * moving a dot: comparing two corners is the commonest thing anyone does
 * here, and clicking each of them in turn loses the first answer before the
 * second arrives. The answer only changes on drop, not while dragging --
 * the travel-time view takes seconds per answer, so re-routing at every
 * frame of a drag would queue up dozens of searches nobody asked for.
 */
function placeMarker(lat: number, lon: number) {
  if (!marker) {
    marker = new maplibregl.Marker({ color: ORIGIN_COLOR, draggable: true })
      .setLngLat([lon, lat]).addTo(map);
    marker.on('dragend', () => {
      const at = marker!.getLngLat();
      askAt(at.lat, at.lng);
    });
  } else {
    marker.setLngLat([lon, lat]);
  }
}

/**
 * Ask the question the current view asks, at a point.
 *
 * The map click and a dropped pin both come through here, so a dragged pin
 * can never answer a different question from a clicked one.
 */
function askAt(lat: number, lon: number) {
  // A click is a request for an answer, so the sheet comes up to where the
  // answer is readable -- but only up. A reader who has already pulled it to
  // full and is comparing two corners should not have it drop back to half
  // under them on the second click.
  sheet.atLeast('half');
  if (view === 'journey') {
    void loadJourney(lat, lon);
    return;
  }
  // Places answers at a place, not a point -- there is no walk radius for a
  // click to measure -- so a map click here asks nothing. Selecting a place
  // happens in the panel's own list instead.
  if (view === 'places') return;
  void load(lat, lon);
}

/**
 * The named destinations' centres.
 *
 * Only the travel-time view needs them — the one-seat layer sends a key and
 * the server resolves the whole seed cloud — so a failure here leaves every
 * other view working and is not worth interrupting the map for.
 */
async function loadDestinations() {
  try {
    named = await fetchJSON<NamedDestination[]>('/api/destinations');
    refreshStateLine();   // it was showing the key until the name arrived
  } catch {
    /* the travel-time view falls back to a dropped pin */
  }
}

async function loadMeta() {
  try {
    const m = await fetchJSON<any>('/api/meta');
    const line = `today: ${m.feeds.current_feed_version || 'current GTFS'} · `
      + `proposed: ${m.feeds.proposed_feed_version || 'proposed-network feed'}`;
    $('feedline').textContent = line;
    // The phone masthead is one line and does not carry this. Repeating it in
    // the methods dialog is what keeps the data vintage reachable there rather
    // than dropped -- it is a stated convention that the vintage travels with
    // the numbers, not a decoration on a wide screen.
    $('feedline-methods').textContent = line;
    // Each entry is addressable so that a figure in the answer panel can send
    // the reader to its own method rather than restating it underneath.
    $('caveats').innerHTML = m.caveats
      .map((c: any) => `<li id="caveat-${c.id}">${c.text}</li>`).join('');
  } catch {
    /* the methods panel is not load-bearing; the map still works without it */
  }
}

// Methods drawer
/** Open the method drawer at one entry, and say which one was asked for. */
function showCaveat(id: string) {
  $('methods').classList.add('open');
  const li = document.getElementById(`caveat-${id}`);
  if (!li) return;   // the drawer is not load-bearing; it may not have loaded
  li.scrollIntoView({ block: 'center' });
  li.classList.remove('asked');
  void li.offsetWidth;               // restart the mark for a repeated click
  li.classList.add('asked');
}

$('methods-open').addEventListener('click', () => $('methods').classList.add('open'));
$('methods-close').addEventListener('click', () => $('methods').classList.remove('open'));
