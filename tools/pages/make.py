#!/usr/bin/env python3
"""Write the new pages from their specs, then refresh the shared bits every page carries.

  python3 tools/pages/make.py          write pages, footer links, hreflang, sitemap
  python3 tools/pages/make.py --check  validate the specs only

Then run python3 _quote/build.py to inject the quote tool.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402
import glob
import importlib
ROOT = lib.ROOT
EN, ES = [], []
for path in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'specs_*.py'))):
    mod = importlib.import_module(os.path.basename(path)[:-3])
    (ES if '_es' in path else EN).extend(mod.PAGES)
ALL = EN + ES

# the language pairs: English page -> Spanish page
PAIRS = {'index.html': 'espanol.html', 'pigeon-proofing.html': 'control-de-palomas.html',
         'window-cleaning.html': 'limpieza-de-ventanas.html', 'solar-panel-cleaning.html': 'limpieza-de-paneles-solares.html'}

FOOTER_AREAS_ADD = [('mountain-communities.html', 'Mountain communities'), ('pigeon-proofing-fontana.html', 'Fontana'),
                    ('pigeon-proofing-rancho-cucamonga.html', 'Rancho Cucamonga')]
FOOTER_COMPANY_ADD = [('espanol.html', 'Español')]


def check_all():
    bad = 0
    for p in ALL:
        errs = lib.check(p)
        if errs:
            bad += 1
            print(p['fn'], '·', '; '.join(errs))
    seen = set()
    for p in ALL:
        if p['fn'] in seen:
            print('duplicate', p['fn']); bad += 1
        seen.add(p['fn'])
    return bad


def footer_links(html):
    """Add the new area and company links to a page's footer, once."""
    def add(block_h3, links, s):
        m = re.search(r'(?s)(<div class="footer-col">\s*<h3>%s</h3>.*?)(\n      </div>)' % block_h3, s)
        if not m:
            return s
        body = m.group(1)
        for href, label in links:
            if 'href="%s"' % href in body:
                continue
            anchor = '        <a href="service-areas.html">' if block_h3 == 'Areas' else '        <a href="privacy.html">'
            if anchor in body:
                body = body.replace(anchor, '        <a href="%s">%s</a>\n%s' % (href, label, anchor), 1)
            else:
                body += '\n        <a href="%s">%s</a>' % (href, label)
        return s[:m.start(1)] + body + s[m.end(1):]
    html = add('Areas', FOOTER_AREAS_ADD, html)
    html = add('Company', FOOTER_COMPANY_ADD, html)
    return html


def hreflang_pair(html, en, es):
    """Both pages point at each other and at themselves."""
    tags = ('  <link rel="alternate" hreflang="en" href="%s%s" />\n  <link rel="alternate" hreflang="es" href="%s%s" />\n  <link rel="alternate" hreflang="x-default" href="%s%s" />\n'
            % (lib.SITE, '' if en == 'index.html' else en, lib.SITE, es, lib.SITE, '' if en == 'index.html' else en))
    html = re.sub(r'  <link rel="alternate" hreflang="[^"]+" href="[^"]+" />\n', '', html)
    return html.replace('  <link rel="canonical"', tags + '  <link rel="canonical"', 1) if 'hreflang' not in html else html


PRIORITY = {'index.html': ('1.0', 'monthly')}
HUBS = ['adhesive-removal', 'commercial-window-cleaning', 'graffiti-removal', 'hard-water-removal', 'pigeon-proofing', 'post-construction-window-cleaning',
        'pricing', 'screen-repair', 'solar-panel-cleaning', 'window-cleaning']
CITY = ['inland-empire', 'spring-valley-lake', 'silverwood', 'about', 'adelanto', 'apple-valley', 'contact', 'gallery', 'hesperia', 'oak-hills', 'phelan',
        'reviews', 'service-areas', 'victorville', 'mountain-communities', 'espanol', 'control-de-palomas', 'limpieza-de-ventanas', 'limpieza-de-paneles-solares']
TOPIC08 = ['screen-replacement', 'all-weather-mesh', 'sliding-door-screen-repair', 'solar-panel-cleaning-warranty-safe', 'solar-cleaning-maintenance-plan',
           'solar-panel-bird-mesh-cost', 'pigeon-proofing-without-drilling', 'pigeon-droppings-cleanup', 'hard-water-stains-windows', 'window-cleaning-two-story',
           'inside-window-cleaning', 'window-cleaning-maintenance-plan', 'storefront-window-cleaning', 'office-window-cleaning', 'medical-office-window-cleaning',
           'hesperia-window-cleaning-reviews']


def sitemap(today):
    pages = sorted(f for f in os.listdir(ROOT) if f.endswith('.html') and f not in ('404.html', 'privacy.html'))
    def pri(fn):
        b = fn[:-5]
        if fn == 'index.html':
            return '1.0'
        if b in HUBS:
            return '0.9'
        if b in CITY or b in TOPIC08:
            return '0.8'
        return '0.7'
    order = sorted(pages, key=lambda f: (-float(pri(f)), f))
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for fn in order:
        loc = lib.SITE + ('' if fn == 'index.html' else fn)
        out += ['  <url>', '    <loc>%s</loc>' % loc, '    <lastmod>%s</lastmod>' % today, '    <changefreq>monthly</changefreq>', '    <priority>%s</priority>' % pri(fn)]
        pair = PAIRS.get(fn) or next((en for en, es in PAIRS.items() if es == fn), None)
        if pair:
            en, es = (fn, PAIRS[fn]) if fn in PAIRS else (pair, fn)
            out += ['    <xhtml:link rel="alternate" hreflang="en" href="%s%s" />' % (lib.SITE, '' if en == 'index.html' else en),
                    '    <xhtml:link rel="alternate" hreflang="es" href="%s%s" />' % (lib.SITE, es)]
        out.append('  </url>')
    out.append('</urlset>')
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    return len(order)


def main():
    bad = check_all()
    if '--check' in sys.argv:
        print('specs', len(ALL), 'problems', bad)
        sys.exit(1 if bad else 0)
    if bad:
        print('fix the specs first'); sys.exit(1)
    lib.DIMS.update(lib.photo_dims())
    parts = lib.ref_parts()
    for p in ALL:
        lib.write_page(p, parts)
    print('wrote', len(ALL), 'pages')
    # shared bits on every page: footer links, language links, sitemap
    n = 0
    for fn in sorted(os.listdir(ROOT)):
        if not fn.endswith('.html') or fn in ('404.html',):
            continue
        path = os.path.join(ROOT, fn)
        s = open(path, encoding='utf-8').read()
        t = footer_links(s) if 'lang="es"' not in s[:80] else s
        if fn in PAIRS:
            t = hreflang_pair(t, fn, PAIRS[fn])
        if t != s:
            open(path, 'w', encoding='utf-8').write(t); n += 1
    print('footer or hreflang touched', n, 'pages')
    import datetime
    print('sitemap urls', sitemap(datetime.date.today().isoformat()))


if __name__ == '__main__':
    main()
