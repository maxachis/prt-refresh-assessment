# WordPress sandboxes an embed it does not trust, and MapLibre goes blank in it

**Observed:** an oEmbed provider was built so WordPress authors who cannot
publish a raw `<iframe>` could embed the map by pasting its URL, and it does
not work in WordPress: the sanitiser forces `sandbox="allow-scripts"` onto the
frame and MapLibre never finishes loading a map in that sandbox, leaving the
toolbar over an empty grey square.
**Where it stands:** closed as not-to-be-done — Max killed the provider on
2026-09-02 once the sandbox result was in, and the code was removed the same
day. This entry is kept for the measurement, so nobody builds it a second time.

## Why this is worth keeping after the code was deleted

"Make the map embeddable by pasting a URL" is an obvious thing to want, oEmbed
is the obvious way to do it, and the reason it fails is invisible from the
outside: WordPress reports no error, our server sees a normal request, and the
map draws its own furniture before going blank. Anyone re-deriving this pays
for a WordPress source read and a side-by-side browser test to find out.

## How it came up

A user reported that the iframe from `docs/WEBAPP.md`, pasted into WordPress's
Custom HTML widget, produced no map. The likely cause is WordPress's HTML
sanitiser: publishing a raw `<iframe>` needs the `unfiltered_html` capability,
which WordPress.com withholds below the Business plan and self-hosted sites
withhold from Editors and below. Those authors have the Embed block instead,
which is an oEmbed consumer — hence the attempt.

> The original report is Max's; it is not reproduced in this repo, and the
> user's WordPress plan and role were never established. That the iframe was
> stripped remains the leading hypothesis, not a confirmed diagnosis.

## What was measured

Against the live site on 2026-09-02, two iframes side by side on one page with
the same `?embed=1` URL — one plain, one carrying the attributes WordPress
emits (`sandbox="allow-scripts" security="restricted"`, a `#?secret=` fragment,
and `style`/`loading` stripped by `wp_kses`). The plain frame drew the county
map normally. The sandboxed one drew the toolbar, the key's shell, the
attribution and the corner link — and no basemap, no dots, and an empty key.

Inside the sandboxed frame:

- `window.origin` is `null`, confirming the opaque origin.
- A fresh `maplibregl.Map` built by hand fires `style.load` and then stalls:
  `isSourceLoaded` stays false for both sources, `map.loaded()` stays false,
  and **no `error` event is raised at all**. That is the whole failure, and it
  reproduces with no code of ours involved.
- Everything else works. A vector tile fetches 200 on the main thread *and*
  from a blob-URL Worker; WebGL initialises; there are no console errors and no
  unhandled rejections.
- Our own `/api/*` calls throw, because the frame is cross-origin to us and the
  site sends no CORS headers. Real, but secondary — see below.

Since `map.on('load')` is where `main.ts` builds every layer and fetches every
figure, a map that never loads means nothing is ever requested. The empty key
is a symptom, not a second bug.

The pinned MapLibre is 4.7.1 (`src/refresh/web/static/vendor/`). Whether a
later version loads tiles under an opaque origin was never tested.

## Why WordPress does this

From WordPress core (`src/wp-includes/embed.php`), `wp_filter_oembed_result()`
runs on `oembed_dataparse` for every `rich`/`video` result, reduces the HTML to
its first `<iframe>` via `wp_kses`, and then unconditionally:

```php
$html = str_ireplace( '<iframe', '<iframe class="wp-embedded-content" sandbox="allow-scripts" security="restricted"', $html );
```

`allow-same-origin` is not in that list, and there is no filter positioned to
put it back that a site owner would reasonably reach for. The function returns
early — untouched — for a provider on WordPress's known list:

```php
// Don't modify the HTML for trusted providers.
if ( false !== $wp_oembed->get_provider( $url, array( 'discover' => false ) ) ) {
    return $result;
}
```

So a site that registers this one as *trusted*, via `wp_oembed_add_provider()`
in a theme's `functions.php` or a small plugin, would skip the sanitiser and
the sandbox with it. That was the only WordPress path that could have worked,
and it is the reason the provider was worth finishing before judging. It needs
someone who can add PHP — more access than publishing an iframe needs, not
less — which is most of why it did not survive the decision below.

## Approaches considered

**Ship the provider anyway, for consumers that are not WordPress.** Rejected by
Max on 2026-09-02. It was spec-correct and tested, and it works for any
consumer that inserts the record's HTML as given — but WordPress was the
entire reason for building it, the one WordPress path left standing needs PHP
access that makes the plain iframe available anyway, and no other consumer had
actually asked. Carrying an endpoint, a per-request rewrite of the map page's
head, and 19 tests for a hypothetical consumer was not worth it. Reversible:
the implementation is in this session's history if a real consumer ever turns
up.

**Serve the API cross-origin.** Added, then reverted in the same session,
before the above. Genuinely required by any consumer that sandboxes — an
`Access-Control-Allow-Origin: *` on the API was measured to make `/api/meta`
answer a null origin — but *not sufficient*, because MapLibre stalls before
anything of ours is fetched. Since it bought nothing on any path that worked,
and widening who may read the API is a real if modest decision, it was pulled
back out rather than kept as collateral of a fix that did not fix anything.
Agent's call.

**Chase the MapLibre stall.** Not attempted. The silence — no error event, no
rejection — suggests something swallowed rather than something refused. This
is the piece of the investigation most likely to reward someone's time and the
least done, but it is only worth starting if there is a reason to want a
sandboxed embed again.

**Route tiles through our own server.** Rejected, agent's call: it would not
help. Tiles were measured fetching fine from the sandbox; the stall is inside
MapLibre, not at the network.

## What is still open

The original report. The user should be asked for their published page's
source — no `<iframe>` in it confirms the capability diagnosis — and the
answer for them remains the hand-written iframe plus whatever access is needed
to publish one. `docs/WEBAPP.md` documents the iframe and says nothing about
why WordPress might eat it; whether it should is Max's call, and was offered
and not taken up on 2026-09-02.
