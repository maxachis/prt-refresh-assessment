"""HTTP surface. The numbers are tested in test_query.py; this checks the skin.

The endpoints are deliberately thin, so what can break here is validation and
wiring, not arithmetic -- with one exception worth a test of its own: the API
must not silently return an empty result for a point outside the service area,
because an empty result renders as a total loss of service.
"""
import pytest

pytest.importorskip("fastapi", reason="web extra not installed")

from fastapi.testclient import TestClient      # noqa: E402

from refresh.web.app import create_app         # noqa: E402


@pytest.fixture(scope="module")
def client(db_path):
    return TestClient(create_app(db_path))


# A Downtown corner, in both networks.
DOWNTOWN = {"lat": 40.442748, "lon": -80.004257}


def test_meta_reports_both_feed_versions(client):
    m = client.get("/api/meta").json()
    assert m["feeds"]["current_feed_version"]
    assert m["feeds"]["proposed_feed_version"]
    assert m["radii"]["primary"] == 400
    assert len(m["periods"]) == 7


def test_meta_carries_the_provenance_caveat(client):
    """Where the proposed feed came from must reach the UI.

    It is published at no URL -- PRT sent it to PPT on request -- so a reader
    cannot go and check it the way they can the current GTFS. This app is the
    most public form of citing it, so the caveat travels with the numbers.
    """
    ids = {c["id"] for c in client.get("/api/meta").json()["caveats"]}
    assert "provenance" in ids
    assert {"location-not-route", "cluster-max", "boardings"} <= ids


def test_place_returns_both_sides(client):
    p = client.get("/api/place", params=DOWNTOWN).json()
    assert p["current"]["days"]["weekday"]["trips"] > 0
    assert p["proposed"]["days"]["weekday"]["trips"] > 0
    assert p["radius"] == 400


def test_place_honours_the_radius(client):
    wide = client.get("/api/place", params={**DOWNTOWN, "radius": 400}).json()
    tight = client.get("/api/place", params={**DOWNTOWN, "radius": 150}).json()
    assert len(tight["current"]["stops"]) <= len(wide["current"]["stops"])


def test_place_rejects_a_point_outside_the_service_area(client):
    """Not an empty result -- an empty result reads as a total service loss."""
    r = client.get("/api/place", params={"lat": 51.5, "lon": -0.12})
    assert r.status_code == 400
    assert "service area" in r.json()["detail"]


@pytest.mark.parametrize("radius", [10, 5000])
def test_place_rejects_an_unusable_radius(client, radius):
    r = client.get("/api/place", params={**DOWNTOWN, "radius": radius})
    assert r.status_code == 422


def test_routes_are_bus_only_on_both_sides(client):
    """Rail and the inclines are outside the Refresh."""
    for side in ("current", "proposed"):
        routes = client.get("/api/routes", params={"side": side}).json()
        assert routes
        ids = {r["route_id"] for r in routes}
        assert not ids & {"BLUE", "RED", "SILVER", "SLVR", "MI", "DQI"}


def test_routes_rejects_an_unknown_side(client):
    assert client.get("/api/routes", params={"side": "draft2"}).status_code == 422


def test_crosswalk_is_served(client):
    cw = client.get("/api/crosswalk").json()
    assert len(cw) > 100
    assert {"current_route", "final_route", "category"} <= set(cw[0])


def test_index_is_served(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "what changes here" in r.text.lower()


def test_change_layer_is_served_for_both_radii(client):
    for radius in (400, 150):
        d = client.get(f"/api/change?radius={radius}").json()
        assert d["radius"] == radius
        assert d["days"] == ["weekday", "saturday", "sunday"]
        assert len(d["points"]) > 5000
        assert all(len(p) == len(d["fields"]) for p in d["points"])


def test_change_layer_rejects_a_radius_it_was_not_built_at(client):
    """Precomputed, unlike /api/place -- so an unbuilt radius must say so
    rather than come back empty, which would render as a map with no change
    anywhere on it."""
    r = client.get("/api/change?radius=250")
    assert r.status_code == 400
    assert "precomputed" in r.json()["detail"]


def test_change_layer_buckets_are_the_published_vocabulary(client):
    from refresh import query
    d = client.get("/api/change").json()
    assert [b["key"] for b in d["buckets"]] == list(query.BUCKET_KEYS)
    assert all(b["label"] for b in d["buckets"])


def test_meta_carries_the_change_layer_caveat(client):
    """The layer's denominator is a caveat: a dot is a location, not a rider."""
    ids = {c["id"] for c in client.get("/api/meta").json()["caveats"]}
    assert "change-layer" in ids


def test_surface_is_served_for_both_radii(client):
    for radius in (400, 150):
        d = client.get(f"/api/surface?radius={radius}").json()
        assert d["radius"] == radius
        assert d["cell_m"] == 100
        assert d["days"] == ["weekday", "saturday", "sunday"]
        assert len(d["cells"]) > 10_000
        assert all(len(c) == len(d["fields"]) for c in d["cells"])


def test_surface_rejects_a_radius_it_was_not_built_at(client):
    """Same reason as the change layer, and more of it: an unbuilt radius
    coming back empty would render as a county with no service anywhere."""
    r = client.get("/api/surface?radius=250")
    assert r.status_code == 400
    assert "precomputed" in r.json()["detail"]


def test_surface_origin_reconstructs_a_cell(client):
    """The client draws squares from (ix, iy) and this origin; if the origin
    does not round-trip, every cell renders in the wrong place."""
    from refresh import query
    d = client.get("/api/surface").json()
    o = d["origin"]
    ix, iy = d["cells"][0][0], d["cells"][0][1]
    lat = o["lat0"] + (iy + 0.5) * o["dlat"]
    lon = o["lon0"] + (ix + 0.5) * o["dlon"]
    assert query.cell_of(lat, lon) == (ix, iy)


def test_meta_carries_the_surface_caveat(client):
    """Area is extent, not people -- convention 10 requires that said next to
    the number, and the methods drawer is where the app says it."""
    ids = {c["id"] for c in client.get("/api/meta").json()["caveats"]}
    assert "surface" in ids


def test_findings_page_is_served(client):
    """The equity brief has a home on the site, not only in the repo."""
    r = client.get("/findings")
    assert r.status_code == 200
    assert "who gains and who loses" in r.text.lower()


def test_the_findings_page_leads_back_to_the_map(client):
    """A page with no way back is a dead end -- the map is the site."""
    assert 'href="/"' in client.get("/findings").text


def test_the_map_links_to_the_findings_page(client):
    """Nobody finds a page that nothing points at."""
    assert 'href="/findings"' in client.get("/").text
