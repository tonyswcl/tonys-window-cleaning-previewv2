#!/usr/bin/env python3
"""Build the vector pack a sign shop can print from: upload/squaresigns/.

The PDFs in pdf/ are already vector, but they carry subsetted fonts, and a
shop's RIP substituting a font is the one failure that ruins a job silently.
So for each vehicle piece we

  1. take pdf/<piece>.pdf and convert it to SVG with every glyph turned into
     an outline (PyMuPDF's text_as_path), then
  2. re-print that outlined SVG back to PDF through Chromium.

The result is two files per piece, both pure paths — no fonts, no rasters, no
resolution ceiling — named so the shop can match them to the parts list.
"""
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'upload', 'squaresigns')
SVG = os.path.join(HERE, 'svg')
TMP = os.environ.get('VECTOR_PACK_TMP', '/tmp/vector-pack')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')

# source stem, shipped name, trim W x H in inches, qty
PIECES = [
    ('decal-tailgate-white-left',  'TonysWC_A_Tailgate-Left_20x8in',   20, 8,  1),
    ('decal-tailgate-white-right', 'TonysWC_B_Tailgate-Right_20x8in',  20, 8,  1),
    ('decal-tailgate-bar-48x4',    'TonysWC_C_Tailgate-Bar_48x4in',    48, 4,  1),
    ('decal-door-20x10',           'TonysWC_D_Front-Door_20x10in',     20, 10, 2),
    ('decal-reardoor-20x10',       'TonysWC_E_Rear-Door_20x10in',      20, 10, 2),
]


def outline_svg(stem, w, h):
    import pymupdf
    page = pymupdf.open(os.path.join(HERE, 'pdf', stem + '.pdf'))[0]
    svg = page.get_svg_image(text_as_path=True)
    # PyMuPDF sizes the root in points, which an editor reads as CSS pixels and
    # opens 25% small. The viewBox is already correct, so only the outer
    # width/height need to be restated in inches.
    def fix(m):
        tag = re.sub(r'width="[^"]*"', 'width="%gin"' % w, m.group(0), count=1)
        return re.sub(r'height="[^"]*"', 'height="%gin"' % h, tag, count=1)
    return re.sub(r'<svg[^>]*>', fix, svg, count=1)


def svg_to_pdf(svg, w, h, out):
    html = os.path.join(TMP, os.path.basename(out) + '.html')
    with open(html, 'w') as fh:
        fh.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
            '@page{size:%gin %gin;margin:0}*{margin:0;padding:0}'
            'html,body{width:%gin;height:%gin;overflow:hidden;background:transparent}'
            'svg{display:block;width:%gin;height:%gin}</style></head><body>%s</body></html>'
            % (w, h, w, h, w, h, svg))
    subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-sandbox',
                    '--no-pdf-header-footer', '--print-to-pdf=' + out, html],
                   check=True, capture_output=True)


def verify(pdf):
    """A shop-ready file has no bitmaps and no fonts. Fail loudly if it does."""
    raw = open(pdf, 'rb').read()
    images = raw.count(b'/Subtype /Image') + raw.count(b'/Subtype/Image')
    fonts = raw.count(b'/Type /Font') + raw.count(b'/Type/Font')
    return images, fonts


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(SVG, exist_ok=True)
    os.makedirs(TMP, exist_ok=True)
    ok = True
    for stem, name, w, h, qty in PIECES:
        svg = outline_svg(stem, w, h)
        with open(os.path.join(SVG, stem + '.svg'), 'w') as fh:
            fh.write(svg)
        with open(os.path.join(OUT, name + '.svg'), 'w') as fh:
            fh.write(svg)
        pdf = os.path.join(OUT, name + '.pdf')
        svg_to_pdf(svg, w, h, pdf)
        images, fonts = verify(pdf)
        ok = ok and images == 0 and fonts == 0
        print('%-34s %2d x %-2d qty %d   %5.0f KB pdf  %5.0f KB svg   images=%d fonts=%d'
              % (name, w, h, qty, os.path.getsize(pdf) / 1024, len(svg) / 1024, images, fonts))

    ref = os.path.join(OUT, 'TonysWC_Placement-Reference_11x17in.pdf')
    shutil.copy(os.path.join(HERE, 'pdf', 'spec-sheet.pdf'), ref)
    print('%-34s reference only (contains photos)  %5.0f KB'
          % (os.path.basename(ref), os.path.getsize(ref) / 1024))
    if not ok:
        print('FAIL: a print file still carries a bitmap or a font', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
