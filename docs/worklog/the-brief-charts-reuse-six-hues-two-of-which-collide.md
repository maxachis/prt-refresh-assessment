# The brief's six demographic colours are not colour-blind safe

**Observed:** `build_equity_brief.py`'s per-dimension chart colours (`--q-race`,
`--q-age`, `--q-income`, `--q-vehicle`, `--q-disability`, `--q-language`) put
race and vehicle access at a CIE76 distance of **2.9** under red-green
colour blindness — indistinguishable — with three further pairs under 8.
**Where it stands:** open, not fixed. Found 2026-09-08 while repainting the
map ramp; deliberately left alone because it is a different deliverable and
the map fix was the task.

## Evidence

Measured with `frontend/cvd.ts`'s simulation, worst case over normal vision
and all three dichromacies:

| Pair | Worst-case ΔE |
|---|---|
| race ~ vehicle | 2.9 |
| age ~ income | 7.0 |
| race ~ disability | 7.3 |
| race ~ income | 7.8 |

For comparison, the map ramp's failure that prompted
[the ramp repaint](the-change-ramp-fails-red-green-colour-blindness.md) was
7.8, and its floor is now 40 for red-green deficiencies.

## Why this is a different problem from the map's

The map ramp is **diverging** — the two ends mean opposite things, so a
collapse there makes a reader read a loss as a gain. These are
**categorical**: six independent demographic dimensions, where a collapse
makes two series unattributable rather than reversed. Less dangerous, still
wrong, and harder to fix because six mutually distinct hues under all three
deficiencies is a real constraint — the usual answer is to stop relying on
hue alone and give each series a marker or direct label instead of a legend
swatch.

Worth checking when it is picked up: whether the charts already carry direct
labels, in which case the colours are decorative and this matters much less
than the numbers above suggest.

## Not attempted

No fix here. The palette is also duplicated across a light and a dark block
in the same file (lines ~496 and ~504), so whoever takes it should factor
that before repainting, or the two themes will drift.
