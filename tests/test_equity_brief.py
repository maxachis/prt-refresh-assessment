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
    """Now vanishingly rare rather than routine: block groups are named by the
    boundary containing them, and municipal boundaries partition the county, so
    the only way to take no name is to fall outside every one. Saying which
    still beats "unnamed ground", which reads as a data artifact."""
    assert "boundary" in brief.place_label(None)
    assert brief.place_label("Ross township") == "Ross township"


def test_the_wide_evidence_blocks_keep_their_centring_margins():
    """Charts and figure blocks break out wider than the reading column and are
    centred on it with `margin-inline:auto`. A `margin:` shorthand in the class
    rule silently resets that to 0 -- and because `.figure` (0,1,0) outranks
    `main > figure` (0,0,2), the charts then hang off the left page edge while
    the tables beside them stay centred. Cost: both charts misaligned on every
    desktop width. Use `margin-block` so the inline axis is never touched.
    """
    for rule in (".figure", ".numbers"):
        block = brief.CSS.split(rule + " {", 1)[1].split("}", 1)[0]
        assert "margin:" not in block, (
            f"{rule} resets margin-inline and un-centres the breakout")


# --------------------------------------------------------------------------
# the prose file and its slots
# --------------------------------------------------------------------------

def test_a_slot_the_prose_does_not_ask_for_is_an_error_not_a_silent_drop():
    """Renaming a slot in the prose file must not quietly delete a chart. A
    builder with nowhere to go means the page loses a whole figure, and the
    output is still valid HTML, so nothing else would catch it."""
    with pytest.raises(KeyError, match="no slot for"):
        brief.fill_slots("<p>no slots here</p>", {"chart-churn": lambda: "x"})


def test_a_slot_with_no_builder_is_an_error_not_a_comment_left_on_the_page():
    """The other direction: a typo in the prose file would otherwise ship an
    HTML comment where a chart should be, invisible in a browser."""
    with pytest.raises(KeyError, match="unknown slots"):
        brief.fill_slots("<!--slot:chart-of-nothing-->", {})


def test_the_prose_file_supplies_the_words_and_the_slots_the_evidence():
    filled = brief.fill_slots(
        "<h1>Title</h1>\n<!--slot:chart-churn-->\n",
        {"chart-churn": lambda: "<svg/>"})
    assert filled == "<h1>Title</h1>\n<svg/>\n"


def test_every_slot_the_prose_file_asks_for_has_a_builder():
    """Guards the real file, not a fixture: `page_body` raises on a mismatch,
    so this fails the moment the prose and the builders disagree."""
    prose = brief.BODY_HTML.read_text(encoding="utf-8")
    assert brief.SLOT.findall(prose), "the prose file has no evidence slots"
    assert "{" not in prose and "}" not in prose, (
        "the prose file must be plain HTML -- braces would read as templating")


# --------------------------------------------------------------------------
# the contents list and its links
# --------------------------------------------------------------------------

def test_a_section_heading_without_an_id_is_an_error():
    """Ids are hand-authored rather than slugged from the words, so that a
    link someone shared survives a rewrite of the heading it points at. The
    cost of that choice is that a new section can ship unlinkable; this is
    what stops it."""
    with pytest.raises(KeyError, match="no id"):
        brief.headings("<h2>Where the trade landed</h2>")


def test_two_sections_cannot_share_one_fragment():
    """A duplicate id sends both contents entries to the first section, and
    the page still renders, so nothing else would notice."""
    with pytest.raises(KeyError, match="twice"):
        brief.headings('<h2 id="a">One</h2><h2 id="a">Two</h2>')


def test_the_contents_list_names_every_section_in_order():
    got = brief.headings('<h2 id="b">Second</h2>\n<h1>x</h1>\n'
                         '<h2 id="a">First <em>bit</em></h2>')
    assert got == [("b", "Second"), ("a", "First bit")]
    nav = brief.contents_nav(got)
    assert nav.index('href="#b"') < nav.index('href="#a"')
    assert ">Second<" in nav and ">First bit<" in nav


def test_clicking_a_heading_moves_the_address_bar_to_that_section():
    """The heading is itself the link, so a reader who wants to cite a section
    clicks its title rather than hunting for a pilcrow."""
    linked = brief.link_headings('<h2 id="removals">The removals</h2>')
    assert linked == ('<h2 id="removals">'
                      '<a class="heading-link" href="#removals">'
                      'The removals</a></h2>')


def test_the_real_page_carries_a_contents_list_and_linkable_sections():
    """Guards the prose file, not a fixture: every section it publishes has a
    fragment, and the contents list points at all of them."""
    prose = brief.BODY_HTML.read_text(encoding="utf-8")
    sections = brief.headings(prose)
    assert len(sections) >= 5
    nav = brief.contents_nav(sections)
    for anchor, text in sections:
        assert f'href="#{anchor}"' in nav


# --------------------------------------------------------------------------
# the full removals list, and its links back to the map
# --------------------------------------------------------------------------

def removed_row(**kw):
    r = {"radius_m": "400", "cluster_id": "1", "place": "Ross township",
         "place_source": "boundary", "primary_street": "PERRY HWY",
         "top_stop_id": "9", "top_stop_name": "PERRY HWY + SIEBERT RD",
         "top_lat": "40.512300", "top_lon": "-80.012300", "n_stops": "2",
         "span_m": "120", "lat": "40.5", "lon": "-80.0",
         "weekday_boardings": "4.0", "saturday_boardings": "1.0",
         "sunday_boardings": "0.0", "current_routes": "O5", "stop_ids": "9;10"}
    r.update({k: str(v) for k, v in kw.items()})
    return r


def test_every_cluster_reaches_the_page_including_the_ones_boarding_nobody():
    """The flatness is the finding (convention 15), so the tail is the
    evidence and truncating it is what a top-few table gets wrong."""
    rows = [removed_row(cluster_id=i, weekday_boardings=w)
            for i, w in enumerate([9.0, 0.0, 3.0, 0.0])]
    html = brief.removed_table(rows, base="")
    assert html.count("<tr") == len(rows) + 1          # + the header row
    assert ">0.0<" in html


def test_the_list_is_ranked_by_riders_with_a_stable_order_through_the_zeros():
    """Below a boarding or two the ordering carries no information, so ties
    fall back to place and then to the street -- otherwise the tail reshuffles
    on every rebuild and the diff is unreadable."""
    rows = [removed_row(place="Ross township", primary_street="B",
                        weekday_boardings=0.0),
            removed_row(place="Baldwin borough", primary_street="C",
                        weekday_boardings=0.0),
            removed_row(place="Baldwin borough", primary_street="A",
                        weekday_boardings=0.0),
            removed_row(place="Zelienople", primary_street="D",
                        weekday_boardings=7.0)]
    ranked = brief.rank_removed(rows)
    assert [(r["place"], r["primary_street"]) for r in ranked] == [
        ("Zelienople", "D"), ("Baldwin borough", "A"),
        ("Baldwin borough", "C"), ("Ross township", "B")]


def test_a_row_links_to_the_map_at_its_busiest_stop_not_the_centroid():
    """The centroid of a corridor can sit in a municipality the row does not
    name; the busiest stop is where the place name was decided."""
    link = brief.map_link(removed_row(), base="")
    assert "at=40.51230,-80.01230" in link
    assert "at=40.50000,-80.00000" not in link   # the centroid


def test_the_standalone_file_links_out_to_the_live_site():
    """Opened from disk or sent as an attachment, a relative link is dead."""
    assert brief.map_link(removed_row(), base=brief.MAP_SITE).startswith(
        "https://")
    assert brief.map_link(removed_row(), base="").startswith("/?")


def test_the_place_index_names_every_place_once_and_points_into_the_list():
    """39 places over 286 rows: the index is how a resident finds their own
    without reading a county-wide ranking end to end."""
    rows = [removed_row(place="Ross township", weekday_boardings=1.0),
            removed_row(place="Baldwin borough", weekday_boardings=9.0),
            removed_row(place="Baldwin borough", weekday_boardings=5.0)]
    index = brief.place_index(brief.rank_removed(rows))
    assert index.index("Baldwin") < index.index("Ross")      # alphabetical
    assert '<span class="count">2</span>' in index
    assert '<span class="count">1</span>' in index
    # Baldwin's busiest cluster ranks first, so its chip lands on row 1.
    assert 'href="#r1"' in index and 'href="#r3"' in index
