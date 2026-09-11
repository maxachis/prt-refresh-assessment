#!/usr/bin/env python3
"""What readers ask the map: a usage report from the front door's access log.

    python3 report_usage.py access.log [access-*.log.gz ...]
    python3 report_usage.py --places data/place_boundaries.json access.log

Reads Caddy's JSON access log as `deploy/setup-caddy.sh` configures it and
prints, per Eastern day, how many people came and what they asked; then, over
the whole window, which views were used, which destinations and day types
were asked about, which places were opened, and where on the map people
clicked. Standard library only, like the rest of the pipeline.

Why a log and not a script on the page. Every question a reader can ask this
app is a GET with the question in the query string (`/api/place?lat=..&lon=..`,
`/api/oneseat?dest=..&day=..`, `/api/places/<key>`), and the app's own state
travels in the page URL (`frontend/urlstate.ts`), so the front door already
sees everything a page-view beacon would report, without a tag, a cookie, or a
third party. The one thing a beacon would add -- a screen size -- is not worth
a script on a public-comment site.

What the log cannot say, and this report does not pretend to:

- **Who.** Caddy masks the client address to a /24 before writing it (an
  `ip_mask` filter in the Caddyfile), and this report never prints even that.
  A "visitor" is one masked address and browser string on one Eastern day,
  which undercounts a household behind one router and overcounts one person on
  two devices. It is a count of readers to within a factor, not a count.
- **Repeat views inside an hour.** Every `/api/*` response is cached for an
  hour (`Cache-Control: public`), so a reader who returns to a view within the
  hour is served from their own browser and leaves no line here. Views are
  therefore counted by visitor, not by request -- one fetch of the surface
  layer is one reader using the surface view, however long they pan it.
- **Hovers.** The Stop-by-stop dots and their hovers are one preloaded layer
  (`/api/change`), so only a click -- which asks `/api/place` -- reaches the
  log. The click count is a count of answer panels opened.
- **Where exactly.** A clicked point is roughly where the reader lives or
  works, which is the one sensitive thing here. Points are rounded to three
  decimals (~100 m) before they are counted, and with `--places` are named by
  the county boundary that contains the cell, the same containment rule the
  pipeline uses for a block group (convention 6). The rounded cells are kept
  in the report because a heat-map of where people ask is the most useful
  thing in it; keep the raw log on the box, not in the repo.
- **Bots.** Crawlers are recognised by their user agent, counted on one line,
  and kept out of every other figure.
"""
import argparse
import gzip
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).parent / "src"))
from refresh import geometry  # noqa: E402

# The audience is in Pittsburgh, so a day is a Pittsburgh day: a reader at
# 1 am Thursday is not Wednesday's visitor because it is still Wednesday in UTC.
LOCAL_TZ = ZoneInfo("America/New_York")

# ~100 m at Pittsburgh's latitude -- the surface's own cell size, near enough,
# and coarse enough that a cell is a block rather than a door.
CLICK_DECIMALS = 3

OUTSIDE_LABEL = "(outside every boundary)"

BOT_UA = re.compile(r"bot|crawl|spider|slurp|fetch|curl|wget|python-requests|"
                    r"headless|preview|monitor|uptime", re.IGNORECASE)

# Which view of the app a request is evidence of. Endpoints the page loads
# regardless of view (`/api/meta`, `/api/change`, `/api/destinations`) are
# deliberately absent: they say the page opened, not what the reader chose.
VIEW_OF_ENDPOINT = {
    "/api/place": "place",          # a click on the Stop-by-stop map
    "/api/surface": "surface",
    "/api/population": "population",
    "/api/corridors": "corridors",
    "/api/oneseat": "oneseat",
    "/api/journey": "journey",
    "/api/places": "places",
    "/api/boundaries": "places",
}
VIEW_LABEL = {
    "place": "Stop-by-stop (clicked a point)",
    "surface": "Surface",
    "population": "Surface, people reading",
    "corridors": "Streets",
    "oneseat": "One-seat rides",
    "journey": "Travel time",
    "places": "Places",
}
PLACE_DETAIL = re.compile(r"^/api/places/([^/]+)$")
PAGES = ("/", "/findings")
EMBED_PARAM = "embed"                    # frontend/embed.ts
TOP_N = 25


@dataclass
class Hit:
    when: datetime                       # local time
    visitor: tuple                       # (masked address, user agent)
    path: str
    query: dict                          # first value of each parameter
    status: int
    referer: str | None
    bot: bool


@dataclass
class Day:
    date: str
    requests: int = 0
    visitors: int = 0
    page_loads: int = 0
    clicks: int = 0


@dataclass
class Usage:
    days: list = field(default_factory=list)
    bot_requests: int = 0
    page_loads: Counter = field(default_factory=Counter)
    embedded_loads: int = 0
    referrers: Counter = field(default_factory=Counter)
    views: Counter = field(default_factory=Counter)        # by visitor
    destinations: Counter = field(default_factory=Counter)
    day_types: Counter = field(default_factory=Counter)
    places_opened: Counter = field(default_factory=Counter)
    clicks: Counter = field(default_factory=Counter)       # by rounded cell
    clicks_by_place: Counter | None = None
    errors: Counter = field(default_factory=Counter)


# ---------------------------------------------------------------- reading

def read_logs(paths):
    """Every line of every file, gzipped rotations included."""
    for path in paths:
        path = Path(path)
        opener = gzip.open if path.suffix == ".gz" else open
        with opener(path, "rt", encoding="utf-8", errors="replace") as f:
            yield from f


def parse(lines):
    """The access records among the lines, as hits; everything else skipped."""
    hits = []
    for raw in lines:
        try:
            rec = json.loads(raw)
        except ValueError:
            continue
        req = rec.get("request") if isinstance(rec, dict) else None
        if not req or "uri" not in req or "ts" not in rec:
            continue
        headers = req.get("headers") or {}
        ua = _first(headers.get("User-Agent"))
        parts = urlsplit(req["uri"])
        hits.append(Hit(
            when=datetime.fromtimestamp(rec["ts"], LOCAL_TZ),
            visitor=(req.get("client_ip") or req.get("remote_ip") or "", ua),
            path=parts.path,
            query={k: v[0] for k, v in parse_qs(parts.query).items()},
            status=int(rec.get("status", 0)),
            referer=_first(headers.get("Referer")) or None,
            bot=bool(BOT_UA.search(ua)),
        ))
    return hits


def _first(values):
    return values[0] if values else ""


# ---------------------------------------------------------------- counting

def summarise(hits, place_index=None):
    u = Usage()
    days = {}
    visitors_by_day = defaultdict(set)
    visitors_by_view = defaultdict(set)
    for h in hits:
        if h.bot:
            u.bot_requests += 1
            continue
        date = h.when.strftime("%Y-%m-%d")
        day = days.setdefault(date, Day(date))
        day.requests += 1
        visitors_by_day[date].add(h.visitor)
        if h.status >= 400:
            u.errors[h.status] += 1
            continue
        if h.path in PAGES:
            _count_page_load(u, day, h)
        view = _view_of(h.path)
        if view:
            visitors_by_view[view].add(h.visitor)
        if h.path in ("/api/place", "/api/journey"):
            _count_click(u, day, h)
        if h.path in ("/api/oneseat", "/api/journey") and "dest" in h.query:
            u.destinations[h.query["dest"]] += 1
        if h.path in ("/api/oneseat", "/api/corridors") and "day" in h.query:
            u.day_types[h.query["day"]] += 1
        m = PLACE_DETAIL.match(h.path)
        if m:
            u.places_opened[m.group(1)] += 1
    for date, day in sorted(days.items()):
        day.visitors = len(visitors_by_day[date])
        u.days.append(day)
    u.views = Counter({v: len(s) for v, s in visitors_by_view.items()})
    if place_index is not None:
        u.clicks_by_place = _name_clicks(u.clicks, place_index)
    return u


def _view_of(path):
    if PLACE_DETAIL.match(path):
        return "places"
    return VIEW_OF_ENDPOINT.get(path)


def _count_page_load(u, day, h):
    day.page_loads += 1
    u.page_loads[h.path] += 1
    if h.query.get(EMBED_PARAM, "").lower() in ("1", "true", "yes"):
        u.embedded_loads += 1
    if h.referer:
        host = urlsplit(h.referer).hostname
        if host:
            u.referrers[host] += 1


def _count_click(u, day, h):
    try:
        lat = round(float(h.query["lat"]), CLICK_DECIMALS)
        lon = round(float(h.query["lon"]), CLICK_DECIMALS)
    except (KeyError, ValueError):
        return
    day.clicks += 1
    u.clicks[(lat, lon)] += 1


def _name_clicks(clicks, index):
    by_place = Counter()
    for (lat, lon), n in clicks.items():
        place = index.place_at(lat, lon)
        by_place[place.name if place else OUTSIDE_LABEL] += n
    return by_place


def load_place_index(path):
    return geometry.PlaceIndex([
        geometry.Place(name=p["place"], kind=p["kind"], polygons=p["polygons"])
        for p in json.loads(Path(path).read_text(encoding="utf-8"))])


# ---------------------------------------------------------------- printing

def render(u):
    out = []
    say = out.append
    say("Usage of the map, from the front door's access log.")
    say("A visitor is one masked address (/24) and browser on one Eastern day;")
    say("views are counted once per visitor, because responses are cached for")
    say("an hour and a repeat inside it leaves no line. Crawlers excluded.")
    say("")
    say(f"{'day':<12}{'requests':>10}{'visitors':>10}{'pages':>8}{'clicks':>8}")
    for d in u.days:
        say(f"{d.date:<12}{d.requests:>10}{d.visitors:>10}{d.page_loads:>8}"
            f"{d.clicks:>8}")
    total_visitors = sum(d.visitors for d in u.days)
    say(f"{'total':<12}{sum(d.requests for d in u.days):>10}{total_visitors:>10}"
        f"{sum(d.page_loads for d in u.days):>8}{sum(d.clicks for d in u.days):>8}")
    say(f"crawler requests, excluded above: {u.bot_requests}")
    say("")
    _section(say, "Page loads", u.page_loads,
             note=f"of which embedded in another page: {u.embedded_loads}")
    _section(say, "Referring sites", u.referrers)
    _section(say, "Views used (visitors)",
             Counter({VIEW_LABEL.get(v, v): n for v, n in u.views.items()}))
    _section(say, "Destinations asked (requests)", u.destinations)
    _section(say, "Day types asked (requests)", u.day_types)
    _section(say, "Places opened (requests)", u.places_opened)
    if u.clicks_by_place is not None:
        _section(say, "Clicks by place (containment)", u.clicks_by_place)
    _section(say, f"Clicks by ~100 m cell (top {TOP_N})", Counter({
        f"{lat:.3f},{lon:.3f}": n for (lat, lon), n in u.clicks.items()}))
    _section(say, "Errors (status)", Counter({str(k): n for k, n in u.errors.items()}))
    return "\n".join(out)


def _section(say, title, counter, note=None):
    say(title)
    if not counter:
        say("  (none)")
    for key, n in counter.most_common(TOP_N):
        say(f"  {n:>7}  {key}")
    if note:
        say(f"  {note}")
    say("")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("logs", nargs="+", help="Caddy JSON access logs (.gz ok)")
    ap.add_argument("--places", metavar="JSON",
                    help="place_boundaries.json, to name clicks by containment")
    args = ap.parse_args(argv)
    index = load_place_index(args.places) if args.places else None
    print(render(summarise(parse(read_logs(args.logs)), place_index=index)))


if __name__ == "__main__":
    main()
