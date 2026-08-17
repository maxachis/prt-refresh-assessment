# LOST-ROUTE

> What routes are completely removed?

**Twenty routes are discontinued, carrying 6,154 weekday riders a day between
them.** A twenty-first route number, the **77**, also disappears — it is merged
into the 86 and PRT does not list it as discontinued, so every count derived from
the crosswalk's `category` column misses it.

## Result

Weekday riders are WPRDC April 2026 daily averages — the freshest official
figures published, fifteen months newer than the stop-level extract.

| Route | Weekday riders | Note |
|---|---:|---|
| 17 Shadeland | 949 | number recycled for the new 17 Avalon – McKnight Rd |
| 53L Homestead Park Limited | 785 | |
| 15 Charles | 774 | |
| Y47 Curry Flyer | 549 | |
| 2 Mount Royal | 448 | |
| P17 Lincoln Park Flyer | 404 | |
| 20 Kennedy | 333 | |
| 43 Bailey | 333 | |
| P7 McKeesport Flyer | 321 | |
| 51L Carrick Limited | 250 | |
| G31 Bridgeville Flyer | 189 | |
| P69 Trafford Flyer | 182 | |
| P71 Swissvale Flyer | 151 | |
| 65 Squirrel Hill | 122 | number recycled for the new 65 Walnut St – Crawford Village |
| P67 Monroeville Flyer | 109 | |
| Y1 Large Flyer | 82 | |
| 71 Edgewood Town Center | 68 | |
| Y45 Baldwin Manor Flyer | 48 | |
| 18 Manchester | 34 | number recycled for the new 18 Wexford |
| O5 Thompson Run Flyer via 279 | 24 | |
| **Total** | **6,154** | |

Backing data: `data/discontinued_route_ridership_202604.csv`,
`data/route_crosswalk.csv`.

## The 77, and why the count is 20 rather than 21

PRT's crosswalk packs two routes into one cell: `"86, 77"` maps to `86 Liberty`,
category **Modified**. So the 77's alignment is folded into the 86 and its number
retires, but it never appears as a discontinued row. Meanwhile the number is
reused: the current **P16 Penn Hills Flyer becomes the 77L**. A reader comparing
route lists sees a 77L and assumes the 77 survives.

Any script splitting that cell on whitespace silently loses the 77 entirely —
which is why it is cross-cutting caveat 6 in [README.md](README.md).

## Read the totals carefully

**6,154 weekday riders is not 6,154 riders left without a bus.** Most of these
corridors keep service under another number: the 51L Carrick Limited disappears
while the 51, 51S and new 45 cover Carrick; the P-flyers are largely replaced by
L-limiteds on the same busway. What each stop actually keeps is
[STOP-LOST-SERVICE.md](STOP-LOST-SERVICE.md) — **593 locations lose all bus
service at 400 m** (900 at 150 m), carrying 488 weekday boardings, which is a far
smaller number than 6,154 and the honest one for "left with nothing".

Three of the busiest losses are worth naming for the comment period: the **17
Shadeland** (949), **53L** (785) and **15 Charles** (774). The 53L is the one to
watch — the 53's own weekday service is already down to 93 riders
([GAIN-SERVICE-DAYS.md](GAIN-SERVICE-DAYS.md)), so the Homestead Park corridor
loses the limited that carries almost all of its weekday load.

## Caveats

Rider figures are route totals for April 2026, unlinked: a passenger transferring
from a discontinued flyer to the T is counted once on the flyer. Adding the 20
routes' riders therefore does not give a count of distinct affected people.

"Discontinued" is PRT's category, not a geographic finding. The three recycled
numbers (17, 18, 65) mean route-number joins between the current and proposed
networks are wrong unless they go through the crosswalk.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 ingest_blr.py               # -> data/route_crosswalk.csv
python3 analyze_route_ridership.py  # -> data/discontinued_route_ridership_*.csv
```
