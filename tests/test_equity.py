"""Unit tests for the population-weighted equity analysis.

These exercise the arithmetic that turns census rows into a finding -- the
tract-to-block-group apportionment, the suppression sentinel, the weighted
tally and the three denominators -- on hand-built fixtures, never on the real
1,464-block-group extract. The failure modes they exist to catch are the quiet
ones: a suppressed ACS cell summed as -666666666, a tract rate handed to every
block group at full strength instead of its population share, or a scope filter
that silently returns everybody.
"""
import analyze_equity_change as eq
import ingest_census as ic


# --------------------------------------------------------------------------
# ingest: reading ACS cells and pushing tract rates down to block groups
# --------------------------------------------------------------------------

def test_suppressed_cell_reads_as_zero_not_as_a_huge_negative():
    """ACS marks an unpublishable cell -666666666, which must never be summed."""
    assert ic.acs_number("-666666666") == 0
    assert ic.acs_number("") == 0
    assert ic.acs_number(None) == 0
    assert ic.acs_number("1234") == 1234


def block_groups():
    """Two block groups in one tract, 300 and 700 people; one in another."""
    return [
        {"geoid": "420030001001", "tract_geoid": "42003000100",
         "county": "Allegheny", "population": 300},
        {"geoid": "420030001002", "tract_geoid": "42003000100",
         "county": "Allegheny", "population": 700},
        {"geoid": "420030002001", "tract_geoid": "42003000200",
         "county": "Allegheny", "population": 500},
    ]


BLOCK_GROUP_DIMENSION = {
    "question": "EQUITY-RACE", "table": "T", "level": ic.BLOCK_GROUP,
    "universe": "people", "total": "T_001E",
    "groups": {"group_a": ["T_002E", "T_003E"]}, "exhaustive": False,
}

TRACT_DIMENSION = {
    "question": "EQUITY-DISABILITY", "table": "T", "level": ic.TRACT,
    "universe": "people", "total": "T_001E",
    "groups": {"group_a": ["T_002E"]}, "exhaustive": False,
}


def test_block_group_table_joins_without_apportioning():
    rows = block_groups()
    values = {"420030001001": {"T_001E": 300.0, "T_002E": 40.0, "T_003E": 10.0},
              "420030001002": {"T_001E": 700.0, "T_002E": 70.0, "T_003E": 0.0},
              "420030002001": {"T_001E": 500.0, "T_002E": 25.0, "T_003E": 5.0}}
    ic.attach(rows, BLOCK_GROUP_DIMENSION, values,
              ic.tract_population(rows))
    assert [r["group_a"] for r in rows] == [50.0, 70.0, 30.0]


def test_tract_table_is_shared_out_by_population_share():
    """The tract's 100 disabled residents split 30/70 by block-group population."""
    rows = block_groups()
    values = {"42003000100": {"T_001E": 1000.0, "T_002E": 100.0},
              "42003000200": {"T_001E": 500.0, "T_002E": 50.0}}
    ic.attach(rows, TRACT_DIMENSION, values, ic.tract_population(rows))
    assert [r["group_a"] for r in rows] == [30.0, 70.0, 50.0]
    # And the shared-out parts still add back up to what the tract published.
    assert rows[0]["disability_total"] + rows[1]["disability_total"] == 1000.0


def test_a_block_group_missing_from_the_acs_response_counts_as_zero():
    rows = block_groups()
    ic.attach(rows, BLOCK_GROUP_DIMENSION, {}, ic.tract_population(rows))
    assert [r["group_a"] for r in rows] == [0.0, 0.0, 0.0]


# --------------------------------------------------------------------------
# analysis: the weighted tally and the denominators
# --------------------------------------------------------------------------

def covered(county, group_a, now, proposed, lost=None, gained=None):
    """One block group: a group-A population, and its covered SHARE before/after.

    `now` and `proposed` are fractions of the block group's residents, since
    coverage is measured across its census blocks rather than at one point.
    Lost and gained default to the simple all-or-nothing case, which is what a
    block group whose blocks all agree looks like.
    """
    return {"county": county, "group_a": group_a,
            "cur_week_any_minimum": now, "prop_week_any_minimum": proposed,
            "lost_week_any_minimum":
                max(now - proposed, 0) if lost is None else lost,
            "gained_week_any_minimum":
                max(proposed - now, 0) if gained is None else gained}


def test_a_partly_covered_block_group_contributes_only_its_covered_part():
    """The whole point of the blocks: 300 of 1,000 residents, not 0 or 1,000."""
    rows = [covered("Allegheny", 1000, 0.3, 0.3)]
    t = eq.tally(rows, "group_a", "week_any_minimum", "")
    assert t["now"] == 300
    assert t["lost"] == 0


def test_a_block_group_that_both_loses_and_gains_reports_both():
    """One end picks up a route while the other loses one; a net would hide it."""
    rows = [covered("Allegheny", 1000, 0.5, 0.5, lost=0.2, gained=0.2)]
    t = eq.tally(rows, "group_a", "week_any_minimum", "")
    assert (t["lost"], t["gained"]) == (200, 200)
    assert t["proposed"] - t["now"] == 0


def test_tally_weights_the_tier_flag_by_population():
    rows = [covered("Allegheny", 100, 1, 1),    # keeps service
            covered("Allegheny", 200, 1, 0),    # loses it
            covered("Allegheny", 50, 0, 1),     # gains it
            covered("Allegheny", 400, 0, 0)]    # never had it
    t = eq.tally(rows, "group_a", "week_any_minimum", "")
    assert t["total"] == 750
    assert t["now"] == 300
    assert t["proposed"] == 150
    assert t["lost"] == 200
    assert t["gained"] == 50


def test_a_block_group_with_none_of_a_group_does_not_move_its_numbers():
    """An all-white block group losing its bus must not appear in a Black total."""
    rows = [covered("Allegheny", 0, 1, 0), covered("Allegheny", 100, 1, 1)]
    t = eq.tally(rows, "group_a", "week_any_minimum", "")
    assert (t["total"], t["lost"]) == (100, 0)


def test_the_three_denominators_select_different_block_groups():
    rows = [covered("Allegheny", 10, 1, 1),     # in county, has service
            covered("Allegheny", 10, 0, 0),     # in county, never served
            covered("Westmoreland", 10, 0, 1)]  # outside, gains service
    counts = {scope: sum(1 for r in rows if eq.in_scope(r, scope))
              for scope in eq.SCOPES}
    assert counts == {eq.ALLEGHENY: 2, eq.SERVED: 2, eq.THREE_COUNTY: 3}


def test_headline_scope_excludes_the_counties_prt_barely_serves():
    """Allegheny is the headline; the other two would only dilute it."""
    assert eq.HEADLINE_SCOPE == eq.ALLEGHENY
    assert not eq.in_scope(covered("Beaver", 10, 0, 0), eq.ALLEGHENY)


def test_every_base_camp_equity_question_has_a_dimension_that_answers_it():
    questions = {d["question"] for d in ic.DIMENSIONS}
    assert questions == {"EQUITY-RACE", "EQUITY-AGE", "EQUITY-INCOME",
                         "EQUITY-VEHICLE", "EQUITY-DISABILITY",
                         "EQUITY-LANGUAGE"}


def test_household_dimensions_are_not_reported_against_a_population_universe():
    """Dividing zero-car households by residents would be off by ~2.2x."""
    by_question = {d["question"]: d["universe"] for d in ic.DIMENSIONS}
    assert by_question["EQUITY-VEHICLE"] == eq.HOUSEHOLDS
    assert by_question["EQUITY-INCOME"] == eq.HOUSEHOLDS
    assert by_question["EQUITY-LANGUAGE"] == eq.HOUSEHOLDS
    assert by_question["EQUITY-RACE"] == eq.PEOPLE


def test_a_group_too_small_to_quote_is_flagged_not_silently_reported():
    """187 Pacific Islanders across 1,062 block groups is arithmetic, not a finding."""
    tiny = [covered("Allegheny", 4, 1, 0)]
    big = [covered("Allegheny", eq.MIN_UNIVERSE, 1, 0)]
    assert eq.tally(tiny, "group_a", "week_any_minimum", "")["total"] < eq.MIN_UNIVERSE
    assert eq.tally(big, "group_a", "week_any_minimum", "")["total"] >= eq.MIN_UNIVERSE
