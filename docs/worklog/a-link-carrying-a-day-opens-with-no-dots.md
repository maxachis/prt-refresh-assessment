# A link that names a day type opens the map with no dots at all

Any URL carrying `day=` — which is every link the app writes for itself —
opens with the change layer never fetched, so the map draws a bare basemap and
the key is empty until the reader touches the radius or the day switch.
Fixed 2026-09-10, awaiting close — the opening fetch is unconditional now;
Max called it while the finding was still on screen.

## What was observed

Locally, against `uv run refresh serve`, watching `/api/change` in the network
log on a cold load:

| Opening URL | `/api/change` fetched? |
|---|---|
| `/` | yes |
| `/?view=dots` | yes |
| `/?radius=400` | yes |
| `/?map=40.4406,-79.9959,15.00` | yes |
| `/?day=weekday` | **no** |
| `/?day=saturday` | **no** |

The visible result is a map of streets with no dots, no crosses and an empty
key — no error in the console, because nothing failed; the fetch simply never
happened.

## Why

`applyOpening` (`frontend/main.ts:678`) returns whether opening the link has
already fetched the citywide layer, so that the caller's own opening fetch does
not duplicate it:

```ts
if (s.day) loadedChangeLayer = press(CONTROL.day, s.day) || loadedChangeLayer;
...
if (!applyOpening(opening)) {
  void loadChangeLayer(map, radius, activeDay()).then(refreshLegend);
}
```

`press` returns whether a button *exists*, not whether pressing it fetched
anything — and the day button's handler (`main.ts:375`) calls `setChangeDay`,
which recolours a layer already in hand. It never fetches. The radius button
next to it does (`main.ts:355`), which is presumably where the assumption came
from; the function's own docstring states it as fact for both.

So the day is the one control that can claim a fetch it did not make, and it
claims it even when the value asked for is the one already pressed.

## Why it matters more than it looks

Every link the app generates carries the day: `toSearch` writes `PARAM.day`
unconditionally (`frontend/urlstate.ts:122`), unlike `weight` and
`surfaceUnit`, which are written only when set. So this is not an edge case
reachable by hand-editing a URL — it is the shape of every shared link, every
embed, and every browser reload after the URL has been synced once.

It was invisible here for the ordinary reason: nobody reloads the page they are
already using, and the first interaction with the radius or day switch repairs
it.

## How it was fixed

Max chose it off the report the same afternoon, and it took the second of the
two options considered: `applyOpening` no longer returns anything, and the
opening fetch always runs. That removes the coupling rather than correcting it
— the return value was a cache of "has the fetch happened" that only one of its
two contributors could actually answer, and the other one was answering anyway.

Duplication is free, which is what makes the simple version viable:
`/api/change?radius=N` goes through `fetchJSONOnce`, so a radius press and the
opening fetch share one promise. Verified — `?radius=150&day=sunday` opens with
exactly one request, for the 150 m layer.

The same six-URL matrix after the change:

| Opening URL | `/api/change` fetched? |
|---|---|
| `/?day=weekday` | yes, once |
| `/?day=saturday` | yes, once — and the key reads "a Saturday" |
| `/?view=dots&day=weekday&map=…` | yes, once |
| `/?radius=150&day=sunday` | yes, once, at 150 m |
| `/?at=40.4406,-79.9959&day=weekday` | yes, once |
| `/` | yes, once |

**No unit test covers this**, and that is the unsatisfying part. `applyOpening`
lives in `main.ts`, which builds a MapLibre map at import time and is reachable
from no vitest file; the evidence above is a browser check run before and after,
not something CI will repeat. The property the fix leans on *is* pinned —
`utils.test.ts` holds `fetchJSONOnce` to one request per URL — but nothing stops
a future change from making the opening fetch conditional again except the
comment at the call site saying why it must not be. Making `main.ts`'s opening
sequence testable is a larger piece of work than this bug justified.

Whether the deployed site was affected was never checked; the fix ships with
whatever goes out next.
