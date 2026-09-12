"""One place that knows how a reader's view becomes a pre-filled bug report.

The map and the findings page each carry a "Report a problem" link to a
Google Form, and the whole point of the link is that it arrives with the
reader's exact view attached -- day, radius, clicked point, selection -- since
a report of "the numbers look wrong here" with no "here" cannot be
reproduced. Both surfaces build that link off this one constant so they
cannot disagree on the substitution rule.
"""
from __future__ import annotations

from urllib.parse import quote

# The Google Forms "Get pre-filled link" URL for the problem-report form, with
# the value of its "link to the view" field replaced by the literal {view}.
# None until the form exists: a link to a form that is not there is worse than
# no link, so every surface that draws one checks this first.
FORM_URL_TEMPLATE: str | None = ("https://docs.google.com/forms/d/e/1FAIpQLSdJSpI0SBDbQ-tTnFf05tV3iWEnzAOQq60oEp5-okuKQgav6g/viewform?usp=pp_url&entry.1025587756={view}")

# The literal token stood in for the view's URL when the prefilled link was
# copied out of Google Forms. `frontend/feedback.ts` carries the same string
# for the same substitution, done again there because the view URL changes on
# every click and only the browser knows it at that point.
VIEW_PLACEHOLDER = "{view}"


def template() -> str | None:
    """The configured template, checked, or None while no form is configured.

    Read off the module global at call time rather than at import, so the
    app reports whatever is set when asked and a test can flip it. Every
    reader of the constant goes through here: the web app calls it once at
    start-up so a bad paste fails at `refresh serve`, in front of the person
    who pasted it, rather than in a browser on every click.
    """
    if FORM_URL_TEMPLATE is None:
        return None
    if VIEW_PLACEHOLDER not in FORM_URL_TEMPLATE:
        # A form configured without ever pasting the placeholder back in would
        # silently ship every report with no view attached -- fail loudly at
        # the point someone can still fix it, not once reports start arriving
        # unreproducible.
        raise ValueError(
            f"FORM_URL_TEMPLATE has no {VIEW_PLACEHOLDER!r} placeholder")
    return FORM_URL_TEMPLATE


def feedback_url(view_url: str) -> str | None:
    """The form, prefilled with `view_url`, or None while no form is configured."""
    form = template()
    if form is None:
        return None
    # safe="": every reserved character in the view URL (?, &, =, #) must be
    # escaped, because the view URL sits inside the FORM's own query string --
    # an unescaped one would be read as one of the form's parameters instead
    # of as part of the value.
    return form.replace(VIEW_PLACEHOLDER, quote(view_url, safe=""))
