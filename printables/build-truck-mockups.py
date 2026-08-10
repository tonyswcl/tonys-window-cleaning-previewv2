#!/usr/bin/env python3
"""Composite the door decals onto the two side photos of the truck.

Both photos come off the phone rotated (EXIF orientation 6 on a landscape
frame), so they are turned upright here rather than by hand, then cropped to
the band the truck occupies.

Each decal is mapped onto a quad picked off the door's flat panel. The camera
is close to perpendicular in both shots, so the quads are near-rectangular -
the small vertical offsets are what keep the artwork sitting on the body line
instead of floating flat across it.
"""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get('TRUCK_PHOTOS', os.path.join(HERE, 'spec', 'source'))
OUT = os.path.join(HERE, 'spec')

# photo file, output name, crop band, and the two door quads in crop pixels.
# A quad is TL, TR, BR, BL.
# Door panels measured off the photos, in crop pixels: the seam either side of
# each door, and the clean band between the character line and the door bottom.
# Every decal is centred in its panel; PX_PER_IN comes from the truck's 199.7"
# overall length spanning the frame.
PX_PER_IN = 14.32
PANEL_Y = (560, 800)

VIEWS = [
    dict(
        src='truck-passenger-side.jpeg', name='view-passenger', crop=(0, 1620, 3024, 2820),
        trim=(0, 55, 3024, 1165),
        doors=[('decal-door-20x10', 1655, 2245), ('decal-reardoor-20x10', 1105, 1655)],
    ),
    dict(
        src='truck-driver-side.jpeg', name='view-driver', crop=(0, 1650, 3024, 2850),
        trim=(0, 0, 3024, 1110),
        doors=[('decal-door-20x10', 975, 1570), ('decal-reardoor-20x10', 1570, 2130)],
    ),
]



def solve(src, dst):
    """Eight perspective coefficients mapping dst -> src, by Gaussian elimination.

    PIL's PERSPECTIVE transform samples the destination and asks where in the
    source each pixel came from, so the system is built in that direction.
    """
    rows = []
    rhs = []
    for (sx, sy), (dx, dy) in zip(src, dst):
        rows.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        rhs.append(sx)
        rows.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
        rhs.append(sy)
    n = 8
    m = [rows[i] + [rhs[i]] for i in range(n)]
    for col in range(n):
        piv = max(range(col, n), key=lambda r: abs(m[r][col]))
        if abs(m[piv][col]) < 1e-12:
            raise ValueError('degenerate quad')
        m[col], m[piv] = m[piv], m[col]
        f = m[col][col]
        m[col] = [v / f for v in m[col]]
        for r in range(n):
            if r != col and m[r][col]:
                k = m[r][col]
                m[r] = [a - k * b for a, b in zip(m[r], m[col])]
    return [m[r][n] for r in range(n)]


def place(base, art, quad):
    """Warp the artwork onto quad and composite it over base."""
    w, h = base.size
    src = [(0, 0), (art.width, 0), (art.width, art.height), (0, art.height)]
    coeffs = solve(src, quad)
    warped = art.transform((w, h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    base.alpha_composite(warped)


def quad(x0, x1, w_in, h_in):
    """Centre a w_in x h_in decal in the door panel between x0 and x1."""
    w = w_in * PX_PER_IN
    h = h_in * PX_PER_IN
    cx = (x0 + x1) / 2
    cy = (PANEL_Y[0] + PANEL_Y[1]) / 2
    l, r = cx - w / 2, cx + w / 2
    t, b = cy - h / 2, cy + h / 2
    return ((l, t), (r, t), (r, b), (l, b))


def main():
    os.makedirs(OUT, exist_ok=True)
    w_in, h_in = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (20.0, 10.0)
    suffix = '' if (w_in, h_in) == (20.0, 10.0) else '-%gx%g' % (w_in, h_in)
    for v in VIEWS:
        photo = Image.open(os.path.join(SRC, v['src'])).rotate(-90, expand=True)
        base = photo.crop(v['crop']).convert('RGBA')
        for stem, x0, x1 in v['doors']:
            art = Image.open(os.path.join(HERE, 'assets', stem + '.png')).convert('RGBA')
            place(base, art, quad(x0, x1, w_in, h_in))
        # the panels are measured against the working crop, so the framing trim
        # only happens once the artwork is already down
        base = base.crop(v['trim'])
        out = os.path.join(OUT, v['name'] + suffix + '.jpg')
        base.convert('RGB').save(out, quality=88, optimize=True)
        print('%-26s %s  %g x %g in  %.0f KB'
              % (v['name'] + suffix, base.size, w_in, h_in, os.path.getsize(out) / 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main())
