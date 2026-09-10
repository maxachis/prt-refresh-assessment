# The stop marks outlive the click that drew them

Clicking a point drew a walk circle and both networks' stops around it, and
nothing ever erased them: switching to Travel Time and clicking elsewhere left
the old circle and dots on screen beside the new journey.
Fixed 2026-09-10, awaiting close — the marks now belong to the click that drew
them and to a view that asks a walk-radius question, and leave when either
stops being true.

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

## How it was fixed

Max asked for it on 2026-09-10, ahead of the tooltip defect it turned out to be
half of ([`the-pin-mark-hides-the-dot-underneath-it.md`](the-pin-mark-hides-the-dot-underneath-it.md)):
stale marks shadow the dots under them, hover and all, somewhere the reader has
moved on from.

The rule taken, of the three the section above weighed: **the marks belong to
the click that drew them AND to a view with a walk radius**, and they come back
on returning to one, because the answer behind them is still the current
answer. So they are cleared on a view without a radius (Streets, Travel time,
Places) and redrawn on returning to one, and cleared the moment a new click
starts rather than when its answer lands — a question with no answer yet has no
marks. `mapview.clearPlace` empties all four sources together, the circle, the
two stop inventories and the leaders between moved poles; `main.syncPlaceMarks`
owns the decision, and `main.marks` holds what they were drawn from, including
**the radius they were drawn at** rather than the one now selected, which is
what the pin key already said out loud.

The one behaviour deliberately given up is the circle staying under a drawn
journey, which the section above called arguably useful. It is a walk radius
from another view's question, and the journey draws its own walk legs.

`mapview.test.ts` pins the clear across all four sources, and pins which views
have a radius at all.
