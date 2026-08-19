export type Day = 'weekday' | 'saturday' | 'sunday';
export type Side = 'current' | 'proposed';

export const DAYS: Day[] = ['weekday', 'saturday', 'sunday'];

/** Period keys, in axis order. Must match query.PERIODS server-side. */
export const PKEYS = [
  'early_4_6a', 'am_6_9a', 'mid_9a_3p', 'pm_3_6p',
  'eve_6_8p', 'late_8_11p', 'owl_11p_4a',
] as const;

export const PERIOD_LABEL: Record<string, string> = {
  early_4_6a: '4–6am',
  am_6_9a: '6–9am',
  mid_9a_3p: '9am–3pm',
  pm_3_6p: '3–6pm',
  eve_6_8p: '6–8pm',
  late_8_11p: '8–11pm',
  owl_11p_4a: '11pm–4am',
};

export interface StopRef {
  stop_id: string;
  name: string;
  lat: number;
  lon: number;
  metres: number;
}

export interface DayService {
  trips: number;
  periods: Record<string, number>;
  hourly: boolean;
  headways: Record<string, { median: number | null; max_gap_6a_6p: number | null }>;
  routes: string[];
  first: number | null;
  last: number | null;
}

export interface SideResult {
  side: Side;
  stops: StopRef[];
  days: Record<Day, DayService>;
}

/**
 * One row of the citywide layer, columnar to keep ~5,900 locations under a few
 * hundred kilobytes on the wire:
 *
 *   [lat, lon, published, wCur, wProp, wBucket, sCur, ..., uBucket]
 *
 * All three day types travel together so switching between them repaints from
 * memory rather than refetching — 152 locations keep their weekday buses and
 * lose the weekend entirely, and that comparison should be instant.
 */
export type ChangePoint = number[];

/** Offsets into a ChangePoint for day `i` of DAYS. */
export const CUR = (i: number) => 3 + 3 * i;
export const PROP = (i: number) => 4 + 3 * i;
export const BUCKET = (i: number) => 5 + 3 * i;
export const PUBLISHED = 2;

export interface ChangeLayer {
  radius: number;
  days: Day[];
  buckets: { key: string; label: string }[];
  fields: string[];
  points: ChangePoint[];
}

export interface PlaceResult {
  lat: number;
  lon: number;
  radius: number;
  current: SideResult;
  proposed: SideResult;
  change: Record<Day, { trips: number; hourly: [boolean, boolean] }>;
  place: { muni: string; hood: string } | null;
}
