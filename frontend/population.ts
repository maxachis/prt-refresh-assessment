/**
 * The magnitude surface's third denominator: not ground, but the people who
 * live on it.
 *
 * `surface.ts` already carries two units for the same lattice — buses per day
 * and square kilometres — and area was deliberately never allowed to stand in
 * for population (convention 10: a square kilometre of hillside paints like a
 * square kilometre of Brookline). This is the layer that answers the question
 * area cannot: how many residents, not how much ground. It is the surface's
 * counterpart to `analyze_equity_change.py`'s population test (convention 12)
 * and to the change legend's riders weighting (convention 15) — a second
 * reading of the same map, not a correction to the first.
 *
 * People are counted where they live, from the 2020 census, exactly as
 * `analyze_equity_change.py` counts them — never at a stop and never by
 * boarding. A cell's population is not spread evenly across its 100 m square;
 * it is the sum of whichever census blocks fall in the cell, each contributing
 * its residents at that block's own interior point, so the count follows where
 * people actually live rather than smearing them across empty ground.
 */
import { PopulationLayer, PopulationCell, POP_LOST, POP_GAINED, POP_KEPT, POP_NONE } from './types';
import { fetchJSON } from './utils';

let data: PopulationLayer | null = null;

export function layerData(): PopulationLayer | null {
  return data;
}

export async function loadPopulationLayer(radius: number): Promise<PopulationLayer> {
  data = await fetchJSON<PopulationLayer>(`/api/population?radius=${radius}`);
  return data;
}

/**
 * Residents in view, by outcome, for one day type.
 *
 * Membership is decided the same way `surface.ts`'s `summariseInBounds`
 * decides it — a cell counts if its centre, not any corner, falls inside the
 * viewport — so panning the map moves the same set of cells whichever unit
 * the reader is looking at.
 */
export function summarisePopulationInBounds(
  cells: PopulationCell[], dayIndex: number,
  west: number, south: number, east: number, north: number,
  origin: PopulationLayer['origin'],
): Record<'lost' | 'gained' | 'kept' | 'none', number> {
  const out = { lost: 0, gained: 0, kept: 0, none: 0 };
  for (const c of cells) {
    const lat = origin.lat0 + (c[1] + 0.5) * origin.dlat;
    const lon = origin.lon0 + (c[0] + 0.5) * origin.dlon;
    if (lat < south || lat > north || lon < west || lon > east) continue;
    out.lost += c[POP_LOST(dayIndex)];
    out.gained += c[POP_GAINED(dayIndex)];
    out.kept += c[POP_KEPT(dayIndex)];
    out.none += c[POP_NONE(dayIndex)];
  }
  return out;
}
