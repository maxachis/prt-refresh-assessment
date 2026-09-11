"""The usage report reads what the front door logged and nothing more.

The log is Caddy's JSON access log with the client address already masked to
a /24 (`deploy/setup-caddy.sh`), so everything the report can say about a
reader is what they asked the app -- and that is what these tests pin: which
question each line is evidence of, what a "visitor" is, what gets rounded, and
what is excluded.
"""
import gzip
import json
from pathlib import Path

import report_usage
from refresh import geometry

UA = "Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0"
BOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

# 2026-09-10 14:00 EDT and 2026-09-11 01:00 EDT -- the second is still 09-10
# in UTC, so a report bucketing by UTC would put both on the same day.
T_WED = 1789063200.0
T_THU = 1789102800.0


def line(uri, *, ts=T_WED, ip="203.0.113.0", ua=UA, status=200, referer=None,
         duration=0.01):
    headers = {"User-Agent": [ua]}
    if referer:
        headers["Referer"] = [referer]
    return json.dumps({
        "level": "info", "ts": ts, "logger": "http.log.access.log0",
        "msg": "handled request",
        "request": {"remote_ip": ip, "client_ip": ip, "proto": "HTTP/2.0",
                    "method": "GET", "host": "prt-refresh.example.org",
                    "uri": uri, "headers": headers},
        "duration": duration, "size": 100, "status": status,
    })


SAMPLE = [
    line("/", referer="https://pittsburghforpublictransit.org/refresh/"),
    line("/app.js"),
    line("/api/meta"),
    line("/api/change?radius=400"),
    line("/api/place?lat=40.431234&lon=-79.987654&radius=400"),
    line("/api/place?lat=40.431299&lon=-79.987601&radius=400"),
    line("/api/surface?radius=400"),
    line("/api/oneseat?radius=400&dest=downtown&day=weekday&oneseatday=any"),
    line("/api/journey?lat=40.44&lon=-79.99&dest=oakland&radius=400"),
    line("/api/places/carrick"),
    line("/api/places/nowhere", status=404),
    # A second reader, same day, embedded in PPT's page.
    line("/?embed=1&view=oneseat", ip="198.51.100.0",
         referer="https://pittsburghforpublictransit.org/refresh/"),
    line("/api/oneseat?radius=400&dest=oakland&day=saturday&oneseatday=any",
         ip="198.51.100.0"),
    # The first reader again, after midnight Eastern: a new day, a new visit.
    line("/findings", ts=T_THU),
    # Crawlers are counted apart and never inside the figures.
    line("/", ua=BOT, ip="192.0.2.0"),
    line("/findings", ua=BOT, ip="192.0.2.0"),
]


def summarise(lines=SAMPLE, **kw):
    return report_usage.summarise(report_usage.parse(lines), **kw)


def test_days_are_eastern_and_visitors_are_address_agent_pairs():
    u = summarise()
    assert [d.date for d in u.days] == ["2026-09-10", "2026-09-11"]
    wed, thu = u.days
    assert wed.requests == 13
    assert wed.visitors == 2
    assert thu.visitors == 1
    assert u.bot_requests == 2


def test_page_loads_and_where_they_came_from():
    u = summarise()
    assert u.page_loads == {"/": 2, "/findings": 1}
    assert u.embedded_loads == 1
    assert u.referrers == {"pittsburghforpublictransit.org": 2}


def test_views_are_counted_by_visitor_not_by_request():
    """Two clicks on the map are one reader using the Stop-by-stop view."""
    u = summarise()
    assert u.views["place"] == 1
    assert u.views["surface"] == 1
    assert u.views["oneseat"] == 2
    assert u.views["journey"] == 1
    assert u.views["places"] == 1


def test_destinations_and_day_types_asked():
    u = summarise()
    assert u.destinations == {"downtown": 1, "oakland": 2}
    assert u.day_types == {"weekday": 1, "saturday": 1}


def test_places_opened_count_only_the_ones_that_exist():
    u = summarise()
    assert u.places_opened == {"carrick": 1}
    assert u.errors == {404: 1}


def test_clicks_are_rounded_to_a_cell_and_named_by_containment():
    square = geometry.Place(name="Carrick", kind="neighborhood", polygons=[
        [[[-80.0, 40.40], [-79.90, 40.40], [-79.90, 40.50], [-80.0, 40.50],
          [-80.0, 40.40]]]])
    u = summarise(place_index=geometry.PlaceIndex([square]))
    # Two clicks 8 m apart are one cell at three decimals (~100 m); the
    # journey's origin is a click too.
    assert u.clicks == {(40.431, -79.988): 2, (40.44, -79.99): 1}
    assert u.clicks_by_place == {"Carrick": 3}


def test_a_click_outside_every_boundary_is_named_as_such():
    elsewhere = geometry.Place(name="Elsewhere", kind="municipality", polygons=[
        [[[-70.0, 30.0], [-69.0, 30.0], [-69.0, 31.0], [-70.0, 31.0],
          [-70.0, 30.0]]]])
    u = summarise(place_index=geometry.PlaceIndex([elsewhere]))
    assert u.clicks_by_place == {report_usage.OUTSIDE_LABEL: 3}


def test_reads_gzipped_rotations(tmp_path: Path):
    plain = tmp_path / "access.log"
    plain.write_text("\n".join(SAMPLE[:3]) + "\n", encoding="utf-8")
    rolled = tmp_path / "access-2026-09-09.log.gz"
    with gzip.open(rolled, "wt", encoding="utf-8") as f:
        f.write("\n".join(SAMPLE[3:]) + "\n")
    hits = report_usage.parse(report_usage.read_logs([plain, rolled]))
    assert len(hits) == len(SAMPLE)


def test_a_line_that_is_not_an_access_record_is_skipped():
    hits = report_usage.parse([
        '{"level":"info","logger":"tls","msg":"cert obtained"}',
        "not json at all",
        SAMPLE[0],
    ])
    assert len(hits) == 1


def test_render_says_what_a_visitor_is_and_never_prints_an_address():
    text = report_usage.render(summarise())
    assert "masked" in text
    assert "203.0.113" not in text
    assert "Carrick" not in text        # no index given, no place names
    assert "40.431" in text
