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
          ('inland-empire', 'Inland Empire', 'Base Line Rd, Rancho Cucamonga')]


def page_config(fn):
    base = fn[:-5]
    city = street = None
    for slug, name, st in CITIES:
        if base == slug or base.endswith('-' + slug):
            city, street = name, st
    if base.startswith('pigeon-proofing'):
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
    return conf


def frag(name):
    with open(os.path.join(FRAG, name), encoding='utf-8') as f:
        return f.read().rstrip('\n')


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
            loader = []
            subprocess.run([eb, src, '--minify', '--target=es2017,safari13', '--legal-comments=none', '--outfile=' + dst] + loader,
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
        if eb:
            subprocess.run([eb, os.path.join(SRC, 'vendor', 'GLTFLoader.js'), '--minify', '--target=es2017,safari13', '--legal-comments=none', '--outfile=' + dst], check=True, capture_output=True)
        else:
            shutil.copyfile(os.path.join(SRC, 'vendor', 'GLTFLoader.js'), dst)
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


def blocks(conf, v):
    three_card = {'pig': 'card-pig.html', 'win': 'card-win.html', 'sol': 'card-sol.html', 'scr': 'card-scr.html', 'com': 'card-com.html'}.get(conf['mode'], 'card-home.html')
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
    steps = '\n\n'.join([lazy_bodies(frag('steps.html'), conf['svc']), frag('zip.html'), head + '\n' + frag(three_card) + '\n' + frag('three-tail.html')])
    tail = ('<div class="tq" data-nosnippet>\n' + lazy_ov(frag('ov.html')) + '\n' + frag('dock.html') + '\n</div>\n'
            '<script>window.TQ=' + json.dumps(dict(conf, **({'tech': v['tech']} if v.get('tech') else {})), separators=(',', ':')) + ';</script>\n'
            '<script src="assets/quote/quote.js?v=' + v['quote.js'] + '" defer></script>')
    return {
        'css': '<link href="assets/quote/quote.css?v=' + v['quote.css'] + '" rel="stylesheet">',
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
            for name, content in blocks(conf, v).items():
                html = replace_block(html, name, content)
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
