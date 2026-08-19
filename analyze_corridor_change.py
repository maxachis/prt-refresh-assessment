#!/usr/bin/env python3
"""
Corridor change -- the PAVEMENT question, not the walk-access one.

Every other analysis in this repo asks "how much service can I reach from a
place I might stand" -- a stop, a cell, a location within a walk radius. This
script asks something narrower and structurally different: on this piece of
STREET, does a bus run today, does one run under the plan, or both? A street
can lose its only bus while a parallel street a block away keeps one; that is
a real loss of pavement and is NOT necessarily a loss of walk access, because
the rest of the repo's radius-based tiers may see no change at all at a stop
two blocks over. Read this alongside the coverage analyses, never as a
replacement for them -- exactly the area/location relationship convention 10
already establishes between analyze_coverage_area.py and
analyze_coverage_change.py, extended to a third, more literal, unit: the
street itself.

NOT A ROUTE COMPARISON. Route numbers never enter the classification below.
Convention 1 forbids comparing route N to route N because the plan re-splits
corridors; this script never reads a route id past selecting bus trips, so it
cannot violate that convention -- a corridor is "served" if ANY bus runs on
it, regardless of which route or how many.

METHOD

For each feed and day type, take the distinct shapes actually used by a
revenue bus trip running that day (bus_shape_ids_by_day), then:

  1. RESAMPLE each shape's polyline at STEP_M = 20 m intervals along its
     length (build_path), recording each sample's projected position, its
     lat/lon, and the local bearing of the segment it sits on. 20 m is finer
     than the smallest feature this script reports (MIN_RUN_M, below) and
     coarse enough that a shape with a few hundred points resamples to a few
     hundred samples, not tens of thousands.

  2. KEY each sample canonically: (ix, iy, bearing_bin), where ix/iy come
     from snapping the projected position to a CELL_M = 25 m lattice and
     bearing_bin folds the local heading mod 180 degrees into BEARING_BINS =
     4 bins of 45 degrees each. Folding mod 180 (not 360) means a street's
     two travel directions -- which run at 180 degrees to each other -- key
     identically, which is what lets one corridor dedupe across a route's
     inbound and outbound patterns. 25 m is close to a two-lane street's own
     width, so two lanes of the same street land in the same or adjacent
     cells; a value much smaller would refuse to dedupe a corridor against
     itself, much larger would start merging genuinely separate streets.

  3. OCCUPY: the set of canonical keys touched by a side's shapes on a day
     type is that side's occupancy for that day.

  4. MATCH tolerantly, not by exact key equality. Two feeds digitising the
     same street rarely land on the same lattice cell -- stop-adjacent
     wiggles, a slightly different vertex spacing, a shape drawn down the
     opposite curb -- so an exact-cell test paints a real corridor as an
     alternating checkerboard of "kept" and "lost" every few samples. A key
     is matched if the OTHER side occupies any key within
     MATCH_CELL_RADIUS = 1 cell in both ix and iy (a 3x3 neighbourhood,
     about 35 m radius after the corner cells) AND in the same or an
     adjacent bearing bin (bins wrap: bin 3 is adjacent to bin 0). Both
     tolerances matter together: position alone would match a street to a
     perpendicular cross street standing in the same 3x3 block; bearing
     alone would match two parallel streets a block apart running the same
     direction.

  5. CLASSIFY each sample as kept (matched), lost (current-only) or added
     (proposed-only) -- never at the key level in isolation, but per sample
     along its own shape's sequence, then SMOOTH with a majority filter of
     width SMOOTH_WINDOW = 5 samples (100 m) to kill single-sample flicker
     from a shape wiggling in and out of match tolerance, then split into
     maximal same-class runs.

  6. DROP whole-run slivers under MIN_RUN_M = 60 m -- three resample steps
     -- as noise rather than a real segment of street. This has to run on
     the un-fragmented run, before the dedupe step below splits it, or a
     scattering of small legitimately-new overlap fragments would be held to
     the same floor as a first-pass noise run and real pavement at every
     junction would silently disappear.

  7. DEDUPE across routes, EXACTLY, not by whole-run subset. Within the
     surviving run, drop the individual samples whose canonical key was
     already emitted by an earlier shape on the same side and day (shapes
     are visited in sorted shape_id order, so this is deterministic), and
     emit each remaining contiguous stretch as its own row. No minimum
     length applies to these stretches -- they are overlap fragments, not
     noise, and a floor here would delete the real pavement right at the
     junction where two corridors merge or diverge. A run is skipped only
     when dropping already-emitted samples leaves nothing behind. This has
     to be exact-key, not "skip the run if it is a full subset of what is
     already emitted": a run that shares only PART of its length with an
     earlier shape (the common case where two routes overlap for a few
     blocks, not their whole corridor) would otherwise be emitted again in
     full, redrawing the shared stretch and inflating summed length_m well
     past the true distinct pavement -- kept corridors worst, since they are
     the trunk streets the most routes share.

  8. SIMPLIFY the surviving run's geometry with iterative Douglas-Peucker at
     SIMPLIFY_M = 8 m before writing it out, so a nearly-straight run of many
     20 m samples does not bloat the CSV with collinear points. Endpoints are
     always kept.

Kept and added runs are drawn from the PROPOSED side's own geometry (never
current's) because the plan is the thing being described; a kept corridor
by definition exists in both feeds, but only one geometry can be emitted, and
the proposed one is what a reader comparing today to the plan wants to see.
Lost runs are drawn from the CURRENT side's geometry, because that street's
proposed-side geometry does not exist to draw.

Because dedupe is exact-key (step 7) rather than whole-run, no canonical key
is ever emitted twice within one side/day: summing length_m over the emitted
rows for a side and day IS the corridor network measured once, not a sum of
overlapping route segments. "Today's pavement" (kept + lost) is nonetheless
an approximation, not an exact street-network length, because kept is
measured on the proposed feed's digitisation and lost on the current feed's
-- two different digitisations of a street can differ by a few metres of
vertex placement even where the street itself is identical, which is exactly
what MATCH_CELL_RADIUS exists to absorb, not eliminate.

WHAT COUNTS AS A BUS. route_type "3" trips only, exactly like the rest of the
repo (gtfs.py's SEMANTICS section). PRT's own current feed additionally
carries two non-revenue placeholder routes, id "TEST" and id "MISC", both
route_type "3" but zero actual trips in this feed as shipped; they are
excluded explicitly by id (NON_REVENUE_ROUTE_IDS) rather than relied on to
stay tripless, since nothing about the feed format guarantees that.
Occasional/holiday calendars are excluded the same way gtfs.load_service
excludes them (a Labor Day-only calendar is not a day type).

OUTPUT. data/corridor_change.csv, one row per emitted run: day, klass
(kept/lost/added), length_m (1 dp, measured along the pre-simplification
samples -- true pavement length, not the simplified geometry's), and geometry
as "lon,lat lon,lat ..." at 5 decimal places.

Run gtfs's prerequisites first (ingest_blr.py for the current feed; the
proposed feed is committed, see gtfs.py). Usage: python3 analyze_corridor_change.py
    -> data/corridor_change.csv
"""

import csv
import math
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

import gtfs

DATA = Path("data")

# --------------------------------------------------------------------------
# constants -- see module docstring for why each was chosen
# --------------------------------------------------------------------------

STEP_M = 20              # resample interval along a shape
CELL_M = 25               # canonical cell size for deduping and matching
BEARING_BINS = 4          # bearing folded mod 180 deg into 45 deg bins
MATCH_CELL_RADIUS = 1     # 3x3 cell neighbourhood, ~35 m tolerance
SMOOTH_WINDOW = 5         # majority filter width in samples (100 m)
MIN_RUN_M = 60            # runs shorter than this are dropped as slivers
SIMPLIFY_M = 8            # Douglas-Peucker tolerance on emitted geometry

BUS_ROUTE_TYPE = "3"
NON_REVENUE_ROUTE_IDS = {"TEST", "MISC"}

KLASS_KEPT = "kept"
KLASS_LOST = "lost"
KLASS_ADDED = "added"

# Local equirectangular projection, defined fresh here rather than imported
# from analyze_coverage_area.py or src/refresh/query.py -- this script is
# meant to be self-contained pipeline code, not dependent on the app. The
# origin and metres-per-degree happen to match analyze_coverage_area.py's
# because both are Allegheny-County-scale projections centred the same way;
# that is a coincidence of scale, not a shared constant, so neither script's
# drift can affect the other.
LAT0, LON0 = 40.45, -79.98
M_PER_DEG_LAT = 111_320.0
M_PER_DEG_LON = M_PER_DEG_LAT * math.cos(math.radians(LAT0))


def project(lat, lon):
    return ((lon - LON0) * M_PER_DEG_LON, (lat - LAT0) * M_PER_DEG_LAT)


def unproject(x, y):
    return (y / M_PER_DEG_LAT + LAT0, x / M_PER_DEG_LON + LON0)


@dataclass(frozen=True)
class Sample:
    x: float
    y: float
    lat: float
    lon: float
    bearing: float
    key: tuple


# --------------------------------------------------------------------------
# resampling and the canonical key
# --------------------------------------------------------------------------

def canonical_key(x, y, bearing_deg):
    """(ix, iy, bearing_bin) -- see METHOD step 2."""
    ix = int(math.floor(x / CELL_M))
    iy = int(math.floor(y / CELL_M))
    bin_width = 180.0 / BEARING_BINS
    b = int((bearing_deg % 180.0) / bin_width) % BEARING_BINS
    return (ix, iy, b)


def build_path(points_ll, step_m):
    """Resample a lat/lon polyline at step_m intervals along its length.

    Returns a list of Sample, always including the polyline's own final
    vertex even when it falls short of a full step, so a run's true end is
    never trimmed to the last multiple of step_m.
    """
    if len(points_ll) == 1:
        lat, lon = points_ll[0]
        x, y = project(lat, lon)
        return [Sample(x, y, lat, lon, 0.0, canonical_key(x, y, 0.0))]

    xy = [project(lat, lon) for lat, lon in points_ll]
    seglen = [math.hypot(xy[i + 1][0] - xy[i][0], xy[i + 1][1] - xy[i][1])
              for i in range(len(xy) - 1)]
    cum = [0.0]
    for L in seglen:
        cum.append(cum[-1] + L)
    total = cum[-1]
    if total == 0:
        lat, lon = points_ll[0]
        x, y = xy[0]
        return [Sample(x, y, lat, lon, 0.0, canonical_key(x, y, 0.0))]

    samples, d, i = [], 0.0, 0
    while True:
        at_end = d >= total - 1e-9
        if at_end:
            d = total
        while i < len(seglen) - 1 and cum[i + 1] < d:
            i += 1
        a, b = xy[i], xy[i + 1]
        L = seglen[i]
        t = 0.0 if L == 0 else (d - cum[i]) / L
        x = a[0] + (b[0] - a[0]) * t
        y = a[1] + (b[1] - a[1]) * t
        bearing = math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])) % 360.0
        lat, lon = unproject(x, y)
        samples.append(Sample(x, y, lat, lon, bearing, canonical_key(x, y, bearing)))
        if at_end:
            break
        d += step_m
    return samples


# --------------------------------------------------------------------------
# tolerant matching between the two sides' occupancy
# --------------------------------------------------------------------------

def bin_neighbors(b):
    return {b, (b - 1) % BEARING_BINS, (b + 1) % BEARING_BINS}


def tolerant_match(key, occupancy):
    """Is `key` served on the other side, within cell and bearing tolerance?

    See METHOD step 4. A hard exact-cell test paints a checkerboard because
    of digitising jitter between the two feeds; this is the fix.
    """
    ix, iy, b = key
    for dx in range(-MATCH_CELL_RADIUS, MATCH_CELL_RADIUS + 1):
        for dy in range(-MATCH_CELL_RADIUS, MATCH_CELL_RADIUS + 1):
            for nb in bin_neighbors(b):
                if (ix + dx, iy + dy, nb) in occupancy:
                    return True
    return False


# --------------------------------------------------------------------------
# classify -> smooth -> split -> dedupe -> drop -> simplify -> emit
# --------------------------------------------------------------------------

def classify_path(samples, other_occupancy, matched_klass, unmatched_klass, cache):
    """Per-sample class, before smoothing. `cache` memoises tolerant_match by
    key -- STEP_M < CELL_M means many consecutive samples share one key, so
    this collapses a lot of repeat matching work on long corridors."""
    out = []
    for s in samples:
        got = cache.get(s.key)
        if got is None:
            got = cache[s.key] = tolerant_match(s.key, other_occupancy)
        out.append(matched_klass if got else unmatched_klass)
    return out


def majority_filter(classes, window):
    """Smooth a class sequence with a sliding-window majority vote.

    Ties keep the sample's own original class, so a perfectly balanced
    window does not introduce a flip the raw data did not already suggest.
    """
    half = window // 2
    out = []
    for i in range(len(classes)):
        lo, hi = max(0, i - half), min(len(classes), i + half + 1)
        counts = Counter(classes[lo:hi])
        out.append(max(counts.items(),
                       key=lambda kv: (kv[1], kv[0] == classes[i]))[0])
    return out


def split_runs(samples, classes):
    """Maximal runs of one class, as (klass, [Sample, ...]) pairs."""
    runs, start = [], 0
    for i in range(1, len(classes) + 1):
        if i == len(classes) or classes[i] != classes[start]:
            runs.append((classes[start], samples[start:i]))
            start = i
    return runs


def run_length_m(samples):
    return sum(math.hypot(samples[i + 1].x - samples[i].x,
                          samples[i + 1].y - samples[i].y)
               for i in range(len(samples) - 1))


def _perp_dist(p, a, b):
    dx, dy = b.x - a.x, b.y - a.y
    if dx == 0 and dy == 0:
        return math.hypot(p.x - a.x, p.y - a.y)
    t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)
    return math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))


def simplify_run(samples, tolerance):
    """Iterative Douglas-Peucker; endpoints are always kept. Iterative rather
    than recursive so a long, genuinely wiggly run cannot hit Python's
    recursion limit."""
    if len(samples) < 3:
        return list(samples)
    keep = [False] * len(samples)
    keep[0] = keep[-1] = True
    stack = [(0, len(samples) - 1)]
    while stack:
        lo, hi = stack.pop()
        if hi - lo < 2:
            continue
        a, b = samples[lo], samples[hi]
        dmax, idx = 0.0, lo
        for i in range(lo + 1, hi):
            d = _perp_dist(samples[i], a, b)
            if d > dmax:
                dmax, idx = d, i
        if dmax > tolerance:
            keep[idx] = True
            stack.append((lo, idx))
            stack.append((idx, hi))
    return [s for s, k in zip(samples, keep) if k]


def make_row(day, klass, length_m, samples):
    simplified = simplify_run(samples, SIMPLIFY_M)
    geometry = " ".join(f"{round(s.lon, 5)},{round(s.lat, 5)}" for s in simplified)
    return {"day": day, "klass": klass, "length_m": round(length_m, 1),
            "geometry": geometry}


def new_pavement_pieces(run, emitted_keys):
    """Split `run` into contiguous stretches whose samples' keys were not
    already emitted by an earlier shape this side/day, marking those keys
    emitted as they are found -- METHOD step 7.

    The membership test is against a snapshot of `emitted_keys` frozen at
    the start of this run, not one updated sample by sample: STEP_M < CELL_M
    means many consecutive samples legitimately share one canonical key, and
    updating mid-run would fracture that single already-new stretch against
    itself the moment its key repeated. No minimum length is applied to the
    pieces -- that already happened to the whole run before this function is
    called, and a floor here would delete a real overlap fragment.
    """
    already = frozenset(emitted_keys)
    pieces, current, new_keys = [], [], set()
    for s in run:
        if s.key in already:
            if len(current) >= 2:
                pieces.append(current)
            current = []
        else:
            new_keys.add(s.key)
            current.append(s)
    if len(current) >= 2:
        pieces.append(current)
    emitted_keys.update(new_keys)
    return pieces


def emit_runs_for_side(day, paths, other_occupancy, matched_klass,
                       unmatched_klass, allowed_klasses):
    """Runs for one side/day, in shape order -- the emit half of METHOD steps
    5-8. `paths` must already be in the deterministic (sorted shape_id) order
    the cross-route dedupe relies on.

    Dedupe is exact-key (new_pavement_pieces), not "skip the whole run if it
    is a subset of what's already emitted" -- a run that shares only part of
    its length with an earlier shape must still contribute the part that is
    new, or summed length_m overcounts every partial overlap.
    """
    cache, emitted_keys, rows = {}, set(), []
    for samples in paths:
        classes = classify_path(samples, other_occupancy, matched_klass,
                                unmatched_klass, cache)
        smoothed = majority_filter(classes, SMOOTH_WINDOW)
        for klass, run in split_runs(samples, smoothed):
            if klass not in allowed_klasses:
                continue
            if run_length_m(run) < MIN_RUN_M:
                continue
            for piece in new_pavement_pieces(run, emitted_keys):
                rows.append(make_row(day, klass, run_length_m(piece), piece))
    return rows


def occupancy(paths, shape_ids):
    keys = set()
    for sid in shape_ids:
        keys.update(s.key for s in paths[sid])
    return keys


# --------------------------------------------------------------------------
# GTFS-specific orchestration
# --------------------------------------------------------------------------

def bus_shape_ids_by_day(feed, samples):
    """{day: {shape_id, ...}} -- distinct shapes used by a revenue bus trip
    running on that day's resolved service. See gtfs.resolve_calendars for
    why day types are resolved per real sample date rather than off
    calendar.txt columns, and the module docstring for NON_REVENUE_ROUTE_IDS.
    """
    by_day, occasional, _nominal, _dates_run = gtfs.resolve_calendars(feed, samples)
    bus_routes = {r["route_id"] for r in feed.rows("routes.txt")
                  if r["route_type"] == BUS_ROUTE_TYPE
                  and r["route_id"] not in NON_REVENUE_ROUTE_IDS}
    out = {day: set() for day in gtfs.DAYS if day in samples}
    for t in feed.rows("trips.txt"):
        if t["route_id"] not in bus_routes or not t["shape_id"]:
            continue
        sid = t["service_id"]
        if sid in occasional:
            continue
        for day in out:
            if sid in by_day[day]:
                out[day].add(t["shape_id"])
    return out


def load_shape_points(feed, shape_ids):
    """{shape_id: [(lat, lon), ...]}, ordered by shape_pt_sequence numerically
    (not string sort, which would put point 10 before point 2)."""
    raw = defaultdict(list)
    for r in feed.rows("shapes.txt"):
        if r["shape_id"] in shape_ids:
            raw[r["shape_id"]].append(
                (int(r["shape_pt_sequence"]), float(r["shape_pt_lat"]),
                 float(r["shape_pt_lon"])))
    return {sid: [(lat, lon) for _seq, lat, lon in sorted(pts)]
            for sid, pts in raw.items()}


def build_paths(feed, shape_ids_by_day):
    """{shape_id: [Sample, ...]} for every shape needed on any day -- loaded
    and resampled once, reused across day types that share a shape."""
    all_ids = set().union(*shape_ids_by_day.values()) if shape_ids_by_day else set()
    points = load_shape_points(feed, all_ids)
    return {sid: build_path(pts, STEP_M) for sid, pts in points.items()}


def corridor_runs(day, cur_paths, cur_shapes_by_day, prop_paths, prop_shapes_by_day):
    """All emitted runs for one day type: kept + added from the proposed
    side's geometry, lost from the current side's (METHOD, "Kept and added
    runs are drawn from...")."""
    cur_ids = sorted(cur_shapes_by_day[day])
    prop_ids = sorted(prop_shapes_by_day[day])
    cur_occ = occupancy(cur_paths, cur_ids)
    prop_occ = occupancy(prop_paths, prop_ids)

    kept_added = emit_runs_for_side(
        day, [prop_paths[sid] for sid in prop_ids], cur_occ,
        KLASS_KEPT, KLASS_ADDED, (KLASS_KEPT, KLASS_ADDED))
    lost = emit_runs_for_side(
        day, [cur_paths[sid] for sid in cur_ids], prop_occ,
        KLASS_KEPT, KLASS_LOST, (KLASS_LOST,))
    return kept_added + lost


# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------

def print_report(rows):
    print("\n" + "=" * 76)
    print("CORRIDOR CHANGE -- WHERE A BUS RUNS ON THE PAVEMENT".center(76))
    print("=" * 76)
    print(f"  {'day':10s} {'kept km':>9s} {'lost km':>9s} {'added km':>9s} "
          f"{'lost %':>8s} {'added %':>8s} {'runs':>6s}")
    for day in gtfs.DAYS:
        day_rows = [r for r in rows if r["day"] == day]
        by_klass_m = defaultdict(float)
        for r in day_rows:
            by_klass_m[r["klass"]] += r["length_m"]
        kept_km = by_klass_m.get(KLASS_KEPT, 0.0) / 1000
        lost_km = by_klass_m.get(KLASS_LOST, 0.0) / 1000
        added_km = by_klass_m.get(KLASS_ADDED, 0.0) / 1000
        today_km = kept_km + lost_km
        lost_pct = lost_km / today_km if today_km else 0.0
        added_pct = added_km / today_km if today_km else 0.0
        print(f"  {day:10s} {kept_km:9.1f} {lost_km:9.1f} {added_km:9.1f} "
              f"{lost_pct:8.1%} {added_pct:8.1%} {len(day_rows):6,d}")

    print("\n  today's total = kept + lost. Each is now counted once -- dedupe "
          "is exact-key,\n  not whole-run, so summed length_m is the corridor "
          "network measured once, not\n  a sum of overlapping route "
          "segments. It is still an approximation of one\n  continuous "
          "street network rather than an exact figure, because kept is "
          "measured\n  on the PROPOSED feed's digitisation and lost on the "
          "CURRENT feed's -- two\n  digitisations of the same street can "
          "differ by a few metres of vertex\n  placement, which "
          "MATCH_CELL_RADIUS absorbs rather than eliminates.")
    print("\n  CAVEAT -- pavement is not access. This table counts STREET, not "
          "PEOPLE:\n  a corridor that loses its only bus while a parallel "
          "street a block away\n  keeps one is a real loss of pavement here, "
          "and may show no change at all\n  in the walk-radius tiers of "
          "analyze_coverage_change.py or\n  analyze_coverage_area.py, which "
          "answer 'can I reach a bus from where I\n  stand' rather than 'does "
          "a bus run on the street in front of me'. Neither\n  answer "
          "substitutes for the other; read them side by side.")


def write_csv(rows):
    out = DATA / "corridor_change.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["day", "klass", "length_m", "geometry"])
        w.writeheader()
        w.writerows(rows)
    print(f"\nWrote {out} ({len(rows):,} rows)")


def main():
    print("Loading sources...")
    cur_feed = gtfs.current()
    prop_feed = gtfs.proposed()

    cur_shapes_by_day = bus_shape_ids_by_day(cur_feed, gtfs.SAMPLE["current"])
    prop_shapes_by_day = bus_shape_ids_by_day(prop_feed, gtfs.SAMPLE["proposed"])
    print(f"  current:  " + ", ".join(f"{d}={len(s)} shapes"
                                       for d, s in cur_shapes_by_day.items()))
    print(f"  proposed: " + ", ".join(f"{d}={len(s)} shapes"
                                       for d, s in prop_shapes_by_day.items()))

    cur_paths = build_paths(cur_feed, cur_shapes_by_day)
    prop_paths = build_paths(prop_feed, prop_shapes_by_day)

    rows = []
    for day in gtfs.DAYS:
        rows.extend(corridor_runs(day, cur_paths, cur_shapes_by_day,
                                  prop_paths, prop_shapes_by_day))

    write_csv(rows)
    print_report(rows)


if __name__ == "__main__":
    main()
