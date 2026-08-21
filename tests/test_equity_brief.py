"""Unit tests for the equity brief's charts.

The brief restates numbers that `docs/answers/EQUITY-*.md` already publish, so
its job is to not change them on the way to the page. These tests pin the two
things that would quietly alter a published finding: which baseline a group is
divided by, and which groups are allowed onto the chart at all.

The scatter's whole claim is that a loss ratio means nothing without the gain
ratio beside it -- Black residents lose weekend hourly service at 1.40x the
county rate and regain it at 1.79x -- so the arithmetic behind both axes is
tested together, on fixtures, never on the real extract.
"""
import pytest

import build_equity_brief as brief


def change_row(**kw):
    row = {"scope": "allegheny", "question": "EQUITY-RACE", "group": "g",
           "universe": "people", "tier": "WEEK-ANY-MINIMUM", "radius_m": "400",
           "total": "1000", "covered_now": "500", "covered_proposed": "480",
           "net": "-20", "pct_now": "50.0", "pct_proposed": "48.0",
           "pct_point_change": "-2.0", "lost": "40", "gained": "20",
           "pct_lost": "4.0", "pct_gained": "2.0", "too_small_to_quote": "0"}
    row.update({k: str(v) for k, v in kw.items()})
    return row


def baseline_rows():
    """The two REGION rows every ratio is divided by: 5% lost, 2% gained."""
    return [change_row(question="REGION", group="all_residents",
                       universe="people", pct_lost=5.0, pct_gained=2.0),
            change_row(question="REGION", group="all_households",
                       universe="households", pct_lost=4.0, pct_gained=1.0)]


# --------------------------------------------------------------------------
# which rows reach the chart
# --------------------------------------------------------------------------

def test_only_the_headline_scope_and_radius_are_charted():
    rows = baseline_rows() + [
        change_row(group="keep"),
        change_row(group="other_scope", scope="three_county"),
        change_row(group="other_radius", radius_m="150"),
    ]
    charted = {r["group"] for r in brief.headline(rows)}
    assert "keep" in charted
    assert {"other_scope", "other_radius"} & charted == set()


def test_a_group_too_small_to_quote_never_reaches_the_chart():
    """14 Pacific Islanders produced a 1.48 ratio; the analysis suppresses it."""
    rows = baseline_rows() + [change_row(group="tiny", too_small_to_quote="1"),
                              change_row(group="big")]
    assert [r.group for r in brief.ratios(rows)] == ["big"]


def test_the_baseline_comes_from_the_headline_scope_not_whichever_loads_last():
    """The CSV holds a REGION row per scope; keying on tier alone lets the
    three-county baseline win and turns every Allegheny ratio above 1.0."""
    rows = baseline_rows() + [
        change_row(question="REGION", group="all_residents", scope="three_county",
                   universe="people", pct_lost=1.0, pct_gained=0.5),
        change_row(group="g", pct_lost=5.0, pct_gained=2.0),
    ]
    (result,) = brief.ratios(rows)
    assert result.loss_ratio == pytest.approx(1.0)   # 5.0 / 5.0, not / 1.0
    assert result.gain_ratio == pytest.approx(1.0)


def test_the_region_baselines_are_not_themselves_plotted_as_groups():
    assert brief.ratios(baseline_rows()) == []


# --------------------------------------------------------------------------
# the two axes
# --------------------------------------------------------------------------

def test_a_group_is_divided_by_the_baseline_of_its_own_universe():
    """Households are compared to households, never to the resident base."""
    rows = baseline_rows() + [
        change_row(group="people_group", universe="people",
                   pct_lost=10.0, pct_gained=4.0),
        change_row(group="hh_group", universe="households",
                   pct_lost=10.0, pct_gained=4.0),
    ]
    by_group = {r.group: r for r in brief.ratios(rows)}
    assert by_group["people_group"].loss_ratio == pytest.approx(2.0)   # /5
    assert by_group["hh_group"].loss_ratio == pytest.approx(2.5)       # /4
    assert by_group["people_group"].gain_ratio == pytest.approx(2.0)   # /2
    assert by_group["hh_group"].gain_ratio == pytest.approx(4.0)       # /1


def test_losing_more_and_gaining_less_is_the_only_thing_called_harm():
    """The distinction the chart exists to draw: churn is not harm."""
    rows = baseline_rows() + [
        change_row(group="churn", pct_lost=7.5, pct_gained=3.0),   # 1.5 / 1.5
        change_row(group="harm", pct_lost=7.5, pct_gained=1.0),    # 1.5 / 0.5
        change_row(group="spared", pct_lost=2.5, pct_gained=3.0),  # 0.5 / 1.5
    ]
    harmed = {r.group for r in brief.ratios(rows) if r.harmed}
    assert harmed == {"harm"}


def test_a_baseline_that_never_moved_yields_no_ratio_rather_than_a_crash():
    """A tier where the county loses nothing has no meaningful denominator."""
    rows = [change_row(question="REGION", group="all_residents",
                       pct_lost=0.0, pct_gained=0.0),
            change_row(group="g", pct_lost=1.0, pct_gained=1.0)]
    (result,) = brief.ratios(rows)
    assert result.loss_ratio is None and result.gain_ratio is None
    assert not result.harmed


def test_the_point_change_carried_to_the_chart_is_the_published_one():
    """The brief must not recompute a delta the analysis already rounded."""
    rows = baseline_rows() + [change_row(group="g", pct_now=53.3,
                                         pct_proposed=49.4,
                                         pct_point_change=-3.9)]
    (result,) = brief.ratios(rows)
    assert (result.pct_now, result.pct_proposed) == (53.3, 49.4)
    assert result.pct_point_change == -3.9


def test_the_served_page_pins_the_dark_theme_the_map_app_uses():
    """The map is dark-only. A light document opening off it reads as a
    different site, so the served copy fixes the theme rather than following
    the reader's OS the way the standalone file does."""
    assert '<html lang="en" data-theme="dark">' in brief.app_page("<h1>x</h1>")
    # Asserted on the root tag, not the whole file: the stylesheet carries
    # `[data-theme]` selectors in both, and only the stamp differs.
    assert '<html lang="en">' in brief.document("<h1>x</h1>")


def test_the_served_page_carries_a_way_back_to_the_map():
    assert 'href="/"' in brief.app_page("<h1>x</h1>")


def test_a_nameless_place_says_why_it_has_no_name():
    """Four of the six unnamed block groups are the plan reaching Wexford,
    where PRT has no stop within 3 km today. "unnamed ground" reads as a data
    artifact; the reason it has no name is the finding."""
    label = brief.place_label(None)
    assert "2 km" in label
    assert brief.place_label("Ross township") == "Ross township"
