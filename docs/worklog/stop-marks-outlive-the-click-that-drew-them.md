# The stop marks outlive the click that drew them

Clicking a point draws a walk circle and both networks' stops around it, and
nothing ever erases them: switch to Travel Time and click elsewhere, and the
old circle and dots stay on screen beside the new journey. Open — noticed while
adding the key for those marks, deliberately not fixed in that change.

## What is observed

`showPlace` (`frontend/mapview.ts:102`) is the only writer of the `walk`,
`stops-now` and `stops-prop` sources, and it is called from exactly one place:
after a successful `/api/place` answer in `main.load` (`frontend/main.ts:936`).
No code path clears them. So:

- Click in Locations, switch to Travel Time, click a different corner: the
  first point's circle and stop dots are still drawn, now unrelated to both
  the pin and the drawn journey.
- The corridor view has no walk radius at all (convention 11) and still shows
  a walk circle from an earlier click in another view.

A reader has no way to tell that those marks answer an older question. The new
"Around the pin" key in the legend box has the same defect one level up: it is
shown whenever marks have ever been drawn, so it too outlives its click.

## Why it matters, and why it may not

It cannot produce a wrong *number* — the panel and the legend counts come from
the current answer, and the stale marks are decoration. But the marks are the
one piece of evidence on screen for "these are two stop inventories over the
same ground", and pointing that evidence at a place the reader has moved on
from is the kind of thing that gets screenshotted.

Against fixing it hastily: leaving the circle up while the journey draws over
it is arguably useful — the walk legs of a trip start inside it. Whether the
right behaviour is "clear on view change", "clear when the journey view takes a
click", or "redraw the circle for the journey's own origin" is a design call,
not a bug fix, which is why it was not taken as part of a legend change.

## Where it stands

Open. Nobody has been pointed at the URL yet, so this has no audience today.
