#!/usr/bin/env python3
"""Vectorize the logo mark so every print file can be shipped as true vector.

assets/logo-tile.png is flat-colour art (five colours plus antialiasing), so it
traces cleanly. The only complication is the transparent surround: a tracer sees
whatever RGB sits under alpha=0 and turns it into a path. So we

  1. flood the transparent pixels with the nearest opaque colour (BFS) — the
     tracer then never invents an edge where the artwork simply stops,
  2. upscale 2x and snap every pixel to the five real brand colours,
  3. trace the colour image, and trace the alpha channel separately as a
     silhouette, and
  4. emit one SVG: the colour paths clipped by the silhouette path.

Result: assets/logo-tile.svg — same artwork, no resolution ceiling, and the
outside stays transparent so it can sit on clear vinyl with no white plate.
"""
import os
import re
import subprocess
import sys
from collections import deque

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'assets', 'logo-tile.png')
OUT = os.path.join(HERE, 'assets', 'logo-tile.svg')
TMP = os.environ.get('LOGO_SVG_TMP', '/tmp/logo-svg')

# The five flat colours, recovered by k-means over the opaque pixels.
PALETTE = [
    (0xE5, 0xF2, 0xFA),   # pale sky (the reflected arc)
    (0x66, 0xBF, 0xE4),   # panel blue
    (0xFE, 0xB5, 0x30),   # sun gold
    (0x07, 0x38, 0x57),   # squeegee navy
    (0xFC, 0xFD, 0xFD),   # white (sparkles, ring, blade stripe, grid)
]
SCALE = 2
OPAQUE = 200


def edge_extend(img):
    """Fill transparent pixels with the colour of the nearest opaque pixel."""
    w, h = img.size
    data = list(img.get_flattened_data())
    rgb = [d[:3] for d in data]
    alpha = [d[3] for d in data]
    filled = [a >= OPAQUE for a in alpha]
    queue = deque(i for i, f in enumerate(filled) if f)
    while queue:
        i = queue.popleft()
        y, x = divmod(i, w)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                j = ny * w + nx
                if not filled[j]:
                    filled[j] = True
                    rgb[j] = rgb[i]
                    queue.append(j)
    out = Image.new('RGB', (w, h))
    out.putdata(rgb)
    mask = Image.new('L', (w, h))
    mask.putdata(alpha)
    return out, mask


def snap(img):
    """Nearest-colour quantize with no dithering.

    The unused palette slots are filled by repeating the real colours; leaving
    them black would pull the darkest navy pixels to #000000.
    """
    pal = Image.new('P', (1, 1))
    entries = []
    for i in range(256):
        entries += list(PALETTE[i % len(PALETTE)])
    pal.putpalette(entries)
    return img.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')


def trace(png, svg, **kw):
    import vtracer
    vtracer.convert_image_to_svg_py(png, svg, **kw)


def nearest(hexcolor):
    r, g, b = (int(hexcolor[i:i + 2], 16) for i in (1, 3, 5))
    c = min(PALETTE, key=lambda p: (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2)
    return '#%02X%02X%02X' % c


def main():
    os.makedirs(TMP, exist_ok=True)
    src = Image.open(SRC).convert('RGBA')
    w, h = src.size
    flat, alpha = edge_extend(src)

    colour_png = os.path.join(TMP, 'colour.png')
    alpha_png = os.path.join(TMP, 'alpha.png')
    snap(flat.resize((w * SCALE, h * SCALE), Image.LANCZOS)).save(colour_png)
    # black = keep, white = cut away, which is what vtracer's binary mode traces
    (alpha.resize((w * SCALE, h * SCALE), Image.LANCZOS)
          .point(lambda v: 0 if v >= 128 else 255)
          .convert('RGB').save(alpha_png))

    colour_svg = os.path.join(TMP, 'colour.svg')
    alpha_svg = os.path.join(TMP, 'alpha.svg')
    # filter_speckle/length_threshold tuned by eye against the PNG: any looser
    # and the sun's rays start to round off, any tighter and the file doubles for
    # detail that is invisible at a 4in print.
    common = dict(hierarchical='stacked', mode='spline', filter_speckle=20,
                  corner_threshold=60, length_threshold=8.0, max_iterations=10,
                  splice_threshold=45, path_precision=1)
    trace(colour_png, colour_svg, colormode='color', color_precision=8,
          layer_difference=0, **common)
    trace(alpha_png, alpha_svg, colormode='binary', **common)

    W, H = w * SCALE, h * SCALE
    body = open(colour_svg).read()
    paths = re.findall(r'<path[^>]*/>', body)
    # vtracer averages colours along layer boundaries; put every fill back on
    # the five-colour palette so the output has no in-between shades.
    fixed = []
    for p in paths:
        p = re.sub(r'fill="(#[0-9A-Fa-f]{6})"', lambda m: 'fill="%s"' % nearest(m.group(1)), p)
        fixed.append(p)
    # keep the whole element — vtracer positions every path with its own
    # transform="translate(...)", and a clip path without it lands nowhere near
    # the artwork.
    clip = re.findall(r'<path[^>]*/>', open(alpha_svg).read())

    svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
        'width="%d" height="%d" shape-rendering="geometricPrecision">' % (W, H, W, H),
        '<defs><clipPath id="tw-logo-clip">%s</clipPath></defs>' % ''.join(clip),
        '<g clip-path="url(#tw-logo-clip)">',
    ]
    svg += fixed
    svg += ['</g>', '</svg>']
    out = ''.join(svg)
    with open(OUT, 'w') as fh:
        fh.write(out)
    print('wrote %s  %d paths  %.0f KB' % (OUT, len(fixed), len(out) / 1024))


if __name__ == '__main__':
    sys.exit(main())
