# twindowclean.com

Static site for Tony's Window Cleaning, Hesperia CA. Served by GitHub Pages
from this repo. Every `.html` file in the root is a live page. The quote tool and 3D preview are
injected into every page by `python3 _quote/build.py` from `_quote/src/`; see `.claude/HANDOFF.md`.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Home |
| `window-cleaning.html`, `solar-panel-cleaning.html`, `pigeon-proofing.html`, `screen-repair.html`, `hard-water-removal.html`, `post-construction-window-cleaning.html` | Residential service hubs |
| `commercial-window-cleaning.html`, `graffiti-removal.html`, `adhesive-removal.html` | Commercial service hubs |
| `commercial-window-cleaning-<city>.html`, `graffiti-removal-victorville.html` | Commercial by city |
| `<city>.html` | City hubs (hesperia, victorville, spring-valley-lake, silverwood, apple-valley, adelanto, oak-hills, phelan) and `inland-empire.html` |
| `<service>-<city>.html` | Residential service by city, 24 pages |
| `service-areas.html`, `about.html`, `reviews.html`, `gallery.html`, `contact.html`, `pricing.html`, `privacy.html`, `404.html` | Company pages |
| `style.css`, `main.js` | One stylesheet, one script, shared by every page |
| `assets/fonts/`, `assets/fonts.css` | Self hosted variable fonts. No Google Fonts request. |
| `assets/tags.js` | Measurement hook. Paste GA4 and Google Ads IDs here, nothing else changes. |
| `assets/photos/` | Real job photos, named `<city>-<service>-NN.jpg` |
| `assets/og/` | 1200x630 social cards, one per page, same filename as the page |
| `assets/ads/` | Meta ad creatives |
| `tools/docs/` | The quote / invoice / agreement document system (de-identified templates only) |
| `_quote/` | Quote tool and 3D sources and the build that injects them (not served) |
| `tools/tests/` | Browser tests, SEO audit, similarity check and the preview builder |
| `sitemap.xml`, `robots.txt`, `CNAME` | Search and hosting config |

## Rules that keep the site fast and ranking

1. **One page, one topic, one H1.** Title under 60 characters, description 140 to 158.
2. **Every page carries** the LocalBusiness block (copy it from any page), a
   BreadcrumbList, and where it applies a Service and FAQPage block. FAQ schema
   must match the visible FAQ word for word.
3. **A price on every service page**, in the hero trust strip and in a price card.
4. **A "why us" section on every page.** Specific reasons, not adjectives.
5. **No shared paragraphs between pages.** City pages describe that city's
   corridors, water, wind and housing. Run the similarity check before pushing.
6. **Images:** `loading="lazy"`, `decoding="async"`, real `width`/`height`, real alt
   text naming the city and service. Keep each photo under 300 KB.
7. **No new external requests.** Fonts are self hosted. The only third party
   script on load is the Meta Pixel. Analytics goes through `assets/tags.js`.
8. **Never commit customer names, addresses, phone numbers or emails.** The
   repo is public. Customer documents live in Google Drive, templates live here.

## Adding a page

1. Copy the closest existing page. Change the filename, `<title>`, description,
   canonical, `og:url`, `og:image`, H1, breadcrumb schema and every visible line.
2. Write the copy for that page. If a paragraph would work on another page, it
   is too generic.
3. Add the page to `sitemap.xml` with today's date.
4. Link to it from at least three existing pages (footer counts as one).
5. Make the OG card: `assets/og/<slug>.jpg`, 1200x630.
6. Push. GitHub Pages deploys in about a minute. Then submit the URL in Search
   Console.

The full playbook for the junior running this lives in Google Drive under
`05 Website & Design / SEO Takeover System`.

## Prices published on the site (September 2026)

| Service | Published |
| --- | --- |
| Window cleaning, exterior | from $149 single story, $249 two story |
| Solar panel cleaning | from $7 per panel |
| Pigeon proofing | from $450, two year warranty |
| Screen re-mesh, all weather | $64.99 per screen, $149 job minimum |
| Hard water restoration | from $12 per pane, free test pane |
| Commercial storefront | $89 monthly, $79 biweekly, $69 weekly, $119 one off, +$50 interior |
| Graffiti removal | from $129 single tag, $289 storefront, +$75 emergency, $89 etch assessment |
| Adhesive and vinyl removal | from $129 up to three panes, $289 storefront |
| Post construction window cleaning | from $249 single story, $349 two story |

Change a price in one place and grep the whole repo for the old number before
you push. Prices appear in copy, FAQ text, FAQ schema and Offer schema.
