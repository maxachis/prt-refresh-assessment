import { $, fetchJSON, esc } from './utils';
import { initMapLayers, showPlace } from './mapview';
import { render, renderEmpty, setDay, activeDay } from './place';
import {
  initChangeLayer, loadChangeLayer, setChangeDay, toggleBucket, resetBuckets,
  layerData, dotLabel,
} from './change';
import { renderLegend, renderCorridorLegend, renderOneSeatLegend } from './legend';
import {
  initSurfaceLayer, loadSurfaceLayer, setSurfaceDay, setSurfaceVisible,
  layerData as surfaceData, isVisible as surfaceOn,
} from './surface';
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
  initZoneLayer, loadZoneLayer, setZoneVisible, zoneLabel, zoneNoteHTML,
  styleZoneToggle, isVisible as zonesOn, layerData as zoneData, ZONE_LAYERS,
} from './zones';
import {
  initJourneyLayer, setJourneyVisible, drawJourney, journeyUrl,
  journeyPanelHTML, journeyPromptHTML, journeyKeyHTML,
  isVisible as journeyOn, journeyData, Point,
} from './journey';
import { questionLineHTML } from './statebar';
import { PlaceResult, Day, OneSeatDay, JourneyResult, NamedDestination } from './types';

const PGH: [number, number] = [-79.9959, 40.4406];
const ORIGIN_COLOR = '#e2574c';   // the red "you asked here" pin

let radius = 400;
let marker: maplibregl.Marker | null = null;
let last: { lat: number; lon: number } | null = null;
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

// Which view is on screen. Two of them — one-seat and travel time — take a
// destination, and one of those two answers on a click rather than on a load,
// so the click handler and the day control both have to know which is active.
let view = 'dots';

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
  center: PGH,
  zoom: 12,
});
map.addControl(new maplibregl.NavigationControl(), 'top-right');

map.on('load', () => {
  initMapLayers(map);
  initChangeLayer(map);      // after initMapLayers: it inserts beneath 'walk-fill'
  initSurfaceLayer(map, 'change-dots');   // under the dots, so 'Both' reads
  initCorridorLayer(map, 'change-dots');  // same slot; corridors and dots/surface are mutually exclusive
  initOneSeatLayer(map, 'walk-fill');     // the dots' own slot; the two never show together
  // Above the surface and the streets, below the dots: the zones have to be
  // legible ON TOP OF the loss they qualify, but they are an annotation and
  // must never hide a dot a reader is trying to click.
  initZoneLayer(map, 'change-dots');
  initJourneyLayer(map);                  // on top: two drawn trips, over everything
  renderEmpty($('panel'));

  map.on('click', (e: any) => {
    if (pinMode) {
      setDestination({ lat: e.lngLat.lat, lon: e.lngLat.lng });
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

  // A zone popup follows the cursor rather than snapping to a centroid: a
  // zone is an area, and a label pinned to its middle would suggest the
  // service is concentrated there. The cursor is not a claim about anything.
  // Nothing here changes the cursor to a pointer — a zone is not clickable,
  // and a click inside one must still open the panel for the point clicked.
  map.on('mousemove', ZONE_LAYERS[0], (e: any) => {
    const f = e.features?.[0];
    if (!f || !zonesOn()) return;
    popup.setLngLat(e.lngLat).setHTML(zoneLabel(f.properties)).addTo(map);
  });
  map.on('mouseleave', ZONE_LAYERS[0], () => { popup.remove(); });

  map.on('moveend', refreshLegend);

  // Radius is a control, not a constant: 400 m is the headline quarter-mile
  // access distance and 150 m the strict same-corner test, and where the two
  // disagree that disagreement is the finding (the station consolidations).
  segment('[data-radius]', (b) => {
    radius = Number(b.dataset.radius);
    void loadChangeLayer(map, radius, activeDay()).then(refreshLegend);
    if (surfaceData()) {
      void loadSurfaceLayer(map, radius, activeDay()).then(refreshLegend);
    }
    if (oneSeatData()) void reloadOneSeat();
    if (last) void load(last.lat, last.lon);
  });

  // Day type governs the citywide layer and the panel together. 152 locations
  // keep every weekday bus and lose the weekend entirely, and on a
  // weekday-only map they are invisible.
  segment('[data-day]', (b) => {
    const day = b.dataset.day as Day;
    setDay(day);
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
    refreshLegend();
  });

  // The one-seat view's own day control. A separate opt-in rather than a
  // fourth day button because the two answers are not the same measurement:
  // the day-free one is what the published figures count, and the day-typed
  // one exists because 152 locations keep every weekday bus and lose the
  // weekend. Restricting is additive — the reader chooses to leave the
  // published answer, and the legend tells them they have.
  segment('[data-oneseat-day]', (b) => {
    oneSeatRestricted = b.dataset.oneseatDay === 'selected';
    refreshDayControls();
    void reloadOneSeat();
    if (last) void load(last.lat, last.lon);
  });

  // Locations, surface, both, or streets. The surface and the corridors are
  // both fetched on first use rather than at startup: the surface is ~48,500
  // cells against ~5,900 dots and the corridors are ~200 KB per day type, and
  // a reader who never switches views should not pay for either.
  segment('[data-view]', (b) => {
    const previous = view;
    view = b.dataset.view!;
    map.setLayoutProperty('change-dots', 'visibility',
      view === 'dots' || view === 'both' ? 'visible' : 'none');
    void showSurface(view === 'surface' || view === 'both');
    void showCorridors(view === 'corridors');
    void showOneSeat(view === 'oneseat');
    showJourney(view === 'journey', previous === 'journey');
    // Neither the street view nor the travel-time view has a walk radius: a
    // corridor is a piece of street, and a journey's walk is the router's own
    // (`journey.CONSTANTS`), not a control. Disabled rather than left
    // clickable and silently ignored.
    setRadiusEnabled(view !== 'corridors' && view !== 'journey');
    // The destination picker means something in two views, and a mode left
    // armed behind a hidden control is a click the reader cannot account for.
    const picksDestination = view === 'oneseat' || view === 'journey';
    $('dest-controls').classList.toggle('hidden', !picksDestination);
    $('oneseat-day-controls').classList.toggle('hidden', view !== 'oneseat');
    refreshDayControls();
    if (!picksDestination) setPinMode(false);
    showDestinationMarker();
  });

  // Where the one-seat view is measuring TO. Downtown and Oakland are the two
  // destinations BASE_CAMP asks about and the two the published place-level
  // answer covers; "pick a point" is the reason the layer applies its
  // destination per request rather than baking a list in at build time.
  // The zone overlay is a toggle, not a member of the view segment: it has to
  // be able to sit on top of whichever view is showing the loss it qualifies.
  $('zone-toggle').addEventListener('click', () => {
    void showZones(!zonesOn());
  });

  segment('[data-dest]', (b) => {
    const key = b.dataset.dest!;
    if (key === 'pin') {
      setPinMode(true);
      return;
    }
    setPinMode(false);
    setDestination({ key });
  });

  $('legend').addEventListener('click', (e) => {
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
    const box = $('legend-box');
    const collapsed = box.classList.toggle('collapsed');
    const b = $('legend-collapse');
    b.textContent = collapsed ? '+' : '–';
    b.title = collapsed ? 'Show the key' : 'Collapse the key';
    b.setAttribute('aria-expanded', String(!collapsed));
  });

  $('side-toggle').addEventListener('click', toggleSide);

  refreshStateLine();
  void loadChangeLayer(map, radius, activeDay()).then(refreshLegend);
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
function segment(sel: string, onPick: (b: HTMLButtonElement) => void) {
  document.querySelectorAll<HTMLButtonElement>(sel).forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll(sel).forEach((o) =>
        o.classList.toggle('active', o === b));
      onPick(b);
      refreshStateLine();
    });
  });
}

/** Say, above the panel, which question the panel is answering. */
function refreshStateLine() {
  $('statebar').innerHTML = questionLineHTML({
    view, day: activeDay(), radius, oneSeatRestricted,
    destination: destinationName(),
  });
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

/**
 * The legend, plus the zone note when the overlay is on.
 *
 * The note is APPENDED to whichever legend the active view drew, rather than
 * replacing it, because the zones qualify the layer underneath rather than
 * answering in its place — the same relationship on the map as in the panel.
 */
function refreshLegend() {
  renderLegendBody();
  if (!zonesOn()) return;
  const z = zoneData();
  if (z) $('legend').insertAdjacentHTML('beforeend', zoneNoteHTML(z.totals));
}

function renderLegendBody() {
  // "Show all" clears buckets hidden from the change legend's filter, which
  // has no counterpart here -- the corridor legend is a key, not a filter --
  // so the button is hidden rather than left clickable and silently inert.
  // "Show all" clears the change legend's bucket filter; neither the corridor
  // legend nor the one-seat legend has one, so the button is hidden rather
  // than left clickable and silently inert.
  $('legend-reset').classList.toggle('hidden',
    corridorOn() || oneSeatOn() || journeyOn());
  if (journeyOn()) {
    $('legend').innerHTML = journeyKeyHTML(journeyData());
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
  renderLegend($('legend'), d, activeDay(), {
    west: b.getWest(), south: b.getSouth(),
    east: b.getEast(), north: b.getNorth(),
  }, surfaceOn() ? surfaceData() : null);
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
  refreshLegend();
}

/**
 * Turn the on-demand zone overlay on or off, fetching it the first time.
 *
 * Ten polygons and ~250 points, so the fetch is trivial — it is deferred only
 * because a reader who never asks the question should not pay for the answer,
 * the same rule the surface and the corridors follow at a much larger size.
 */
async function showZones(on: boolean) {
  if (on && !zoneData()) await loadZoneLayer(map);
  setZoneVisible(map, on);
  $('zone-toggle').classList.toggle('active', on);
  styleZoneToggle($('zone-toggle'), on);
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
function showJourney(on: boolean, leaving = false) {
  setJourneyVisible(map, on);
  refreshLegend();
  if (!on) {
    // The panel belongs to the view that filled it. Leaving a timed trip on
    // screen under the Locations map would leave two different questions
    // answered side by side, with only the heading to say which is which.
    if (leaving) {
      if (last) void load(last.lat, last.lon);
      else renderEmpty($('panel'));
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
    'hidden', !dayControlsShown(view, oneSeatRestricted));
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
  // the state line is redrawn here rather than only in `segment`.
  refreshStateLine();
  if (view === 'journey') {
    if (last) void loadJourney(last.lat, last.lon);
    refreshLegend();
    return;
  }
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
    render(p);
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
  if (view === 'journey') {
    void loadJourney(lat, lon);
    return;
  }
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
    $('feedline').textContent =
      `today: ${m.feeds.current_feed_version || 'current GTFS'} · ` +
      `proposed: ${m.feeds.proposed_feed_version || 'proposed-network feed'}`;
    $('caveats').innerHTML = m.caveats
      .map((c: any) => `<li>${c.text}</li>`).join('');
  } catch {
    /* the methods panel is not load-bearing; the map still works without it */
  }
}

// Methods drawer
$('methods-open').addEventListener('click', () => $('methods').classList.add('open'));
$('methods-close').addEventListener('click', () => $('methods').classList.remove('open'));
