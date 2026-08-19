"""`refresh` command line -- serving only.

Building `data/refresh.db` is deliberately NOT a subcommand here. It belongs to
the pipeline, which is standard-library only and run with a bare `python3`
alongside the other analysis scripts:

    python3 build_webdb.py

Putting it behind this CLI would make the pipeline depend on an installed
package, which is the one thing the optional-extra split exists to prevent.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

DEFAULT_DB = Path("data/refresh.db")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="refresh", description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("serve", help="run the web app")
    s.add_argument("--db", default=str(DEFAULT_DB), type=Path)
    s.add_argument("--host", default="127.0.0.1",
                   help="default 127.0.0.1 -- see the note in web/app.py "
                        "before binding this publicly")
    s.add_argument("--port", type=int, default=8000)
    s.add_argument("--reload", action="store_true")

    args = ap.parse_args(argv)

    if args.cmd == "serve":
        if not args.db.exists():
            print(f"{args.db} not found -- run `python3 build_webdb.py` first",
                  file=sys.stderr)
            return 1
        try:
            import uvicorn
        except ModuleNotFoundError:
            print("web dependencies missing -- `uv sync --extra web`",
                  file=sys.stderr)
            return 1
        from .web.app import create_app

        uvicorn.run(create_app(args.db), host=args.host, port=args.port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
