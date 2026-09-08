# The change ramp fails red-green colour blindness

**Observed:** the dot layer and the magnitude surface encode loss as red and
gain as green, so for a red-green dichromat — about 1 in 12 men — the two
buckets either side of no-change collapse to the same appearance, and the
redundancy `change.ts` claims protects them does not, because dot size encodes
magnitude and never direction.
**Where it stands:** fixed 2026-09-08 for the two red-green deficiencies by
moving the gain half of both ramps onto violet, with `frontend/cvd.test.ts`
holding a floor so it cannot drift back, and applied unconditionally rather
than behind a colour-blind mode. Raised by a user. Two things remain open
below: a deliberate tritanopia trade-off, and the shape/hatch redundancy
that would close it.

## What was measured

Viénot 1999 dichromat simulation, CIE76 ΔE between every pair of bucket
colours, over all five palettes the map draws. The script is now
`frontend/cvd.ts`; the finding predates it.

The failure is confined to two layers, and it is the same failure in both:

| Pair | Meaning | ΔE before | ΔE after |
|---|---|---|---|
| `less` ~ `more` (protanopia) | loses some ~ gains some | **7.8** | 58.4 |
| `less` ~ `doubled` (deuteranopia) | loses some ~ gains a lot | 11.6 | 60.8 |
| surface `-4x` ~ `+4x` (protanopia) | worst loss ~ best gain | **9.8** | 54.3 |

ΔE 7.8 is roughly the distance between two shades of one colour. These are
opposite findings rendering as the same mark.

**The other three layers were already safe and were not touched.** The street
layer, the one-seat map and the journey lines use red/blue/grey and
blue/orange; their worst sign-crossing pair stays above ΔE 45 under every
deficiency. The app already owned a colour-blind-safe vocabulary — the two
layers that carry the site's main finding just were not using it.

## Why the existing redundancy did not cover it

`change.ts`'s docstring said:

> COLOUR IS NOT THE ONLY CHANNEL. Size carries the same signal, so the extremes
> are still the extremes for a reader who cannot separate the red from the green.

Half true, and the half that fails is the important one. Sizes run 6 / 4.5 / 3
outward from `same` on **both** sides, so size is symmetric about no-change: it
encodes how big the change is and says nothing about which way it goes. The two
buckets that collapsed under protanopia, `less` and `more`, are both size 3. A
dichromat could read the magnitude of the change and not its direction, on a
site whose entire subject is the direction. That sentence has been rewritten
rather than annotated.

The surface is worse and could not be argued away at all: it is a fill, so it
has no second channel of any kind.

## What was changed

The gain half of both ramps moved from green to violet. `more` `#478a68` →
`#996cb4`, `doubled` `#12a163` → `#bd60e7`, and the surface's "quadrupled or
better" `#0b7a48` → `#961bed`. Losses, `same`, `gone` and `new` are all
untouched.

Violet rather than the obvious blue **because blue was already spoken for**:
`new` is `#0f79c9`, and `GONE_COLOR`/`NEW_COLOR` are imported by the street and
one-seat layers, so a blue gain ramp would either collide with "new service" or
force a repaint of three more modules and their tests. Violet leaves every
shared colour where it is. (Agent-derived; overturnable, and the alternative is
recorded here precisely because it is the one a later session would otherwise
re-derive.)

The three hexes were not hand-picked. They came from a grid search over the
violet region maximising the worst dichromat distance to any opposite-sign
bucket, subject to `contrast.test.ts`'s existing constraint that each gain
bucket sit within 6% of its loss mirror in contrast against the basemap. That
constraint is load-bearing and is why the colours are not more saturated: it
pins each gain colour's lightness to its mirror's.

## The tritanopia trade-off is real and was accepted

> Decision made by the agent, not by Max — overturn it if the shape work below
> lands or if the reasoning does not hold.

Violet moves toward pink under tritanopia, which is the loss side's direction.
So the change **improves** the two red-green deficiencies enormously and
**regresses** tritanopia's worst sign-crossing pair, from ΔE 50.8 to 12.0.

Accepted because the populations are not comparable — red-green deficiency
affects roughly 8% of men, tritanopia roughly 1 in 10,000 — and because the
palette's worst pair *overall* under tritanopia still improved, 7.9 → 11.8, so
no tritan reader is worse off than the map's previous weakest point. The test
floor is set per-deficiency to encode exactly this rather than to hide it: a
later change cannot quietly make tritan worse than it now is either.

This is a trade, not a fix, and the thing that would retire it is the next
section.

## Always-on, not a toggle

> Max's decision, 2026-09-08, on the agent's recommendation. Settled — do not
> reopen it as though it were an oversight.

The violet palette is simply the palette. There is no "colour-blind view"
switch, and one should not be added.

The general reason is that a toggle earns its place only when the accessible
version costs the default audience something, and this one does not: violet
reads as well as green to normal vision, so a switch would only ever hand
somebody the worse map. Three reasons specific to this repo:

- **The output gets quoted, and a screenshot cannot carry the toggle state.**
  This site exists to put evidence into public comment; its views end up in
  letters and slides. Two palettes would mean two visually different images of
  the same finding with nothing on either saying which produced it — which is
  convention 17's trap ("otherwise indistinguishable from a published one") one
  layer up, at the presentation surface rather than inside the key.
- **The favicon cannot toggle.** A tab icon has no runtime state, so a mode
  guarantees that in one of its two positions the icon contradicts the map —
  and in the position that matters, for exactly the reader the mode exists for.
- **Discovery runs backwards.** A one-time visitor arriving from a link does
  not go looking for accessibility settings, and the reader who most needs the
  switch is the least likely to find it. Meanwhile it doubles what has to stay
  in step across the dots, the surface, the legend swatches and the two shared
  colour exports.

The counter-argument considered and rejected: green-means-good is a real
convention and violet-means-gain has to be learned from the key. Rejected
because the key is always on screen, and the map's subject is direction, which
the old palette destroyed outright for roughly 1 in 12 men.

Two things that would legitimately be toggles, neither of them this one: the
shape redundancy below, *if* it proves visually noisy at city zoom (and it
would default to on), and a developer-only preview that renders the map through
`cvd.ts`'s simulation so future palettes can be eyeballed rather than only
measured. The second is an authoring tool and does not ship to the public page.

## Still open: direction needs a channel that is not hue

The complete answer is redundant encoding of the **sign**, which no palette can
provide: triangle-down / circle / triangle-up for the dots (a MapLibre symbol
layer where there is now a circle layer), and a hatch on the loss half of the
surface fill. That would make the map readable under any deficiency, in
greyscale, and on the printout somebody takes to a public-comment hearing —
which is a real distribution channel for this work and one no colour choice
survives.

Deferred as its own item, not attempted here: a symbol layer changes how the
brush selection hit-tests and how the legend draws its swatches, which is a
wider change than the palette and wants to be reviewed on its own. Max's call
whether it is worth it — the palette change alone gets most of the benefit for
the readers most affected.
