#!/usr/bin/env python3
"""Build Tony's quick quote into every page.

  python3 _quote/build.py            rebuild assets and refresh every marked page
  python3 _quote/build.py --init F   convert an old style page (hero + quote form) to the new layout
  python3 _quote/build.py --check    validate only, change nothing

Source lives in _quote/src. Output goes to assets/quote/ and into the marked blocks
of each page (<!-- tq:NAME --> ... <!-- /tq:NAME -->). Everything outside the markers,
like the headline, city copy, FAQ and schema, is never touched.
Jekyll skips folders that start with an underscore, so _quote is never published.
"""
import hashlib, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_quote', 'src')
FRAG = os.path.join(SRC, 'fragments')
OUT = os.path.join(ROOT, 'assets', 'quote')
SKIP = {'privacy.html', '404.html'}

CITIES = [('spring-valley-lake', 'Spring Valley Lake', 'Spring Valley Pkwy'), ('apple-valley', 'Apple Valley', 'Kiowa Rd, Apple Valley'),
          ('oak-hills', 'Oak Hills', 'Oak Hill Rd, Oak Hills'), ('hesperia', 'Hesperia', 'Main St, Hesperia'),
          ('victorville', 'Victorville', 'Bear Valley Rd, Victorville'), ('adelanto', 'Adelanto', 'Bartlett Ave, Adelanto'),
          ('phelan', 'Phelan', 'Phelan Rd, Phelan'), ('silverwood', 'Silverwood', 'Camp Creek, Silverwood'),
          ('inland-empire', 'Inland Empire', 'Base Line Rd, Rancho Cucamonga'),
          ('fontana', 'Fontana', 'Sierra Ave, Fontana'), ('rancho-cucamonga', 'Rancho Cucamonga', 'Base Line Rd, Rancho Cucamonga'),
          ('crestline', 'Crestline', 'Lake Dr, Crestline'), ('lake-arrowhead', 'Lake Arrowhead', 'Hwy 173, Lake Arrowhead'),
          ('running-springs', 'Running Springs', 'Hilltop Blvd, Running Springs'), ('big-bear-lake', 'Big Bear Lake', 'Big Bear Blvd, Big Bear Lake'),
          ('wrightwood', 'Wrightwood', 'Park Dr, Wrightwood'), ('cajon-pass', 'Cajon Pass', 'Cajon Blvd, Devore')]

# pages in Spanish: same tool, Spanish fragments and strings
SPANISH = {'espanol.html': 'index.html', 'control-de-palomas.html': 'pigeon-proofing.html',
           'limpieza-de-ventanas.html': 'window-cleaning.html', 'limpieza-de-paneles-solares.html': 'solar-panel-cleaning.html'}

# topic pages that don't follow the city naming: which services they start with, and which 3D module opens
TOPICS = {'screen-replacement': (['scr'], 'scr'), 'all-weather-mesh': (['scr'], 'scr'), 'sliding-door-screen-repair': (['scr'], 'scr'),
          'solar-panel-cleaning-warranty-safe': (['sol'], 'sol'), 'solar-cleaning-maintenance-plan': (['sol'], 'sol'), 'solar-panel-bird-mesh-cost': (['pig'], 'pig'),
          'pigeon-proofing-without-drilling': (['pig'], 'pig'), 'pigeon-droppings-cleanup': (['pig'], 'pig'),
          'hard-water-stains-windows': (['win', 'hw'], 'win'), 'window-cleaning-two-story': (['win'], 'win'), 'inside-window-cleaning': (['win'], 'win'),
          'window-cleaning-maintenance-plan': (['win'], 'win'), 'hesperia-window-cleaning-reviews': (['win'], 'home'),
          'storefront-window-cleaning': (['com'], 'com'), 'office-window-cleaning': (['com'], 'com'), 'medical-office-window-cleaning': (['com'], 'com'),
          'new-construction-window-cleaning-silverwood': (['pc'], 'win'), 'mountain-communities': (['win'], 'home')}
MOUNTAIN = ['crestline', 'lake-arrowhead', 'running-springs', 'big-bear-lake', 'wrightwood', 'cajon-pass']


def page_config(fn):
    base = fn[:-5]
    lang = 'es' if fn in SPANISH else 'en'
    if lang == 'es':
        fn = SPANISH[fn]
        base = fn[:-5]
    city = street = None
    for slug, name, st in CITIES:
        if base == slug or base.endswith('-' + slug):
            city, street = name, st
    if base in TOPICS:
        svc, mode = TOPICS[base]
        if base == 'window-cleaning-two-story':
            pass
    elif base.startswith('pigeon-proofing'):
        svc, mode = ['pig'], 'pig'
    elif base.startswith('solar-panel-cleaning'):
        svc, mode = ['sol'], 'sol'
    elif base.startswith('screen-repair'):
        svc, mode = ['scr'], 'scr'
    elif base.startswith('hard-water'):
        svc, mode = ['win', 'hw'], 'win'
    elif base.startswith('post-construction'):
        svc, mode = ['pc'], 'win'
    elif base.startswith('adhesive'):
        svc, mode = ['ad'], 'win'
    elif base.startswith('graffiti'):
        svc, mode = ['gr'], 'win'
    elif base.startswith('commercial'):
        svc, mode = ['com'], 'com'
    elif base.startswith('window-cleaning'):
        svc, mode = ['win'], 'win'
    elif base == 'inland-empire':
        svc, mode = ['pig'], 'home'
    else:
        svc, mode = ['win'], 'home'
    conf = {'svc': svc, 'mode': mode}
    if city:
        conf['city'] = city
        conf['street'] = street
    if lang == 'es':
        conf['lang'] = 'es'
    if base in MOUNTAIN or base == 'mountain-communities':
        conf['mountain'] = True
    return conf


def frag(name, lang='en'):
    """A fragment, in Spanish when the page is Spanish and a translation exists in fragments/es."""
    path = os.path.join(FRAG, lang, name) if lang != 'en' else os.path.join(FRAG, name)
    if not os.path.exists(path):
        path = os.path.join(FRAG, name)
    with open(path, encoding='utf-8') as f:
        html = f.read().rstrip('\n')
    if '<!-- tq-solar -->' in html:
        # one panel count and sections control, the same in every place it shows
        solar = re.sub(r'^<!--.*?-->\n', '', frag('solar.html', lang), flags=re.S)
        html = re.sub(r'( *)<!-- tq-solar -->', lambda m: '\n'.join(m.group(1) + x for x in solar.split('\n')), html)
    return html


def short_hash(path):
    with open(path, 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()[:10]


def esbuild():
    for cand in [shutil.which('esbuild'), '/tmp/tqtools/node_modules/.bin/esbuild']:
        if cand and os.path.exists(cand):
            return cand
    return None


def build_assets():
    os.makedirs(OUT, exist_ok=True)
    eb = esbuild()
    for name in ['q3d.js', 'quote.css', 'quote.js']:
        src, dst = os.path.join(SRC, name), os.path.join(OUT, name)
        if name == 'quote.js':
            with open(src, encoding='utf-8') as f:
                code = f.read().replace('assets/quote/q3d.js', 'assets/quote/q3d.js?v=' + short_hash(os.path.join(OUT, 'q3d.js')))
            tmp = os.path.join(OUT, '.quote.src.js')
            with open(tmp, 'w', encoding='utf-8') as f:
                f.write(code)
            src = tmp
        if eb:
            subprocess.run([eb, src, '--minify', '--target=es2017,safari13', '--legal-comments=none', '--outfile=' + dst],
                           check=True, capture_output=True)
        else:
            shutil.copyfile(src, dst)
        if src.endswith('.quote.src.js'):
            os.remove(src)
    v = {n: short_hash(os.path.join(OUT, n)) for n in ['quote.css', 'quote.js', 'q3d.js']}
    # a rigged character, when one has been added, plus the loader it needs
    tech = os.path.join(OUT, 'tech.glb')
    if os.path.exists(tech):
        v['tech'] = short_hash(tech)
        dst = os.path.join(ROOT, 'assets', 'vendor', 'gltf.min.js')
        # the loader and the meshopt decoder the compressed character needs, in one file
        tmp = os.path.join(OUT, '.gltf.src.js')
        with open(tmp, 'w', encoding='utf-8') as f:
            for part in ['GLTFLoader.js', 'meshopt_decoder.js']:
                with open(os.path.join(SRC, 'vendor', part), encoding='utf-8') as g:
                    f.write(g.read() + '\n')
        if eb:
            subprocess.run([eb, tmp, '--minify', '--target=es2017,safari13', '--legal-comments=none', '--outfile=' + dst], check=True, capture_output=True)
        else:
            shutil.copyfile(tmp, dst)
        os.remove(tmp)
    return v


def lazy_bodies(html, keep):
    """Service options this page doesn't start with go in an inert <template>.
    quote.js unpacks them the first time someone touches the tool, so visitors see
    the same thing, but the same 300 words aren't repeated in every page's HTML."""
    def wrap(m):
        return m.group(0) if m.group(2) in keep else m.group(1) + '<template data-tpl>' + m.group(0).strip() + '</template>'
    return re.sub(r'( *)<div class="svc" data-body="(\w+)">.*?\n        </div>', wrap, html, flags=re.S)


def lazy_ov(html):
    """The 3D control panel only matters once the 3D is open, so it waits in a template too."""
    a, b = html.index('    <div class="ops" data-for="home">'), html.index('    <div class="osum"')
    return html[:a] + '    <template data-tpl>\n' + html[a:b] + '    </template>\n' + html[b:]


def com_swap(html):
    """Commercial pages open on the storefront: its poster, its words."""
    return (html.replace('assets/quote/home-4x5.webp', 'assets/quote/com-4x5.webp').replace('assets/quote/home-16x10.webp', 'assets/quote/com-16x10.webp')
            .replace('alt="3D model of a High Desert home with clean windows, washed solar panels, pigeon mesh and spinners"', 'alt="3D model of a storefront with clean glass doors, panes and window stickers"')
            .replace('alt="3D model of a High Desert home with clean windows, washed solar panels and pigeon mesh"', 'alt="3D model of a storefront with clean glass doors and panes"')
            .replace('aria-label="Open the 3D preview of your home"', 'aria-label="Open the 3D preview of your storefront"')
            .replace('See it on my home', 'See it on my storefront'))


# ---------- what each page leads with: its own service, then only the ones that go with it ----------
def focus(conf):
    """The service a page is about, for its hero chips, photo tabs and model: home pages cover everything."""
    svc, mode = conf['svc'], conf['mode']
    if mode == 'com':
        return 'com'
    if 'hw' in svc:
        return 'hw'
    if svc and svc[0] in ('pc', 'ad', 'gr'):
        return svc[0]
    if mode == 'home':
        return 'pig' if svc == ['pig'] else 'home'
    return mode


# the hero's photo tabs, in order: the 3D first, then the page's service, then what's related to it
TABS = {'home': ['r3d', 'win', 'sol', 'pig'], 'win': ['r3d', 'win', 'scr'], 'hw': ['r3d', 'win', 'scr'], 'pc': ['r3d', 'win'], 'ad': ['r3d', 'win'], 'gr': ['r3d', 'win'],
        'sol': ['r3d', 'sol', 'pig'], 'pig': ['r3d', 'pig', 'sol'], 'scr': ['r3d', 'scr', 'win'], 'com': ['r3d', 'win']}

CHIPS = {
    'en': {
        'win': [('Single story', '$149', ''), ('Two story', '$249', ''), ('Inside', '+$49', ''), ('Screens, tracks and sills', 'included', '')],
        'hw': [('Hard water', 'from $12', '/pane'), ('Windows', '$149', ''), ('Two story', '$249', ''), ('Inside', '+$49', '')],
        'pc': [('New construction', '$249', ''), ('Two story', '$349', ''), ('Inside and out', '', ''), ('Tempered glass', 'tested first', '')],
        'ad': [('Decal removal', 'from $129', ''), ('Up to 3 panes', '', ''), ('Windows', '$149', '')],
        'gr': [('Graffiti removal', 'from $129', ''), ('Etched glass check', '$89', ''), ('Windows', '$149', '')],
        'sol': [('Solar', '$7', '/panel'), ('20 panels', '$140', ''), ('Nobody walks', 'on your panels', ''), ('Pigeon proofing', '$450', '')],
        'pig': [('Pigeon proofing', '$450', ''), ('Up to', '12 panels', ''), ('Past 12', '+$50', '/panel'), ('Solar wash', 'included', ''), ('Warranty', '2 years', '')],
        'scr': [('Charcoal fiberglass', '$53.99', ''), ('All weather', '$64.99', ''), ('New frames', '+$10', ''), ('Window cleaning', '$149', '')],
    },
    'es': {
        'win': [('Un piso', '$149', ''), ('Dos pisos', '$249', ''), ('Por dentro', '+$49', ''), ('Mosquiteros, rieles y repisas', 'incluidos', '')],
        'sol': [('Solar', '$7', '/panel'), ('20 paneles', '$140', ''), ('Nadie camina', 'sobre tus paneles', ''), ('Control de palomas', '$450', '')],
        'pig': [('Control de palomas', '$450', ''), ('Hasta', '12 paneles', ''), ('Después de 12', '+$50', '/panel'), ('Lavado solar', 'incluido', ''), ('Garantía', '2 años', '')],
    }}


def chips_html(items):
    return '\n'.join('        <span class="chip">' + a + (' <b>' + b + '</b>' if b else '') + c + '</span>' for a, b, c in items)


# window, solar and screen pages show the model home without pigeon mesh and spinners, so their poster does too
PLAIN_ALT = {'en': ('alt="3D model of a High Desert home with clean windows, washed solar panels, pigeon mesh and spinners"',
                    'alt="3D model of a High Desert home with clean windows and washed solar panels"'),
             'es': ('alt="Modelo 3D de una casa del High Desert con ventanas limpias, paneles solares lavados, malla contra palomas y espantapájaros"',
                    'alt="Modelo 3D de una casa del High Desert con ventanas limpias y paneles solares lavados"')}


def poster_of(conf):
    return 'com-4x5' if conf['mode'] == 'com' else 'home-plain-4x5' if conf['mode'] in ('win', 'sol', 'scr') else 'home-4x5'


def hero_for(conf, cta, media, lang):
    """Swap the shared hero's chips, photo tabs and poster for the ones that fit this page."""
    if poster_of(conf) == 'home-plain-4x5':
        a, b = PLAIN_ALT[lang]
        media = media.replace('assets/quote/home-4x5.webp', 'assets/quote/home-plain-4x5.webp').replace(a, b)
    f = focus(conf)
    items = CHIPS.get(lang, {}).get(f)
    if items:
        cta = re.sub(r'(      <div class="chips">\n).*?(\n      </div>)', lambda m: m.group(1) + chips_html(items) + m.group(2), cta, count=1, flags=re.S)
    keep = TABS.get(f, TABS['home'])
    btns = {k: v for v, k in re.findall(r'(        <button type="button" data-m="(\w+)"[^\n]*\n)', media)}
    lays = {k: v for v, k in re.findall(r'(        <div class="lay car" data-lay="(\w+)" hidden>\n.*?\n        </div>\n)', media, flags=re.S)}
    for k, v in lays.items():
        media = media.replace(v, '')
    for k, v in btns.items():
        media = media.replace(v, '')
    order_btns = ''.join(btns[k] for k in keep if k in btns)
    media = re.sub(r'(      <div class="modes" id="modes" role="group" aria-label="[^"]*">\n)', lambda m: m.group(1) + order_btns, media, count=1)
    anchor = '        <span class="lbl" id="wlbl">'
    media = media.replace(anchor, ''.join(lays[k] for k in keep if k in lays) + anchor, 1)
    return cta, media


# the four service tiles, with the page's own service first
TILE_ORDER = {'win': ['win', 'scr', 'sol', 'pig'], 'hw': ['win', 'scr', 'sol', 'pig'], 'sol': ['sol', 'pig', 'win', 'scr'],
              'pig': ['pig', 'sol', 'win', 'scr'], 'scr': ['scr', 'win', 'sol', 'pig']}


def tiles_for(conf, steps):
    order = TILE_ORDER.get(focus(conf))
    if not order:
        return steps
    tiles = {k: v for v, k in re.findall(r'(      <button type="button" class="tile" data-svc="(\w+)".*?</button>\n)', steps, flags=re.S)}
    if set(tiles) != set(order):
        return steps
    first = steps.index(tiles['win'])
    for v in tiles.values():
        steps = steps.replace(v, '')
    return steps[:first] + ''.join(tiles[k] for k in order) + steps[first:]


# ---------- the real work strip: 3D first, then real photos, then the quote ----------
# One data file (_quote/src/photos.json) says what each job photo shows, its service and the town it was taken in.
# Each page gets a short strip of the photos that fit its service, its own town first, placed between the hero and
# the quote. Photos the page already shows elsewhere are left out, pages with nothing relevant get no strip.
with open(os.path.join(SRC, 'photos.json'), encoding='utf-8') as _f:
    PHOTOS = [p for p in json.load(_f)['photos'] if p['tier'] in ('best', 'job')]
WORK_SVC = {'win': 'win', 'hw': 'win', 'pc': 'win', 'sol': 'sol', 'pig': 'pig', 'scr': 'scr', 'home': None}
WORK_SKIP = {'gallery.html'}   # the main gallery is its own page
WORK_N = 6
WORK_NAME = {'en': {'win': 'window cleaning', 'sol': 'solar panel cleaning', 'pig': 'pigeon proofing', 'scr': 'screen repair', None: 'work'},
             'es': {'win': 'limpieza de ventanas', 'sol': 'limpieza de paneles solares', 'pig': 'control de palomas', 'scr': 'reparación de mosquiteros', None: ''}}
CITY_NAME = {slug: name for slug, name, _ in CITIES}


def work_pick(svc, city, used, hero):
    """The photos for one page: its service (or a mix of windows, solar and pigeons on a general page), its town first,
    then the strongest, then towns we know before photos with no town. Nothing the page shows elsewhere."""
    pool = [p for p in PHOTOS if (p['svc'] == svc if svc else p['svc'] in ('win', 'sol', 'pig'))
            and 'assets/photos/%s.jpg' % p['f'] not in used and ('assets/photos/%s.jpg' % p['f'] not in hero or (city and p['city'] == city))]
    pool.sort(key=lambda p: (p['city'] != city if city else 0, p['tier'] != 'best', p['city'] is None))
    if svc:
        return pool[:WORK_N]
    out, by = [], {k: [p for p in pool if p['svc'] == k] for k in ('win', 'sol', 'pig')}
    while len(out) < WORK_N and any(by.values()):
        for k in ('win', 'sol', 'pig'):
            if by[k] and len(out) < WORK_N:
                out.append(by[k].pop(0))
    return sorted(out, key=lambda p: p['city'] != city if city else 0)   # the town's own photos stay first


def work_block(fn, conf, used):
    lang, f = conf.get('lang', 'en'), focus(conf)
    if fn in WORK_SKIP or f not in WORK_SVC:
        return ''
    svc = WORK_SVC[f]
    slug = next((k for k, v in CITY_NAME.items() if v == conf.get('city')), None)
    hero = set(re.findall(r'assets/photos/[\w-]+\.jpg', frag('media.html')))
    pics = work_pick(svc, slug, used, hero)
    if len(pics) < 3:   # few photos of this service: the hero's photo tab stays hidden until tapped, so share with it
        pics = work_pick(svc, slug, used, set())
    if len(pics) < 3:
        return ''
    local = sum(p['city'] == slug for p in pics) if slug else 0
    city = conf.get('city')
    if lang == 'es':
        what = WORK_NAME['es'][svc]
        h = '¿Quieres ver trabajos de %s que hemos hecho?' % what if what else '¿Quieres ver trabajos que hemos hecho?'
        lead = 'Fotos de nuestros propios trabajos. Toca una para verla más grande.'
        nxt = '¿Te gusta lo que ves? <a href="#quote">Arma tu proyecto aquí abajo.</a>'
        kick, cap_key, alt_key = 'Trabajo real', 'es', 'alt_es'
    else:
        what = WORK_NAME['en'][svc]
        if city and local >= 2:
            h = "Interested in seeing %s we've done in %s?" % (what, city)
            lead = 'Photos from our own jobs in %s%s. Tap one to see it bigger.' % (city, ', and a few from nearby towns' if local < len(pics) else '')
        elif city:
            h = "Interested in seeing %s we've done?" % what
            of = ' of this' if svc else ''
            lead = ("We don't have many %s photos%s yet, so most of these are from other towns we serve. Tap one to see it bigger." if local
                    else "We don't have %s photos%s yet, so these are from other towns we serve. Tap one to see it bigger.") % (city, of)
        else:
            h = "Interested in seeing %s we've done?" % what
            lead = 'Photos from our own jobs, with the town on each one we know. Tap one to see it bigger.'
        nxt = 'Like what you see? <a href="#quote">Build your project below.</a>'
        kick, cap_key, alt_key = 'Real work', 'en', 'alt'
    items = []
    for p in pics:
        w, hh = p['w'], p['h']
        k = min(360 / w, 480 / hh) if hh >= w else min(480 / w, 360 / hh)
        tw, th = round(w * k), round(hh * k)
        cap = ((CITY_NAME[p['city']] + ' · ') if p['city'] else '') + p[cap_key]
        items.append('      <li><a href="assets/photos/%s.jpg" data-work><img src="assets/photos/t/%s.webp" alt="%s" width="%d" height="%d" loading="lazy" decoding="async"></a><span>%s</span></li>'
                     % (p['f'], p['f'], p[alt_key].replace('"', '&quot;'), tw, th, cap))
    return ('<!-- REAL WORK: photos from real jobs, between the 3D and the quote -->\n'
            '<section class="tq-work" id="work" data-work-svc="%s" data-local="%d">\n  <div class="wrap">\n'
            '    <span class="where">%s</span>\n    <h2>%s</h2>\n    <p class="work-lead">%s</p>\n'
            '    <ul class="work-strip" data-n="%d">\n%s\n    </ul>\n    <p class="work-next">%s</p>\n  </div>\n</section>\n\n'
            % (svc or 'mix', local, kick, h, lead, len(items), '\n'.join(items), nxt))   # data-n: quote.css fills the desktop row with fewer photos


# ---------- the main gallery: only the best photos, from the same data file ----------
# A page opts in with an empty <!-- tq:best-win --> (win, sol, pig or scr) block inside a photo grid. The block gets
# the service's before and after pair, if there is one, then its best photos. The local strips above use the rest.
with open(os.path.join(SRC, 'photos.json'), encoding='utf-8') as _f:
    _ALL = json.load(_f)
BY_F = {p['f']: p for p in _ALL['photos']}


BEST_N = 6   # two full rows of three on desktop, three of two on a tablet: no half empty last row


def best_block(svc, lang='en', used=()):
    def card(p, cap):
        return ('        <figure class="photo-card">\n          <img src="assets/photos/%s.jpg" alt="%s" loading="lazy" decoding="async" width="%d" height="%d">\n'
                '          <figcaption>%s</figcaption>\n        </figure>' % (p['f'], p['alt' if lang == 'en' else 'alt_es'].replace('"', '&quot;'), p['w'], p['h'], cap))
    town = lambda p: (CITY_NAME[p['city']] + ' · ') if p['city'] else ''
    out, seen = [], set()
    for a, z in _ALL.get('pairs', []):
        pa, pz = BY_F[a.split('/')[-1][:-4]], BY_F[z.split('/')[-1][:-4]]
        if pa['svc'] == svc:
            out += [card(pa, 'Before · ' + town(pa) + pa['en']), card(pz, 'After · Same array, same visit')]
            seen |= {pa['f'], pz['f']}
    out += [card(p, town(p) + p['en']) for p in _ALL['photos'] if p['svc'] == svc and p['tier'] == 'best' and p['f'] not in seen
            and 'assets/photos/%s.jpg' % p['f'] not in used]   # a photo the page already shows in its own sections stays there
    return '\n'.join(out[:BEST_N])


def css_block(conf_v, conf):
    """The stylesheet, plus a preload for the hero poster so the picture paints before the 3D even starts loading."""
    poster = poster_of(conf)
    return ('<link href="assets/quote/quote.css?v=' + conf_v['quote.css'] + '" rel="stylesheet">\n'
            '  <link rel="preload" as="image" href="assets/quote/' + poster + '.webp" fetchpriority="high">')


def blocks(conf, v, fn='', used=()):
    lang = conf.get('lang', 'en')
    work = work_block(fn, conf, set(used))
    three_card = {'pig': 'card-pig.html', 'win': 'card-win.html', 'sol': 'card-sol.html', 'scr': 'card-scr.html', 'com': 'card-com.html'}.get(conf['mode'], 'card-home.html')
    if lang != 'en':
        steps = work + '\n\n'.join([lazy_bodies(tiles_for(conf, frag('steps.html', lang)), conf['svc']), frag('zip.html', lang), frag('three-head.html', lang) + '\n' + frag(three_card, lang) + '\n' + frag('three-tail.html', lang)])
        tail = ('<div class="tq" data-nosnippet>\n' + lazy_ov(frag('ov.html', lang)) + '\n' + frag('dock.html', lang) + '\n</div>\n'
                '<script>window.TQ=' + json.dumps(dict(conf, **({'tech': v['tech']} if v.get('tech') else {})), separators=(',', ':')) + ';</script>\n'
                '<script src="assets/quote/quote.js?v=' + v['quote.js'] + '" defer></script>')
        cta_es, media_es = hero_for(conf, frag('cta.html', lang), frag('media.html', lang), lang)
        return {'css': css_block(v, conf), 'cta': cta_es, 'media': media_es, 'steps': steps, 'tail': tail}
    head, media, cta = frag('three-head.html'), frag('media.html'), frag('cta.html')
    if conf['mode'] == 'com':
        head = com_swap(head).replace('<h2>See it on your home in 3D</h2><p>Pick your home. Watch the job get done.</p>', '<h2>See it on your storefront in 3D</h2><p>Set your panes, doors and stickers. Watch the glass get done.</p>')
        media = com_swap(media).replace('>3D home</button>', '>3D storefront</button>')
        cta = com_swap(cta).replace('''        <span class="chip">Windows <b>$149</b></span>
        <span class="chip">Two story <b>$249</b></span>
        <span class="chip">Inside <b>+$49</b></span>
        <span class="chip">Solar <b>$7</b>/panel</span>
        <span class="chip">Pigeon proofing <b>$450</b></span>
        <span class="chip">Screens <b>$53.99</b></span>''', '''        <span class="chip">Storefront <b>$149</b></span>
        <span class="chip">Monthly <b>15% off</b></span>
        <span class="chip">Every 2 weeks <b>25% off</b></span>
        <span class="chip">Partitions and mirrors <b>+$50</b></span>
        <span class="chip">Vinyl stickers <b>$10</b> each</span>''')
    cta, media = hero_for(conf, cta, media, 'en')
    steps = work + '\n\n'.join([lazy_bodies(tiles_for(conf, frag('steps.html')), conf['svc']), frag('zip.html'), head + '\n' + frag(three_card) + '\n' + frag('three-tail.html')])
    tail = ('<div class="tq" data-nosnippet>\n' + lazy_ov(frag('ov.html')) + '\n' + frag('dock.html') + '\n</div>\n'
            '<script>window.TQ=' + json.dumps(dict(conf, **({'tech': v['tech']} if v.get('tech') else {})), separators=(',', ':')) + ';</script>\n'
            '<script src="assets/quote/quote.js?v=' + v['quote.js'] + '" defer></script>')
    return {
        'css': css_block(v, conf),
        'cta': cta,
        'media': media,
        'steps': steps,
        'tail': tail,
    }


def replace_block(html, name, content):
    pat = re.compile(r'(<!-- tq:%s -->)(.*?)(<!-- /tq:%s -->)' % (name, name), re.S)
    if len(pat.findall(html)) != 1:
        raise ValueError('block %s found %d times' % (name, len(pat.findall(html))))
    return pat.sub(lambda m: m.group(1) + '\n' + content + '\n' + m.group(3), html)


def init_page(html, fn, conf):
    """Turn an old page (hero section + quote form) into the new layout with markers."""
    m = re.search(r'<section[^>]*class="hero[^"]*"[^>]*>.*?</section>', html, re.S)
    if not m:
        raise ValueError('no hero section')
    hero = m.group(0)

    def inner(pat):
        mm = re.search(pat, hero, re.S)
        return mm.group(1).strip() if mm else ''
    crumbs = inner(r'<p class="crumbs">(.*?)</p>')
    h1 = inner(r'<h1[^>]*>(.*?)</h1>')
    tag = inner(r'<p class="hero-tagline">(.*?)</p>')
    sub = re.sub(r'\s+', ' ', inner(r'<p class="hero-sub">(.*?)</p>'))
    where = ('Serving ' + conf['city'] + ' and the High Desert') if conf.get('city') else 'Serving the High Desert this week'
    intro = ''
    if crumbs:
        intro += '      <p class="crumbs">' + crumbs + '</p>\n'
    intro += '      <span class="where">' + where + '</span>\n      <h1>' + h1 + '</h1>\n'
    if tag:
        intro += '      <p class="tagline">' + tag + '</p>\n'
    if sub:
        intro += '      <p class="lede">' + sub + '</p>\n'
    new = ('<div class="tq">\n<section class="tq-hero" id="tq-top">\n  <div class="wrap">\n    <div class="tq-intro">\n' + intro +
           '<!-- tq:cta -->\n<!-- /tq:cta -->\n    </div>\n<!-- tq:media -->\n<!-- /tq:media -->\n  </div>\n</section>\n'
           '<!-- tq:steps -->\n<!-- /tq:steps -->\n</div>')
    html = html.replace(hero, new, 1)
    html = re.sub(r'\s*<section id="quote" class="section quote">.*?</section>', '', html, count=1, flags=re.S)
    html, n = re.subn(r'(<link href="style\.css[^"]*" rel="stylesheet">)', r'\1\n  <!-- tq:css -->\n<!-- /tq:css -->', html, count=1)
    if n != 1:
        raise ValueError('style.css link not found')
    html = html.replace('</body>', '<!-- tq:tail -->\n<!-- /tq:tail -->\n</body>', 1)
    html = html.replace('href="#hero"', 'href="#tq-top"')
    return html


def validate(html, fn):
    errs = []
    ids = re.findall(r'\sid="([^"]+)"', html)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        errs.append('duplicate ids ' + ','.join(dup))
    if html.count('assets/quote/quote.js') != 1:
        errs.append('quote.js included %d times' % html.count('assets/quote/quote.js'))
    for need in ['ov', 'stage', 'quote', 'price', 'tq-send', 'days', 'zipIn', 'h3host', 'dockTotal', 'ttotal', 'pdfBtn', 'shareBtn', 'hp']:
        if need not in ids:
            errs.append('missing #' + need)
    for a in set(re.findall(r'href="#([^"]+)"', html)):
        if a not in ids:
            errs.append('dead link #' + a)
    if not re.search(r'<link rel="canonical" href="https://twindowclean\.com/', html):
        errs.append('no canonical')
    return errs


def main():
    args = sys.argv[1:]
    check = '--check' in args
    init = args[args.index('--init') + 1:] if '--init' in args else []
    v = build_assets() if not check else {n: short_hash(os.path.join(OUT, n)) for n in ['quote.css', 'quote.js', 'q3d.js']}
    if check and os.path.exists(os.path.join(OUT, 'tech.glb')):
        v['tech'] = short_hash(os.path.join(OUT, 'tech.glb'))
    report, bad = [], 0
    for fn in sorted(os.listdir(ROOT)):
        if not fn.endswith('.html') or fn in SKIP:
            continue
        path = os.path.join(ROOT, fn)
        with open(path, encoding='utf-8') as f:
            html = f.read()
        conf = page_config(fn)
        if '<!-- tq:tail -->' not in html:
            if fn in init or 'all' in init:
                html = init_page(html, fn, conf)
            else:
                report.append(fn + ': not converted (run --init ' + fn + ')')
                continue
        if not check:
            # photos the page shows itself (structured data in <script> lists images but shows none)
            outside = re.sub(r'<script\b.*?</script>', '', re.sub(r'<!-- tq:(\w+) -->.*?<!-- /tq:\1 -->', '', html, flags=re.S), flags=re.S)
            used = set(re.findall(r'assets/photos/[\w-]+\.jpg', outside))
            for name, content in blocks(conf, v, fn, used).items():
                html = replace_block(html, name, content)
            for name in re.findall(r'<!-- tq:(best-\w+) -->', html):
                others = re.sub(r'<script\b.*?</script>', '', re.sub(r'<!-- tq:(\w+(?:-\w+)?) -->.*?<!-- /tq:\1 -->', '', html, flags=re.S), flags=re.S)
                html = replace_block(html, name, best_block(name[5:], conf.get('lang', 'en'), set(re.findall(r'assets/photos/[\w-]+\.jpg', others))))
            with open(path, 'w', encoding='utf-8') as f:
                f.write(html)
        errs = validate(html, fn)
        bad += bool(errs)
        report.append(fn + ': ' + (conf['mode'] + ' ' + ','.join(conf['svc'])) + (' · ' + '; '.join(errs) if errs else ' ok'))
    print('\n'.join(report))
    print('assets', v)
    if bad:
        print(bad, 'page(s) with problems')
        sys.exit(1)


if __name__ == '__main__':
    main()
