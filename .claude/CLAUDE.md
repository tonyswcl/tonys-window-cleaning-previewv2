# Tony's Window Cleaning site

Start with `.claude/HANDOFF.md`. It has the rules, prices, current state, what's waiting on Tony, the launch checklist, how the build works and how to test.

The short version:

- The repo is public and main is the live site. Never commit customer names, phones, addresses or emails. Never hardcode calendar IDs.
- Work on `claude/business-growth-marketing-of9ero`. Nothing goes to main until Tony says "move to main".
- Copy: "no dashes, no slop, nothing to exaggerated and beyond. Not too tacky or salesey."
- Quote tool and 3D sources are in `_quote/src/`. Rebuild with `python3 _quote/build.py`, never edit between `<!-- tq:... -->` markers by hand.
- Run the tests in `tools/tests/` before every push.
