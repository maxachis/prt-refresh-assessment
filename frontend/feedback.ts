/**
 * The "Report a problem" link's URL, built the same way `refresh/feedback.py`
 * builds the findings page's -- only here, because the map's view changes on
 * every click and only the browser holds the current one; the server can
 * hand over nothing sharper than the template.
 */

// Must match `VIEW_PLACEHOLDER` in refresh/feedback.py: it is the token
// pasted into the form's own "Get pre-filled link" URL in place of a real
// view, and both sides have to agree on it or a redeployed form silently
// stops filling in.
export const VIEW_PLACEHOLDER = '{view}';

/**
 * Substitute the current view's URL into the form's prefill template.
 *
 * `encodeURIComponent`, not a bare concatenation: the view URL carries its
 * own `?`, `&`, `=` and `#`, and left unescaped they would be read as the
 * FORM's own query parameters rather than as part of the value the reader
 * is reporting.
 *
 * Null, not a throw, for a template with no placeholder. The server refuses
 * to start on one, so this is only reachable through a hand-edited
 * `/api/meta`; but the caller runs from the same function that writes the
 * address bar, and an exception there would break every click over a link
 * that is better simply left hidden.
 */
export function feedbackHref(template: string, viewUrl: string): string | null {
  if (!template.includes(VIEW_PLACEHOLDER)) return null;
  return template.replace(VIEW_PLACEHOLDER, encodeURIComponent(viewUrl));
}
