# Handoff: Tony's Window Cleaning site, final launch

Written at the end of the build session on September 25, 2026. Read this top to bottom before touching anything.

## Ground rules from Tony

- Copy style, his words: "no dashes, no slop, nothing to exaggerated and beyond. Not too tacky or salesey." Plain, direct, specific. No em or en dashes in customer facing copy. No hype words, no claims we can't back up.
- "This website cannot be tampered with." and "Mistakes cannot happen due to the amount of pages." Every change gets the full test run below before it is pushed.
- The repo is **public** and main **is the live site** (GitHub Pages, `CNAME` twindowclean.com). Never write a customer's name, phone, address or email into any file, commit, test or published artifact. Customer documents live in Google Drive only. Never hardcode calendar IDs.
- Work on branch `claude/business-growth-marketing-of9ero`. Nothing goes to main until Tony says the exact phrase **"move to main"**. Then open a pull request (no PR template exists in the repo), merge it, and check the live site.
- The 3D must never crash, and pages should load in under 2 seconds on a phone.
- Tony wants the site to take someone who knows nothing and have them convinced before they call. The core of the 3D: "Okay, now this is exactly what my home or building looks like", then their problem shown on it, then the fix.

## Business facts used everywhere

- Tony's Window Cleaning, Hesperia CA. 714-559-0300, twindowclean@gmail.com. Owner: Tony.
- Windows: $149 single story, $249 two story, outside, screens, tracks and sills included. Inside every window +$49. More windows than the base covers: **flat +$39** (single or two story).
- Solar: $7 a panel.
- Pigeon proofing: $450 up to 12 panels, +$50 each panel over 12, 2 to 3 reflective spinners free (extra $50 each), solar wash and roof soft wash included (roof wash is from $599 on its own). Mesh is clipped to the frame, never bolted. 2 year pigeon free warranty.
- Screens: $53.99 charcoal fiberglass, $64.99 all weather, new frames +$10 a screen, $149 minimum when screens are the only service.
- Storefronts: **$149 flat for 8 to 10 panes inside and out**, doors count as panes, **flat $50 more past 10**. Month to month: monthly 15% off every visit, every 2 weeks 25% off. **Quarterly agreement 20% off, yearly agreement 40% off** (the best single discount applies, never stacked). Interior partitions and mirrors +$50. Rotating vinyl stickers $10 each, every visit.
- Office buildings: **$10 a pane inside and out on the ground floor, $10 more a pane for each story up** (story 2 is $20 a pane, story 3 is $30). Every pane checked for hard water staining, existing tint left alone. Free walkthrough confirms the count, then the price is firm in writing.
- Home plans: once a year, twice a year 15% off, every 3 months 25% off. Booking online takes 10% off the first visit.
- Large custom homes: Tony confirms on site ($499 to $599 inside and out on some).
- Step 2 days: weekdays offer morning or afternoon. Saturday and Sunday just read "I prefer weekends" (Tony's words, September 25). Never mention a quote visit or 3 PM.
- Google rating 5.0, 25 reviews. Review link: https://g.page/r/CWQH1O3JGKh4EAE/review

All prices live in one object `P` at the top of `_quote/src/quote.js`. Page body copy also states prices by hand, so a price change means grepping the pages too.

## Where things stand

**Live.** Tony gave the go ahead on September 25 ("publish to main") and the branch was merged into main that day. Round two the same day, on his "take full control": recent commits, newest first:

0. Round three, on the branch and in the preview, **not merged**: Tony asked for a checklist first, then he tries it, then main. Tony the guide: the character is Tony (blue long sleeve, black shorts, olive cap, glasses, from his stills), stands by the home on the page and on the tour, walks to each stop, points at the problem, waves, and every note carries his tag and voice. Every control change gets a spoken reaction with the price and the reason (`react()` in q3d.js, diffed against the last state). "Ask Tony" chips answer the porch questions per mode (`ASK` table, EN and ES). Try it chips on the picture: inside +$49, pigeon proofing from the solar view, spinners on their own at $50 each (priced in `items()` only without pigeon proofing), Mesh / Clips / Spinners close ups in the pigeon story. The welcome asks the counts where the problem is checked (panels and sections, screens, about how many windows, a custom or large home card). Pigeon install: nests and droppings hauled off, mesh drops, clips go on one by one, spinner pole then clamps then head, camera goes close for each. Mountain cabin style and Mountain street (pines, granite, cabins, dirt drives), default on mountain pages. The hero model home always shows panels, mesh and spinners, posters rerendered at 1200x1500 with a preload. Tab changes glide the camera instead of cutting. Real photos of Tony on the about page.
1. Round two: 30 new English pages (the 24 from the masterplan, the mountain communities hub and Crestline, Lake Arrowhead, Running Springs, Big Bear Lake, Wrightwood and the Cajon Pass), 4 Spanish pages with the whole quote tool and 3D in Spanish, a public review line under the ticket total, the wait timeline opening on Book now, the storefront schedule in one row of five, shorter 3D notes, the hose routed down the pole. 89 pages. Pages are generated from `tools/pages/specs_*.py` by `tools/pages/make.py` (see below).
2. Launch pass: the "Do I really need this?" tabs left the quote flow (each service card says what you get and why now, the signs it's time fold under step 3), step 2 ends on "What happens next", weekdays morning or afternoon and weekends "I prefer weekends", the 3D controls grouped into tabs with a fold away bar on phones, one zoom pill, lighter stage chips, desktop side panel with the summary pinned at the bottom.
3. Leafy trees, fuller palms and pines, mountains in three lines, rounded tech body with boots, window wash from Tony's footage, cards and posters rerendered.
4. Storefront terms and $50 past 10, office buildings $10 a pane by story, deep links into the 3D, Meta event map, WebSite and Service schema, view transitions, pigeon clip copy.
5. Crew uniform on the 3D tech, storefronts $149 with plan discounts and the editors, flat $39 more windows, watermarked customer PDF, Inland Empire page, live neighborhoods, weather, adaptive quality.

Next round, already approved by Tony ("certainly"): the 24 new pages in the masterplan artifact (https://claude.ai/artifact/HD7hioXQZVXvkx61rjRDkq). Re-export Search Console in about a month and adjust. The Meta plan waits on Tony ("I'll get back to you on the ad").

Private preview of every page (only Tony can open it until he shares it): https://claude.ai/artifact/ToeLTekjZgCYmKzMYDGrA8

### What the 3D does now

Round three additions, all in `_quote/src/q3d.js` unless noted:
- **The character (round four).** `assets/quote/tech.glb` is Mixamo Ch28 from Tony's upload, 1.55 MB: textures cut to 1024 and the skin tone in the texture warmed and lightened toward Tony's from his photos (done offline with PIL, the original is in the artifact above). `buildRig()` loads it 2.5 s after the page's 3D starts, or right away when the 3D opens; the simple built body shows until then. Height is set to 1.78 m from the `HeadTop_End` bone. The hoodie and pants get their own materials (royal blue, near black) and keep the normal map for the folds. An olive cap and glasses are built in code and attached to the `Head` bone by `headwear()` (`HW` holds their offsets; `api.tuneHead()` retunes them live for tests). **Colors in r128 are linear: always `new T.Color(hex).convertSRGBToLinear()` for new materials, or they come out washed.** The file has no idle or walk clip, so everything is driven in code: `rigIdle()` (weight shift, breathing, dropped shoulders, walk bob), `rigLegs()` (feet planted, a real step when walking), `rigLook()` (neck and head follow what he looks at), `rigReach()` (two bone arm IK). **The scenes name hands by screen side: "L" is the figure's -x side, which is the rig's anatomical right. `rigArm(side)` does that mapping; use it for any new arm code or the arms fold into the body.**
- **Reflections.** The sky box is pre-filtered with `PMREMGenerator.fromCubemap` before it becomes `scene.environment`. The raw cube could sample as solid black on some iPhones, which showed up as a black block on panels the moment they were washed.
- **Phone framing.** `fitWH()` fits the subject into the part of the stage the note doesn't cover (`visFrac()`), the window, screen and solar shots are wider and from the side, the controls fold away on phones when a demo opens (until the person opens them, `panelUser`), and the home's own yard trees (`yardTrees`, kept out of the batch) hide when they sit between the camera and Tony (`clearView()`). On phones Tony's badge rides the top edge of the note and Ask Tony sits in the button row.
- **Tony the guide.** `guideFrame()` runs in `show` (the page) and `home` (the tour). `guideSpot()` picks where he stands per stop (front yard away from the driveway, beside the demo window, beside the screen window, in the yard pointing at the array or the mesh). He walks between spots (`legs(ph)` steps the feet, boots ride in a foot group), waves on arrival at the start and the end and every 12 s on the page, points with `pointAt()`, otherwise idles (`idleArms`, weight shift and breathing in `placeWorker`). His look comes from the stills in Drive: royal blue long sleeve, black shorts, white socks, olive cap, glasses.
- **His voice.** Every note carries the `.mtag` (avatar `assets/quote/tony-192.jpg`, cropped from his photo). `tonySay(txt,cls,ms)` puts a transient line on top of whatever the scene is saying; `say()` applies it. `react()` runs after every `sync()` and compares `snapSt()` with the last one: panels, sections, stories, inside, windows count, more, spinners, screens, mesh, frames, plan, large, style, street, storefront schedule and glass, building panes and stories. Each change gets one line with the price and the reason, plus "Your quote now".
- **Ask Tony.** `ASK` table (key, when, question, answer) in EN and ES; `askList()` shows the mode's own questions first, then the general ones (home, how long, insured, weekends, pay, rain). `#askb` toggles `#askp`; an answer is a 40 s `tonySay`.
- **Try it chips** `#try` on the stage, built by `tryChips()` from `tryList()`: windows (inside +$49, flips to the inside view), solar (add pigeon proofing, spinners only), pigeons (Mesh, Clips, Spinners close ups via `pigShot()` and `FOCUS_T`). `tryAct()` handles taps. Spinners on their own: `st.spin` with no `st.pig`; `spinCount()` returns just `st.spin` then, and `items()` in quote.js prices them at $50 each only when `!st.pig && (st.sol||st.win)`.
- **Pigeon install.** `buildMess()` adds nests under the low panel edges and droppings on the tile; they shrink away at stage 1 (`me.mk`). Clips appear one by one after the mesh is down (`me.ck` drives `clipIM.count`). `spinInstall()` grows the pole, then the clamps, then the head. `pigAuto()` moves the camera close for mesh, clips and the first spinner, then back.
- **Welcome counts.** Page 2 of the welcome has `.obd-det` rows that show when their problem is checked (`detSync()`): panels and sections, screens, about how many windows (drives `st.more` through `st.winsSet`), a custom or large home card that sets `st.large`.
- **Mountain.** `STY[4]` cabin (steep gable, `TX.logs` walls, `M.stone` chimney, porch), hood 4 in `buildTown()` (two lane road, cabins with `CABW` walls, 340 pines, boulders, `M.forest` floor). `C.CFG.mountain` opens on it.
- **Seamless.** `setMode(m,keepT,glide)`: tab changes glide the camera instead of cutting; only the storefront and the inside room still fade. `showPanels()` and `pigLook()` make the page model always finished: panels, mesh, spinners.

- "See it on my home" opens the welcome: picture cards for home style, stories and street (Desert yards, Lawns and trees, On the lake, Acreage), then the problems as picture check cards (dirty windows, pigeons, dusty panels, torn screens, hard water). After "Build my home" the control panel folds away on phones (class `min` on `#ov`, the `#ovGrab` bar reopens it) so the tour gets the whole screen. Skip leaves it open.
- The controls are grouped with `data-otab` tabs and `data-og` groups (home: Home, Colors, Solar, Street; storefront: My storefront, Glass, Schedule). Tests that tap a control inside a group tap its tab first.
- The home appears in that community with the checked problems on it: grime on the glass, dirty or torn and hanging screens, dust on the panels, pigeons with white droppings and nests. Numbered dots explain each problem (including the smell). The tour button reads "Fix it" and each problem clears.
- "Edit my windows": tap a wall to add a window, drag to move, pick pane or with screen, small, standard or large, on all four walls. On Done the counts go into the quote (more windows flag, screen count).
- Storefront tab and commercial pages: strip center, cafe with patio, tall glass, or standalone. Name on the sign, wall and sign colors. "Build my storefront" adds, moves and resizes panes and doors, stickers, wider or narrower; the counts feed the quote. Office building mode by square feet, stories and windows.
- Wind and weather chip: on the live site it reads the latest observation from the National Weather Service station KVCV (Victorville), or KONT (Ontario) for Inland Empire ZIPs, cached 30 minutes. Tap to cycle sunny, windy, cloudy. Wind drives tree sway, blowing dust and tumbleweeds. Falls back to "A typical day" if the request fails. The privacy page mentions it.
- The camera stays on the customer's own home. They can orbit and zoom a little, not wander the street.
- Crash safety: WebGL context loss pauses and resumes; a real time frame rate watcher steps pixel ratio down, then turns shadows off if a phone struggles. Instanced batching keeps a whole town to a few dozen draws.

### The PDF

Made in the browser (`makePdf` in `quote.js`), downloaded or shared as a file. Every page carries a light diagonal watermark "CUSTOMER COPY" with the customer's name and date, and a footer line saying Tony brings the printed original for signatures. Storefront quotes show the storefront picture and a schedule table.

## Answered by Tony on September 25

- Storefront discounts 15% monthly and 25% every 2 weeks confirmed; quarterly agreement 20%, yearly agreement 40% added.
- Panes past 10 on a storefront: flat $50, inside and out.
- Office buildings: $10 a pane, $10 more a pane per story up. Hard staining check and tint care are part of the pitch.
- No Barstow page (too far, not enough there).
- Search Console export received (3 months): the home page carries almost all clicks; "screen replacement" has 167 impressions at position 10 with no clicks; Google shows the site for Crestline, Lake Arrowhead and Cajon queries. The SEO plan in the masterplan artifact builds on that.
- Meta pixel `1424363186269397` is live on every page and has fired; the account has no custom conversions yet. `quote.js` now maps events to ViewContent, CustomizeSimulator, QuoteReady, QuoteSubmitted, Lead and Contact.
- Deep links: any page opens straight into the 3D with `?see=pig|win|sol|scr|com|tour` or `#see-pig`. Tested in `tools/tests/deeplink.js`.

## Blocked

- ~~A Mixamo character~~ Done in round four: Tony converted the 50 MB FBX himself (the "Ch28 Falling Loop" artifact, https://claude.ai/artifact/V5ucKmNzDn1AtmzNL2f1Bh). See "The character" below.
- Tony's 2 minute video in Drive is 289 MB (the Drive tool limit is 10 MB). Needs a YouTube link or a clip under 10 MB.
- Unique local stories to bring same type page overlap under 45%: excluding the shared quote tool it is 12 to 21%, including it 59 to 65%. Getting under 45% with the tool counted is about 17,000 words of real, city specific text across 35 pages. Never invent jobs or customers.

## Final launch checklist

1. Get Tony's answers above. Update `P` and any page copy that states those prices.
2. Rebuild and run every test (next section). All must pass.
3. Content sweep: prices consistent across pages, no em or en dashes in visible copy, review count 25 everywhere, sitemap `lastmod`, the Inland Empire page OG image (it uses `assets/og/pigeon-proofing.jpg`; make `assets/og/inland-empire.jpg` if wanted), title under 60 and description 140 to 158 (run `tools/tests/audit.py`).
4. Measurement: GA4 `G-F97LW93P0P`, Google Ads `AW-17238956448`, Meta pixel `1424363186269397`. Events are in `assets/tags.js`. Make sure a sent quote fires the lead events on the live site.
5. The form posts to Formspree (`FORM` in `quote.js`). Previews set `live:false` so nothing is sent. After launch, send one real test lead and delete it.
6. Look at the preview on a real phone: welcome, problem cards, Fix it steps, Edit my windows, the storefront builder, the PDF.
7. When Tony says "move to main": pull request from the branch into main, merge, open twindowclean.com and spot check the home page, a pigeon page, a commercial page and the Inland Empire page. Submit `sitemap.xml` in Search Console. (Done September 25.)
8. The `/leads` skill has the real review link. (Done.)

## How the site is built

- 89 static pages in the repo root. `style.css` and `main.js` are shared.
- New pages since launch are written as Python specs in `tools/pages/specs_en*.py` and `tools/pages/specs_es.py` and rendered by `python3 tools/pages/make.py` (nav, footer and the business schema are copied from `pigeon-proofing-hesperia.html` at run time so they never drift; the script also adds the footer links, the hreflang pairs and rewrites `sitemap.xml`). Then run `_quote/build.py`. `make.py --check` enforces title under 60, description 140 to 158, no dashes. Edit the spec, not the generated page.
- Spanish: `espanol.html`, `control-de-palomas.html`, `limpieza-de-ventanas.html`, `limpieza-de-paneles-solares.html`. `build.py` maps them in `SPANISH`, uses the fragments in `_quote/src/fragments/es/`, and sets `window.TQ.lang="es"`. In `quote.js` the `L(en,es)` and `ix(en,es)` helpers switch the ticket, notes, plans, days and ZIP answers; the message to Tony, the form payload and the PDF stay English (`totals("en")`). In `q3d.js` the `L()` helper does the same for the welcome, tour, step notes, panel summary and editor. Tested by `tools/tests/spanish.js` (20 checks).
- Mountain pages carry `mountain: true` in `window.TQ` (unused by the scripts today; there if a pine street ever gets built in the 3D).
- The quote tool and 3D are injected into every page by `python3 _quote/build.py` between marker comments `<!-- tq:css -->`, `tq:cta`, `tq:media`, `tq:steps`, `tq:tail`. Never edit inside those markers by hand. Edit `_quote/src/` and rebuild. The build needs `esbuild` on the PATH (`npm i -g esbuild`) and prints one line per page.
- `build.py` `page_config()` picks services and 3D mode from the file name (`pigeon-proofing*` pig, `solar-panel-cleaning*` sol, `screen-repair*` scr, `window-cleaning*` win, `commercial*` com with storefront posters and wording, `inland-empire` pig, everything else home). City names come from `CITIES`.
- `_quote/src/quote.js`: prices `P`, state `st`, limits `LIMIT`, `items()` line items, `totals()`, plan schedules, the message to Tony, the share link token (`#q...`, includes an optional `-c` storefront segment), ZIP answers (High Desert, extra High Desert places, Inland Empire ranges), PDF, hydration of the lazy templates.
- `_quote/src/q3d.js`, in order: renderer and painted sky with clouds, mountains, materials and textures, window sizes and wall frames, `makeHouse`, the town (`liteHouse`, streets, lake, acreage, brush), neighbors, spinners, pigeons (merged body), the before state (grime, droppings, nests, damage dots), weather, storefronts (`buildCom`, styles, `autoShop`), the editor (`edStart`, `edStop`, hit testing on the wall plane), the tour and messages, camera (presets, flights, view lift above the note), labels, welcome cards, render loop with the quality watcher, controls, API.
- Card pictures and posters in `assets/quote/*.webp` are rendered from the 3D itself with `tools/tests/cards.js` and `tools/tests/storefront-posters.js`, then converted to webp (cards 300x200 quality 74, posters quality 76).
- three.js r128 is vendored at `assets/vendor/three.min.js` and loads after the page.

## Tests

Setup, once per session:

```
cd <repo root> && python3 -m http.server 8765      # leave running in the background
export NODE_PATH=/opt/node22/lib/node_modules       # playwright lives here
# optional: export CHROME=/path/to/chrome if the default path doesn't exist
```

Run each from an empty temp directory (they write screenshots there): `cd $(mktemp -d) && node <repo>/tools/tests/<name>.js`

| Script | What it proves | Pass looks like |
| --- | --- | --- |
| `pages.js` | Every page on phone and desktop: no JS errors, tool hydrates (12 bodies, 6 3D panels). 89 pages, about 4 minutes | `ALL PAGES CLEAN` |
| `quote.js` | Prices, plans, pigeon package, no need tabs, signs folded under step 3, weekday and weekend rules, ZIP answers, message, email and text links, PDF name, form payload | 32 PASS |
| `spanish.js` | Spanish page: ticket, plans, days, ZIP, welcome, Tony's tour note, Ask Tony, pigeon chips, panel in Spanish; message to Tony in English | 22 PASS |
| `deeplink.js` | `?see=` and `#see-` links open the right module, Meta events fire | 10 PASS |
| `modes3d.js` | Welcome with the count rows, Tony's intro, tour, folded panel, pigeon chips and story steps, neighborhoods, mountain cabin, Ask Tony, solar chips and spinners only, inside from the picture | `no errors`, every logged check true |
| `home-flow.js 390 844` | Welcome to Fix it on a phone, damage dots, weather chip | `errors []` |
| `storefront-flow.js 1280 800` | Storefront tour, stickers, building mode, price lines | `errors []` |
| `editors.js 390 844` | Add, change, drag windows on the house; storefront add, widen, sticker; counts reach the quote | `errors []` |
| `pdfchk.js` | Downloads a storefront and a home PDF (render with PyMuPDF to look) | two PDFs saved |
| `adapt.js` | Quality steps down on a slow renderer without errors | level drops, `errors []` |
| `speed.js` | Load time and weight on a throttled phone | load under 2 s |
| `similarity.py`, `audit.py` | Page overlap by type, on page SEO | see numbers above |

Tests set `window.__tqFixedQ=true` so the quality watcher doesn't lower detail in screenshots. The 3D in headless Chromium runs on SwiftShader at a few frames a second, so tests call `window.__tq.api.settle()` to skip camera flights.

Preview: `PREVIEW_OUT=<scratchpad>/preview python3 tools/tests/mkpreview.py` builds `<scratchpad>/preview/site` (every page with `live:false`, `index.html` renamed `home.html`, a landing page from `tools/tests/preview-landing.html`; edit its "New this round" list by hand) and `files-v3.json` for publishing to the preview artifact above with the Artifact tool's `files` map and `root` set to that site folder. The Artifact tool only accepts a `root` inside the repo or the session scratchpad, so don't build it under `/tmp`.
