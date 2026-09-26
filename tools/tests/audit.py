#!/usr/bin/env python3
"""On-page SEO audit of every page in the site."""
import re, json, pathlib, collections, sys, html

ROOT = pathlib.Path(__file__).resolve().parents[2]
pages = sorted(p for p in ROOT.glob("*.html") if p.name != "404.html")

# the text of a match, entities decoded, so "&amp;" counts as one character; meta values use the quote they opened with
def txt(m):  return (html.unescape(m.group(m.lastindex).strip()) if m else "")

rows = []
for p in pages:
    s = p.read_text(errors="replace")
    body = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", s)
    body = re.sub(r"(?is)<svg[^>]*>.*?</svg>", " ", body)
    body = re.sub(r"(?s)<!--.*?-->", " ", body)
    visible = re.sub(r"(?s)<[^>]+>", " ", body)
    visible = re.sub(r"&[a-z#0-9]+;", " ", visible)
    words = len(visible.split())

    title = txt(re.search(r"(?is)<title>(.*?)</title>", s))
    desc  = txt(re.search(r'(?is)<meta\s+name=["\']description["\']\s+content=(["\'])(.*?)\1', s))
    canon = txt(re.search(r'(?is)<link\s+rel=["\']canonical["\']\s+href=(["\'])(.*?)\1', s))
    ogt   = txt(re.search(r'(?is)<meta\s+property=["\']og:title["\']\s+content=(["\'])(.*?)\1', s))
    ogi   = txt(re.search(r'(?is)<meta\s+property=["\']og:image["\']\s+content=(["\'])(.*?)\1', s))
    robots= txt(re.search(r'(?is)<meta\s+name=["\']robots["\']\s+content=(["\'])(.*?)\1', s))

    h1s = re.findall(r"(?is)<h1[^>]*>(.*?)</h1>", s)
    h1s = [re.sub(r"(?s)<[^>]+>", "", h).strip() for h in h1s]
    h2n = len(re.findall(r"(?is)<h2[^>]*>", s))
    h3n = len(re.findall(r"(?is)<h3[^>]*>", s))

    imgs = re.findall(r"(?is)<img\b[^>]*>", s)
    # alt="" is right for a decorative image; missing means no alt attribute at all
    no_alt = [i for i in imgs if not re.search(r'\balt\s*=', i)]
    no_dim = [i for i in imgs if not (re.search(r'\bwidth\s*=', i) and re.search(r'\bheight\s*=', i))]
    no_lazy= [i for i in imgs if 'loading=' not in i]

    links = re.findall(r'(?is)<a\b[^>]*href=["\']([^"\']+)["\']', s)
    internal = [l for l in links if l.endswith(".html") or l in ("/", "#")]
    internal_pages = sorted({l.split("#")[0] for l in links
                             if l.endswith(".html") and not l.startswith("http")})
    external = [l for l in links if l.startswith("http") and "twindowclean.com" not in l]

    schema = []
    for blk in re.findall(r'(?is)<script[^>]*application/ld\+json[^>]*>(.*?)</script>', s):
        try:
            d = json.loads(blk)
            for item in (d if isinstance(d, list) else [d]):
                g = item.get("@graph", [item]) if isinstance(item, dict) else [item]
                for n in g:
                    if isinstance(n, dict) and n.get("@type"):
                        t = n["@type"]
                        schema += t if isinstance(t, list) else [t]
        except Exception:
            schema.append("PARSE_ERROR")

    rows.append(dict(
        page=p.name, title=title, tlen=len(title), desc=desc, dlen=len(desc),
        canon=canon, og_title=bool(ogt), og_image=bool(ogi), robots=robots,
        h1n=len(h1s), h1=h1s[0] if h1s else "", h2n=h2n, h3n=h3n, words=words,
        imgs=len(imgs), no_alt=len(no_alt), no_dim=len(no_dim), no_lazy=len(no_lazy),
        int_links=len(internal_pages), int_targets=internal_pages,
        ext=len(external), schema=sorted(set(schema)),
    ))

print(f"PAGES AUDITED: {len(rows)}\n")

# ---- title / description health
print("=" * 78)
print("TITLES  (ideal 50-60 chars, hard cap ~60 before Google truncates)")
print("=" * 78)
long_t  = [r for r in rows if r["tlen"] > 60]
short_t = [r for r in rows if r["tlen"] < 30]
print(f"  over 60: {len(long_t)}   under 30: {len(short_t)}   ok: {len(rows)-len(long_t)-len(short_t)}")
for r in sorted(long_t, key=lambda x: -x["tlen"])[:12]:
    print(f"   {r['tlen']:>3}  {r['page']:<34} {r['title'][:70]}")

print()
print("=" * 78)
print("META DESCRIPTIONS  (ideal 140-158)")
print("=" * 78)
missing_d = [r for r in rows if not r["desc"]]
long_d    = [r for r in rows if r["dlen"] > 160]
short_d   = [r for r in rows if 0 < r["dlen"] < 120]
print(f"  missing: {len(missing_d)}   over 160: {len(long_d)}   under 120: {len(short_d)}")
for r in sorted(long_d, key=lambda x: -x["dlen"])[:10]:
    print(f"   {r['dlen']:>3}  {r['page']:<34} {r['desc'][:66]}...")
for r in short_d[:10]:
    print(f"   {r['dlen']:>3}  {r['page']:<34} (short)")

# ---- duplicates
print()
print("=" * 78)
print("DUPLICATES")
print("=" * 78)
for field, label in (("title", "title"), ("desc", "description"), ("h1", "H1")):
    c = collections.Counter(r[field] for r in rows if r[field])
    dupes = {k: v for k, v in c.items() if v > 1}
    print(f"  duplicate {label}s: {len(dupes)}")
    for k, v in list(dupes.items())[:5]:
        print(f"     x{v}  {k[:66]}")

# ---- structural
print()
print("=" * 78)
print("STRUCTURE")
print("=" * 78)
print(f"  pages with no canonical : {sum(1 for r in rows if not r['canon'])}")
print(f"  pages with no og:title  : {sum(1 for r in rows if not r['og_title'])}")
print(f"  pages with no og:image  : {sum(1 for r in rows if not r['og_image'])}")
print(f"  pages with != 1 H1      : {sum(1 for r in rows if r['h1n'] != 1)}")
for r in rows:
    if r["h1n"] != 1:
        print(f"     {r['page']:<34} h1 count = {r['h1n']}")
print(f"  noindex present         : {sum(1 for r in rows if 'noindex' in r['robots'].lower())}")

# ---- content depth
print()
print("=" * 78)
print("CONTENT DEPTH  (thin = under 600 visible words)")
print("=" * 78)
thin = sorted([r for r in rows if r["words"] < 600], key=lambda x: x["words"])
print(f"  thin pages: {len(thin)} of {len(rows)}")
for r in thin[:14]:
    print(f"   {r['words']:>5}w  {r['page']}")
ws = sorted(r["words"] for r in rows)
print(f"  min {ws[0]}  median {ws[len(ws)//2]}  max {ws[-1]}")

# ---- images
print()
print("=" * 78)
print("IMAGES")
print("=" * 78)
print(f"  total <img>            : {sum(r['imgs'] for r in rows)}")
print(f"  missing alt            : {sum(r['no_alt'] for r in rows)}")
print(f"  missing width/height   : {sum(r['no_dim'] for r in rows)}  (causes layout shift)")
print(f"  missing loading=lazy   : {sum(r['no_lazy'] for r in rows)}")
for r in rows:
    if r["no_alt"]:
        print(f"     {r['page']:<34} {r['no_alt']} without alt")

# ---- internal linking
print()
print("=" * 78)
print("INTERNAL LINKING  (how many other pages each page links to)")
print("=" * 78)
inbound = collections.Counter()
for r in rows:
    for t in r["int_targets"]:
        inbound[t] += 1
print("  fewest INBOUND internal links (orphan risk):")
allp = {r["page"] for r in rows}
for pg in sorted(allp, key=lambda x: inbound.get(x, 0))[:14]:
    print(f"     {inbound.get(pg,0):>3} inbound   {pg}")

# ---- schema
print()
print("=" * 78)
print("SCHEMA COVERAGE")
print("=" * 78)
sc = collections.Counter()
for r in rows:
    for t in r["schema"]:
        sc[t] += 1
for t, n in sc.most_common():
    print(f"   {n:>3} pages   {t}")
no_schema = [r["page"] for r in rows if not r["schema"]]
print(f"  pages with NO schema: {len(no_schema)} {no_schema[:8]}")

# ---- review count references
print()
print("=" * 78)
print("REVIEW COUNT REFERENCES (should now be 25)")
print("=" * 78)
hits = collections.Counter()
for p in pages:
    s = p.read_text(errors="replace")
    for m in re.findall(r'reviewCount"?\s*:\s*"?(\d+)', s): hits[f"schema reviewCount={m}"] += 1
    for m in re.findall(r'\b(\d{1,3})\s+(?:Google\s+)?reviews\b', s, re.I): hits[f'text "{m} reviews"'] += 1
    for m in re.findall(r'ratingValue"?\s*:\s*"?([\d.]+)', s): hits[f"ratingValue={m}"] += 1
for k, v in hits.most_common():
    print(f"   {v:>3}  {k}")
