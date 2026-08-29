# The site has two numbers that look like people

**Observed:** the findings page says 68,989 people lose any bus at all and the
map's key now says the stranded locations carry 488 daily boardings; both read
as "people affected", they are different currencies measured at different ends
of a trip, and nothing on the site says so.
**Where it stands:** open, wording decision owed — and now over three numbers,
not two: [`the-surface-counts-ground-not-people.md`](the-surface-counts-ground-not-people.md)
shipped 2026-08-29, so the map's own key can print residents as well as
boardings. The third number is the same measure as `/findings`' — but the key answers per
day type, so it reads the `WEEKDAYS-ANY-MINIMUM` row (−68,989 / **+20,223**)
where the page quotes `WEEK-ANY-MINIMUM` (−68,989 / **+20,095**). Same loss,
128 more gainers on the weekday reading, because a place that gains only
weekend service counts in a week-any test and not in a weekday one. Both are
correct and they are 128 apart on one site.

> Raised by Max, 2026-08-29, reading the two figures side by side and asking
> whether one is access and the other use.

## The two numbers, and how they differ

| | −68,989 / +20,095 | 488 of 67,619 |
|---|---|---|
| what it counts | residents of census blocks | unlinked boardings |
| measured where | at home | at the stop |
| source | 2020 census blocks, ACS group weights | PRT usage extract, May 2025 |
| both networks? | yes — coverage is computable for a plan | **no** — today's only |
| lives on | `/findings` | the map's key, `?weight=riders` |

Access is roughly "who could ride" and boardings roughly "who does", so the
intuition is sound. Three things break the parallel, and all three are the kind
of thing a reader repeats wrongly:

**They are not nested.** The 488 boardings are not the riding subset of the
68,989 residents. Boardings happen where people get on, and the people getting
on at a Downtown or Oakland stop live somewhere else entirely. Nothing in this
repo counts riders by where they live, and nothing can: the usage extract knows
only the stop.

**Boardings are not people** — unlinked, so a round trip with a transfer is up
to four of them, and up to 30% low by PRT's own disclaimer.

**Only one has a gain side, permanently.** Coverage can be computed for a
network that has not run; ridership cannot. So the coverage figure is a balance
sheet and the ridership figure is a risk register, and putting them in the same
sentence without saying that invites the reading where the plan takes 69,000
people's bus and gives back nothing measurable.

They are not even the same service test: the findings page asks for any bus in
a week, the map's "loses all service" bucket asks about one day type. A place
can lose its weekday bus and keep its Saturday one.

## Why this is worth a decision rather than a caveat

The honest sentence uses both — *"the plan withdraws service from where 69,000
people live, and those places generate under 1% of the system's boardings"* —
and that sentence is the finding, not a hedge. It is also the sentence most
likely to be quoted at PPT with one half missing, in either direction. What is
owed is where it gets said: the findings page, the map's key, both, or a short
"what these numbers are" section neither currently has.

If the population layer ships, the count goes to three people-shaped numbers on
one site — residents with access, residents in view, boardings — and the
decision gets harder, not easier. That is an argument for settling the wording
first and building second.

## Not the same as convention 15

Convention 15 already forbids quoting the boardings figure alone, and
convention 10 already forbids quoting locations, area or population alone.
Both are instructions to whoever writes a finding. This entry is about what the
*site* says to a reader who writes nothing and quotes what is on screen — a
different audience with no access to `CLAUDE.md`.
