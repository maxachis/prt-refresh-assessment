"""Minimal SVG chart primitives, standard library only.

The repo publishes its findings as CSVs and prose, and a chart is neither. This
module exists so a chart can be *generated* from the same CSVs by the same
pipeline rules as everything else -- no plotting library, no build step, no
runtime JavaScript, and a diff you can read. It knows nothing about transit or
the census: it maps numbers onto a canvas and emits markup.

Two deliberate limits. There is no automatic axis-tick algorithm -- callers
pass the ticks they want, because a chart that silently rounds 1.0 off a scale
whose whole point is the value 1.0 is worse than no chart. And every text
string goes through `escape`, because place labels come from PRT's HOOD field
and are not trusted markup.
"""


def escape(text):
    """XML-escape a value for use as element text or an attribute."""
    return (str(text).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


class Scale:
    """Linear map from a data interval onto a pixel interval.

    `hi` below `lo` is allowed and is how a vertical axis gets its origin at the
    bottom of the canvas, so callers never negate coordinates by hand.
    """

    def __init__(self, lo, hi, out_lo, out_hi):
        if lo == hi:
            raise ValueError("empty domain")
        self.lo, self.hi, self.out_lo, self.out_hi = lo, hi, out_lo, out_hi

    def __call__(self, value):
        span = (value - self.lo) / (self.hi - self.lo)
        return self.out_lo + span * (self.out_hi - self.out_lo)

    def clamp(self, value):
        """The value pinned into the domain, for points drawn off the end."""
        low, high = min(self.lo, self.hi), max(self.lo, self.hi)
        return min(max(value, low), high)


def attrs(mapping):
    """Render an attribute dict, turning `stroke_width` into `stroke-width`."""
    out = []
    for key, value in mapping.items():
        if value is None:
            continue
        out.append(f'{key.rstrip("_").replace("_", "-")}="{escape(value)}"')
    return " ".join(out)


def el(tag, text=None, children=(), **kw):
    """One element. Text and children are both optional; text is escaped."""
    body = "" if text is None else escape(text)
    body += "".join(children)
    rendered = attrs(kw)
    open_tag = f"<{tag}{' ' + rendered if rendered else ''}"
    if not body:
        return open_tag + "/>"
    return f"{open_tag}>{body}</{tag}>"


def group(children, **kw):
    return el("g", children=children, **kw)


def svg(width, height, children, *, title=None, klass=None):
    """A root <svg>. `title` is the accessible name, not a visible caption."""
    parts = []
    if title:
        parts.append(el("title", title))
    parts.extend(children)
    return el("svg", children=parts, viewBox=f"0 0 {width} {height}",
              width=None, height=None, role="img", class_=klass,
              xmlns="http://www.w3.org/2000/svg",
              preserveAspectRatio="xMidYMid meet")
