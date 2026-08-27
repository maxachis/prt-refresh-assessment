/**
 * The map as someone else's page furniture: map and key, and a way back here.
 *
 * A community organisation putting this in an article has a column a few
 * hundred pixels wide and a reader who did not come looking for a transit
 * tool. The full app answers a question per click in a 400 px panel beside
 * the map, and that panel is the first thing an embed cannot afford: at
 * embed widths it either takes the whole frame or gets a phone's bottom
 * sheet, and in both cases the map -- the thing worth embedding -- is what
 * disappears.
 *
 * So an embed keeps the map, the toolbar and the key, and drops the panel.
 * That is a real loss and it is not hidden: the key is still the summary
 * sentence for what is on screen ("2,688 locations in view · a weekday ·
 * 400 m walk"), and one link in the corner carries the reader to the full
 * site at exactly the view they are looking at.
 *
 * THE LINK IS NOT OPTIONAL FURNITURE. It is the only thing on an embedded
 * map that says whose map it is, and the only route to the method and
 * caveats -- which this project requires to travel with any number it shows.
 * A reader who meets these figures inside a third-party page has otherwise
 * met them with no provenance at all.
 *
 * The mode is asked for in the URL rather than inferred from being framed.
 * Framing already changes one thing on its own (the wheel stops being ours,
 * see `isFramed`), but stripping the answer panel is an editorial choice the
 * embedder makes, not something to spring on someone who framed the whole
 * app on purpose.
 */

/** Named once: it is part of an iframe src the moment anyone copies one. */
export const EMBED_PARAM = 'embed';

const ON = '1';
const TRUTHY = [ON, 'true', 'yes'];

/** Marks the link as leaving the frame, in the corner where there is no room to say so. */
const OUTWARD = ' ↗';

export function isEmbedded(search: string): boolean {
  const v = new URLSearchParams(search).get(EMBED_PARAM);
  return v !== null && TRUTHY.includes(v.toLowerCase());
}

/**
 * Keep the mode in the address bar as the reader works the controls.
 *
 * The state written back on every click is built from the question alone, so
 * without this an embed would lose its own mode the first time anyone touched
 * a button -- invisibly, until the frame was reloaded and came back as the
 * whole app in a 300 px box.
 */
export function withEmbed(search: string): string {
  const p = new URLSearchParams(search);
  p.set(EMBED_PARAM, ON);
  return `?${p}`;
}

/** The same view, as the whole site: what the corner link points at. */
export function withoutEmbed(search: string): string {
  const p = new URLSearchParams(search);
  p.delete(EMBED_PARAM);
  const rest = String(p);
  return rest ? `?${rest}` : '';
}

/**
 * What the corner link offers, which depends on whether there is an answer to
 * offer. Before anyone has clicked, the map is the whole of what an embed has
 * and the link is an invitation. After a click there IS an answer -- the
 * panel computed it, the embed simply has nowhere to put it -- and the link
 * has to say so, or the click reads as having done nothing.
 */
export function fullViewLabel(place: string | null): string {
  return (place ? `Full answer for ${place}` : 'Open the full map') + OUTWARD;
}
