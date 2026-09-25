"""Page assembly for Tony's Window Cleaning.

A page is a dict (see specs_en.py). This module turns it into the same HTML shape every
existing page uses: head with schema, the shared nav and footer lifted from a live page so
they never drift, the quote tool hero with the tq markers (build.py fills those), then the
page's own sections. Run make.py, then _quote/build.py.
"""
import html as H
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = 'https://twindowclean.com/'
REF = 'pigeon-proofing-hesperia.html'   # the page whose nav, footer and business block are copied


def esc(s):
    # the rest of the site writes Tony's with a plain apostrophe in titles and attributes, so match it
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def read(fn):
    with open(os.path.join(ROOT, fn), encoding='utf-8') as f:
        return f.read()


def ref_parts():
    s = read(REF)
    nav = re.search(r'(?s)  <header class="nav" id="nav">.*?</header>\n', s).group(0)
    foot = re.search(r'(?s)  <footer class="footer">.*?</footer>\n', s).group(0)
    biz = re.search(r'(?s)  <!-- LocalBusiness : one entity, referenced from every page -->\n  <script type="application/ld\+json">.*?</script>\n', s).group(0)
    tags = re.search(r'(?s)  <!-- Google tag \(gtag\.js\).*?</noscript>\n', s).group(0)
    return nav, foot, biz, tags


NAV_ES = '''  <header class="nav" id="nav">
    <a href="espanol.html" class="brand">
      <img src="assets/logo-92.png" alt="Logotipo de Tony's Window Cleaning" class="brand-logo" fetchpriority="high" width="46" height="46">
      <span class="brand-text">Tony's <strong>Window Cleaning</strong></span>
    </a>
    <nav class="nav-links" id="navLinks">
      <a href="limpieza-de-ventanas.html">Ventanas</a>
      <a href="control-de-palomas.html">Palomas</a>
      <a href="limpieza-de-paneles-solares.html">Paneles solares</a>
      <a href="#faq">Preguntas</a>
      <a href="#quote" class="nav-cta">Cotización gratis</a>
    </nav>
    <a href="tel:7145590300" class="nav-phone" aria-label="Llamar a Tony's Window Cleaning">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.37 2.3.57 3.5.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.57 3.5a1 1 0 01-.24 1l-2.23 2.3z"/></svg>
      <span>714-559-0300</span>
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </header>
'''

FOOT_ES = '''  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <a href="espanol.html" class="brand footer-brand">
          <img src="assets/logo-92.png" alt="Logotipo de Tony's Window Cleaning" class="brand-logo" width="46" height="46" loading="lazy" decoding="async">
          <span class="brand-text">Tony's <strong>Window Cleaning</strong></span>
        </a>
        <p class="footer-note">Limpieza de vidrios para casas y negocios en el High Desert y el Inland Empire. Ventanas, paneles solares, control de palomas y mosquiteros, con cada precio publicado.</p>
      </div>
      <div class="footer-col">
        <h3>Servicios</h3>
        <a href="limpieza-de-ventanas.html">Limpieza de ventanas</a>
        <a href="limpieza-de-paneles-solares.html">Limpieza de paneles solares</a>
        <a href="control-de-palomas.html">Control de palomas</a>
        <a href="screen-repair.html">Mosquiteros (en inglés)</a>
        <a href="commercial-window-cleaning.html">Negocios (en inglés)</a>
      </div>
      <div class="footer-col">
        <h3>Zonas</h3>
        <a href="hesperia.html">Hesperia</a>
        <a href="victorville.html">Victorville</a>
        <a href="apple-valley.html">Apple Valley</a>
        <a href="adelanto.html">Adelanto</a>
        <a href="inland-empire.html">Inland Empire</a>
        <a href="service-areas.html">Todas las zonas</a>
      </div>
      <div class="footer-col">
        <h3>Empresa</h3>
        <a href="index.html">English</a>
        <a href="reviews.html">Reseñas</a>
        <a href="pricing.html">Precios</a>
        <a href="privacy.html">Privacidad</a>
      </div>
      <div class="footer-col">
        <h3>Contacto</h3>
        <a href="tel:7145590300">714-559-0300</a>
        <a href="mailto:twindowclean@gmail.com">twindowclean@gmail.com</a>
        <a href="https://www.facebook.com/twindowclean" target="_blank" rel="noopener">Facebook</a>
        <a href="https://g.page/r/CWQH1O3JGKh4EAE/review" target="_blank" rel="noopener">Dejar una reseña en Google</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; <span id="year"></span> Tony's Window Cleaning. Hesperia, California. Todos los derechos reservados.</p>
    </div>
  </footer>
'''


def jsonld(d):
    return '  <script type="application/ld+json">\n' + json.dumps(d, indent=2, ensure_ascii=False) + '\n</script>\n'


def service_schema(p):
    url = SITE + p['fn']
    d = {'@context': 'https://schema.org', '@type': 'Service', 'name': p['schema_name'], 'serviceType': p['service_type'], 'url': url,
         'provider': {'@id': SITE + '#business'}, 'areaServed': p.get('area', ['High Desert', 'Inland Empire', 'California']),
         'image': p['og_image']}
    if p.get('price'):
        d['offers'] = {'@type': 'Offer', 'price': p['price'], 'priceCurrency': 'USD', 'description': p['price_desc'], 'availability': 'https://schema.org/InStock'}
    if p.get('lang') == 'es':
        d['inLanguage'] = 'es'
    return d


def crumbs_schema(p):
    items = [('Home' if p.get('lang') != 'es' else 'Inicio', SITE if p.get('lang') != 'es' else SITE + 'espanol.html')]
    if p.get('parent'):
        items.append(p['parent'])
    if p.get('crumb'):
        items.append((p['crumb'], SITE + p['fn']))
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList',
            'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]}


def faq_schema(p):
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in p['faq']]}


def hreflang(p):
    out = ''
    for lang, fn in p.get('alts', []):
        out += '  <link rel="alternate" hreflang="%s" href="%s%s" />\n' % (lang, SITE, '' if fn == 'index.html' else fn)
    return out


def head(p, biz, tags):
    lang = p.get('lang', 'en')
    canon = SITE + p['fn']
    h = ['<!DOCTYPE html>', '<html lang="%s">' % lang, '<head>', '  <meta charset="UTF-8" />',
         '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
         '  <title>%s</title>' % esc(p['title']),
         '  <meta name="description" content="%s" />' % esc(p['desc']),
         '  <meta name="theme-color" content="#103050" />',
         '  <link rel="canonical" href="%s" />' % canon, '', hreflang(p).rstrip('\n') if p.get('alts') else '',
         '  <meta property="og:title" content="%s" />' % esc(p['title']),
         '  <meta property="og:description" content="%s" />' % esc(p.get('og_desc', p['desc'])),
         '  <meta property="og:type" content="website" />',
         '  <meta property="og:image" content="%s" />' % p['og_image'],
         '  <meta property="og:image:width" content="1200" />', '  <meta property="og:image:height" content="630" />',
         '  <meta property="og:url" content="%s" />' % canon,
         '  <meta property="og:locale" content="%s" />' % ('es_US' if lang == 'es' else 'en_US'),
         '  <meta name="twitter:card" content="summary_large_image" />', '',
         '  <link rel="icon" href="assets/favicon.png" />', '  <link rel="apple-touch-icon" href="assets/favicon.png" />',
         '  <link rel="preload" href="assets/fonts/plus-jakarta-sans.woff2" as="font" type="font/woff2" crossorigin>',
         '  <link rel="preload" href="assets/fonts/sora.woff2" as="font" type="font/woff2" crossorigin>',
         '  <link href="assets/fonts.css" rel="stylesheet">', tags.rstrip('\n'), '',
         '  <link href="style.css" rel="stylesheet">', '  <!-- tq:css -->', '<!-- /tq:css -->', '']
    h = [x for x in h if x is not None]
    out = '\n'.join(h) + '\n'
    out += jsonld(service_schema(p)) + jsonld(crumbs_schema(p)) + jsonld(faq_schema(p)) + '\n' + biz
    out += '</head>\n'
    return out


def para(t):
    return '        <p class="lead" style="text-align:left;margin-bottom:1.15rem">%s</p>\n' % t


def sec_text(kicker, title, paras, wide=False):
    out = '  <section class="section">\n    <div class="container%s">\n      <div class="section-head reveal">\n        <span class="kicker">%s</span>\n        <h2 class="section-title">%s</h2>\n      </div>\n      <div class="reveal">\n' % ('' if wide else ' narrow', esc(kicker), title)
    for t in paras:
        out += para(t)
    out += '      </div>\n    </div>\n  </section>\n\n'
    return out


def sec_tiles(kicker, title, tiles, lead=None):
    out = '  <section class="section">\n    <div class="container">\n      <div class="section-head reveal">\n        <span class="kicker">%s</span>\n        <h2 class="section-title">%s</h2>\n' % (esc(kicker), title)
    if lead:
        out += '        <p class="lead center">%s</p>\n' % lead
    out += '      </div>\n      <div class="hood-grid reveal">\n'
    for h3, t in tiles:
        out += '        <div class="hood">\n          <h3>%s</h3>\n          <p>%s</p>\n        </div>\n' % (h3, t)
    out += '      </div>\n    </div>\n  </section>\n\n'
    return out


DIMS = {}   # photo path -> (width, height), filled by make.py from the existing pages' img tags


def photo_dims():
    d = {}
    for fn in os.listdir(ROOT):
        if not fn.endswith('.html'):
            continue
        for m in re.finditer(r'<img src="(assets/photos/[^"]+)"[^>]*?width="(\d+)" height="(\d+)"', read(fn)):
            d[m.group(1)] = (int(m.group(2)), int(m.group(3)))
    return d


def sec_photos(kicker, title, lead, photos):
    out = '  <section class="section">\n    <div class="container">\n      <div class="section-head reveal">\n        <span class="kicker">%s</span>\n        <h2 class="section-title">%s</h2>\n        <p class="lead center">%s</p>\n      </div>\n      <div class="photo-grid reveal">\n' % (esc(kicker), title, lead)
    for ph in photos:
        src, alt = ph[0], ph[1]
        w, hgt = ph[2:4] if len(ph) > 3 else DIMS.get(src, (1000, 750))
        out += '        <figure class="photo-card">\n          <img src="%s" alt="%s"\n               loading="lazy" decoding="async" width="%d" height="%d">\n        </figure>\n' % (src, esc(alt), w, hgt)
    out += '      </div>\n    </div>\n  </section>\n\n'
    return out


def sec_faq(kicker, title, faq):
    out = '  <section id="faq" class="section faq">\n    <div class="container narrow">\n      <div class="section-head reveal">\n        <span class="kicker">%s</span>\n        <h2 class="section-title">%s</h2>\n      </div>\n      <div class="reveal">\n' % (esc(kicker), title)
    for q, a in faq:
        out += '        <details class="faq-item">\n          <summary>%s</summary>\n          <p>%s</p>\n        </details>\n' % (q, a)
    out += '      </div>\n    </div>\n  </section>\n\n'
    return out


def sec_cta(title, sub, btn, lang='en'):
    return ('  <section class="cta-banner">\n    <div class="container">\n      <h2>%s</h2>\n      <p>%s</p>\n      <div class="hero-actions center">\n'
            '        <a href="#quote" class="btn btn-primary">%s</a>\n        <a href="tel:7145590300" class="btn btn-ghost light">%s 714-559-0300</a>\n      </div>\n    </div>\n  </section>\n\n'
            % (title, sub, btn, 'Llama al' if lang == 'es' else 'Call'))


def hero(p):
    lang = p.get('lang', 'en')
    home = ('Inicio', 'espanol.html') if lang == 'es' else ('Home', '/')
    crumbs = '<a href="%s">%s</a>' % (home[1], home[0])
    if p.get('parent'):
        crumbs += '<span>/</span><a href="%s">%s</a>' % (p['parent'][1].replace(SITE, ''), esc(p['parent'][0]))
    if p.get('crumb'):
        crumbs += '<span>/</span>%s' % esc(p['crumb'])
    out = '  <div class="tq">\n<section class="tq-hero" id="tq-top">\n  <div class="wrap">\n    <div class="tq-intro">\n'
    out += '      <p class="crumbs">%s</p>\n' % crumbs
    out += '      <span class="where">%s</span>\n' % esc(p['where'])
    out += '      <h1>%s</h1>\n' % p['h1']
    out += '      <p class="tagline">%s</p>\n' % p['tagline']
    out += '      <p class="lede">%s</p>\n' % p['lede']
    out += '<!-- tq:cta -->\n<!-- /tq:cta -->\n    </div>\n<!-- tq:media -->\n<!-- /tq:media -->\n  </div>\n</section>\n<!-- tq:steps -->\n<!-- /tq:steps -->\n</div>\n\n'
    return out


def render(p, parts):
    nav, foot, biz, tags = parts
    lang = p.get('lang', 'en')
    out = head(p, biz, tags)
    out += '<body>\n  <div class="scroll-progress" id="scrollProgress"></div>\n\n'
    out += NAV_ES if lang == 'es' else nav
    out += '\n' + hero(p)
    for kind, *args in p['sections']:
        if kind == 'text':
            out += sec_text(*args)
        elif kind == 'tiles':
            out += sec_tiles(*args)
        elif kind == 'photos':
            out += sec_photos(*args)
        elif kind == 'cta':
            out += sec_cta(*args, lang=lang)
    out += sec_faq(p.get('faq_kicker', 'Preguntas' if lang == 'es' else 'FAQ'), p['faq_title'], p['faq'])
    out += '\n' + (FOOT_ES if lang == 'es' else foot)
    out += '\n  <script src="assets/tags.js" defer></script>\n  <script src="main.js" defer></script>\n<!-- tq:tail -->\n<!-- /tq:tail -->\n</body>\n</html>\n'
    return out


def write_page(p, parts):
    with open(os.path.join(ROOT, p['fn']), 'w', encoding='utf-8') as f:
        f.write(render(p, parts))


def check(p):
    """The same rules audit.py applies: title under 60, description 140 to 158, FAQ text on the page, no dashes."""
    errs = []
    if len(p['title']) > 60:
        errs.append('title %d chars' % len(p['title']))
    if not 140 <= len(p['desc']) <= 158:
        errs.append('description %d chars' % len(p['desc']))
    blob = json.dumps(p, ensure_ascii=False)
    for ch in '—–':
        if ch in blob:
            errs.append('dash in copy')
    return errs
