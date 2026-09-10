/**
 * One hit test per pointer move, for every layer that answers the pointer.
 *
 * MapLibre's own `map.on('mousemove', layer, ...)` is a delegated listener: it
 * runs `queryRenderedFeatures` itself, once per listener. Three listeners --
 * enter, leave, move -- on each of six layers is 19 hit tests for a single
 * mouse move, measured at 2.5-3.5 ms of main-thread JavaScript at zoom 12.
 * Four of those six layers belong to views that were not even on screen.
 *
 * That work lands where it hurts most. A drag delivers one pointer event per
 * frame and MapLibre does not suppress it, so on a machine drawing the map
 * with its processor the hit tests compete with the frame they precede.
 *
 * So the app does the dispatch instead: one query, over the layers the current
 * view is actually drawing, and the topmost feature goes to whichever spec
 * owns its layer. The visibility test is what drops the other views' layers,
 * and it works because every view toggles its layers with `visibility` rather
 * than by removing them.
 */

export interface HoverSpec {
  /** The layer this spec answers for. */
  layer: string;
  /**
   * The tooltip for a feature of that layer, or null for "nothing to say" --
   * which the dot layers return before their data has arrived. A null closes
   * the tooltip rather than leaving the previous feature's up.
   */
  html(feature: any): string | null;
  /**
   * Where to anchor the tooltip. Defaults to the pointer: a dot anchors at its
   * own coordinates instead, so the tooltip does not drift off the mark it
   * describes.
   */
  anchor?(feature: any, e: any): [number, number] | any;
}

/** What identifies "still the same feature" between two pointer moves. */
function keyOf(f: any): string {
  return `${f.layer?.id}:${f.id ?? JSON.stringify(f.geometry?.coordinates)}`;
}

/**
 * Returns the way to close the tooltip from outside a pointer move.
 *
 * A view switch closes it with the pointer sitting still over the dot it
 * described; the "same feature, nothing to do" shortcut below would then keep
 * it shut until the reader found another dot. Anything that hides the tooltip
 * has to come through here so that memory is cleared with it.
 */
export function initHover(
  map: any, popup: any, specs: HoverSpec[],
): () => void {
  const owners = new Map(specs.map((s) => [s.layer, s]));
  // What is on screen, so a pointer event that changes neither does no DOM
  // work at all -- which is most of them during a drag across one dot.
  let showing: string | null = null;
  let cursor = '';

  const setCursor = (want: string) => {
    if (cursor === want) return;
    cursor = want;
    map.getCanvas().style.cursor = want;
  };

  const forget = () => {
    showing = null;
    setCursor('');
    popup.remove();
  };

  map.on('mousemove', (e: any) => {
    const layers = specs
      .map((s) => s.layer)
      .filter((id) => map.getLayer(id)
        && map.getLayoutProperty(id, 'visibility') !== 'none');
    if (!layers.length) { forget(); return; }

    const [top] = map.queryRenderedFeatures(e.point, { layers });
    if (!top) { forget(); return; }

    setCursor('pointer');
    const key = keyOf(top);
    // A drag fires a pointer event per frame across one dot. The tooltip it
    // would build is the tooltip already on screen.
    if (key === showing) return;

    const spec = owners.get(top.layer?.id);
    const html = spec ? spec.html(top) : null;
    if (html === null || html === undefined) {
      showing = null;
      popup.remove();
      return;
    }
    showing = key;
    const at = spec!.anchor ? spec!.anchor(top, e) : e.lngLat;
    popup.setLngLat(at).setHTML(html).addTo(map);
  });

  // The pointer leaving the canvas is the one case no mousemove reports.
  map.on('mouseout', forget);

  return forget;
}
