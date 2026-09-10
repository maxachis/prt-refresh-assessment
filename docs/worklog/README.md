# Worklog

Durable records of open items — things noticed outside whatever task was
running, that outlive the session that found them: an open question, a decision
owed, a defect deliberately not fixed, a conclusion nobody should have to
re-derive.

One file per item. Each opens with a two-line lede — the observation in one
sentence, where it stands in one — then whatever body the item deserves:
evidence with commands and file references, why it matters, approaches
considered and *who* rejected them, and the resolution once it lands.

Not here: anything found and fixed in the same change (that reasoning belongs
in a comment at the line and in the commit), passing thoughts, and anything
someone outside the repo needs to act on (that goes to the tracker, with the
entry linked rather than copied).

New facts get appended *and* the stale claims at the top rewritten in the same
pass — a reader who stops halfway down must not be misinformed.

| Entry | Status |
|---|---|
| [Origin-to-destination travel time, before and after](origin-destination-travel-time.md) | built, awaiting close — BASE_CAMP question owed |
| [The synthesised transfer radius is not neutral between the two networks](transfer-radius-favours-one-network.md) | open, decision owed |
| [A township is not a point, and the travel-time layer treats it as one](one-point-cannot-represent-a-township.md) | open, decision owed |
| [A T station reads as a bare number in a drawn itinerary](rail-stops-have-no-name-in-a-journey.md) | open, not fixed |
| [A walk is drawn — and timed — straight through the blocks](walks-are-drawn-and-timed-in-straight-lines.md) | fixed, awaiting close — two judgement calls inside the fix are Max's to overturn |
| [The last walk doglegs via a bus stop the rider never uses](the-last-walk-doglegs-via-a-stop-nobody-boards.md) | open, decision owed |
| [A stairway is timed as though it were level ground](stairways-are-timed-as-though-they-were-level.md) | open, decision owed |
| [The ten on-demand zones are retracted, figure and map layer both](the-on-demand-zones-are-retracted.md) | fixed, awaiting close — retracted; whether the retraction needs to travel is Max's |
| [The surface counts ground, not people](the-surface-counts-ground-not-people.md) | **closed 2026-08-29 by Max** — built as the key's Ground/People switch; the wording question it raised lives on its own entry |
| [The site has two numbers that look like people](the-site-has-two-numbers-that-look-like-people.md) | open, wording decision owed — raised by Max |
| [The map counts places, not riders](the-map-counts-places-not-riders.md) | fixed, awaiting close — built as the legend's Riders switch; a BASE_CAMP question ID is owed |
| [The deploy box runs out of memory building the database](the-deploy-box-runs-out-of-memory-building-the-database.md) | open, decision owed — unblocked by a hand-added swapfile the repo does not know about |
| [The stop marks outlive the click that drew them](stop-marks-outlive-the-click-that-drew-them.md) | open, not fixed |
| [The panel keeps the Places list after leaving the Places view](the-panel-keeps-the-places-list-after-leaving-places.md) | open, not fixed |
| [The place number has no view of its own](the-place-number-has-no-view-of-its-own.md) | open, decision owed — raised by Max |
| [Two scripts now name a place differently](two-scripts-now-name-a-place-differently.md) | open, deliberate and scoped — travel time still names by nearest stop |
| [The panel's heading names the point by the lowest stop id](the-panel-names-the-point-by-the-lowest-stop-id.md) | open, not fixed — wrong neighbourhood on 18% of clicks, wrong municipality on 11%; raised by a reader |
| [Two distances to the replacement stop](two-distances-to-the-replacement-stop.md) | open, decision owed — the map says walk, the published CSV says straight line |
| [The service map has findings nothing publishes](the-service-map-has-findings-nothing-publishes.md) | open, decision owed — whether per-place bus service becomes a published answer |
| [A deleted stop is not a lost bus, and nothing counts which is which](consolidation-is-not-counted-apart-from-loss.md) | open, partly answered — the map counts and draws the split from 2026-09-09 (Stop-by-stop's red cross); the published CSV and two answer documents still do not; raised by Max, corrected after a reader's report |
| [A boardings figure the pipeline flags as wrong still gets counted](a-flagged-wrong-boardings-figure-still-gets-counted.md) | open, decision owed — 119 reused stop codes; flagged in the CSV, summed everywhere downstream |
| [A renumbered stop falls out of the measured universe](a-renumbered-stop-falls-out-of-the-measured-universe.md) | fixed, awaiting close — 533 served stops were measured nowhere, 40 of them removals; raised by PPT |
| [WordPress sandboxes an embed it does not trust, and MapLibre goes blank in it](wordpress-sandboxes-the-embed-and-maplibre-goes-blank.md) | **closed 2026-09-02 by Max** — oEmbed provider built, measured against WordPress, and removed; kept for the measurement |
| [122 stops sit on an island of the walk network](some-stops-sit-on-an-island-of-the-walk-network.md) | open, not fixed |
| [The published travel times to Oakland lagged a build behind the anchor](travel-times-to-oakland-lagged-the-narrower-anchor.md) | fixed, awaiting close — rebuilt 2026-09-05; kept for what the one coupling test does *not* catch |
| [The change ramp fails red-green colour blindness](the-change-ramp-fails-red-green-colour-blindness.md) | fixed, awaiting close — gain half moved to violet and pinned by a test; shape redundancy deferred, and a tritanopia trade-off is Max's to overturn |
| [A new stop the plan adds usually draws no dot of its own](a-new-stop-the-plan-adds-draws-no-dot.md) | fixed, awaiting close — the added-stop mark counts poles, not locations; all 481 draw with no pin; raised by PRT |
| [A stale local database fails the tests as though the code broke](a-stale-local-database-fails-the-tests-as-a-code-bug.md) | fixed, awaiting close — rebuilt 2026-09-08; nothing still distinguishes an old build from a regression |
| [The brief's six demographic colours are not colour-blind safe](the-brief-charts-reuse-six-hues-two-of-which-collide.md) | open, not fixed — two chart series collide at ΔE 2.9; categorical, so lower risk than the map ramp was |
| [The marks around the pin borrow the dot palette](the-pin-marks-borrow-the-dot-palette.md) | fixed, awaiting close — both marks left the bucket palette 2026-09-09: the core says today (ink or empty), the ring says the plan stops here |
| [A pole the plan drops quietly has no mark of its own](a-pole-the-plan-drops-quietly-has-no-mark.md) | open, decision owed — 434 poles are retired without a cross because the plan serves a stop within 150 m; 336 of them read as a dot whose neighbours have a ring, and 376 have nothing to draw a leader to; raised by Max |
| [The dot key lost its caveats](the-dot-key-lost-its-caveats.md) | fixed, awaiting close — the three footnotes came out 2026-09-10; the infill one no longer applies now the mark counts poles, the other two replaced by nothing |
