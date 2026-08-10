#!/usr/bin/env python3
"""Render the print HTML to PDF with headless Chromium.

    python3 build-pdf.py                 # every .html in this folder
    python3 build-pdf.py decal-door-20x10 spec-sheet

Each page carries its own @page size, so Chromium's --print-to-pdf produces a
PDF at exact trim (or trim + bleed) with the fonts embedded and the artwork
left as vector.
"""
import glob
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, 'pdf')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')


def render(name):
    src = os.path.join(HERE, name + '.html')
    out = os.path.join(PDF, name + '.pdf')
    subprocess.run([
        CHROME, '--headless', '--disable-gpu', '--no-sandbox',
        '--no-pdf-header-footer', '--print-to-pdf=' + out, src,
    ], check=True, capture_output=True)
    return out


def main(argv):
    os.makedirs(PDF, exist_ok=True)
    names = argv or sorted(
        os.path.basename(p)[:-5] for p in glob.glob(os.path.join(HERE, '*.html')))
    for name in names:
        name = name[:-5] if name.endswith('.html') else name
        out = render(name)
        print('%-32s %6.0f KB' % (name, os.path.getsize(out) / 1024))


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
