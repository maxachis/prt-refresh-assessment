"""FastAPI app -- a thin HTTP skin over `refresh.query`, reading SQLite read-only.

No analysis happens here. Every endpoint is a parameter-validating wrapper
around a pure function in `query.py`, which is what lets `tests/test_query.py`
check the numbers against `data/coverage_change.csv` without going through
HTTP. Built via `create_app` so tests can point it at a temp DB.

ON BINDING THIS PUBLICLY. `refresh serve` binds 127.0.0.1 by default and that
default is doing real work. The proposed-network GTFS this app serves names PRT
as its publisher and is not published at any URL; how it reached this repo is
not recorded, and DATA_SOURCES.md says that must be settled before the numbers
are cited publicly. Serving it on a public address publishes PRT's unreleased
timetable at the finest possible grain -- every departure at every stop. Settle
provenance and permission first; the code will still be here.
"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .. import query

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
            "caveats": CAVEATS,
        }

    @app.get("/api/place")
    def api_place(
        lat: float = Query(..., description="latitude"),
        lon: float = Query(..., description="longitude"),
        radius: float = Query(query.PRIMARY_RADIUS, ge=MIN_RADIUS, le=MAX_RADIUS,
                              description="walk radius in metres"),
    ):
        """Before and after at one point, both networks measured identically.

        This is the app's whole purpose; everything else is navigation.
        """
        _check_point(lat, lon)
        return query.place(con, lat, lon, radius)

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
                "not published at any URL. How it reached this repo is not "
                "recorded; DATA_SOURCES.md carries that as an open question.",
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
        "id": "location-not-route",
        "text": "Comparisons are between the same circle on the ground in both "
                "networks, never between route N and route N. The plan "
                "re-splits corridors and renumbers routes, so route-to-route "
                "deltas are meaningless.",
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
        "id": "boardings",
        "text": "Boardings are May 2025 weekday averages, unlinked and "
                "unweighted. PRT's own disclaimer calls them unadjusted, "
                "unofficial totals that may understate ridership by up to 30%.",
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
    {
        "id": "microtransit",
        "text": "The proposal's 10 on-demand microtransit zones are not counted "
                "here, so a place slated for on-demand service instead of "
                "fixed route may read as a loss.",
    },
]
