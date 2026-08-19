import { $, fetchJSON } from './utils';
import { initMapLayers, showPlace } from './mapview';
import { render, renderEmpty, setDay, activeDay } from './place';
import {
  initChangeLayer, loadChangeLayer, setChangeDay, toggleBucket, resetBuckets,
  layerData, dotLabel,
} from './change';
import { renderLegend, renderCorridorLegend } from './legend';
import {
  initSurfaceLayer, loadSurfaceLayer, setSurfaceDay, setSurfaceVisible,
  layerData as surfaceData, isVisible as surfaceOn,
} from './surface';
import {
  initCorridorLayer, loadCorridorLayer, setCorridorDay, setCorridorVisible,
  layerData as corridorData, isVisible as corridorOn,
} from './corridor';
import { PlaceResult, Day } from './types';

const PGH: [number, number] = [-79.9959, 40.4406];

let radius = 400;
let marker: maplibregl.Marker | null = null;
let last: { lat: number; lon: number } | null = null;
let seq = 0;   // guards against a slow response overwriting a newer click

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
  renderEmpty($('panel'));

  map.on('click', (e: any) => {
    // Snap to a change dot when one is under the cursor, so the panel that
    // opens is measured at the same point the dot was coloured from. Clicking
    // a dot and getting a different answer to the one it is painted with is
    // the single worst thing this layer could do.
    const hit = map.queryRenderedFeatures(e.point, { layers: ['change-dots'] })[0];
    const c = hit ? (hit.geometry as any).coordinates : [e.lngLat.lng, e.lngLat.lat];
    void load(c[1], c[0]);
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
    if (corridorData()) void setCorridorDay(map, day).then(refreshLegend);
    refreshLegend();
  });

  // Locations, surface, both, or streets. The surface and the corridors are
  // both fetched on first use rather than at startup: the surface is ~48,500
  // cells against ~5,900 dots and the corridors are ~200 KB per day type, and
  // a reader who never switches views should not pay for either.
  segment('[data-view]', (b) => {
    const view = b.dataset.view!;
    map.setLayoutProperty('change-dots', 'visibility',
      view === 'surface' || view === 'corridors' ? 'none' : 'visible');
    void showSurface(view === 'surface' || view === 'both');
    void showCorridors(view === 'corridors');
    setRadiusEnabled(view !== 'corridors');
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

  void loadChangeLayer(map, radius, activeDay()).then(refreshLegend);
  void loadMeta();
});

/** Wire one segmented control: mark the clicked button active, then act. */
function segment(sel: string, onPick: (b: HTMLButtonElement) => void) {
  document.querySelectorAll<HTMLButtonElement>(sel).forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll(sel).forEach((o) =>
        o.classList.toggle('active', o === b));
      onPick(b);
    });
  });
}

function refreshLegend() {
  // "Show all" clears buckets hidden from the change legend's filter, which
  // has no counterpart here -- the corridor legend is a key, not a filter --
  // so the button is hidden rather than left clickable and silently inert.
  $('legend-reset').classList.toggle('hidden', corridorOn());
  if (corridorOn()) {
    const c = corridorData();
    if (c) renderCorridorLegend($('legend'), c);
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

async function load(lat: number, lon: number) {
  const mine = ++seq;
  last = { lat, lon };
  $('panel').classList.add('loading');

  if (!marker) {
    marker = new maplibregl.Marker({ color: '#e2574c' }).setLngLat([lon, lat]).addTo(map);
  } else {
    marker.setLngLat([lon, lat]);
  }

  try {
    const p = await fetchJSON<PlaceResult>(
      `/api/place?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}&radius=${radius}`);
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
