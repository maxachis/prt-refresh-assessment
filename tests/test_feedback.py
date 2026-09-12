"""The problem-report link's URL is built here, once, so the map and the
findings page cannot disagree on how a view is packed into a Google Form.

The form does not exist yet -- `FORM_URL_TEMPLATE` starts as `None` -- so the
first thing this checks is the gate itself: nothing renders a link to a form
that is not there.
"""
import pytest

from refresh import feedback


def test_no_link_until_a_form_is_configured(monkeypatch):
    monkeypatch.setattr(feedback, "FORM_URL_TEMPLATE", None)
    assert feedback.feedback_url("https://prt-refresh.lemaliconsulting.com/") is None


def test_the_view_url_is_percent_encoded_into_the_template(monkeypatch):
    monkeypatch.setattr(
        feedback, "FORM_URL_TEMPLATE",
        "https://docs.google.com/forms/d/e/X/viewform?usp=pp_url&entry.1={view}")
    url = feedback.feedback_url(
        "https://prt-refresh.lemaliconsulting.com/?view=dots&day=weekday#x")
    # The view URL's own ?, &, = and # must not read as the FORM's parameters,
    # so they -- and everything else needing escape -- are percent-encoded;
    # the template's own punctuation around {view} is left exactly as written.
    assert url == (
        "https://docs.google.com/forms/d/e/X/viewform?usp=pp_url&entry.1="
        "https%3A%2F%2Fprt-refresh.lemaliconsulting.com%2F%3Fview%3Ddots"
        "%26day%3Dweekday%23x")


def test_a_template_with_no_placeholder_is_a_misconfiguration(monkeypatch):
    """A form set up without ever pasting `{view}` into the prefill link would
    silently ship a report with no view attached -- catch it at startup
    instead of leaving every submitted report unreproducible."""
    monkeypatch.setattr(feedback, "FORM_URL_TEMPLATE",
                        "https://docs.google.com/forms/d/e/X/viewform")
    with pytest.raises(ValueError):
        feedback.feedback_url("https://prt-refresh.lemaliconsulting.com/")
