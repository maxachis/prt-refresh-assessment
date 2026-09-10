# The panel's heading names the point by the lowest stop id, not the nearest stop

**Observed:** the answer panel's heading is supposed to name a clicked point
from the closest labelled stop, and instead names it from whichever labelled
stop within 600 m sorts first by id — so Fifth Avenue at Jumonville, in the
Bluff, is headed "South Oakland" after a stop 567 m away on Second Avenue,
while the residents block further down the same panel says Bluff.
**Where it stands:** open, not fixed — found 2026-09-09 while running down a
reader's report about stops in Uptown. One-line fix, but it changes the heading
on 27% of clicks, so whether to land it before the comment deadline is Max's
call.

## What is wrong

`src/refresh/query.py:1323` walks `stops_within(con, lat, lon, 600, "current")`
and returns the first labelled stop it finds. Its docstring says "(muni, hood)
from the closest labelled stop". But `stops_within` sorts by **stop id**, not
by distance — deliberately, and for a good reason: that is rule 3 in this
module's header, the determinism tie-break that keeps set-iteration order out
of published answers. Every other caller wants that ordering. This one wanted
distance and never asked for it, so the "nearest" in its name has never been
true.

Stop ids sort as text, so the winner is roughly "the lowest-numbered stop
within 600 m", which is uncorrelated with distance and correlated with nothing
a reader can see.

## Evidence

At the corner the reader named — Fifth Avenue and Jumonville Street, Uptown:

```
python3 - <<'PY'
import sqlite3, sys; sys.path.insert(0, 'src')
from refresh import query
con = sqlite3.connect('data/refresh.db'); con.row_factory = sqlite3.Row
for s in query.stops_within(con, 40.43831, -79.97840, 600, 'current')[:4]:
    r = con.execute("SELECT hood FROM stop_place WHERE stop_id = ? "
                    "AND id_name_mismatch = 0", (s[0],)).fetchone()
    print(f"{s[0]:>7} {s[4]:>6.0f} m  {s[1]:<30} {r['hood'] if r else None}")
PY
```

```
  12090    567 m  SECOND AVE + BRADY             South Oakland   <- what the panel prints
  12094    549 m  SECOND AVE + BRADY             South Oakland
  18164    456 m  FIFTH AVE + KIRKPATRICK FS     West Oakland
  20507    232 m  BLVD OF ALLIES + JUMONVILLE    Bluff
```

The truly nearest labelled stop is FIFTH AVE + WYANDOTTE ST at 88 m, and it
says Bluff. So does containment (`query.place_residents` → Bluff), which is
what the "who lives here" block prints — so the panel names two different
neighbourhoods for one point, 200 pixels apart, and the wrong one is the one in
the heading.

Blast radius, over 1,200 randomly sampled current stop locations (seed 0):
**320 of 1,198 clicks — 27% — get a heading from a stop that is not the nearest
one**; the neighbourhood name differs on 18%, and the *municipality* differs on
11%. The stop actually used is a median 466 m further away than the nearest
labelled stop, up to the full 599 m.

## Why it matters more than a cosmetic label

Convention 6 is explicit that a point's place is decided by containment and
never by the nearest stop's label, and that PRT's labels are wrong by up to
40 km in places. This heading is the last thing in the app still deciding a
place from a PRT label at all, and it does not even do that correctly.

The stakes are the reader's trust rather than a published number: nothing
computed reads it, and `place_residents` is keyed by containment, so no figure
moves. But a heading is the first thing on the panel, and a Pittsburgher who is
told their own corner is in South Oakland has been given a reason to disbelieve
the numbers underneath it — which are right. That is how this one surfaced.

## The fix, and the choice inside it

Sorting the candidates by distance inside `nearest_place_label` is one line and
makes the function do what it says. It does not need `stops_within`'s ordering
changed — that ordering is load-bearing for every other caller and must not
move.

The larger question is whether the heading should use a PRT label at all, given
that the boundary containment used four lines below it is the repo's stated
rule for exactly this question. Naming the point by containment would make the
panel self-consistent and would drop the last nearest-stop label from the app;
against that, containment names a *neighbourhood polygon* and PRT's `HOOD` is
occasionally the more colloquial name for a corner. Not decided.

> Whether either change lands before the 2026-09-30 comment deadline is Max's
> call; the heading is on the deployed site at
> <https://prt-refresh.lemaliconsulting.com>.

## Related

- [`two-scripts-now-name-a-place-differently.md`](two-scripts-now-name-a-place-differently.md)
  — the deliberate, bounded divergence between the two naming systems. This is
  not that: this is one system used incorrectly.
