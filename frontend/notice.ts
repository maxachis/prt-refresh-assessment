/**
 * The first-visit notice: stop locations on the proposed network are a draft.
 *
 * PRT asked, through Pittsburghers for Public Transit, that readers be told on
 * arrival that the stops along the Proposed Final Network's routes are not
 * final. The wording is Max's, at the level of detail PPT relayed, and it is
 * the only place on the site that carries the statement: it is not a caveat
 * in the methods drawer and not a line in the masthead, by decision.
 *
 * It shows once per browser. A card that comes back on every load trains a
 * reader to click through it without reading, which defeats the one thing it
 * is for. The dismissal is remembered in localStorage and nowhere else, so a
 * new device or a cleared browser sees it again -- that is the right side to
 * err on.
 *
 * Two places it does not show. In an embed there is no room for a card over
 * a 300 px map, and the embed already carries the reader to the full site,
 * where the notice meets them. And where storage is unavailable (a private
 * window, blocked site data) the notice shows rather than the page breaking:
 * every access is guarded, and a dismissal that cannot be saved is silently
 * not saved.
 *
 * The decision is a pure function of the mode and a storage object so it can
 * be tested without a DOM; `main.ts` wires it to the markup.
 */

/** Renaming this re-shows the notice to everyone who has dismissed it. */
export const NOTICE_DISMISSED_KEY = 'draft-stops-notice-dismissed-v1';

const DISMISSED = '1';

/** `Storage` or nothing, because even reading `window.localStorage` can throw. */
type MaybeStorage = Pick<Storage, 'getItem' | 'setItem'> | null | undefined;

export function shouldShowNotice(opts: { embedded: boolean; storage: MaybeStorage }): boolean {
  if (opts.embedded) return false;
  try {
    return opts.storage?.getItem(NOTICE_DISMISSED_KEY) !== DISMISSED;
  } catch {
    return true;
  }
}

export function dismissNotice(storage: MaybeStorage): void {
  try {
    storage?.setItem(NOTICE_DISMISSED_KEY, DISMISSED);
  } catch {
    /* nowhere to remember it; the notice will show again next load */
  }
}

/** The browser's storage, or null where merely touching it throws. */
export function safeLocalStorage(): MaybeStorage {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
