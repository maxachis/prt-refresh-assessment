"""FastAPI app -- a thin HTTP skin over `refresh.query`, reading SQLite read-only.

No analysis happens here. Every endpoint is a parameter-validating wrapper
around a pure function in `query.py`, which is what lets `tests/test_query.py`
check the numbers against `data/coverage_change.csv` without going through
HTTP. Built via `create_app` so tests can point it at a temp DB.

ON BINDING THIS PUBLICLY. `refresh serve` binds 127.0.0.1 by default. The
proposed-network GTFS this app serves is published at no URL: PRT sent it to
Pittsburghers for Public Transit on request and PPT passed it on
(DATA_SOURCES.md), which settles provenance and makes the numbers citable.
Serving it on a public address is still a further step -- it puts PRT's
unpublished timetable on the web at the finest possible grain, every departure
at every stop -- so confirm that is expected before changing the bind address.
See docs/WEBAPP.md, "Before it goes public".
"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .. import journey, query

_STATIC = Path(__file__).parent / "static"

# Bounds a request can ask for. The upper bound is not a performance limit --
# it is the point past which "walking distance" stops meaning anything, and a
# 5 km circle over Downtown would return most of the network and read as though
# one corner had 300 routes.
MIN_RADIUS, MAX_RADIUS = 50, 1500

# Roughly Allegheny County, plus margin. A point outside it has no PRT service
# by definition, and rejecting it early gives a clearer error than an empty
# result that looks like a service loss.
LAT_RANGE = (40.15, 40.75)
LON_RANGE = (-80.45, -79.55)


def create_app(db_path: str | Path = "data/refresh.db") -> FastAPI:
    con = query.connect(db_path)
    meta = query.meta(con)

    app = FastAPI(
        title="PRT Bus Line Refresh — before and after",
        description=__doc__,
        version="0.1.0",
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    def _check_point(lat: float, lon: float):
        if not (LAT_RANGE[0] <= lat <= LAT_RANGE[1]
                and LON_RANGE[0] <= lon <= LON_RANGE[1]):
            raise HTTPException(
                400, "point is outside the PRT service area "
                     f"(lat {LAT_RANGE}, lon {LON_RANGE})")

    @app.get("/api/meta")
    def api_meta():
        """Feed versions, sample dates and the caveats every number carries."""
        return {
            "feeds": meta,
            "radii": {"primary": query.PRIMARY_RADIUS, "offered": list(query.RADII)},
            "periods": [{"key": k, "start": a, "end": b}
                        for k, a, b in query.PERIODS],
            "journey": {
                "day": query.JOURNEY_DAY,
                "window": {"start_min": query.JOURNEY_WINDOW[0],
                           "end_min": query.JOURNEY_WINDOW[1]},
                "transfer_radii": query.TRANSFER_RADII,
                "constants": journey.CONSTANTS,
            },
            "caveats": CAVEATS,
        }

    @app.get("/api/place")
    def api_place(
        lat: float = Query(..., description="latitude"),
        lon: float = Query(..., description="longitude"),
        radius: float = Query(query.PRIMARY_RADIUS, ge=MIN_RADIUS, le=MAX_RADIUS,
                              description="walk radius in metres"),
        dest_lat: float | None = Query(None, description="optional one-seat "
                                                         "destination pin"),
        dest_lon: float | None = Query(None),
        oneseat_day: str = Query(
            query.ANY_DAY,
            pattern=f"^({'|'.join(query.ONESEAT_DAYS)})$",
            description="day type for the one-seat verdicts only; the default "
                        "is the published day-free answer"),
    ):
        """Before and after at one point, both networks measured identically.

        This is the app's whole purpose; everything else is navigation.

        `dest_lat`/`dest_lon` add one dropped-pin one-seat verdict alongside
        the named destinations, so that a reader who has pointed the map at
        somewhere of their own gets the panel to answer for it too rather than
        silently reverting to Downtown and Oakland.
        """
        _check_point(lat, lon)
        if (dest_lat is None) != (dest_lon is None):
            raise HTTPException(400, "give both dest_lat and dest_lon, or neither")
        if dest_lat is not None:
            _check_point(dest_lat, dest_lon)
        return query.place(con, lat, lon, radius, dest_lat, dest_lon,
                           oneseat_day)

    @app.get("/api/change")
    def api_change(
        radius: float = Query(query.PRIMARY_RADIUS,
                              description="walk radius in metres; must be one "
                                          "of the precomputed radii"),
    ):
        """The citywide change layer: every location, bucketed, all three days.

        Radius is restricted to the built set rather than free like
        `/api/place`, because this table is precomputed -- see `build_webdb.py`
        for why ~5,900 locations cannot be measured per request.
        """
        if int(radius) not in query.RADII:
            raise HTTPException(
                400, f"radius must be one of {list(query.RADII)} — the change "
                     "layer is precomputed at those two")
        return query.change_layer(con, radius)

    @app.get("/api/surface")
    def api_surface(
        radius: float = Query(query.PRIMARY_RADIUS,
                              description="walk radius in metres; must be one "
                                          "of the precomputed radii"),
    ):
        """The magnitude surface: every covered 100 m cell, all three days.

        The continuous counterpart to `/api/change` — the same before-and-after
        measured on a lattice rather than only where a stop stands today, so
        the plan reads as a field instead of a scatter. Precomputed for the
        same reason, and more so: this is ~48,500 cells per radius.
        """
        if int(radius) not in query.RADII:
            raise HTTPException(
                400, f"radius must be one of {list(query.RADII)} — the surface "
                     "is precomputed at those two")
        return query.surface_layer(con, radius)

    @app.get("/api/population")
    def api_population(
        radius: float = Query(query.PRIMARY_RADIUS,
                              description="walk radius in metres; must be one "
                                          "of the precomputed radii"),
    ):
        """Who lives on the ground the surface paints, by lattice cell.

        The third denominator (convention 12), and the only layer here whose
        numbers are somebody else's published answer: the citywide totals are
        `data/equity_change.csv`'s, because coverage is decided at each census
        block's own point rather than at the cell it is drawn in. Precomputed
        at the same two radii as the surface, and for the same reason.
        """
        if int(radius) not in query.RADII:
            raise HTTPException(
                400, f"radius must be one of {list(query.RADII)} — the people "
                     "layer is precomputed at those two")
        return query.population_layer(con, radius)

    @app.get("/api/corridors")
    def api_corridors(
        day: str = Query("weekday", pattern=f"^({'|'.join(query.DAYS)})$"),
    ):
        """Every street segment gained, lost or kept, for one day type.

        No `radius` parameter, and that is deliberate: a corridor is a piece
        of street, not a catchment, so a walk radius has no meaning here the
        way it does for `/api/place`, `/api/change` or `/api/surface`. This is
        pavement, not access -- see `query.corridor_layer` and
        `analyze_corridor_change.py` for the distinction.
        """
        return query.corridor_layer(con, day)

    @app.get("/api/places")
    def api_places():
        """Every named Allegheny place the plan changes, ranked by the client.

        No `radius` and no `day`, and both absences are the point. This is the
        published place-level equity answer, which is day-free -- losing every
        bus on any day of the week -- and measured at census block points, not
        inside a walk circle. It is deliberately a different unit from
        `/api/place`, whose numbers move with both; see convention 12 and
        `docs/worklog/the-place-number-has-no-view-of-its-own.md`.

        Named places only: 151 of the county's 68,989 residents who lose every
        bus live beyond 2 km of a labelled PRT stop, take no place name, and
        are in neither this list nor its map. The view states that residual.
        """
        return query.places(con)

    @app.get("/api/places/{key}")
    def api_place_detail(key: str):
        """One place, with the block groups the plan changed as points."""
        detail = query.place_detail(con, key)
        if detail is None:
            raise HTTPException(status_code=404, detail=f"no such place: {key}")
        return detail

    @app.get("/api/destinations")
    def api_destinations():
        """The named destinations the one-seat view offers, with their centres.

        `seeds` is how many stops define the district; the centre is only
        somewhere for the map to fly to, and nothing is measured from it.
        """
        return query.destinations(con)

    @app.get("/api/oneseat")
    def api_oneseat(
        radius: float = Query(query.PRIMARY_RADIUS,
                              description="walk radius in metres; must be one "
                                          "of the precomputed radii"),
        dest: str | None = Query(None, description="a named destination key"),
        dest_lat: float | None = Query(None, description="or a dropped pin"),
        dest_lon: float | None = Query(None),
        day: str = Query(
            query.ANY_DAY,
            pattern=f"^({'|'.join(query.ONESEAT_DAYS)})$",
            description="restrict to routes that call at both ends on this "
                        "day type; the default is the published day-free "
                        "answer, and a day type is a different measurement "
                        "rather than a sharper one"),
    ):
        """Who keeps, gains and loses a one-seat ride to one destination.

        Unlike `/api/change` and `/api/surface`, the answer here is not
        precomputed -- only its expensive half is. Which routes can be boarded
        at each location is built once per radius; the destination is applied
        as a set intersection per request, which is what lets the reader drop a
        pin anywhere rather than choose from a list fixed at build time.

        Radius is still restricted to the built set, because that stored half
        is per radius.
        """
        if int(radius) not in query.RADII:
            raise HTTPException(
                400, f"radius must be one of {list(query.RADII)} — the "
                     "one-seat layer is precomputed at those two")
        if dest is None and (dest_lat is None or dest_lon is None):
            raise HTTPException(
                400, "give either dest=<key> or dest_lat= and dest_lon=")
        if dest is None:
            _check_point(dest_lat, dest_lon)
        try:
            return query.oneseat_layer(con, radius, key=dest,
                                       dest_lat=dest_lat, dest_lon=dest_lon,
                                       day=day)
        except KeyError:
            known = [d["key"] for d in query.destinations(con)]
            raise HTTPException(404, f"no destination {dest!r}; known: {known}")

    @app.get("/api/journey")
    def api_journey(
        lat: float = Query(..., description="origin latitude"),
        lon: float = Query(..., description="origin longitude"),
        dest_lat: float = Query(..., description="destination latitude"),
        dest_lon: float = Query(..., description="destination longitude"),
        day: str = Query(query.JOURNEY_DAY,
                         pattern=f"^({'|'.join(query.DAYS)})$"),
    ):
        """How long the trip takes, door to door, on both networks.

        The only endpoint here with a clock, and the only slow one. Nothing is
        precomputed because both ends are points the reader chose, and the
        answer is a profile over every ready-minute of the window rather than
        one departure -- so this is a few tenths of a second for a well-served
        pair and a few seconds for a badly served one. It needs a loading
        state, not a cache.

        No `radius` parameter: the walk to a stop is the router's own access
        distance, shared with the rest of the site, and the radius that
        matters to this answer is the one the reader cannot choose -- the
        invented transfer walk. Every pair is therefore answered at both, with
        `sign_flips` set where they disagree about which network is faster.
        """
        _check_point(lat, lon)
        _check_point(dest_lat, dest_lon)
        return query.journey_between(con, lat, lon, dest_lat, dest_lon, day=day)

    @app.get("/api/stops")
    def api_stops(
        side: str = Query("current", pattern="^(current|proposed)$"),
        lat: float = Query(...), lon: float = Query(...),
        radius: float = Query(query.PRIMARY_RADIUS, ge=MIN_RADIUS, le=MAX_RADIUS),
    ):
        _check_point(lat, lon)
        return [{"stop_id": s[0], "name": s[1], "lat": s[2], "lon": s[3],
                 "metres": round(s[4])}
                for s in query.stops_within(con, lat, lon, radius, side)]

    @app.get("/api/routes")
    def api_routes(side: str = Query("current", pattern="^(current|proposed)$")):
        return query.routes(con, side)

    @app.get("/api/crosswalk")
    def api_crosswalk():
        """PRT's own current -> proposed route mapping.

        A labelling aid only. Convention 1 forbids comparing route N to route N
        for service volume, and nothing in /api/place goes through this.
        """
        return query.crosswalk(con)

    @app.get("/")
    def index():
        return FileResponse(_STATIC / "index.html")

    @app.get("/findings")
    def findings():
        """The equity brief, as a page of the site rather than a repo file.

        Static and pre-rendered: `build_equity_brief.py` writes it from
        `data/equity_change.csv`, so the charts here cannot drift from what
        `docs/answers/EQUITY-*.md` publish. Nothing about it is per-request,
        which is why it is a file and not an endpoint over `query.py`.
        """
        return FileResponse(_STATIC / "findings.html")

    if _STATIC.exists():
        app.mount("/", StaticFiles(directory=_STATIC, html=True), name="static")

    return app


# Shown in the app's methods panel. These are not decoration: a public-comment
# audience is going to screenshot a number off this map, and it must carry its
# caveat with it.
CAVEATS = [
    {
        "id": "provenance",
        "text": "The proposed-network GTFS names PRT as its publisher and is "
                "published at no URL: PRT supplied it to Pittsburghers for "
                "Public Transit on request, and PPT passed it on. It is the "
                "plan PRT put out for comment, checked against PRT's own "
                "published tables -- not a download anyone can repeat.",
    },
    {
        "id": "change-layer",
        "text": "The citywide layer is the 5,751 locations coverage_change.csv "
                "measures — stops served today that carry a ridership record — "
                "plus the places the proposed network serves where nothing "
                "stops within 400 m today. It is not a population map: a dot "
                "is a location, not the people at it.",
    },
    {
        "id": "surface",
        "text": "The continuous surface measures the same comparison at every "
                "point on a 100 m lattice, so it shows ground the plan adds or "
                "drops rather than only stops that exist today. It is extent, "
                "not people: a square kilometre of hillside counts like a "
                "square kilometre of Brookline. Read it beside the location "
                "dots — the plan is roughly service-neutral per location and "
                "covers 12% less ground, and either figure alone is a talking "
                "point rather than a finding.",
    },
    {
        "id": "corridor",
        "text": "The street-level layer shows whether ANY bus runs on a given "
                "street — route numbers never enter it. A street can lose its "
                "only bus while a parallel street a block away keeps one, so "
                "this is pavement, not access: it can show a real loss where "
                "the location and surface views show none, and no change "
                "where they show a loss two blocks over. Read it alongside "
                "those views, never instead of them. Weekday citywide: 897.8 "
                "km kept, 258.5 km lost, 83.0 km added.",
    },
    {
        "id": "one-seat",
        "text": "The one-seat view asks a different question from every other "
                "layer here: can a rider reach the chosen destination without "
                "transferring? Its published answer has no day type and no "
                "travel time — a route serves a location or it does not — so a "
                "surviving one-seat ride may be hourly on a Sunday or take an "
                "hour to make. The view can be restricted to a single day "
                "type, which asks whether a route calls at both ends on that "
                "day; that is a different measurement from the published one "
                "and its counts are not the figures the answer documents "
                "carry. It is "
                "also the only view that counts rail: the T and the inclines "
                "are unchanged by the Refresh, but leaving them out would show "
                "the South Hills losing Downtown rides the Blue Line still "
                "provides. Both ends of the trip use the walk radius, where "
                "the published place-level answer uses 200 m at the "
                "destination.",
    },
    {
        "id": "travel-time",
        "text": "The journey view is the only one here with a clock, and it "
                "measures schedule against schedule: today's side is compared "
                "at its scheduled times, not the times its buses actually "
                "run, because the proposed side has no observed times and "
                "never will. The clock starts when the rider is ready, not "
                "when they board, so waiting counts. The answer is the spread "
                "over every departure minute of the weekday 07:00-09:00 peak, "
                "not one chosen departure, with the share of minutes the trip "
                "can be made at all beside it. Neither feed publishes "
                "transfer rules, so connections are invented from stop "
                "positions -- and because the Refresh asks riders to transfer "
                "more than today's network does, a generous transfer walk "
                "flatters it and a strict one penalises it. Every pair is "
                "answered at both 400 m and 150 m for that reason; where the "
                "two disagree about which network is faster, that "
                "disagreement is the finding and neither number should be "
                "quoted alone.",
    },
    {
        "id": "location-not-route",
        "text": "Comparisons are between the same circle on the ground in both "
                "networks, never between route N and route N. The plan "
                "re-splits corridors and renumbers routes, so route-to-route "
                "deltas are meaningless. The route lists in the answer "
                "panel differ by more than the service does for the same "
                "reason: the 61A-D become the 60X/61X/62X and the "
                "P-flyers become L-limiteds, which is renumbering rather "
                "than replacement.",
    },
    {
        "id": "cluster-max",
        "text": "Trips at a location take the maximum across the stops in the "
                "radius per route, direction and period — never the sum. "
                "Adjacent stop ids on one corridor are one bus passing once.",
    },
    {
        "id": "radius",
        "text": "400 m is the headline quarter-mile access distance; 150 m is "
                "the strict same-corner test. Where the two disagree, both are "
                "reported.",
    },
    {
        "id": "typical-wait",
        "text": "The typical wait is the median gap between buses from 6am to "
                "6pm, in whichever direction is better served -- a location on "
                "a one-way street is not judged by the direction that never "
                "comes. It is the gap between buses of any route at the "
                "location rather than of one route, so a corner with two "
                "hourly routes can read as a 30-minute wait. It is the gap "
                "itself, not the wait a rider arriving at random would "
                "expect, which is about half of it. Descriptive only: no "
                "published figure uses it, and a location with fewer than two "
                "trips in the window shows nothing at all.",
    },
    {
        "id": "boardings",
        "text": "Boardings are May 2025 daily averages, unlinked and "
                "unweighted — one rider's round trip with a transfer is up "
                "to four of them. PRT's own disclaimer calls them unadjusted, "
                "unofficial totals that may understate ridership by up to "
                "30%. They are observed at stops that run today, so weighting "
                "the map by them measures what is at risk and never what is "
                "gained: a location the plan adds a bus to has no ridership "
                "record, which is not the same as having no riders. And they "
                "are counted where people get on, not where they live, so "
                "at a busy transfer point most of them belong to riders "
                "from somewhere else entirely.",
    },
    {
        "id": "population",
        "text": "People are 2020 census residents counted at home, scaled to "
                "the ACS estimates the equity work reports in, and a census "
                "block's residents are all counted at one point. It is an "
                "ecological measure — it describes the places people live, "
                "not whether any of them ride. Coverage is decided at that "
                "point, not at the 100 m cell the answer is drawn in, so the "
                "totals are the ones docs/answers/ publishes.",
    },
    {
        "id": "place-population",
        "text": "The panel's \u201cwho lives here\u201d figure is for the whole "
                "named place, not for the walk radius the rest of the panel "
                "measures, and it counts losing every bus on any day of the "
                "week rather than the day type selected above. Allegheny "
                "County only — elsewhere the equity work never asked, so "
                "nothing is shown rather than a zero. The place is named by "
                "the nearest labelled stop, which PRT's own HOOD/MUNI fields "
                "sometimes get wrong.",
    },
    {
        "id": "day-types",
        "text": "Day types are resolved for real sample dates, not read off "
                "calendar.txt columns — the current feed carries two holiday "
                "calendars that otherwise read as weekday service.",
    },
    {
        "id": "bus-only",
        "text": "Bus only. Rail and the inclines are outside the Refresh and "
                "are dropped from both sides.",
    },
]
