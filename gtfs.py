#!/usr/bin/env python3
"""
One GTFS reader for both networks, so both sides are measured by the same code.

A GTFS for the proposed network exists at no URL -- its `feed_info.txt` names PRT
as publisher and is stamped 2026-08-11 -- but *how* it reached this repo is not
recorded, and must be before the feed is cited publicly. It is committed verbatim under `data/raw/proposed_gtfs/`;
`ingest_blr.py` cannot re-fetch it. See DATA_SOURCES.md for what is and is not
known about where it came from, and `verify_proposed_gtfs.py` for the check that
it describes the plan PRT published.

WHY A SHARED MODULE

The repo's first analytical convention is that both networks must be measured
identically. While the proposed side was modelled from the Frequency & Hours
PDFs and the Remix map, that could only ever be a convention -- the two sides
ran through different code and the comparison was between a timetable and an
estimate. With a real feed on both sides it becomes structural: `load_service`
is called twice, once per feed, and neither side can drift from the other
without the other moving too.

WHAT THE PROPOSED FEED RETIRES

The PDF model got the daily total close and the shape wrong. Whole-network
weekday bus trips come out at 5,480 modelled against 5,559 real, +1.4%. The
distribution is where it fails:

  * BY TIME OF DAY. The published span end is the last departure from the
    anchor, not the last departure on the route; the feed's last departure is
    later on all 240 route-days, by a median of 96 minutes. So the model
    overcounts the start of the day and undercounts its end -- early -26.9%,
    late 8-11pm +15.5%, owl +115.7% against real trips. The late-evening
    "cut" the earlier findings carried was largely this.
  * BY ROUTE. Span x headway cannot express a midday gap, so peak-only routes
    run all day in the model. Ten "L" routes are modelled at 28 weekday trips
    and actually run 14.
  * BY LOCATION, the largest and least visible. The old stop-level method gave
    every (route, direction-label) at a stop that route's *whole published
    frequency*, so a branching route counted twice where its patterns diverge.
    Real stop_times count the trips that actually call.
  * BY STOP INVENTORY. Remix carried 107 stops the proposal does not serve, and
    its base feed is 2023, which forced an "unverifiable" confidence tier onto
    any stop that looked dropped. PRT's own feed removes the need for it.

The PDFs remain an independent published cross-check. Remix remains the only
source for the on-demand microtransit zones.

SEMANTICS, identical for both feeds:

  * a trip is counted at each stop it calls at, at its departure time THERE --
    not its start time;
  * times are folded onto a 4:00am-4:00am axis, so a 25:30 departure is 1:30am
    and lands in the owl period;
  * day types are resolved for real sample DATES, never read off calendar.txt
    columns, so calendar_dates exceptions apply -- see `resolve_calendars`;
  * bus only by default (route_type 3): rail and the inclines are outside the
    Refresh.

TWO WAYS TO READ A FEED

`load_service` answers how much service there is: departure minutes per stop,
per route and direction, folded onto the 4am axis, buses only. Every analysis
that counts service uses it.

`load_patterns` answers what a vehicle does: which departures belong to the
same trip, in what order it calls, in raw minutes, every mode included. Only
the router uses it. It is a separate reader rather than a flag because the two
disagree about the axis and about rail on purpose, and a caller that took the
wrong one would get a plausible answer to the other question.

Usage:
    import gtfs
    svc = gtfs.load_service(gtfs.proposed(), gtfs.SAMPLE["proposed"],
                            period_of=period_of, to_axis=to_axis)
    svc.times[day][stop_id][(route, direction)] -> [axis minutes]

    by_day, coords, _ = gtfs.load_patterns(gtfs.current(), gtfs.SAMPLE["current"])
    by_day[day] -> [(route, stops, [(start minute, offsets)])]
"""

import csv
import io
import math
import zipfile
from bisect import bisect_left
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, timedelta
from pathlib import Path

DATA = Path("data")
RAW = DATA / "raw"

CURRENT_GTFS = RAW / "current_gtfs.zip"
PROPOSED_GTFS = RAW / "proposed_gtfs"

DAYS = ["weekday", "saturday", "sunday"]
DOWS = ["monday", "tuesday", "wednesday", "thursday", "friday",
        "saturday", "sunday"]

# A holiday-free week inside each feed's own validity window. The current feed
# is valid 2026-06-28 to 2026-10-24; the proposed feed covers 2027.
SAMPLE = {
    "current": {"weekday": date(2026, 9, 16),    # Wednesday
                "saturday": date(2026, 9, 19),
                "sunday": date(2026, 9, 20)},
    "proposed": {"weekday": date(2027, 9, 15),   # Wednesday
                 "saturday": date(2027, 9, 18),
                 "sunday": date(2027, 9, 19)},
}

# A calendar operating on no more than this many dates in its own window is
# holiday or special service, not a day type. The current feed has two: service
# 4 (Labor Day) and service 1 (July 4). The proposed feed has none.
OCCASIONAL_MAX_DATES = 3

REQUIRED = ["calendar.txt", "routes.txt", "trips.txt", "stop_times.txt",
            "stops.txt"]


class Feed:
    """Minimal GTFS reader over either a .zip or an unpacked directory."""

    def __init__(self, path, label=""):
        self.path = Path(path)
        self.label = label or self.path.name
        self.zip = zipfile.ZipFile(path) if self.path.suffix == ".zip" else None

    def rows(self, name):
        if self.zip:
            with self.zip.open(name) as f:
                yield from csv.DictReader(io.TextIOWrapper(f, "utf-8-sig"))
        else:
            with open(self.path / name, encoding="utf-8-sig") as f:
                yield from csv.DictReader(f)

    def has(self, name):
        if self.zip:
            return name in self.zip.namelist()
        return (self.path / name).exists()

    def check(self):
        missing = [n for n in REQUIRED if not self.has(n)]
        if missing:
            raise SystemExit(
                f"{self.path} is not a usable GTFS: missing {missing}\n"
                "The proposed-network feed is supplied by PRT and is not "
                "fetchable; see DATA_SOURCES.md for provenance.")
        return self

    def version(self):
        if not self.has("feed_info.txt"):
            return ""
        try:
            return next(iter(self.rows("feed_info.txt"))).get("feed_version", "")
        except StopIteration:
            return ""


def current():
    if not CURRENT_GTFS.exists():
        raise SystemExit(f"missing {CURRENT_GTFS} -- run ingest_blr.py first")
    return Feed(CURRENT_GTFS, "current").check()


def proposed():
    if not PROPOSED_GTFS.exists():
        raise SystemExit(
            f"missing {PROPOSED_GTFS}\n"
            "The proposed-network GTFS is supplied by PRT, not fetchable; see "
            "DATA_SOURCES.md.")
    return Feed(PROPOSED_GTFS, "proposed").check()


# --------------------------------------------------------------------------
# calendars
# --------------------------------------------------------------------------

def parse_date(s):
    return date(int(s[:4]), int(s[4:6]), int(s[6:8]))


def runs_on(row, exc, d):
    """Does this calendar row operate on date d, exceptions applied?"""
    ds = d.strftime("%Y%m%d")
    on = row["start_date"] <= ds <= row["end_date"] and row[DOWS[d.weekday()]] == "1"
    e = exc[row["service_id"]].get(ds)
    return True if e == "1" else (False if e == "2" else on)


def resolve_calendars(feed, samples):
    """(by_day, occasional, nominal, dates_run) for one feed.

    Day types are resolved for real dates rather than read off calendar.txt
    columns, because the current feed contains two holiday calendars that look
    exactly like day types. Service id 4 has monday=1 and reads as an ordinary
    weekday calendar, but calendar_dates suppresses it on every Monday in the
    window except 2026-09-07: it is Labor Day service, and service 2, the real
    weekday calendar, is suppressed that day. Counting service 4 as weekday
    service credits 70 routes with a schedule they do not run.

    Occasional calendars are identified by counting the dates each one actually
    operates on across its own window -- the only way to tell Labor Day service
    from a Monday schedule, since both have monday=1.
    """
    cal = list(feed.rows("calendar.txt"))
    exc = defaultdict(dict)
    if feed.has("calendar_dates.txt"):
        for r in feed.rows("calendar_dates.txt"):
            exc[r["service_id"]][r["date"]] = r["exception_type"]

    by_day = {day: {row["service_id"] for row in cal if runs_on(row, exc, d)}
              for day, d in samples.items()}

    occasional, dates_run = set(), {}
    for row in cal:
        d, end = parse_date(row["start_date"]), parse_date(row["end_date"])
        n = 0
        while d <= end:
            n += runs_on(row, exc, d)
            d += timedelta(days=1)
        dates_run[row["service_id"]] = n
        if n <= OCCASIONAL_MAX_DATES:
            occasional.add(row["service_id"])

    nominal = {row["service_id"]: {d for d in DAYS
                                   if (row["saturday"] == "1" if d == "saturday"
                                       else row["sunday"] == "1" if d == "sunday"
                                       else any(row[x] == "1" for x in DOWS[:5]))}
               for row in cal}

    for day in DAYS:
        if day in samples and not by_day.get(day):
            raise SystemExit(
                f"{feed.label} feed has no service on its {day} sample date "
                f"{samples[day]} -- the sample dates in gtfs.SAMPLE fall "
                "outside this feed's validity window")
    return by_day, occasional, nominal, dates_run


# --------------------------------------------------------------------------
# service
# --------------------------------------------------------------------------

@dataclass
class Service:
    """Everything the analyses need from one feed, per day type."""

    label: str
    version: str
    # {day: {stop_id: {(route, direction): [axis minutes]}}}
    times: dict = field(default_factory=dict)
    coords: dict = field(default_factory=dict)          # stop_id -> (lat, lon)
    route_days: dict = field(default_factory=dict)      # route -> {day, ...}
    holiday_only: dict = field(default_factory=dict)    # route -> {day, ...}
    # {day: {route: {period: whole trips}}} -- trips, NOT stop visits
    route_periods: dict = field(default_factory=dict)
    # {day: {route: (first, last)}} in raw GTFS minutes
    route_spans: dict = field(default_factory=dict)
    # {day: {route: revenue hours}} -- summed trip durations, first to last
    # stop. This is in-service time only: layover, deadhead and pull-in/pull-out
    # are not in a GTFS, so it is a floor on platform hours, not a cost figure.
    route_hours: dict = field(default_factory=dict)
    n_trips: dict = field(default_factory=dict)         # day -> trips kept

    def served(self, day=None):
        """Stop ids with at least one departure, on `day` or on any day."""
        days = [day] if day else DAYS
        return {sid for d in days for sid in self.times.get(d, {})}

    def counts(self, day, period_of):
        """{stop_id: {(route, direction, period): trips}} for one day type.

        Derived from `times` rather than accumulated separately, so the two can
        never disagree.
        """
        out = defaultdict(lambda: defaultdict(float))
        for sid, per_rd in self.times[day].items():
            for (rt, dr), ts in per_rd.items():
                for t in ts:
                    p = period_of(t)
                    if p:
                        out[sid][(rt, dr, p)] += 1
        return out


# --------------------------------------------------------------------------
# where a bus actually drives: shapes, for drawing only
# --------------------------------------------------------------------------

# A drawn path is simplified to this tolerance before it is stored. Five metres
# is under a lane width and well under a pixel at any zoom this map is read at,
# so it is invisible on screen -- and it turns ~550,000 shape points into
# something a database can carry.
SHAPE_SIMPLIFY_M = 5.0

M_PER_DEG_LAT = 111_320.0


def metres_between(a, b):
    """Equirectangular metres between two (lat, lon) points.

    The same approximation the rest of the repo uses at city scale: exact
    enough at these distances, and it does not need trigonometry per call.
    """
    lat_scale = math.cos(math.radians((a[0] + b[0]) / 2))
    dy = (a[0] - b[0]) * M_PER_DEG_LAT
    dx = (a[1] - b[1]) * M_PER_DEG_LAT * lat_scale
    return math.hypot(dx, dy)


def _perpendicular_m(point, start, end):
    """Distance from `point` to the segment start->end, in metres."""
    lat_scale = math.cos(math.radians(start[0]))
    px = (point[1] - start[1]) * M_PER_DEG_LAT * lat_scale
    py = (point[0] - start[0]) * M_PER_DEG_LAT
    ex = (end[1] - start[1]) * M_PER_DEG_LAT * lat_scale
    ey = (end[0] - start[0]) * M_PER_DEG_LAT
    span = ex * ex + ey * ey
    if span == 0:
        return math.hypot(px, py)
    t = max(0.0, min(1.0, (px * ex + py * ey) / span))
    return math.hypot(px - t * ex, py - t * ey)


def simplify_path(points, tolerance_m=SHAPE_SIMPLIFY_M):
    """Douglas-Peucker, iterative so a long shape cannot blow the stack.

    Lossy on purpose and only ever used for drawing. Nothing in this repo
    measures a distance off a simplified path -- lengths come from the full
    shape (`analyze_corridor_change.py`) or from the timetable.
    """
    if len(points) < 3:
        return list(points)
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        lo, hi = stack.pop()
        if hi - lo < 2:
            continue
        worst_at, worst = lo, 0.0
        for i in range(lo + 1, hi):
            d = _perpendicular_m(points[i], points[lo], points[hi])
            if d > worst:
                worst_at, worst = i, d
        if worst > tolerance_m:
            keep[worst_at] = True
            stack.append((lo, worst_at))
            stack.append((worst_at, hi))
    return [p for p, k in zip(points, keep) if k]


# Today's `shapes.txt` steps to the curb and back at every stop: three points
# that leave the centreline by a few metres and return to the coordinate they
# left from (`shp-87-01`, sequence 788-790, 5.5 m out and 5.5 m back). Drawn
# faithfully that is a perpendicular stub at 14,820 stops, which is exactly
# what "the line does not follow the street" looks like -- and simplifying
# cannot remove it, because the detour really is 5.5 m off the zero-length
# segment between its two neighbours. A vertex whose neighbours are this close
# together is not a turn, so it goes before the path is simplified.
CURB_PULL_IN_M = 2.0

# The longest excursion, in vertices, that may be collapsed as a pull-in. The
# feed's are four points -- centreline, kerb, stop, kerb -- and a bus entering
# a transit centre and coming back out is far longer. Both this and the offset
# ceiling below are what keeps a real dead-end spur (Century III, South Hills
# Village: 60-100 m out and back) on the map while the kerb steps come off it.
CURB_PULL_IN_MAX_POINTS = 8


def drop_curb_pull_ins(points, tolerance_m=CURB_PULL_IN_M,
                       max_offset_m=None, max_points=CURB_PULL_IN_MAX_POINTS):
    """Drop excursions the path makes and returns from within a few metres.

    Written as a scan over whole excursions rather than a filter over triples,
    because the feed's pull-ins nest: `shp-61A-03` steps out at 458, again at
    459, touches the stop at 460 and unwinds through 461 to 462, and dropping
    the innermost pair leaves the outer one behind as a wedge. Drawing only.
    """
    if max_offset_m is None:
        max_offset_m = STOP_SNAP_M
    if len(points) < 3:
        return list(points)

    def returns_to(start):
        """The furthest vertex the path comes back to `start` at, if any."""
        limit = min(len(points), start + max_points + 1)
        for end in range(limit - 1, start + 1, -1):
            if metres_between(points[start], points[end]) > tolerance_m:
                continue
            if max(metres_between(points[start], points[i])
                   for i in range(start + 1, end)) <= max_offset_m:
                return end
        return None

    kept, at = [points[0]], 0
    while at < len(points) - 1:
        back = returns_to(at)
        if back is not None:
            at = back            # the path is already at this coordinate
            continue
        at += 1
        kept.append(points[at])
    return kept


def _shape_paths(feed, wanted):
    """{shape_id: [(lat, lon), ...]}, ordered along the shape, for the ids asked.

    Curb pull-ins are dropped on the way out, so callers get the line the bus
    drives rather than the line plus a stub at every stop.
    """
    raw = defaultdict(list)
    for r in feed.rows("shapes.txt"):
        sid = r["shape_id"]
        if sid not in wanted:
            continue
        try:
            raw[sid].append((int(r["shape_pt_sequence"]),
                             float(r["shape_pt_lat"]), float(r["shape_pt_lon"])))
        except (TypeError, ValueError):
            continue
    return {sid: drop_curb_pull_ins([(lat, lon) for _, lat, lon in sorted(rows)])
            for sid, rows in raw.items()}


# How far ahead of the last matched stop to look for the next one. Shape
# points run every few tens of metres, so a stop is normally a handful of
# vertices past its predecessor; the window only has to cover a long express
# run between two stops, and a stop that finds nothing convincing inside it
# widens to the whole remaining path.
_STOP_MATCH_LOOKAHEAD = 400
_STOP_MATCH_GOOD_M = 60.0


def _vertex_for_each_stop(points, stops, coords):
    """One vertex index per stop, in calling order and never going backwards.

    Matched by POSITION, not by the feeds' `shape_dist_traveled`. That field
    is published on every row of both feeds and is wrong on some of them: 27
    proposed routes, route 55 among them, carry stop distances running to
    36,850 against a shape whose own distances stop at 30,858, and slicing on
    it put stops five kilometres from the path they are supposed to sit on.
    Position cannot drift like that, and a shape point is only tens of metres
    from its neighbour, so the vertex found is the right one.

    Forward-only: a route that doubles back would otherwise match its return
    leg to an outbound stop and draw the ride backwards.
    """
    out, floor = [], 0
    for stop in stops:
        here = coords.get(stop)
        if here is None:
            return None
        best, best_m = floor, None
        window = min(len(points), floor + _STOP_MATCH_LOOKAHEAD)
        for candidate in range(floor, window):
            gap = metres_between(here, points[candidate])
            if best_m is None or gap < best_m:
                best, best_m = candidate, gap
        if best_m is not None and best_m > _STOP_MATCH_GOOD_M:
            for candidate in range(window, len(points)):
                gap = metres_between(here, points[candidate])
                if gap < best_m:
                    best, best_m = candidate, gap
        out.append(best)
        floor = best
    return out


# How far a stop may sit from the path its own trips drive and still be
# treated as being ON it. Below this, a stop is a kerbside coordinate for a bus
# that drives down the middle of the street, and moving the drawn line out to
# touch it wrenches it off the street and back for no information at all.
# Above it, the feed has genuinely put the stop somewhere else -- some
# proposed-side stops are 100-350 m off their own shape, and rail stations sit
# beside the track alignment -- and drawing through the wrong block would be
# worse than a visible jog. Nothing between 25 m and 100 m occurs in either
# feed, so the threshold sits in an empty gap rather than on a judgement call.
STOP_SNAP_M = 30.0


def _pattern_path(points, stops, coords):
    """A pattern's drawn path: the shape between stops, the stop at each stop.

    Every stop contributes a vertex, so a leg from stop i to stop j is the
    slice between their two indices. WHICH coordinate that vertex takes is the
    whole subtlety, and it is `STOP_SNAP_M` that decides: a stop the path
    already runs past keeps the path on the street, and only a stop the feed
    has genuinely put elsewhere -- 100-350 m off on the proposed side, or a
    rail station beside its track alignment -- pulls the line out to itself.
    Anchoring unconditionally looks right and is not: it steps the line off
    the street and back at the kerb of every stop on every route.

    Between stops the run is thinned on its own, so the vertices the stops sit
    on always survive. A leg from stop i to stop j is then the slice between
    their two indices, with no searching at draw time.
    """
    vertices = _vertex_for_each_stop(points, stops, coords)
    if vertices is None:
        return None

    def anchor(position):
        """Where the drawn path sits at this stop: the street, or the stop."""
        here, on_path = coords[stops[position]], points[vertices[position]]
        return on_path if metres_between(here, on_path) <= STOP_SNAP_M else here

    path, stop_idx = [anchor(0)], [0]
    for position in range(1, len(stops)):
        # Interior vertices only: the two ends of the run are the stops
        # themselves, which are already in the path or about to be.
        run = points[vertices[position - 1] + 1:vertices[position]]
        if run:
            path.extend(simplify_path(run) if len(run) > 2 else run)
        path.append(anchor(position))
        stop_idx.append(len(path) - 1)
    return tuple(path), tuple(stop_idx)


def _pattern_shapes(feed, shape_votes, coords):
    """{(route, stops): (path, stop_idx)} for every pattern that has a path.

    A pattern whose trips name no shape, or whose feed omits `shapes.txt`, is
    simply absent -- the map draws its straight lines for that leg instead.
    """
    if not shape_votes or not feed.has("shapes.txt"):
        return {}
    # Broken by (-count, shape_id) so a tie resolves the same way on every
    # run: a redraw that moved with dict order would be a diff nobody could
    # explain.
    chosen = {key: min(votes.items(), key=lambda kv: (-kv[1], kv[0]))[0]
              for key, votes in shape_votes.items()}

    paths = _shape_paths(feed, set(chosen.values()))
    out = {}
    for (route, stops), shape_id in chosen.items():
        points = paths.get(shape_id)
        if not points:
            continue
        drawn = _pattern_path(points, stops, coords)
        if drawn is not None:
            out[(route, stops)] = drawn
    return out


def load_patterns(feed, samples, routed_types=None, quiet=False,
                  with_shapes=False):
    """({day: [(route, stops, trips)]}, {stop_id: (lat, lon)}, shapes).

    `shapes` is `{(route, stops): (path, stop_idx)}` and is empty unless
    `with_shapes` asks for it, because filling it means reading the feed's
    `shapes.txt` -- 22 MB on the current side -- which only the map needs. See
    WHERE THE BUS ACTUALLY DRIVES below.

    The trip dimension `load_service` throws away. It keeps which departures
    belong to the same vehicle and in what order that vehicle calls, which is
    the only thing a journey needs and the one thing a departure count cannot
    reconstruct. Everything else about how a feed is read -- the calendar
    resolution, the holiday exclusion, the minute truncation -- is shared with
    `load_service`, so a journey cannot be routed onto service no analysis here
    would count.

    WHY PATTERNS RATHER THAN TRIPS

    The two feeds carry 1.7 million stop calls between them and about 33,000
    trips, but only ~471 distinct stop sequences: a route's trips overwhelmingly
    call at the same stops in the same order, ~70 times over. So a trip is
    stored as a pattern index, a start minute and its running times as offsets
    from that start, and the stop list is paid for once per pattern instead of
    once per trip. That is what makes the router's data a fifth of the size of
    the feeds it comes from.

    Running times are per trip and never per pattern, deliberately. Both feeds
    widen a route's end-to-end time at the PM peak, and that widening is part of
    what a before-and-after comparison is measuring; averaging it into one
    per-pattern profile would erase the plan's own congestion assumptions.

    TWO DEPARTURES FROM THE HOUSE CONVENTIONS, both required here

    Times are RAW GTFS minutes, not the 4:00-28:00 axis every other analysis
    folds onto. Folding is what puts a 25:30 departure in the owl period, and it
    is exactly wrong along a trip: a vehicle running through 4am would appear to
    arrive an hour before it left. Callers that need a period bucket fold at the
    point of display, after the routing is done.

    Every route type is kept, not buses only -- convention 13. A journey is not
    a quantity of service, so the T and the inclines carry riders here even
    though no service figure in this repo counts them. Pass `routed_types` to
    narrow it; the default is every mode in the feed. Note that the two feeds
    spell rail differently, current as route_type 2 and proposed as 0, so a
    caller that narrows by naming a type must name both.

    WHERE THE BUS ACTUALLY DRIVES

    A pattern is a list of stops, which is everything the router needs and
    nothing a map can draw a line along: joining stops directly puts a bus
    through buildings and across rivers, and straightens every turn it makes.
    Both feeds carry `shapes.txt`, so with `with_shapes` a pattern also gets
    the path its own trips run, with the vertex each of its stops sits on --
    a leg from one stop to another is then a slice, not a search.

    Where trips of one pattern name different shapes, the commonest wins; the
    variants differ by a few metres at a terminal loop. The path is thinned to
    `SHAPE_SIMPLIFY_M` between stops and is LOSSY BY CONSTRUCTION: it is for
    drawing only, and no distance may be measured off it.
    """
    feed.check()
    by_day, occasional, nominal, _dates_run = resolve_calendars(feed, samples)

    routes = {r["route_id"]: r for r in feed.rows("routes.txt")}
    keep_routes = (set(routes) if routed_types is None else
                   {rid for rid, r in routes.items()
                    if r["route_type"] in routed_types})

    keep = {}
    for t in feed.rows("trips.txt"):
        if t["route_id"] not in keep_routes or t["service_id"] in occasional:
            continue
        days = [d for d in DAYS if t["service_id"] in by_day[d]]
        if days:
            keep[t["trip_id"]] = (t["route_id"], days,
                                  t.get("shape_id", "") if with_shapes else "")

    calls = defaultdict(list)
    for st in feed.rows("stop_times.txt"):
        if st["trip_id"] not in keep:
            continue
        clock = st["departure_time"] or st["arrival_time"]
        try:
            h, m, _ = clock.split(":")
        except ValueError:
            continue
        calls[st["trip_id"]].append(
            (int(st["stop_sequence"]), st["stop_id"], int(h) * 60 + int(m)))

    # {(route, stops): {day: [(start, offsets)]}} -- one entry per pattern,
    # holding the trips that run it, split by the day types they operate on.
    patterns = defaultdict(lambda: defaultdict(list))
    # {(route, stops): {shape_id: trips}} -- which path this pattern's trips
    # actually run. Only filled when the caller wants geometry.
    shape_votes = defaultdict(lambda: defaultdict(int))
    for trip_id, rows in calls.items():
        rows.sort()
        route, days, shape_id = keep[trip_id]
        start = rows[0][2]
        stops = tuple(stop for _, stop, _ in rows)
        offsets = tuple(minute - start for _, _, minute in rows)
        for day in days:
            patterns[(route, stops)][day].append((start, offsets))
        if with_shapes and shape_id:
            shape_votes[(route, stops)][shape_id] += 1

    out = {day: [] for day in DAYS}
    for (route, stops), per_day in patterns.items():
        for day, trips in per_day.items():
            trips.sort()
            out[day].append((route, stops, trips))

    coords = {}
    for s in feed.rows("stops.txt"):
        try:
            coords[s["stop_id"]] = (float(s["stop_lat"]), float(s["stop_lon"]))
        except (TypeError, ValueError, KeyError):
            pass

    shapes = _pattern_shapes(feed, shape_votes, coords) if with_shapes else {}

    if not quiet:
        print(f"  {feed.label}: patterns={len(patterns)}  "
              + "  ".join(f"{d}={sum(len(t) for _, _, t in out[d]):,} trips"
                          for d in DAYS))
    return out, coords, shapes


def stop_routes(feed, bus_only=True):
    """({stop_id: {route_id}} for served stops, {stop_id: (lat, lon)}).

    No calendar resolution and no period bucketing -- this answers only "is
    this stop served, and by what", which is all analyze_service_loss.py and
    analyze_one_seat.py ask. Keeping it separate means those two do not have to
    import the period definitions from analyze_frequency_change.py, which would
    be circular.

    Every trip in the feed counts, on any calendar. That is deliberate here: a
    stop served once a week is still served, and the question these callers ask
    is whether the stop keeps a bus at all.
    """
    feed.check()
    keep = None
    if bus_only:
        keep = {r["route_id"] for r in feed.rows("routes.txt")
                if r["route_type"] == "3"}
    trip_route = {t["trip_id"]: t["route_id"] for t in feed.rows("trips.txt")
                  if keep is None or t["route_id"] in keep}

    served = defaultdict(set)
    for st in feed.rows("stop_times.txt"):
        rt = trip_route.get(st["trip_id"])
        if rt:
            served[st["stop_id"]].add(rt)

    coords = {}
    for s in feed.rows("stops.txt"):
        try:
            coords[s["stop_id"]] = (float(s["stop_lat"]), float(s["stop_lon"]))
        except (TypeError, ValueError, KeyError):
            pass
    return dict(served), coords


def load_service(feed, samples, period_of=None, to_axis=None, bus_only=True,
                 quiet=False):
    """Departure times per day type for one feed. See module docstring."""
    feed.check()
    by_day, occasional, nominal, dates_run = resolve_calendars(feed, samples)

    if not quiet:
        print(f"  {feed.label}: operating dates per calendar "
              + ", ".join(f"{k}={v}" for k, v in sorted(dates_run.items())))
        if occasional:
            print(f"    holiday/special calendars, excluded: {sorted(occasional)}")
        for day in DAYS:
            print(f"    {day:9s} sample {samples[day]}  "
                  f"service_ids={sorted(by_day[day])}")

    routes = {r["route_id"]: r for r in feed.rows("routes.txt")}
    keep_routes = ({rid for rid, r in routes.items() if r["route_type"] == "3"}
                   if bus_only else set(routes))

    keep, route_days, holiday_routes = {}, defaultdict(set), defaultdict(set)
    for t in feed.rows("trips.txt"):
        if t["route_id"] not in keep_routes:
            continue
        if t["service_id"] in occasional:
            # A route running on Labor Day does not have weekday service.
            # Remembered so the report can say so, never counted.
            holiday_routes[t["route_id"]] |= nominal.get(t["service_id"], set())
            continue
        days = [d for d in DAYS if t["service_id"] in by_day[d]]
        if days:
            keep[t["trip_id"]] = (t["route_id"], t["direction_id"], days)
            route_days[t["route_id"]].update(days)

    times = {d: defaultdict(lambda: defaultdict(list)) for d in DAYS}
    trip_span = {}
    spans = {d: defaultdict(lambda: [None, None]) for d in DAYS}

    for st in feed.rows("stop_times.txt"):
        rd = keep.get(st["trip_id"])
        if not rd:
            continue
        clock = st["departure_time"] or st["arrival_time"]
        try:
            h, m, _ = clock.split(":")
            raw = int(h) * 60 + int(m)
        except ValueError:
            continue
        # A trip's first and last stop are the min and max over its own
        # stop_times in RAW GTFS minutes, which run past 24:00 and so stay
        # monotonic along the trip. Folding to the 4am axis first would make a
        # trip that crosses 4am appear to start at its last stop.
        cell = trip_span.get(st["trip_id"])
        if cell is None:
            trip_span[st["trip_id"]] = [raw, raw]
        else:
            if raw < cell[0]:
                cell[0] = raw
            if raw > cell[1]:
                cell[1] = raw
        route, direction, days = rd
        axis = to_axis(raw)
        for day in days:
            times[day][st["stop_id"]][(route, direction)].append(axis)
            cell = spans[day][route]
            if cell[0] is None or raw < cell[0]:
                cell[0] = raw
            if cell[1] is None or raw > cell[1]:
                cell[1] = raw

    route_periods = {d: defaultdict(lambda: defaultdict(float)) for d in DAYS}
    route_hours = {d: defaultdict(float) for d in DAYS}
    n_trips = {d: 0 for d in DAYS}
    for tid, (start, end) in trip_span.items():
        route, _direction, days = keep[tid]
        p = period_of(to_axis(start))
        for day in days:
            n_trips[day] += 1
            route_hours[day][route] += (end - start) / 60.0
            if p:
                route_periods[day][route][p] += 1

    coords = {}
    for s in feed.rows("stops.txt"):
        try:
            coords[s["stop_id"]] = (float(s["stop_lat"]), float(s["stop_lon"]))
        except (TypeError, ValueError, KeyError):
            pass

    holiday_only = {rt: days - route_days.get(rt, set())
                    for rt, days in holiday_routes.items()
                    if days - route_days.get(rt, set())}
    for rt in holiday_routes:
        route_days.setdefault(rt, set())

    svc = Service(
        label=feed.label, version=feed.version(), times=times, coords=coords,
        route_days=dict(route_days), holiday_only=holiday_only,
        route_periods=route_periods,
        route_spans={d: {r: tuple(v) for r, v in rs.items()}
                     for d, rs in spans.items()},
        route_hours={d: dict(h) for d, h in route_hours.items()},
        n_trips=n_trips)
    if not quiet:
        print(f"    routes={len(keep_routes)}  stops={len(coords):,}  "
              f"trips kept={len(keep):,}  "
              + "  ".join(f"{d}={n_trips[d]:,}" for d in DAYS))
    return svc
