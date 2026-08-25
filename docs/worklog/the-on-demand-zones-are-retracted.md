# The ten on-demand zones are retracted, figure and map layer both

**Observed:** every published claim about microtransit in this repo rests on ten
polygons that exist only inside PRT's Remix project file, are flagged
`isHidden: true` there, do not render on the public map, and appear in no PRT
document or feed — and PPT now says PRT is not including microtransit zones in
this proposal.
**Where it stands:** fixed, awaiting close — Max chose full retraction on
2026-08-25; the figure, the analysis, the CSV and the map layer are gone, and
every citation now carries a retraction note.

> PPT's correction — that PRT is not including microtransit zones in the latest
> proposal — was relayed by Max on 2026-08-25. Stated by Max; not verifiable
> from the repo.

## What the evidence says

Five independent checks, run 2026-08-25, all point the same way.

1. **Hidden in the plan file.** All ten zones carry `isHidden: true` *and*
   `hideZoneName: true` in `scenarios[0].onDemandZones` of
   `data/raw/remix_project.json`. Not one is visible.
2. **Hidden on the live map.** Max confirms the zones do not display at
   `platform.remix.com/project/82ea6210`, which is what those two flags mean in
   the viewer.
3. **Absent from the timetable feed.** `data/raw/proposed_gtfs/` carries 95 bus
   routes, 3 light rail, 2 inclines, and none of the GTFS-Flex machinery a
   demand-responsive zone needs — no `locations.geojson`, no
   `location_groups.txt`, no `booking_rules.txt`, no `route_type` 715. This is
   weak evidence on its own: plain GTFS cannot express a zone anyway, and PRT
   did not use Flex. It stops being weak in company with the rest.
4. **Absent from every PRT public document.** `pdftotext` over the three
   frequency-and-hours PDFs, `exhibit_a.pdf`, and `findmyroute.html` returns no
   match for "on-demand", "microtransit", "shuttle", "van", or "flex". Nothing
   PRT put in front of the public mentions them.
5. **Not from a different project.** The file is the final network's own —
   `name: "Bus Line Refresh - Proposed Final Network"`, `createdAt`
   2026-07-31, `updatedAt` 2026-08-17, the publication date. So "artifact of an
   earlier build" is the wrong shape: these are objects *inside the current
   project* that were switched off rather than deleted, which is what leftover
   planning scaffolding looks like in a tool where hiding is one click and
   deleting loses the work.

The one fact that cuts the other way: the zones carry real modelling — a demand
estimate, a vehicle `supply` of 1–3, an `hourlyCost` of $80, hours of 7am–9pm
weekdays and 8am–8pm weekends, and per-day `modelResults`. Someone did the work.
That makes them a considered idea; it does not make them a proposal, and a
costed option that was modelled and then shelved fits every observation above at
least as well.

## Why it matters

`analyze_coverage_area.py` is the only consumer, and its section E is published
in five places: `FINDINGS.md:332`, `docs/answers/COVERAGE-CHANGE.md:165`,
`METHOD-coverage.md:171`, `STOP-LOST-SERVICE.md:107`, and
`docs/answers/README.md:133` — all quoting **23% of the lost area (18.3 km²)
falls inside a proposed on-demand zone**. The web app drew the zones over every
map layer (`frontend/zones.ts`, `build_webdb.py`), and `CLAUDE.md` stated the
purpose as keeping ground offered a van from reading as a plain loss. All of
that is removed — see the resolution below.

If PPT is right, the direction of the error is the bad one: a softener applied
to a loss that in fact has no softener. Every one of those five sentences makes
the plan look better than it is, in a document written for public comment.

The repo has been honest in the small: `data/coverage_area_ondemand.csv` carries
a `hidden_in_remix` column, `DATA_SOURCES.md:167` warns that nothing checks the
zones against a published PRT document, and the area figure is reported beside
the losses rather than netted off. That is why this is recoverable. It is not
why it is fine — the caution lives in the method notes while the 23% travels
alone into the findings.

## Approaches considered

- **Retract** — drop section E and the map layer, note that zones were modelled
  and hidden. Safest; loses a real finding if PRT does propose them. **Chosen by
  Max, 2026-08-25**, over the recommendation's weaker form: rather than
  retract-and-restore-if-confirmed, remove the microtransit material from the
  site entirely.
- **Footnote** — keep the number, attach PPT's correction to the five citations.
  Rejected by Max: it leaves a possibly void figure in circulation.
- **Confirm first** — ask PRT, or ask PPT for the provenance of their
  correction, before touching anything. Rejected by Max; the comment period
  closes 2026-09-30 and the error runs in the direction that flatters the plan.

## Resolution

Retracted 2026-08-25. What changed:

- `analyze_coverage_area.py` — section E deleted (`on_demand_zones`,
  `zone_cells`, `in_ring`, `on_demand_report`), and a block in the module
  docstring says why, so the next reader does not restore it.
  `data/coverage_area_ondemand.csv` deleted.
- The app — `/api/zones`, `query.ondemand_layer`, the `ondemand_zone` table and
  its `lost_km2_citywide` meta row, `build_webdb.load_zones`,
  `frontend/zones.ts`, the overlay toggle, its legend note and CSS, the
  `microtransit` caveat in `/api/meta`. Nothing on the site mentions
  microtransit now.
- Tests — `tests/test_ondemand_zones.py` and `frontend/zones.test.ts` deleted.
  293 pytest and 147 vitest pass.
- Prose — retraction notes at all five citations (`FINDINGS.md`,
  `COVERAGE-CHANGE.md`, `METHOD-coverage.md`, `STOP-LOST-SERVICE.md`,
  `answers/README.md` caveat 12), plus `EQUITY-VEHICLE.md`, `ROUTE-51.md`,
  `OUTER-CHARTIERS.md`, `data/README.md`, `DATA_SOURCES.md`, `docs/WEBAPP.md`,
  `CLAUDE.md`, `ingest_blr.py`, `gtfs.py`. Two location answers carried an open
  worry that a zone might soften their losses; both are now resolved in the
  direction of the loss being real.
- [[origin-destination-travel-time]] item 4 — "on-demand zones cannot be
  routed" — closed for the same reason.

The polygons remain in `data/raw/remix_project.json`, because that cache is
verbatim. Nothing reads them.

**Still owed by Max:** whether to tell anyone the 23% figure was in circulation.
It was published in this repo from the coverage-area work until today; if it
reached a PPT comment draft or a conversation, the retraction needs to travel
the same distance the number did.

**The shape of the mistake**, which generalises past this item: a caution was
recorded honestly in the method notes — `DATA_SOURCES.md` said nothing verified
the zones against a published PRT document, and the CSV carried a
`hidden_in_remix` column — while the number derived from them travelled into
the findings alone. A caveat that lives only next to the method does not
restrain the figure once the figure is quotable. The check that was never run
is the cheap one: `isHidden` on all ten was known, and nobody asked what it
would mean if it were load-bearing.
