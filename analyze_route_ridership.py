#!/usr/bin/env python3
"""
Riders on the 20 discontinued routes, from the freshest public source.

analyze_service_loss.py answers this from the stop-usage layer, which stops at
May 2025 and which PRT itself warns "may underestimate true system-wide
ridership by as much as 30%". WPRDC's route-level ridership table is a better
source for the same question: it is public, it is official, and it runs through
April 2026.

Usage: python3 analyze_route_ridership.py
"""

import csv
import json
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

DATA = Path("data")
RAW = DATA / "raw"
RESOURCE = "12bb84ed-397e-435c-8d1b-8ce543108698"
SQL_URL = "https://data.wprdc.org/api/3/action/datastore_search_sql"


def query(sql):
    url = f"{SQL_URL}?{urllib.parse.urlencode({'sql': sql})}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    d = json.loads(urllib.request.urlopen(req, timeout=120).read())
    if not d.get("success"):
        raise RuntimeError(str(d.get("error"))[:400])
    return d["result"]["records"]


def load(month):
    cache = RAW / f"route_ridership_{month}.csv"
    if cache.exists():
        return list(csv.DictReader(open(cache, encoding="utf-8")))
    rows = query(f'SELECT "Route", "Route_Full_Name", "Mode", "Day_Type", '
                 f'"Avg_Riders" FROM "{RESOURCE}" WHERE "Date_Key" = {month}')
    cache.parent.mkdir(parents=True, exist_ok=True)
    with open(cache, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["Route", "Route_Full_Name", "Mode",
                                          "Day_Type", "Avg_Riders"])
        w.writeheader()
        w.writerows({k: r[k] for k in w.fieldnames} for r in rows)
    return rows


def main():
    latest = query(f'SELECT MAX("Date_Key") AS m FROM "{RESOURCE}"')[0]["m"]
    print(f"Latest published month: {latest}")
    rows = load(int(latest))

    day_types = sorted({r["Day_Type"] for r in rows})
    rider = defaultdict(dict)
    for r in rows:
        rider[r["Route"]][r["Day_Type"]] = float(r["Avg_Riders"] or 0)
    names = {r["Route"]: r["Route_Full_Name"] for r in rows}
    print(f"  {len(rider)} routes, day types {day_types}")

    cross = list(csv.DictReader(open(DATA / "route_crosswalk.csv")))
    disc = [c["current_route"].split()[0] for c in cross
            if c["category"] == "Discontinued" and c["current_route"] != "-"]

    wk = next(d for d in day_types if d.upper().startswith("WEEK"))
    print(f"\n{'route':6s} {'weekday riders':>15s}  name")
    total, missing = 0.0, []
    out = []
    for rt in sorted(disc, key=lambda x: -rider.get(x, {}).get(wk, 0)):
        if rt not in rider:
            missing.append(rt)
            continue
        v = rider[rt][wk]
        total += v
        out.append({"route": rt, "name": names.get(rt, ""),
                    **{d.lower(): round(rider[rt].get(d, 0), 1) for d in day_types}})
        print(f"{rt:6s} {v:15,.0f}  {names.get(rt, '')}")
    print(f"\n{len(disc) - len(missing)} of {len(disc)} discontinued routes matched"
          + (f"; no data for {missing}" if missing else ""))
    print(f"TOTAL weekday riders on discontinued routes: {total:,.0f}")

    sys_tot = sum(v.get(wk, 0) for v in rider.values())
    print(f"System weekday riders: {sys_tot:,.0f}   "
          f"discontinued share: {total / sys_tot:.1%}")

    path = DATA / f"discontinued_route_ridership_{latest}.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(out[0].keys()))
        w.writeheader()
        w.writerows(out)
    print(f"\nWrote {path}")


if __name__ == "__main__":
    main()
