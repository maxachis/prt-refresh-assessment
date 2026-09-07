"""Every stop a bus calls at today is a measured location, however PRT numbers it.

The failure this file exists to prevent: the boardings extract and the GTFS are
joined on the stop id, and PRT renumbers stops. When it does, the old id keeps
the ridership and the new id keeps the service, so a location served all day by
the 87 falls through both halves of the join and is measured nowhere -- not in
the coverage tiers, not in the removal ranking, and not as a dot on the map.
That is how the whole of Friendship Avenue and Penn Avenue through Garfield
came to be drawn as though no bus stopped there.

The second failure guarded here is the fix overreaching. Carrying boardings
across a renumbering is only honest while the match is unambiguous: one retired
code, close enough that it can only be the same pole, claimed by only one
current stop. Everywhere else the location is still measured, but its boardings
are unknown rather than zero -- convention 15's distinction between "nobody
boards here" and "nobody can have boarded here", arriving on the current side.
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import analyze_service_loss as sl  # noqa: E402

M_PER_DEG_LAT = 111_320.0


def dlat_for(metres):
    return metres / M_PER_DEG_LAT


def usage_row(stop_code, lat, lon, *, weekday=10.0, route_code="All Routes",
              mode="BUS"):
    """One row of the stop-usage extract, keyed by GTFS stop id (`stop_code`)."""
    return {"stop_code": stop_code, "stop_name": f"STOP {stop_code}",
            "stop_lat": f"{lat}", "stop_lon": f"{lon}",
            "route_code": route_code, "mode": mode,
            "MUNI": "Elsewhere (Allegheny, PA)", "HOOD": "",
            f"B_W_{sl.MONTH}": f"{weekday}", f"B_S_{sl.MONTH}": "1.0",
            f"B_U_{sl.MONTH}": "0.5"}


BASE_LAT, BASE_LON = 40.4620, -79.9410


def test_a_stop_keeping_its_id_joins_on_the_id():
    coords = {"100": (BASE_LAT, BASE_LON)}
    usage = [usage_row("100", BASE_LAT, BASE_LON)]

    joined = sl.usage_by_stop(usage, coords)

    row, source = joined["100"]
    assert source == sl.BOARDINGS_BY_ID
    assert row["stop_code"] == "100"


def test_a_renumbered_stop_takes_the_boardings_of_the_id_it_replaced():
    """The Friendship Avenue case: same pole, new id, ridership on the old one."""
    coords = {"21905": (BASE_LAT, BASE_LON)}
    usage = [usage_row("14850", BASE_LAT + dlat_for(4), BASE_LON, weekday=88.0)]

    joined = sl.usage_by_stop(usage, coords)

    row, source = joined["21905"]
    assert source == sl.BOARDINGS_BY_FORMER_ID
    assert float(row[f"B_W_{sl.MONTH}"]) == 88.0


def test_two_retired_ids_at_one_corner_donate_to_neither():
    """Opposite kerbs land within the tolerance, and their boardings differ."""
    coords = {"21905": (BASE_LAT, BASE_LON)}
    usage = [usage_row("14850", BASE_LAT + dlat_for(4), BASE_LON, weekday=88.0),
             usage_row("14869", BASE_LAT - dlat_for(6), BASE_LON, weekday=12.0)]

    joined = sl.usage_by_stop(usage, coords)

    row, source = joined["21905"]
    assert source == sl.BOARDINGS_UNKNOWN
    assert row is None


def test_a_retired_id_two_current_stops_could_claim_goes_to_neither():
    coords = {"21905": (BASE_LAT, BASE_LON),
              "22075": (BASE_LAT + dlat_for(8), BASE_LON)}
    usage = [usage_row("14850", BASE_LAT + dlat_for(4), BASE_LON, weekday=88.0)]

    joined = sl.usage_by_stop(usage, coords)

    assert joined["21905"] == (None, sl.BOARDINGS_UNKNOWN)
    assert joined["22075"] == (None, sl.BOARDINGS_UNKNOWN)


def test_a_retired_id_beyond_the_tolerance_is_not_the_same_pole():
    coords = {"21905": (BASE_LAT, BASE_LON)}
    usage = [usage_row("14850", BASE_LAT + dlat_for(sl.FORMER_ID_MAX_M + 5),
                       BASE_LON)]

    joined = sl.usage_by_stop(usage, coords)

    assert joined["21905"] == (None, sl.BOARDINGS_UNKNOWN)


def test_an_id_still_in_service_never_donates_its_boardings():
    """A stop that still runs owns its own ridership; it has not been replaced."""
    coords = {"14850": (BASE_LAT + dlat_for(4), BASE_LON),
              "21905": (BASE_LAT, BASE_LON)}
    usage = [usage_row("14850", BASE_LAT + dlat_for(4), BASE_LON, weekday=88.0)]

    joined = sl.usage_by_stop(usage, coords)

    assert joined["14850"][1] == sl.BOARDINGS_BY_ID
    assert joined["21905"] == (None, sl.BOARDINGS_UNKNOWN)


def test_every_served_stop_is_measured_however_its_boardings_resolve():
    coords = {"100": (BASE_LAT, BASE_LON),
              "21905": (BASE_LAT + dlat_for(300), BASE_LON),
              "99999": (BASE_LAT + dlat_for(900), BASE_LON)}
    usage = [usage_row("100", BASE_LAT, BASE_LON),
             usage_row("14850", BASE_LAT + dlat_for(303), BASE_LON)]

    joined = sl.usage_by_stop(usage, coords)

    assert set(joined) == set(coords)


def test_only_the_all_routes_row_is_a_stop_level_total():
    """Convention 7: summing the per-route rows double-counts."""
    coords = {"100": (BASE_LAT, BASE_LON)}
    usage = [usage_row("100", BASE_LAT, BASE_LON, route_code="71A", weekday=5.0),
             usage_row("100", BASE_LAT, BASE_LON, weekday=10.0)]

    joined = sl.usage_by_stop(usage, coords)

    assert float(joined["100"][0][f"B_W_{sl.MONTH}"]) == 10.0


def test_rail_rows_are_out_of_a_bus_universe_but_available_to_an_all_mode_one():
    coords = {"100": (BASE_LAT, BASE_LON)}
    usage = [usage_row("100", BASE_LAT, BASE_LON, mode="LRT")]

    assert sl.usage_by_stop(usage, coords)["100"][1] == sl.BOARDINGS_UNKNOWN
    assert sl.usage_by_stop(usage, coords,
                            bus_only=False)["100"][1] == sl.BOARDINGS_BY_ID


# Each file's own scope, which is not the same scope. The coverage tiers ask
# about every day type, so their universe is every stop a bus calls at on any
# of the three. The frequency analysis is a weekday one throughout, so five
# weekend-only stops are correctly outside it -- pinning it to the wider set
# would demand rows the file has no weekday reading for.
PUBLISHED_UNIVERSES = [("coverage_change.csv", ("weekday", "saturday", "sunday")),
                       ("stop_frequency_change.csv", ("weekday",))]


@pytest.mark.parametrize("path,days", PUBLISHED_UNIVERSES)
def test_the_published_files_measure_every_bus_stop_served_today(path, days):
    """The regression itself: no served stop may be missing from the output."""
    import csv
    import gtfs
    from analyze_coverage_change import period_of, to_axis

    data = Path(__file__).resolve().parents[1] / "data" / path
    if not data.exists():
        pytest.skip(f"{data} not built")

    cur = gtfs.load_service(gtfs.current(), gtfs.SAMPLE["current"],
                            period_of=period_of, to_axis=to_axis)
    served = {sid for day in days for sid in cur.times[day]} & set(cur.coords)
    with open(data, encoding="utf-8") as f:
        published = {r["stop_id"] for r in csv.DictReader(f)}

    assert not served - published, (
        f"{len(served - published)} stops a bus calls at today are absent from "
        f"{path}")
