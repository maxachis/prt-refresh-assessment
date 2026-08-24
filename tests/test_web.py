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


# --------------------------------------------------------------------------
# the one-seat view
# --------------------------------------------------------------------------

def test_destinations_are_listed_with_their_seed_counts(client):
    got = {d["key"]: d for d in client.get("/api/destinations").json()}
    assert set(got) == {"downtown", "oakland"}
    assert got["oakland"]["seeds"] > 1        # a district, not a pin


def test_oneseat_is_served_for_a_named_destination(client):
    got = client.get("/api/oneseat", params={"dest": "downtown"}).json()
    assert got["destination"]["key"] == "downtown"
    assert sum(got["counts"].values()) == len(got["points"])
    assert got["counts"]["loses"] > 0 and got["counts"]["gains"] > 0


def test_oneseat_accepts_a_dropped_pin(client):
    """The reader is not limited to the destinations built into the database."""
    got = client.get("/api/oneseat", params={
        "dest_lat": DOWNTOWN["lat"], "dest_lon": DOWNTOWN["lon"]}).json()
    assert got["destination"]["seeds"] == 1
    assert sum(got["counts"].values()) == len(got["points"])


def test_oneseat_needs_somewhere_to_go(client):
    assert client.get("/api/oneseat").status_code == 400


def test_oneseat_rejects_an_unknown_destination(client):
    r = client.get("/api/oneseat", params={"dest": "shadyside"})
    assert r.status_code == 404
    assert "downtown" in r.json()["detail"]


def test_oneseat_rejects_a_radius_it_was_not_built_at(client):
    r = client.get("/api/oneseat", params={"dest": "downtown", "radius": 275})
    assert r.status_code == 400


def test_oneseat_rejects_a_pin_outside_the_service_area(client):
    r = client.get("/api/oneseat", params={"dest_lat": 39.95, "dest_lon": -75.16})
    assert r.status_code == 400


def test_place_carries_the_one_seat_verdicts(client):
    p = client.get("/api/place", params=DOWNTOWN).json()
    assert {d["key"] for d in p["oneseat"]} == {"downtown", "oakland"}
    assert {d["status"] for d in p["oneseat"]} <= {
        "here", "keeps", "gains", "loses", "none"}


def test_oneseat_answers_for_one_day_type(client):
    """The variant beside the published answer, and it says which it gave."""
    wide = client.get("/api/oneseat", params={"dest": "downtown"}).json()
    sunday = client.get("/api/oneseat", params={"dest": "downtown",
                                                "day": "sunday"}).json()
    assert wide["day"] == "any"
    assert sunday["day"] == "sunday"
    assert sunday["counts"]["keeps"] < wide["counts"]["keeps"]


def test_oneseat_rejects_a_day_that_is_not_a_day(client):
    r = client.get("/api/oneseat", params={"dest": "downtown", "day": "tuesday"})
    assert r.status_code == 422


def test_place_verdicts_follow_the_map_day(client):
    """A dot and the panel it opens must not answer different questions."""
    p = client.get("/api/place", params={**DOWNTOWN, "oneseat_day": "sunday"}).json()
    assert p["oneseat_day"] == "sunday"
    assert all(d["day"] == "sunday" for d in p["oneseat"])


def test_meta_carries_the_one_seat_caveat(client):
    """The view has no day type and no travel time, and must say so."""
    caveats = {c["id"]: c["text"] for c in client.get("/api/meta").json()["caveats"]}
    assert "one-seat" in caveats
    assert "transferring" in caveats["one-seat"]


def test_place_answers_for_a_dropped_pin_too(client):
    """Pick a destination of your own and the panel must follow you there.

    Without this the reader points the map at somewhere that matters to them,
    clicks a location, and the panel quietly answers about Downtown instead.
    """
    p = client.get("/api/place", params={
        **DOWNTOWN, "dest_lat": 40.4614, "dest_lon": -79.9247}).json()
    assert p["oneseat"][0]["key"] is None          # the pin leads
    assert {d["key"] for d in p["oneseat"][1:]} == {"downtown", "oakland"}


def test_place_rejects_half_a_destination(client):
    r = client.get("/api/place", params={**DOWNTOWN, "dest_lat": 40.4614})
    assert r.status_code == 400


# A real origin with a real destination: Bloomfield to a Downtown corner, the
# kind of pair the panel exists to answer.
BLOOMFIELD = {"lat": 40.461380, "lon": -79.949380}
JOURNEY = {**BLOOMFIELD, "dest_lat": DOWNTOWN["lat"], "dest_lon": DOWNTOWN["lon"]}


def test_journey_answers_both_networks_at_both_transfer_radii(client):
    j = client.get("/api/journey", params=JOURNEY).json()
    assert set(j["radii"]) == {"headline", "strict"}
    for at_radius in j["radii"].values():
        for side in ("current", "proposed"):
            assert at_radius[side]["median_min"] > 0
            assert 0 < at_radius[side]["reachable_fraction"] <= 1
    assert j["day"] == "weekday"


def test_journey_says_whether_the_transfer_radius_changes_the_answer(client):
    """The invented transfer walk can flip which network is faster, so the
    answer has to carry its own sensitivity rather than one median."""
    j = client.get("/api/journey", params=JOURNEY).json()
    assert j["sign_flips"] in (True, False)
    assert j["constants"]["max_transfer_walk_m"] == 400.0


def test_journey_shows_a_trip_a_rider_could_have_made(client):
    legs = (client.get("/api/journey", params=JOURNEY)
            .json()["radii"]["headline"]["current"]["itinerary"]["legs"])
    assert any(leg["kind"] == "ride" and leg["route"] for leg in legs)


def test_journey_rejects_a_pin_outside_the_service_area(client):
    for bad in ({"lat": 41.9, "lon": -87.6}, {"dest_lat": 41.9, "dest_lon": -87.6}):
        assert client.get("/api/journey", params={**JOURNEY, **bad}).status_code == 400


def test_journey_rejects_a_day_type_the_feeds_do_not_have(client):
    assert client.get("/api/journey",
                      params={**JOURNEY, "day": "tuesday"}).status_code == 422


def test_meta_carries_the_travel_time_caveat_and_the_window(client):
    m = client.get("/api/meta").json()
    assert "travel-time" in {c["id"] for c in m["caveats"]}
    assert m["journey"]["window"] == {"start_min": 420, "end_min": 540}
    assert m["journey"]["transfer_radii"]["strict"] == 150.0
