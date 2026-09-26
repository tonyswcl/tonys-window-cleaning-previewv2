#!/usr/bin/env python3
"""Small webp copies of the job photos for the real work strip above the quote (assets/photos/t/).
The strip loads these; a tap opens the full photo. Run after adding photos to _quote/src/photos.json."""
import json, os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'photos', 't')


def main():
    os.makedirs(OUT, exist_ok=True)
    data = json.load(open(os.path.join(ROOT, '_quote', 'src', 'photos.json'), encoding='utf-8'))
    n = 0
    for p in data['photos']:
        if p['tier'] not in ('best', 'job'):
            continue
        dst = os.path.join(OUT, p['f'] + '.webp')
        src = os.path.join(ROOT, 'assets', 'photos', p['f'] + '.jpg')
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            continue
        im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
        im.thumbnail((360, 360 * 4 // 3) if im.height >= im.width else (480, 360), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=72, method=6)
        n += 1
    print(n, 'thumbnails written to assets/photos/t')


if __name__ == '__main__':
    main()
