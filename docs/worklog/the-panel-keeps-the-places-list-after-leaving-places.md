# The panel keeps the Places list after leaving the Places view

Switching from Places to any other view leaves the ranked place list sitting in
the answer panel, under a heading that now says "Locations", until the reader
clicks the map. Open — noticed while moving the Places controls into the
toolbar, deliberately not fixed in that change.

## What is observed

At 1440x900, `?view=places`, then pressing **Locations** in the toolbar: the
map switches to the dots layer, the state line reads
`Locations · a weekday · 400 m walk`, and the panel below it still lists
Baldwin borough, McCandless township, Ross township and the rest, with the
Places scope note above them. The first click on the map replaces it with the
point answer, so the stale list is only ever visible in the gap between
switching views and asking a question.

The reason is one asymmetry in `showPlaces` (`frontend/main.ts:860`): it calls
`renderPanel()` only when the view is being turned **on**, so nothing repaints
the panel on the way out. Every other view either fills the panel on entry or
clears it — `showJourney` explicitly re-renders when `leaving`, with a comment
saying the panel belongs to the view that filled it, which is exactly the rule
Places is missing.

This predates the toolbar move: that change touched the view handler's control
visibility and the panel's own markup, not the panel's render path, and the
`if (on) renderPanel()` line is untouched in the diff.

## Why it matters, and why it might not

It shows two different questions' answers on one screen with only the small
state line to say which is which, and the Places list is precisely the reading
whose whole reason to exist is that a place figure and a walk-radius figure
were appearing to disagree
([the-place-number-has-no-view-of-its-own](the-place-number-has-no-view-of-its-own.md)).
A stale ranked list under a Locations heading is that same confusion arriving
by a different route.

Against fixing it: the window is short and self-clearing, and the same family
of staleness is already filed one layer up in
[stop-marks-outlive-the-click-that-drew-them](stop-marks-outlive-the-click-that-drew-them.md)
— the marks and the panel are two symptoms of the same missing "the view that
filled it owns it" rule, and a fix that only handles Places would leave the
general case open. Worth deciding whether to fix them together.

## Approaches considered

- **`renderPanel()` on the way out of Places too**, mirroring `showJourney`'s
  `leaving` branch. One line, fixes the observed case; does nothing for the map
  marks. Not done here — this session's task was the control move, and the
  entry above suggests the two want one decision rather than two patches.
