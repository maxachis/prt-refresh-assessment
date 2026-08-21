"""Build the equity brief -- the charts that carry the EQUITY-* findings.

`docs/answers/EQUITY-*.md` answer six questions one file at a time, and the
finding they share is not in any one of them: read together, the plan's trade
runs progressive, and older residents are the exception. That is a comparison
across nineteen groups against a county baseline, and prose makes a reader
assemble it from twenty-four tables. This script draws it.

Two charts, both generated from `data/equity_change.csv` so they cannot drift
from the published numbers:

**The churn/harm scatter** plots each group's loss ratio against its gain
ratio, with the diagonal marking equal rates. It exists because a loss ratio
alone is a misreading machine. Black residents lose weekend hourly service at
1.40x the county rate -- quotable, alarming, and wrong on its own, because they
regain it at 1.79x for a net of +8.4 points. Only a group that is *both* above
1.0 on losses and below 1.0 on gains is losing ground, and on the headline tier
exactly one is: residents aged 65 and over, at 1.14 and 0.89.

**The point-change dot plot** shows where the trade landed, in percentage
points of each group's own population, on the two tiers that matter most: any
bus at all, and an hourly bus on a weekend. Sorted, it is the progressive
gradient in one picture -- car-free and low-income households at the gaining
end, the highest income bracket and the over-65s at the losing end.

Scope is Allegheny County at a 400 m walk, the headline denominator and radius
that `METHOD-equity.md` argues for; the other scopes and the 150 m sensitivity
stay in the CSV rather than on the page, because a chart offering four
denominators invites picking the flattering one.

Nothing here recomputes a finding. Percentages, point changes and the loss and
gain rates are read from the analysis output as published; the only arithmetic
is dividing a group's rate by its own universe's county rate, which is the
ratio `docs/answers/` prints. Output is `docs/equity-brief.html`, one
self-contained file with no scripts, no fonts and no network calls.

The brief's words are not in this file. They live in `equity_brief_body.html`,
a plain HTML fragment with `<!--slot:name-->` comments where the charts and
tables go, so that editing the prose is editing a document rather than a
Python string literal -- and so that a writer never has to know which
characters this script would try to interpolate. See `page_body`.
"""
import argparse
import csv
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import analyze_equity_places as ap
import svgplot as sp
from svgplot import el, escape, group

DATA = Path(__file__).resolve().parent / "data"
DOCS = Path(__file__).resolve().parent / "docs"
CHANGE_CSV = DATA / "equity_change.csv"
FREQUENCY_CSV = DATA / "equity_frequency.csv"
OUT_HTML = DOCS / "equity-brief.html"
# The brief's words, as an editable HTML fragment rather than a string
# literal in this file. See `page_body`.
BODY_HTML = Path(__file__).resolve().parent / "equity_brief_body.html"
# The same brief, served by the web app at /findings. Generated and committed
# for the same reason `static/app.js` is: the box serves what it checks out.
APP_HTML = (Path(__file__).resolve().parent / "src" / "refresh" / "web"
            / "static" / "findings.html")

# The headline denominator and radius. METHOD-equity.md caveat 1 is that two
# thirds of the three-county population lives where PRT has never run a bus, so
# `three_county` makes every change look small; `allegheny` is the honest base.
SCOPE = "allegheny"
RADIUS = "400"

# The analysis writes the county totals as rows of their own, under a question
# id no chart plots. They are the denominator, not a group.
REGION = "REGION"
BASELINE_GROUP = {"people": "all_residents", "households": "all_households"}

# Tier ids as `analyze_coverage_change.py` defines them.
ANY_BUS = "WEEK-ANY-MINIMUM"
WEEKEND_BUS = "WEEKENDS-ANY-MINIMUM"
WEEKDAY_HOURLY = "WEEK-ANY-HOURLY"
WEEKEND_HOURLY = "WEEKEND-ANY-HOURLY"

TIER_LABEL = {
    ANY_BUS: "Any bus at all",
    WEEKEND_BUS: "A bus on a weekend",
    WEEKDAY_HOURLY: "Hourly on a weekday",
    WEEKEND_HOURLY: "Hourly on a weekend",
}
SCATTER_TIERS = [ANY_BUS, WEEKEND_BUS, WEEKDAY_HOURLY, WEEKEND_HOURLY]

# Group ids carry their ACS provenance; a reader should see plain English.
GROUP_LABEL = {
    "hispanic_or_latino": "Hispanic or Latino",
    "white_nh": "White",
    "black_nh": "Black",
    "asian_nh": "Asian",
    "other_race_nh": "Other race",
    "two_or_more_nh": "Two or more races",
    "under_18": "Under 18",
    "age_65_plus": "Age 65+",
    "income_under_25k": "Under $25k",
    "income_25k_50k": "$25k-50k",
    "income_50k_75k": "$50k-75k",
    "income_75k_100k": "$75k-100k",
    "income_100k_plus": "$100k+",
    "zero_vehicle_households": "No vehicle",
    "one_vehicle_households": "One vehicle",
    "with_a_disability": "With a disability",
    "limited_english_households": "Limited English",
}

QUESTION_LABEL = {
    "EQUITY-RACE": "Race", "EQUITY-AGE": "Age", "EQUITY-INCOME": "Income",
    "EQUITY-VEHICLE": "Vehicles", "EQUITY-DISABILITY": "Disability",
    "EQUITY-LANGUAGE": "Language",
}

# One hue per question, so a reader can see a whole dimension move together --
# the income brackets marching down the gradient is the finding, not five
# unrelated dots.
# Values are CSS custom properties rather than hex, because the SVG is inline
# in the page and a reader in dark mode would otherwise get six dark dots on a
# dark ground. The stylesheet redefines each token per theme; nothing here has
# to know which theme is active.
QUESTION_COLOUR = {q: f"var(--q-{q.split('-')[1].lower()})" for q in QUESTION_LABEL}


@dataclass(frozen=True)
class GroupChange:
    """One group on one tier, as the chart needs it."""
    question: str
    group: str
    universe: str
    tier: str
    total: float
    pct_now: float
    pct_proposed: float
    pct_point_change: float
    loss_ratio: float | None
    gain_ratio: float | None

    @property
    def label(self):
        return GROUP_LABEL.get(self.group, self.group)

    @property
    def colour(self):
        return QUESTION_COLOUR.get(self.question, "#555")

    @property
    def harmed(self):
        """Losing above the county rate *and* regaining below it.

        The scatter's entire point. A group above 1.0 on both axes is churning
        -- the plan moved its service and gave it back -- and calling that harm
        would misread the largest net gain in the analysis as a cut.
        """
        if self.loss_ratio is None or self.gain_ratio is None:
            return False
        return self.loss_ratio > 1.0 and self.gain_ratio < 1.0


def headline(rows):
    """Just the scope and radius this brief speaks for."""
    return [r for r in rows
            if r["scope"] == SCOPE and r["radius_m"] == RADIUS]


def baselines(rows):
    """(universe, tier) -> the county row every ratio is divided by.

    Filters to the headline scope first. The CSV carries a REGION row per
    scope and radius, and keying on (universe, tier) alone lets the
    three-county or 150 m baseline win on load order -- which divides
    Allegheny rates by a three-county denominator and turns every ratio
    above 1.0. That is a wrong answer with a confident face on it.
    """
    return {(r["universe"], r["tier"]): r for r in headline(rows)
            if r["question"] == REGION
            and r["group"] == BASELINE_GROUP.get(r["universe"])}


def _ratio(part, whole):
    """A rate against its county rate, or None where the county did not move."""
    return part / whole if whole else None


def ratios(rows):
    """Every quotable group, on every tier, with both ratios attached."""
    base = baselines(rows)
    out = []
    for r in headline(rows):
        if r["question"] == REGION or r["too_small_to_quote"] == "1":
            continue
        county = base.get((r["universe"], r["tier"]))
        if county is None:
            continue
        out.append(GroupChange(
            question=r["question"], group=r["group"], universe=r["universe"],
            tier=r["tier"], total=float(r["total"]),
            pct_now=float(r["pct_now"]),
            pct_proposed=float(r["pct_proposed"]),
            pct_point_change=float(r["pct_point_change"]),
            loss_ratio=_ratio(float(r["pct_lost"]), float(county["pct_lost"])),
            gain_ratio=_ratio(float(r["pct_gained"]),
                              float(county["pct_gained"])),
        ))
    return out


def load(path=CHANGE_CSV):
    if not path.exists():
        sys.exit(f"missing {path} -- run analyze_equity_change.py first")
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


# --------------------------------------------------------------------------
# chart 1: the churn/harm scatter
# --------------------------------------------------------------------------
#
# Ratios are drawn on a log scale so that "twice the county rate" and "half the
# county rate" sit the same distance from 1.0. On a linear axis, halving is
# squashed into the first tenth of the canvas and doubling gets the rest, which
# makes every protected group look unremarkable and every churning one look
# extreme -- the exact misreading this chart exists to prevent.

from math import log2

RATIO_MIN, RATIO_MAX = 0.35, 3.4
RATIO_TICKS = [0.5, 1.0, 2.0, 3.0]

# Dots are sized by the group's population, so the reader can see at a glance
# that the two dots furthest into the corners belong to "Other race" -- 6,773
# people, barely over the threshold at which this analysis quotes a group at
# all -- while the 935,000 white residents sit near the middle. Area, not
# radius, tracks population; a radius-scaled dot exaggerates by its square.
DOT_MIN_R, DOT_MAX_R = 3.4, 12.0
LABEL_GAP = 13.0

PANEL = 268          # plotting square, per facet
PANEL_PAD = 62       # room for axis labels and the facet title
HARM_FILL = "var(--harm)"
GRID = "var(--rule)"
AXIS = "var(--axis)"


def _ratio_axis(lo_px, hi_px):
    return sp.Scale(log2(RATIO_MIN), log2(RATIO_MAX), lo_px, hi_px)


def _dot_title(row):
    """The accessible name on a dot: everything the label cannot fit."""
    return (f"{row.label} — loses at {row.loss_ratio:.2f}x the county rate, "
            f"gains at {row.gain_ratio:.2f}x; "
            f"{row.pct_now:.1f}% to {row.pct_proposed:.1f}% "
            f"({row.pct_point_change:+.1f} points)")


def _scatter_frame(x, y, title):
    """Axes, gridlines, the 1.0 crosshair and the shaded losing-ground corner."""
    one_x, one_y = x(0.0), y(0.0)   # log2(1.0)
    parts = [
        el("rect", x=one_x, y=one_y, width=x(log2(RATIO_MAX)) - one_x,
           height=y(log2(RATIO_MIN)) - one_y, fill=HARM_FILL),
        el("text", title, x=x(log2(RATIO_MIN)), y=y(log2(RATIO_MAX)) - 26,
           class_="facet-title"),
    ]
    for tick in RATIO_TICKS:
        px, py = x(log2(tick)), y(log2(tick))
        heavy = tick == 1.0
        parts += [
            el("line", x1=px, x2=px, y1=y(log2(RATIO_MIN)), y2=y(log2(RATIO_MAX)),
               stroke=AXIS if heavy else GRID,
               stroke_width=1.4 if heavy else 1,
               stroke_dasharray=None if heavy else "2 3"),
            el("line", y1=py, y2=py, x1=x(log2(RATIO_MIN)), x2=x(log2(RATIO_MAX)),
               stroke=AXIS if heavy else GRID,
               stroke_width=1.4 if heavy else 1,
               stroke_dasharray=None if heavy else "2 3"),
            el("text", f"{tick:g}x", x=px, y=y(log2(RATIO_MIN)) + 15,
               class_="tick", text_anchor="middle"),
            el("text", f"{tick:g}x", x=x(log2(RATIO_MIN)) - 7, y=py + 4,
               class_="tick", text_anchor="end"),
        ]
    return parts


def _radius(total, largest):
    """Dot radius from population, by area."""
    return DOT_MIN_R + (DOT_MAX_R - DOT_MIN_R) * (total / largest) ** 0.5


def _dodge(anchors):
    """Nudge labels apart vertically, keeping their order and their anchor.

    Five of the six harmed groups on the headline tier land inside one cluster,
    and unnudged their labels overprint into an unreadable smear -- which is
    the one part of the chart a reader most needs to be able to read.
    """
    placed = []
    for anchor_y in sorted(anchors):
        if placed and anchor_y - placed[-1] < LABEL_GAP:
            placed.append(placed[-1] + LABEL_GAP)
        else:
            placed.append(anchor_y)
    return dict(zip(sorted(anchors), placed))


def _scatter_dots(rows, x, y):
    """One dot per group, labelled only where it lands in the losing corner."""
    largest = max(r.total for r in rows)
    placed, dots, labels = [], [], []
    for row in sorted(rows, key=lambda r: -r.total):
        px, py = x(log2(row.loss_ratio)), y(log2(row.gain_ratio))
        dots.append(el("circle", children=[el("title", _dot_title(row))],
                       cx=px, cy=py, r=_radius(row.total, largest),
                       fill=row.colour, fill_opacity=0.8,
                       stroke="var(--page)", stroke_width=1.2))
        if row.harmed:
            placed.append((py, px, row))
    dodged = _dodge([p[0] for p in placed])
    for py, px, row in placed:
        ty = dodged[py]
        labels.append(el("line", x1=px + 5, y1=py, x2=px + 17, y2=ty - 3,
                         stroke=row.colour, stroke_width=1, stroke_opacity=0.5))
        labels.append(el("text", row.label, x=px + 19, y=ty, class_="dot-label",
                         fill=row.colour))
    return dots + labels


def churn_scatter(rows):
    """Four facets: loss ratio against gain ratio, one panel per tier."""
    cols, gap = 2, 34
    cell = PANEL + PANEL_PAD
    width = cols * cell + gap
    height = 2 * cell + gap + 30
    facets = []
    for index, tier in enumerate(SCATTER_TIERS):
        ox = (index % cols) * (cell + gap) + PANEL_PAD
        oy = (index // cols) * (cell + gap) + 34
        x = _ratio_axis(ox, ox + PANEL)
        y = _ratio_axis(oy + PANEL, oy)
        tier_rows = [r for r in rows
                     if r.tier == tier
                     and r.loss_ratio is not None and r.gain_ratio is not None]
        facets.append(group(_scatter_frame(x, y, TIER_LABEL[tier])
                            + _scatter_dots(tier_rows, x, y)))
    axis_titles = [
        el("text", "loses service at … the county rate  →",
           x=width / 2, y=height - 4, class_="axis-title", text_anchor="middle"),
        el("text", "gains service at … the county rate  →", x=0, y=0,
           class_="axis-title", text_anchor="middle",
           transform=f"translate(12,{height / 2}) rotate(-90)"),
    ]
    return sp.svg(width, height, facets + axis_titles, klass="chart",
                  title="Loss ratio against gain ratio, by group and tier")


# --------------------------------------------------------------------------
# chart 2: where the trade landed, in points of each group's own population
# --------------------------------------------------------------------------

ROW_H = 25
LABEL_W = 132
DOT_PANEL = 258
CHANGE_MIN, CHANGE_MAX = -7.6, 10.4
CHANGE_TICKS = [-5, 0, 5]
DOT_TIERS = [ANY_BUS, WEEKEND_HOURLY]


def _county_change(rows, tier, universe):
    """The county's own point change on a tier -- the line groups are read against."""
    for r in rows:
        if (r["question"] == REGION and r["tier"] == tier
                and r["group"] == BASELINE_GROUP.get(universe)):
            return float(r["pct_point_change"])
    return None


def _change_panel(ordered, tier, county, ox, oy):
    """One column: a dot per group at its point change, with the county line."""
    x = sp.Scale(CHANGE_MIN, CHANGE_MAX, ox, ox + DOT_PANEL)
    bottom = oy + len(ordered) * ROW_H
    parts = [el("text", TIER_LABEL[tier], x=ox, y=oy - 24, class_="facet-title")]
    for tick in CHANGE_TICKS:
        parts += [
            el("line", x1=x(tick), x2=x(tick), y1=oy - 8, y2=bottom,
               stroke=AXIS if tick == 0 else GRID,
               stroke_width=1.4 if tick == 0 else 1,
               stroke_dasharray=None if tick == 0 else "2 3"),
            el("text", f"{tick:+g}" if tick else "0", x=x(tick), y=bottom + 15,
               class_="tick", text_anchor="middle"),
        ]
    if county is not None:
        parts += [
            el("line", x1=x(county), x2=x(county), y1=oy - 8, y2=bottom,
               stroke="var(--ink)", stroke_width=1, stroke_dasharray="4 3"),
            el("text", f"county {county:+.1f}", x=x(county), y=oy - 12,
               class_="county-mark", text_anchor="middle"),
        ]
    for index, row in enumerate(ordered):
        cy = oy + index * ROW_H + ROW_H / 2
        parts += [
            el("line", x1=x(0), x2=x(row.pct_point_change), y1=cy, y2=cy,
               stroke=row.colour, stroke_width=2, stroke_opacity=0.35),
            el("circle", children=[el("title",
               f"{row.label}: {row.pct_now:.1f}% to {row.pct_proposed:.1f}% "
               f"({row.pct_point_change:+.1f} points)")],
               cx=x(row.pct_point_change), cy=cy, r=5, fill=row.colour,
               stroke="var(--page)", stroke_width=1.2),
            el("text", f"{row.pct_point_change:+.1f}",
               x=x(row.pct_point_change) + (10 if row.pct_point_change >= 0 else -10),
               y=cy + 4, class_="value",
               text_anchor="start" if row.pct_point_change >= 0 else "end"),
        ]
    return parts


def change_dots(rows, raw_rows):
    """Two columns of point change, groups in one shared, sorted row order."""
    by_tier = {t: {r.group: r for r in rows if r.tier == t} for t in DOT_TIERS}
    ordered = sorted(by_tier[ANY_BUS].values(), key=lambda r: r.pct_point_change)
    gap = 78
    width = LABEL_W + 2 * DOT_PANEL + gap + 24
    top = 58
    height = top + len(ordered) * ROW_H + 34
    parts = []
    for index, row in enumerate(ordered):
        cy = top + index * ROW_H + ROW_H / 2
        parts += [
            el("rect", x=0, y=top + index * ROW_H, width=width, height=ROW_H,
               fill="var(--stripe)" if index % 2 else "none"),
            el("text", row.label, x=LABEL_W - 12, y=cy + 4, class_="row-label",
               text_anchor="end"),
        ]
    for column, tier in enumerate(DOT_TIERS):
        ordered_here = [by_tier[tier][r.group] for r in ordered]
        parts += _change_panel(ordered_here, tier,
                               _county_change(headline(raw_rows), tier, "people"),
                               LABEL_W + column * (DOT_PANEL + gap), top)
    return sp.svg(width, height, parts, klass="chart",
                  title="Change in coverage, in points of each group's own population")


def colour_legend():
    """Which hue is which question -- and which universe it counts."""
    universes = {"EQUITY-RACE": "people", "EQUITY-AGE": "people",
                 "EQUITY-DISABILITY": "people", "EQUITY-INCOME": "households",
                 "EQUITY-VEHICLE": "households", "EQUITY-LANGUAGE": "households"}
    items = []
    for question, colour in QUESTION_COLOUR.items():
        items.append(
            f'<li><span class="swatch" style="background:{colour}"></span>'
            f'{escape(QUESTION_LABEL[question])} '
            f'<em>· {escape(universes[question])}</em></li>')
    return '<ul class="legend">' + "".join(items) + "</ul>"


# --------------------------------------------------------------------------
# the page
# --------------------------------------------------------------------------

CSS = """
/* Light is the base palette; the two blocks below redefine only the tokens, so
   a colour never has its single definition inside a theme block. The inline
   SVG reads the same tokens, which is why the charts follow the page. */
:root {
  --page:#fff; --ink:#111827; --muted:#5b6470; --rule:#e3e6ea; --axis:#9aa3ad;
  --harm:#fdecec; --stripe:#f6f7f9; --note-bg:#fdfaf1; --note-edge:#d8c48a;
  --code-bg:#f3f4f6; --body:#374151;
  --q-race:#1f6feb; --q-age:#c2410c; --q-income:#15803d;
  --q-vehicle:#7c3aed; --q-disability:#0e7490; --q-language:#a16207;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --page:#14171c; --ink:#e9ecf1; --muted:#9aa3ae; --rule:#2b3038; --axis:#5d6775;
    --harm:#3a2224; --stripe:#191d23; --note-bg:#221e14; --note-edge:#7a6534;
    --code-bg:#22262d; --body:#c6ccd5;
    --q-race:#6ba5ff; --q-age:#f59b6b; --q-income:#5ec97f;
    --q-vehicle:#b494f7; --q-disability:#4fc3d9; --q-language:#d9b455;
  }
}
:root[data-theme="dark"] {
  --page:#14171c; --ink:#e9ecf1; --muted:#9aa3ae; --rule:#2b3038; --axis:#5d6775;
  --harm:#3a2224; --stripe:#191d23; --note-bg:#221e14; --note-edge:#7a6534;
  --code-bg:#22262d; --body:#c6ccd5;
  --q-race:#6ba5ff; --q-age:#f59b6b; --q-income:#5ec97f;
  --q-vehicle:#b494f7; --q-disability:#4fc3d9; --q-language:#d9b455;
}
* { box-sizing:border-box; }
/* The system stack is a choice, not a default: this file is a repo artifact
   that has to render identically offline, and a webfont would be the page's
   only network call. */
body { margin:0; padding:0; color:var(--ink); background:var(--page);
  font:16px/1.62 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,
  "Helvetica Neue",Arial,sans-serif;
  font-variant-numeric:tabular-nums; }

/* The argument reads in a 68-character column; the evidence -- charts, tables,
   the headline figures -- breaks out wider, because a chart squeezed to
   reading width stops being readable at exactly the point it matters. */
main { display:grid; padding:52px 24px 80px; column-gap:0;
  grid-template-columns:minmax(0,1fr) min(68ch,100%) minmax(0,1fr); }
main > * { grid-column:2; }
main > figure, main > .scroller, main > .numbers {
  grid-column:1 / -1; margin-inline:auto; }
/* Each kind of evidence gets the width it actually needs. The charts want
   room; a three-column table stretched to 1060px is mostly the gap between a
   place name and its number. */
/* Capped near the charts' own drawing width (~700-750 px). Beyond that the
   SVG upscales and every label with it, so the type stops matching the page. */
main > figure { width:min(100%,860px); }
main > .numbers { width:min(100%,880px); }
main > .scroller { width:min(100%,760px); }

h1 { font-size:clamp(1.75rem,1.2rem + 2vw,2.15rem); line-height:1.18;
  margin:0 0 .45em; letter-spacing:-.018em; text-wrap:balance; }
h2 { font-size:1.16rem; margin:2.7em 0 .3em; letter-spacing:-.008em;
  text-wrap:balance; }
p { margin:0 0 1em; }
.standfirst { font-size:1.12rem; color:var(--body); }
/* `margin-block`, never the `margin` shorthand: these blocks are centred on the
   reading column by `margin-inline:auto` above, and a shorthand here resets that
   axis to 0 -- `.figure` outranks `main > figure`, so the charts would hang off
   the left page edge while the tables beside them stayed centred. */
.figure { margin-block:1.2em 0; }
/* Wide charts scroll inside their own box; the page body never scrolls sideways. */
.figure > svg { min-width:520px; }
.scroller { overflow-x:auto; }
.chart { display:block; width:100%; height:auto; overflow:visible; }
.facet-title { font:600 13px sans-serif; fill:var(--ink); }
.tick { font:11px sans-serif; fill:var(--muted); }
.dot-label { font:600 11px sans-serif; paint-order:stroke; stroke:var(--page);
  stroke-width:3px; stroke-linejoin:round; }
.axis-title { font:11.5px sans-serif; fill:var(--muted); }
.row-label { font:12.5px sans-serif; fill:var(--ink); }
.value { font:11px sans-serif; fill:var(--body); paint-order:stroke;
  stroke:var(--page); stroke-width:3px; stroke-linejoin:round; }
.county-mark { font:10px sans-serif; fill:var(--ink); paint-order:stroke;
  stroke:var(--page); stroke-width:3px; stroke-linejoin:round; }
.caption { font-size:.88rem; color:var(--muted); margin:.5em auto 1.9em;
  padding-top:.7em; border-top:1px solid var(--rule); max-width:68ch; }
.table-note { font-size:.88rem; color:var(--muted); margin:.7em 0 2em; }
.legend { list-style:none; display:flex; flex-wrap:wrap; gap:.4em 1.3em;
  padding:0; margin:.2em 0 0; font-size:.85rem; color:var(--body); }
.legend em { color:var(--muted); font-style:normal; }
.swatch { display:inline-block; width:11px; height:11px; border-radius:50%;
  margin-right:.4em; vertical-align:-1px; }
.numbers { display:flex; flex-wrap:wrap; gap:1px; background:var(--rule);
  border:1px solid var(--rule); margin-block:1.6em 0; }
.numbers div { background:var(--page); padding:1em 1.2em; flex:1 1 200px; }
.numbers b { display:block; font-size:1.4rem; letter-spacing:-.02em;
  line-height:1.25; white-space:nowrap; }
.numbers span { display:block; margin-top:.3em; font-size:.79rem;
  color:var(--muted); line-height:1.45; letter-spacing:.005em; }
.note { border-left:3px solid var(--note-edge); background:var(--note-bg);
  padding:.9em 1.1em; margin:1.6em 0 0; font-size:.92rem; }
.note p:last-child { margin:0; }
.note h2 { margin-top:0; font-size:1rem; }
footer { margin-top:3em; padding-top:1em; border-top:1px solid var(--rule);
  font-size:.85rem; color:var(--muted); }
table { border-collapse:collapse; width:100%; min-width:420px; margin:1.2em 0 0;
  font-size:.92rem; }
th, td { text-align:left; padding:.42em .7em; border-bottom:1px solid var(--rule); }
thead th { font-size:.8rem; text-transform:uppercase; letter-spacing:.04em;
  color:var(--muted); font-weight:600; border-bottom:1px solid var(--axis); }
td.num, th:not(:first-child) { text-align:right; font-variant-numeric:tabular-nums; }
tbody tr:nth-child(even) { background:var(--stripe); }
code { font-size:.9em; background:var(--code-bg); padding:.1em .35em;
  border-radius:3px; }
"""


def key_numbers(rows):
    """The three figures the brief is accountable to, straight from the CSV."""
    picked = {}
    for r in headline(rows):
        if r["question"] == REGION and r["group"] == "all_residents":
            picked[r["tier"]] = r
    any_bus, hourly = picked[ANY_BUS], picked[WEEKEND_HOURLY]
    cards = [
        (f'{float(any_bus["pct_now"]):.1f}% → {float(any_bus["pct_proposed"]):.1f}%',
         "Allegheny residents with any bus within 400 m of home"),
        (f'{float(hourly["pct_now"]):.1f}% → {float(hourly["pct_proposed"]):.1f}%',
         "…with an hourly bus on a weekend"),
        (f'−{int(any_bus["lost"]):,} / +{int(any_bus["gained"]):,}',
         "people who lose, and gain, any bus at all"),
    ]
    return '<div class="numbers">' + "".join(
        f"<div><b>{escape(big)}</b><span>{escape(small)}</span></div>"
        for big, small in cards) + "</div>"


# --------------------------------------------------------------------------
# where it landed, on named ground
# --------------------------------------------------------------------------

PLACE_ROWS = 12


def place_label(place):
    """What to print for a block group that took no name.

    A block group more than `LABEL_RADIUS_M` from a labelled stop stays
    unnamed rather than borrowing a neighbourhood it has no claim to. Saying
    so is better than calling it "unnamed ground", because the absence is the
    finding: four of the six sit on Perry Highway around Wexford, where PRT
    has no stop within 3 km today and the plan puts ten. They have no name to
    borrow for the same reason they are gaining a bus.
    """
    return place or f"no stop within {ap.LABEL_RADIUS_M // 1_000} km today"


def place_table(rolled, key, *, side, unit, columns):
    """The places holding the most of one kind of change, as a table.

    Both sides are always shown for every place listed. A place that loses 108
    car-free households and gains 111 back has not been cut, and a table with
    only the losing column would say it was.
    """
    ranked = sorted((e for e in rolled if e[f"{key}_{side}"] >= 1),
                    key=lambda e: -e[f"{key}_{side}"])
    total = sum(e[f"{key}_{side}"] for e in rolled)
    shown = ranked[:PLACE_ROWS]
    head = "".join(f"<th>{escape(c)}</th>" for c in columns)
    body = ""
    for entry in shown:
        body += (f"<tr><td>{escape(place_label(entry['place']))}</td>"
                 f"<td class=\"num\">{entry[f'{key}_lost']:,.0f}</td>"
                 f"<td class=\"num\">{entry[f'{key}_gained']:,.0f}</td></tr>")
    rest = sum(e[f"{key}_{side}"] for e in ranked[PLACE_ROWS:])
    return (f'<div class="scroller"><table><thead><tr><th>Place</th>{head}</tr>'
            f"</thead><tbody>{body}</tbody></table></div>"
            f'<p class="table-note">These {len(shown)} places hold '
            f"{sum(e[f'{key}_{side}'] for e in shown):,.0f} of the "
            f"{total:,.0f} {unit} that {side} it; a further {rest:,.0f} are "
            f"spread across {len(ranked) - len(shown)} more places. Full list, "
            f"block group by block group, in <code>data/equity_places.csv</code>."
            "</p>")


def page_body(rows):
    """The brief's prose, with the generated evidence dropped into its slots.

    The words live in `equity_brief_body.html` rather than in this file, so
    editing them is editing a document rather than a Python string literal. It
    is a real HTML fragment -- openable, diffable, and free of any templating
    syntax beyond the `<!--slot:name-->` comments, which cannot collide with
    prose the way `{}` or `$` would.
    """
    ratio_rows = ratios(rows)
    rolled = ap.by_place(ap.read_located())
    return fill_slots(BODY_HTML.read_text(encoding="utf-8"), {
        "key-numbers": lambda: key_numbers(rows),
        "chart-churn": lambda: churn_scatter(ratio_rows),
        "chart-change": lambda: change_dots(ratio_rows, rows),
        "colour-legend": colour_legend,
        "table-car-free": lambda: place_table(
            rolled, "zero_vehicle", side="lost", unit="car-free households",
            columns=["Lose every bus", "Gain a bus"]),
        "table-gained": lambda: place_table(
            rolled, "residents", side="gained", unit="residents",
            columns=["Lose every bus", "Gain a bus"]),
    })


SLOT = re.compile(r"<!--slot:([a-z-]+)-->")


def fill_slots(template, builders):
    """Replace every `<!--slot:name-->` with what `builders[name]` returns.

    Raises on a slot with no builder and on a builder with no slot, because
    both failures are silent otherwise: the first leaves an HTML comment where
    a chart should be, and the second drops a chart off the page entirely.
    """
    wanted = set(SLOT.findall(template))
    if wanted - builders.keys():
        raise KeyError(f"{BODY_HTML.name} asks for unknown slots: "
                       f"{sorted(wanted - builders.keys())}")
    if builders.keys() - wanted:
        raise KeyError(f"{BODY_HTML.name} has no slot for: "
                       f"{sorted(builders.keys() - wanted)}")
    return SLOT.sub(lambda m: builders[m.group(1)](), template)


def _html(body, *, theme=None, extra_css="", top=""):
    root = f' data-theme="{theme}"' if theme else ""
    return (f'<!doctype html>\n<html lang="en"{root}>\n<head>\n'
            '<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            "<title>Who gains and who loses under the Bus Line Refresh</title>\n"
            f"<style>{CSS}{extra_css}</style>\n</head>\n<body>\n{top}"
            f"<main>\n{body}</main>\n</body>\n</html>\n")


def document(body):
    """The standalone file. Follows the reader's own light/dark setting."""
    return _html(body)


def app_page(body):
    """The same brief as a page of the map app, at `/findings`.

    Two differences from the standalone file, both about belonging to a site
    rather than sitting in a repo. The theme is pinned dark, because the map
    is dark-only and a light document opening off it reads as a different
    site. And it gets a bar back to the map, since the map is the site and a
    page with no way back is a dead end.
    """
    return _html(body, theme="dark", extra_css=APP_CSS, top=SITE_BAR)


# The map app's own accent blue (index.html `--now`), so the one interactive
# thing on this page is the colour the rest of the site uses for interaction.
APP_CSS = """
.sitebar { position:sticky; top:0; z-index:5; display:flex; flex-wrap:wrap;
  align-items:baseline; gap:6px 14px; padding:11px 24px;
  background:var(--page); border-bottom:1px solid var(--rule); }
.sitebar a { color:#4aa3ff; text-decoration:none; font-size:13px; }
.sitebar a:hover { text-decoration:underline; }
.sitebar a:focus-visible { outline:2px solid #4aa3ff; outline-offset:3px;
  border-radius:3px; }
.sitebar .where { color:var(--muted); font-size:13px; }
main { padding-top:34px; }
"""

SITE_BAR = ('<nav class="sitebar"><a href="/">← Back to the map</a>'
            '<span class="where">Bus Line Refresh — findings</span>'
            "</nav>\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--fragment", action="store_true",
                        help="emit the body and stylesheet only, on stdout")
    args = parser.parse_args()

    rows = load()
    body = page_body(rows)
    if args.fragment:
        # Keep the <main> wrapper: the whole layout is `main > *` grid
        # placement, and a fragment without it loses the reading column.
        sys.stdout.write(f"<style>{CSS}</style>\n<main>{body}</main>\n")
        return

    OUT_HTML.write_text(document(body), encoding="utf-8")
    APP_HTML.write_text(app_page(body), encoding="utf-8")
    charted = {r.group for r in ratios(rows)}
    print(f"wrote {OUT_HTML.relative_to(OUT_HTML.parent.parent)} "
          f"-- {len(charted)} groups, {len(SCATTER_TIERS)} tiers, "
          f"{OUT_HTML.stat().st_size / 1024:.0f} KB")
    print(f"wrote {APP_HTML.relative_to(APP_HTML.parents[4])} "
          f"-- the same brief as the app's /findings page")


if __name__ == "__main__":
    main()
