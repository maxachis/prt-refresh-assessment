# Worklog

Durable records of open items — things noticed outside whatever task was
running, that outlive the session that found them: an open question, a decision
owed, a defect deliberately not fixed, a conclusion nobody should have to
re-derive.

One file per item. Each opens with a two-line lede — the observation in one
sentence, where it stands in one — then whatever body the item deserves:
evidence with commands and file references, why it matters, approaches
considered and *who* rejected them, and the resolution once it lands.

Not here: anything found and fixed in the same change (that reasoning belongs
in a comment at the line and in the commit), passing thoughts, and anything
someone outside the repo needs to act on (that goes to the tracker, with the
entry linked rather than copied).

New facts get appended *and* the stale claims at the top rewritten in the same
pass — a reader who stops halfway down must not be misinformed.

| Entry | Status |
|---|---|
| [Origin-to-destination travel time, before and after](origin-destination-travel-time.md) | built, awaiting close — BASE_CAMP question owed |
| [The synthesised transfer radius is not neutral between the two networks](transfer-radius-favours-one-network.md) | open, decision owed |
| [A township is not a point, and the travel-time layer treats it as one](one-point-cannot-represent-a-township.md) | open, decision owed |
| [A T station reads as a bare number in a drawn itinerary](rail-stops-have-no-name-in-a-journey.md) | open, not fixed |
| [A walk is drawn — and timed — straight through the blocks](walks-are-drawn-and-timed-in-straight-lines.md) | fixed, awaiting close — two judgement calls inside the fix are Max's to overturn |
| [The last walk doglegs via a bus stop the rider never uses](the-last-walk-doglegs-via-a-stop-nobody-boards.md) | open, decision owed |
| [A stairway is timed as though it were level ground](stairways-are-timed-as-though-they-were-level.md) | open, decision owed |
| [The ten on-demand zones are retracted, figure and map layer both](the-on-demand-zones-are-retracted.md) | fixed, awaiting close — retracted; whether the retraction needs to travel is Max's |
| [The deploy box runs out of memory building the database](the-deploy-box-runs-out-of-memory-building-the-database.md) | open, decision owed — unblocked by a hand-added swapfile the repo does not know about |
