These are human-authored notes on what is desired. This is ground truth for human intent in this repo, with all other documentation considered secondary.

# Coverage Criteria

We are defining coverage according to several different tiers:
1. WEEK-ANY-MINIMUM: At least one bus visiting at all in a given week
2. WEEKENDS-ANY-MINIMUM: At least one bus visiting at all on Weekends
3. WEEKDAYS-ANY-MINIMUM: At least one bus visiting at all on Weekdays
4. WEEK-ANY-HOURLY: At least one bus visiting with hourly or more frequent services on Weekdays
5. WEEKEND-ANY-HOURLY: At least one bus visiting with hourly or more frequent services on Weekends 

# Questions

## General

REGION-LOSS: What region(s) are currently on this line that won’t be served at all anymore?
GAIN-ONE-SEAT-DOWNTOWN: What communities will gain one-seat-ride to Downtown? 
LOSE-ONE-SEAT-DOWNTOWN: What communities will lose one-seat-ride to downtown?
GAIN-ONE-SEAT-OAKLAND: What communities will gain one-seat-ride to Oakland?
LOSE-ONE-SEAT-OAKLAND: What communities will lose one-seat-ride to Oakland?
GAIN-ONE-SEAT-CRITICAL: What other critical destinations will riders gain a one seat ride to? (Walmarts, grocery stores, etc.)
LOSE-ONE-SEAT-CRITICAL: What other critical destinations will riders lose a one seat ride to? (Walmarts, grocery stores, etc.)
GAIN-OTHER: What other notables gains are occurring which are not otherwise described?
NEW-ROUTE: What new routes are added?
LOST-ROUTE: What routes are completely removed?
LOSE-OTHER: What other notable losses are occuring which are not otherwise described?
COVERAGE-CHANGE: What is the total change in coverage, in terms of area, and by several different coverage criteria.
RIDERSHIP-PROJECTIONS: Can we make projections about the change in total ridership from the changes, under different scenarios?

## Route-by-Route

These are questions to be asked for individual routes that are neither added nor removed. 

LOSE-SERVICE-DAYS: What days of service will this route have cut?
GAIN-SERVICE-DAYS: What days of service will this route gain?
LOSE-SERVICE-HOURS: What routes are losing service hours overall?
GAIN-SERVICE-HOURS: What routes are gaining service hours overall?
LOSE-FREQUENCY-HALF: What routes are seeing frequency halve or worse?
GAIN-FREQUENCY-DOUBLE: What routes are doubling frequency or better?

## Stop-by-Stop

These are questions to be asked for individual stops. 
STOP-ROUTE-REPLACE: What stops are seeing service from one route replaced with comparable service from a different route?
STOP-LOST-SERVICE: What stops have lost service by one of the given service criteria?

# Appendix

For GAIN-ONE-SEAT-CRITICAL and LOSE-ONE-SEAT-CRITICAL, Note that the remix feed appears to contain data on SNAP-accepting groceries and other locations, which may be relevant for this. 
