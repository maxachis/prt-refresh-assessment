#!/usr/bin/env python3
"""
Ingest PRT Bus Line Refresh (proposed final network) data into tidy CSVs.

Sources 1-5 verified live 2026-08-17:
  1. Route crosswalk  - server-rendered HTML table on the Find My Route page
  2. Service tables   - three PDFs with a clean text layer (span + headway by period)
  3. Exhibit A        - official major-service-change narrative (30pp, text layer)
  4. Current GTFS     - the baseline to compare the proposal against
  5. Remix public API - proposed stops/routes; now superseded for service by (6).
                        Its 10 on-demand zone polygons are deliberately unused
  6. Proposed GTFS    - PRT's own feed for the proposed network, obtained from
                        PRT directly. NOT fetchable; committed verbatim under
                        data/raw/proposed_gtfs/. This step only checks it is
                        present; verify_proposed_gtfs.py checks it agrees
                        with (2).

Requires: curl + pdftotext (poppler-utils). No third-party Python packages.

Usage:  python3 ingest_blr.py [--outdir data]
"""

import argparse
import csv
import html
import re
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

UA = "Mozilla/5.0 (compatible; PPT-refresh-assessment/1.0)"

FIND_MY_ROUTE = "https://engage.rideprt.org/buslineredesign/BLR-finaldraft-findmyroute"
ROUTE_PAGE = "https://engage.rideprt.org/buslineredesign/BLR-route-{}"
EXHIBIT_A = "https://www.rideprt.org/link/d0a97382033d4e9a8849e52609df2218.aspx"
CURRENT_GTFS = "https://www.rideprt.org/developerresources/GTFS.zip"

S3 = "https://hdp-us-prod-app-rideprt-engage-files.s3.us-west-2.amazonaws.com"
SERVICE_TABLES = {
    "weekday": f"{S3}/1217/8611/7803/FrequencyHoursTable_Weekday.pdf",
    "saturday": f"{S3}/9717/8611/7803/FrequencyHoursTable_Saturday.pdf",
    "sunday": f"{S3}/5217/8611/7803/FrequencyHoursTable_Sunday.pdf",
}

# Headway columns, in the order they appear in the PDFs.
PERIODS = ["early_4_6a", "am_6_9a", "mid_9a_3p", "pm_3_6p", "eve_6_8p",
           "late_8_11p", "owl_11p_4a"]


def fetch(url, dest):
    """Download url to dest unless already present. Returns dest."""
    dest = Path(dest)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())
    return dest


def untag(fragment):
    """Strip tags from an HTML fragment and collapse whitespace."""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


# --- 1. route crosswalk -----------------------------------------------------

def parse_crosswalk(raw):
    """Current # -> draft 2.0 # -> proposed final #, plus change category."""
    table = re.search(r"<table.*?</table>", raw, re.S)
    if not table:
        raise SystemExit("crosswalk table not found - page structure changed")
    rows = []
    for tr in re.findall(r"<tr.*?</tr>", table.group(0), re.S):
        cells = [untag(c) for c in
                 re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)]
        if len(cells) >= 5:
            rows.append(cells[:5])
    if not rows:
        raise SystemExit("crosswalk table had no parseable rows")

    out = []
    for cur, draft, final, category, related in rows[1:]:  # rows[0] is the header
        # Route pages are slugged off the proposed number, or the current
        # number + "-discontinued" when the route goes away.
        slug = None
        if category.lower().startswith("discont"):
            m = re.match(r"([A-Za-z0-9]+)", cur)
            if m:
                slug = f"{m.group(1)}-discontinued"
        else:
            m = re.match(r"([A-Za-z0-9]+)", final)
            if m:
                slug = m.group(1)
        out.append({
            "current_route": cur,
            "draft2_route": draft,
            "final_route": final,
            "category": category.rstrip("!").title() if category else "",
            "related_routes": related,
            "route_page": ROUTE_PAGE.format(slug) if slug else "",
        })
    return out


# --- 2. service tables (span + frequency) -----------------------------------

# The current-route cell can list several routes ("86, 77"); a new route says
# "NEW". Only one space may separate the name from the start time, so the name
# is non-greedy and the times anchor the match.
ROW_RE = re.compile(
    r"^\s*(?P<cur>NEW|[A-Za-z0-9]+(?:,\s*[A-Za-z0-9]+)*)\s+"
    r"(?P<draft>[A-Za-z0-9]+)\s+"
    r"(?P<final>[A-Za-z0-9]+)\s+"
    r"(?P<name>\S.*?)\s+"
    r"(?P<start>\d{1,2}:\d{2}\s*[AP]M)\s+"
    r"(?P<end>\d{1,2}:\d{2}\s*[AP]M)"
)

# Second header line, carrying the time-period ranges under which values sit.
HEADER_RE = re.compile(r"4-6a\s+6-9a\s+9a-3p\s+3-6p\s+6-8p\s+8-11p\s+11p-4a")
CELL_RE = re.compile(r"\d+|n/a")


def _period_centers(page):
    """Column centres of the seven headway columns, read off this page's header.

    Values are assigned by column position rather than by counting tokens,
    because an unserved period may be left blank instead of "n/a".

    Every page repeats the header, and the columns drift a few characters
    between pages (the weekday table puts "4-6a" at column 70, 72, 74, 73 on
    its four pages). The centres must therefore be measured on the page whose
    rows they are applied to: measuring once and reusing them across pages
    pushes the Late and Owl cells into the same column on page 3, where the
    later cell silently overwrites the earlier one and Late reads as blank.

    Returns None for a page with no header - i.e. one with no table on it.
    """
    m = HEADER_RE.search(page)
    if not m:
        return None
    line = page[page.rfind("\n", 0, m.start()) + 1:
                page.find("\n", m.start())]
    centers, end = [], 0
    for label in ("4-6a", "6-9a", "9a-3p", "3-6p", "6-8p", "8-11p", "11p-4a"):
        i = line.index(label, end)
        end = i + len(label)
        centers.append((i + end) / 2)
    return centers


def _parse_service_page(page, centers, day_type, pdf_path):
    """Rows from one page of a service table, given that page's column centres.

    Route names wrap onto the preceding line in these PDFs, so a name carried
    on the previous line is stitched back on.
    """
    rows, prev = [], ""
    for line in page.splitlines():
        m = ROW_RE.match(line)
        if not m:
            prev = line
            continue

        name = m.group("name").strip()
        # A wrapped name fragment sits alone on the previous line, indented
        # past the route-number columns and containing no times.
        frag = prev.strip()
        if frag and not re.search(r"\d{1,2}:\d{2}|Route|Name|Current", frag) \
                and len(frag.split()) <= 6:
            name = f"{frag} {name}".strip()
        prev = ""

        row = {
            "day_type": day_type,
            "current_route": "" if m.group("cur") == "NEW" else m.group("cur"),
            "is_new": m.group("cur") == "NEW",
            "draft2_route": m.group("draft"),
            "final_route": m.group("final"),
            "route_name": re.sub(r"\s*-\s*$", "", name),
            "start_time": re.sub(r"\s+", " ", m.group("start")),
            "end_time": re.sub(r"\s+", " ", m.group("end")),
        }
        row.update({p: "" for p in PERIODS})

        # Slot each headway into the period column it sits closest to. Two
        # cells landing in one column means the centres no longer describe this
        # page, so fail loudly rather than dropping a period's service.
        taken = {}
        for cell in CELL_RE.finditer(line, m.end()):
            mid = (cell.start() + cell.end()) / 2
            nearest = min(range(len(centers)), key=lambda i: abs(centers[i] - mid))
            if nearest in taken:
                raise SystemExit(
                    f"{Path(pdf_path).name}: {day_type} route "
                    f"{m.group('final')} has two headway cells "
                    f"({taken[nearest]!r} and {cell.group()!r}) in the "
                    f"{PERIODS[nearest]} column - column positions drifted:\n"
                    f"  {line.rstrip()}")
            taken[nearest] = cell.group()
            row[PERIODS[nearest]] = "" if cell.group() == "n/a" else cell.group()
        rows.append(row)
    return rows


def parse_service_table(pdf_path, day_type):
    """Extract one row per route: span of service + headway per time period."""
    text = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True, text=True, check=True,
    ).stdout

    rows, pages_with_table = [], 0
    for page in text.split("\f"):
        centers = _period_centers(page)
        if centers is None:
            continue
        pages_with_table += 1
        rows += _parse_service_page(page, centers, day_type, pdf_path)

    if not pages_with_table:
        raise SystemExit(f"service-table header not found in {pdf_path} "
                         "- layout changed")
    if not rows:
        raise SystemExit(f"no rows parsed from {pdf_path} - layout changed")
    return rows


# --- 3. current-network baseline from GTFS ----------------------------------

def parse_current_gtfs(zip_path):
    """Route list + feed validity window from the current published GTFS."""
    with zipfile.ZipFile(zip_path) as z:
        with z.open("routes.txt") as f:
            routes = list(csv.DictReader(
                (ln.decode("utf-8-sig") for ln in f)))
        with z.open("feed_info.txt") as f:
            feed = next(csv.DictReader((ln.decode("utf-8-sig") for ln in f)))
    return routes, feed


# --- 4. proposed network from the Remix public view ------------------------
#
# The public map is a JS app, but the API behind it answers anonymously.
#   /api/projects/{id}          -> project metadata, incl. transitMapId
#   /api/maps/{transitMapId}    -> the whole map: stops + lines/patterns/directions
# Route geometry is served separately as vector tiles at
#   /api/maps/{id}/tile.pbf?x={x}&y={y}&z={z}   (layer "shapes")
# and timetables are not published (the trips endpoint returns []).

REMIX_PROJECT = "82ea6210"
REMIX_API = "https://platform.remix.com/api"
REMIX_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126 Safari/537.36",
    "Referer": f"https://platform.remix.com/project/{REMIX_PROJECT}",
    "Accept": "application/json",
}


def fetch_json(url, dest):
    dest = Path(dest)
    if not (dest.exists() and dest.stat().st_size > 0):
        dest.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers=REMIX_HEADERS)
        with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
            f.write(r.read())
    import json
    return json.loads(dest.read_text(encoding="utf-8"))


def parse_remix(raw_dir):
    """Stops, routes, and ordered stop sequences for the proposed network."""
    project = fetch_json(f"{REMIX_API}/projects/{REMIX_PROJECT}",
                         raw_dir / "remix_project.json")
    map_id = project["transitMapId"]
    m = fetch_json(f"{REMIX_API}/maps/{map_id}", raw_dir / "remix_map.json")

    stops = [{
        "stop_uuid": s["id"],
        "gtfs_stop_id": s.get("gtfsStopId") or "",
        "stop_name": s.get("name") or "",
        "lat": s["geometry"]["coordinates"][1],
        "lon": s["geometry"]["coordinates"][0],
        "wheelchair_boarding": s.get("gtfsWheelchairBoarding", ""),
    } for s in m["stops"] if s.get("geometry")]

    routes, seqs = [], []
    for line in m["lines"]:
        routes.append({
            "route_id": line.get("gtfsRouteId") or "",
            "short_name": line.get("gtfsShortName") or "",
            "long_name": line.get("gtfsLongName") or "",
            "name": line.get("name") or "",
            "color": (line.get("lineDisplay") or {}).get("color", ""),
            "line_uuid": line["id"],
        })
        for pattern in line.get("patterns", []):
            for d in pattern.get("directions", []):
                for i, ds in enumerate(d.get("directionStops", []), start=1):
                    seqs.append({
                        "route_id": line.get("gtfsRouteId") or "",
                        "short_name": line.get("gtfsShortName") or "",
                        "pattern": pattern.get("name") or "",
                        "direction": d.get("name") or "",
                        "headsign": d.get("headsign") or "",
                        "stop_sequence": i,
                        "stop_uuid": ds.get("placeId") or "",
                        "meters_from_start": round(ds.get("distanceFromStart") or 0, 1),
                    })
    return stops, routes, seqs


# --- 5. proposed network GTFS ----------------------------------------------
#
# Unlike every other source here this one has no URL. PRT sent it to PPT on
# request and PPT passed it on (see DATA_SOURCES.md), so it cannot be re-fetched
# and is committed verbatim. All this step can do is confirm it is
# present and report what is in it; the agreement check against PRT's published
# tables lives in verify_proposed_gtfs.py.

PROPOSED_FILES = ["calendar.txt", "routes.txt", "trips.txt", "stop_times.txt",
                  "stops.txt"]


def check_proposed_gtfs(raw_dir):
    d = raw_dir / "proposed_gtfs"
    missing = [n for n in PROPOSED_FILES if not (d / n).exists()]
    if missing:
        print(f"  WARNING: {d} is absent or incomplete (missing {missing}).")
        print("  Every analysis of the proposed network needs it. It is not")
        print("  fetchable -- see DATA_SOURCES.md for provenance.")
        return

    def count(name):
        with open(d / name, encoding="utf-8-sig") as f:
            return max(sum(1 for _ in f) - 1, 0)

    version = ""
    if (d / "feed_info.txt").exists():
        with open(d / "feed_info.txt", encoding="utf-8-sig") as f:
            row = next(csv.DictReader(f), {})
            version = row.get("feed_version", "")
    print(f"  {d}  [{version}]")
    for name in ("routes.txt", "stops.txt", "trips.txt", "stop_times.txt"):
        print(f"    {name:16s} {count(name):>8,d} rows")
    print("  Run verify_proposed_gtfs.py to check it against the published PDFs.")


def write_csv(path, rows, fieldnames=None):
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames or list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"  wrote {path}  ({len(rows)} rows)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outdir", default="data")
    args = ap.parse_args()

    out = Path(args.outdir)
    raw = out / "raw"
    print("Ingesting PRT Bus Line Refresh data...\n")

    print("[1/6] route crosswalk")
    cw_html = fetch(FIND_MY_ROUTE, raw / "findmyroute.html").read_text(
        encoding="utf-8", errors="replace")
    crosswalk = parse_crosswalk(cw_html)
    write_csv(out / "route_crosswalk.csv", crosswalk)
    counts = {}
    for r in crosswalk:
        counts[r["category"]] = counts.get(r["category"], 0) + 1
    print("  categories:", ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))

    print("\n[2/6] service span + frequency tables")
    service = []
    for day, url in SERVICE_TABLES.items():
        pdf = fetch(url, raw / f"service_{day}.pdf")
        rows = parse_service_table(pdf, day)
        print(f"  {day}: {len(rows)} routes")
        service += rows
    write_csv(out / "service_levels.csv", service)

    print("\n[3/6] Exhibit A (official change narrative)")
    ex = fetch(EXHIBIT_A, raw / "exhibit_a.pdf")
    txt = subprocess.run(["pdftotext", "-layout", str(ex), "-"],
                         capture_output=True, text=True, check=True).stdout
    (out / "exhibit_a.txt").write_text(txt, encoding="utf-8")
    print(f"  wrote {out / 'exhibit_a.txt'}  ({len(txt.splitlines())} lines)")

    print("\n[4/6] current network baseline (GTFS)")
    gtfs = fetch(CURRENT_GTFS, raw / "current_gtfs.zip")
    routes, feed = parse_current_gtfs(gtfs)
    write_csv(out / "current_routes.csv", routes)
    print(f"  feed {feed.get('feed_version')}: "
          f"{feed.get('feed_start_date')}-{feed.get('feed_end_date')}")

    print("\n[5/6] proposed network from Remix public API")
    r_stops, r_routes, r_seqs = parse_remix(raw)
    write_csv(out / "proposed_stops.csv", r_stops)
    write_csv(out / "proposed_routes.csv", r_routes)
    write_csv(out / "proposed_stop_sequences.csv", r_seqs)
    served = {s["stop_uuid"] for s in r_seqs}
    print(f"  {len(served)} of {len(r_stops)} stops are actually served "
          f"by a proposed route")

    print("\n[6/6] proposed network GTFS (supplied by PRT, not fetchable)")
    check_proposed_gtfs(raw)

    print(f"\nDone. CSVs in {out.resolve()}")
    print("NOTE: the proposed network now has a real GTFS, obtained from\n"
          "      PRT directly and committed under data/raw/proposed_gtfs/. It is\n"
          "      authoritative for proposed stops and service; the Frequency &\n"
          "      Hours PDFs are a published cross-check.\n"
          "      Run verify_proposed_gtfs.py to re-check the feed against the\n"
          "      PDFs before relying on it.")


if __name__ == "__main__":
    sys.exit(main())
