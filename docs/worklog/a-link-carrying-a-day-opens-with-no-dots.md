# A link that names a day type opens the map with no dots at all

Any URL carrying `day=` — which is every link the app writes for itself —
opens with the change layer never fetched, so the map draws a bare basemap and
the key is empty until the reader touches the radius or the day switch.
Open, not fixed; found in passing 2026-09-10 while screenshotting an unrelated
change, and present on `main` before it.

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

## Not fixed, and why

Found while verifying a change to the dot hover; the primary goal was that, so
this is filed rather than pursued. The fix is small and in one place — either
have the day press report honestly (it fetches nothing, so it should not count
as a fetch), or make the caller's opening fetch unconditional and let the
radius press stop claiming one too, which removes the coupling rather than
correcting it. The second is worth the extra thought: the return value is a
cache of "has the fetch happened" that only one of its two contributors can
actually answer.

Whether the deployed site is affected has not been checked.
