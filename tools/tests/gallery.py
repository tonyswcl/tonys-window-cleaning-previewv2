#!/usr/bin/env python3
"""The real work photos, on every page (no browser needed):
- the strip sits between the hero (3D) and the quote, on every page that has relevant work, and nowhere it doesn't fit
- its photos fit the page's service, its own town comes first, a heading that names the town has at least 2 photos from it
- captions name the right town, no photo twice on a page, every file and thumbnail exists, nothing below job quality
- the main gallery shows only the best photos and the real before and after pair
usage: python3 tools/tests/gallery.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, '_quote'))
import build  # noqa: E402

data = json.load(open(os.path.join(ROOT, '_quote', 'src', 'photos.json'), encoding='utf-8'))
BY = {p['f']: p for p in data['photos']}
NO_STRIP = {'gallery.html', 'privacy.html', '404.html'}
res = []


def ok(name, cond, detail=''):
    res.append(('PASS ' if cond else 'FAIL ') + name + ('  [' + str(detail)[:300] + ']' if detail and not cond else ''))


strips, bad_place, bad_svc, bad_city, bad_dup, bad_file, bad_head, bad_tier, missing, extra = 0, [], [], [], [], [], [], [], [], []
for fn in sorted(f for f in os.listdir(ROOT) if f.endswith('.html')):
    html = open(os.path.join(ROOT, fn), encoding='utf-8').read()
    if '<!-- tq:steps -->' not in html:
        continue
    conf = build.page_config(fn)
    focus = build.focus(conf)
    want = focus in build.WORK_SVC and fn not in NO_STRIP
    m = re.search(r'<section class="tq-work" id="work" data-work-svc="(\w+)" data-local="(\d+)">(.*?)</section>', html, re.S)
    if not m:
        if want:
            missing.append(fn)
        continue
    if not want:
        extra.append(fn)
    strips += 1
    svc, local, body = m.group(1), int(m.group(2)), m.group(3)
    if not (html.index('id="tq-top"') < m.start() < html.index('id="quote"')):
        bad_place.append(fn)
    items = re.findall(r'<a href="assets/photos/([\w-]+)\.jpg" data-work><img src="assets/photos/t/([\w-]+)\.webp" alt="([^"]+)"[^>]*></a><span>([^<]+)</span>', body)
    if len(items) < 3 or len(items) > build.WORK_N:
        bad_file.append(fn + ' count %d' % len(items))
    names = [a for a, _, _, _ in items]
    if len(set(names)) != len(names):
        bad_dup.append(fn + ' in strip')
    outside = re.sub(r'<script\b.*?</script>', '', re.sub(r'<!-- tq:(\w+) -->.*?<!-- /tq:\1 -->', '', html, flags=re.S), flags=re.S)
    for f in names:
        if 'assets/photos/%s.jpg' % f in outside:
            bad_dup.append(fn + ' ' + f)
    page_svc = build.WORK_SVC[focus] or 'mix'
    city = conf.get('city')
    for f, t, alt, cap in items:
        p = BY.get(f)
        if not p or f != t:
            bad_file.append(fn + ' ' + f)
            continue
        for path in ('assets/photos/%s.jpg' % f, 'assets/photos/t/%s.webp' % f):
            if not os.path.exists(os.path.join(ROOT, path)):
                bad_file.append(path)
        if p['tier'] not in ('best', 'job'):
            bad_tier.append(fn + ' ' + f)
        if not (p['svc'] == page_svc or (page_svc == 'mix' and p['svc'] in ('win', 'sol', 'pig'))) or svc != page_svc:
            bad_svc.append(fn + ' ' + f)
        town = build.CITY_NAME.get(p['city']) if p['city'] else None
        if (town and not cap.startswith(town + ' · ')) or (not town and ' · ' in cap):
            bad_city.append(fn + ' ' + f + ' ' + cap)
    h2 = re.search(r'<h2>(.*?)</h2>', body).group(1)
    n_local = sum(1 for f, _, _, _ in items if BY[f]['city'] and build.CITY_NAME[BY[f]['city']] == city) if city else 0
    if n_local != local or (city and (' in %s?' % city in h2) != (n_local >= 2)):
        bad_head.append('%s local=%d h2=%s' % (fn, n_local, h2))
    # the town's own photos come first
    firsts = [bool(city and BY[f]['city'] and build.CITY_NAME[BY[f]['city']] == city) for f, _, _, _ in items]
    if firsts != sorted(firsts, reverse=True):
        bad_head.append(fn + ' own town not first')
    if conf.get('lang') == 'es' and not h2.startswith('¿'):
        bad_head.append(fn + ' not in Spanish')

ok('every page with relevant work has the strip (%d strips)' % strips, not missing, missing)
ok('no strip where nothing fits (storefront, graffiti, decals, main gallery)', not extra, extra)
ok('the strip sits after the 3D hero and before the quote', not bad_place, bad_place)
ok('photos fit the page service', not bad_svc, bad_svc)
ok('captions name the town the photo was taken in, and only then', not bad_city, bad_city)
ok('no photo twice on a page', not bad_dup, bad_dup)
ok('every photo and thumbnail exists, 3 to 6 a strip', not bad_file, bad_file)
ok('only job quality photos or better in strips', not bad_tier, bad_tier)
ok('a heading names the town only with 2 or more photos from it, own town first, Spanish in Spanish', not bad_head, bad_head)
# the main gallery
g = open(os.path.join(ROOT, 'gallery.html'), encoding='utf-8').read()
best = re.findall(r'<!-- tq:best-(\w+) -->(.*?)<!-- /tq:best-\1 -->', g, re.S)
ok('main gallery has the four best blocks', sorted(k for k, _ in best) == ['pig', 'scr', 'sol', 'win'], [k for k, _ in best])
pairs = {x.split('/')[-1][:-4] for pr in data['pairs'] for x in pr}
low = [f for _, blk in best for f in re.findall(r'assets/photos/([\w-]+)\.jpg', blk) if BY[f]['tier'] != 'best' and f not in pairs]
ok('main gallery grids use only best photos and the real pair', not low, low)
allg = re.findall(r'assets/(?:photos|gallery)/([\w-]+)\.jpg', re.sub(r'<script\b.*?</script>', '', re.sub(r'<!-- tq:(cta|media|tail|css) -->.*?<!-- /tq:\1 -->', '', g, flags=re.S), flags=re.S))
dups = sorted({f for f in allg if allg.count(f) > 1})
ok('no photo twice on the main gallery page', not dups, dups)
ok('no photo in the data is missing on disk', all(os.path.exists(os.path.join(ROOT, 'assets/photos/%s.jpg' % p['f'])) for p in data['photos']))
print('\n'.join(res))
sys.exit(1 if any(r.startswith('FAIL') for r in res) else 0)
