# Tony's Window Cleaning — 3D Laminated Printables

Print-ready visuals with 3D extruded lettering, matched to the website brand
(navy `#103050`, brand blue `#80b0e0`, sky `#c0e0f0`, sun gold `#f0b040`,
Sora + Plus Jakarta Sans).

## The designs

| File | Size | Use it for |
|---|---|---|
| `pdf/sign-business-name.pdf` | 11×8.5" landscape | Business name sign — truck window, A-frame, job-site sign |
| `pdf/sign-free-quotes.pdf` | 11×8.5" landscape | "Free Quotes / Call or Text" sign with big phone number |
| `pdf/flyer-services.pdf` | 8.5×11" portrait | Full services flyer with logo, all 8 services & service areas |
| `pdf/poster-crystal-clear.pdf` | 8.5×11" portrait | "See the World Crystal Clear" poster |
| `pdf/tonys-printables-all.pdf` | all four | One-click print of the whole set |
| `pdf/magnet-door-20x10.pdf` | 20×10" (bleed 20.25×10.25") | VistaPrint car magnet — truck doors (order 2) |
| `pdf/magnet-tailgate-24x12.pdf` | 24×12" (bleed 24.25×12.25") | VistaPrint car magnet — tailgate |
| `pdf/magnet-windshield-48x32.pdf` | 48×32" (bleed 48.25×32.25") | **UPrinting 30pt windshield magnet with QR code** |
| `pdf/decal-tailgate-20x8-navy.pdf` | 20×8" (bleed 20.25×8.25") | **Tailgate decal, navy panel — order 2, one per side of the Ford oval** |
| `pdf/decal-tailgate-20x8.pdf` | 20×8" | Same decal, transparent background (clear vinyl / cut lettering) |
| `pdf/decal-tailgate-44x5_5.pdf` | 44×5.5" | Long strip — rear window or bed sides, transparent background |
| `pdf/banner-48x28.pdf` | 48×28" (bleed 48.5×28.5") | **Outdoor vinyl banner with QR code** |
| `pdf/decal-tailgate-white-left.pdf` | 20×8" | **Tailgate white lettering — LEFT panel (the name)** |
| `pdf/decal-tailgate-white-right.pdf` | 20×8" | **Tailgate white lettering — RIGHT panel (the contact)** |
| `pdf/decal-tailgate-white-text.pdf` | 20×8" | Superseded — the old version that repeated on both sides |
| `pdf/magnet-door-24x12-light.pdf` | 24×12" (bleed 24.25×12.25") | **Side door magnets — order 2** (recommended) |
| `pdf/magnet-door-24x12.pdf` | 24×12" (bleed 24.25×12.25") | Navy-ground version of the same size |
| `pdf/magnet-door-20x10-clean.pdf` | 20×10" (bleed 20.25×10.25") | Same design, smaller fallback if the door's flat area is tight |

## Windshield magnet (48×32, UPrinting)

`magnet-windshield-48x32.pdf` is built to UPrinting's custom car magnet
spec: 48"×32" trim, 0.125" bleed on every side (page is 48.25"×32.25"),
1/4" rounded corners, 30pt magnetic stock, front only. All content sits at
least 1" inside the trim, so the corner rounding never touches type.

Clean flat-color treatment matching the flyer and the website — navy
header and footer bands, gold accent rule, no effects. Fonts are embedded
in the PDF; upload it as-is.

The QR code points to **https://twindowclean.com/#quote** — it opens the
site and lands on the free-quote form. It prints about 9.8" square, which
scans easily from across a parking lot. To repoint it somewhere else,
edit the URL in `build-qr.py`, re-run it, and re-export the PDF.

## Vinyl banner (48×28)

`banner-48x28.pdf` — 48"×28" trim with 0.25" bleed per side. All type sits
at least 2" inside the trim so hems and grommets never cover it. Order on
13oz scrim vinyl, hemmed with grommets every 2 ft.

Content is drawn only from what the business already publishes on
twindowclean.com and its linked Google/Facebook/Yelp profiles: the eight
services in the site's service catalog, the 5.0 Google rating, free
estimates, locally owned, purified-water/streak-free, the
"Satisfaction Guaranteed" slogan, 8am–8pm daily hours, and the High
Desert service-area cities. No licences, insurance, awards or
years-in-business are claimed, because none are published anywhere.

## VistaPrint order — tailgate lettering + door magnets

**Tailgate, white text only** — two DIFFERENT panels, 20"×8" each,
**quantity 1 of each**. `decal-tailgate-white-left.pdf` carries the name
and goes left of the Ford oval; `decal-tailgate-white-right.pdf` carries
the phone and website and goes right of it. Splitting the content stops
the tailgate reading as the same block printed twice, and lets both lines
of type run much larger than they could when each side had to hold
everything. Order under Car Decals / Car Window Decals: custom shape,
**clear vinyl**, outside-glass/surface application. Only white ink is
used, so nothing can clash with the carbonized-grey paint. A transparent
PNG (`assets/decal-tailgate-white-text.png`, 192 dpi) is included in case
their uploader flattens PDF transparency — check their on-screen proof
shows white letters, not blank.

If they cannot print white ink on clear, order the same artwork on
**white vinyl with a die cut around the text block** instead.

**Side doors** — `magnet-door-24x12-light.pdf`, **quantity 2**, under Car
Door Magnets: Square/Rectangle, 24"×12" (a stock VistaPrint size).

This version uses navy as INK on a soft near-white ground rather than as
a solid field. A large navy panel sits dark-on-dark against carbonized-
grey paint and reads heavy; the light ground separates from the paint and
reads as a fitted plaque. Content is deliberately sparse — mark, name,
number, website. No service list, no review badge, no call to action.
`magnet-door-24x12.pdf` keeps the navy-ground treatment if it is ever
wanted for a light-coloured vehicle. 24×12 is
the industry-standard truck door magnet and the right call for the
Maverick's SuperCrew front door: ~24" of width leaves roughly 7–8" of
margin on a ~39" door, and 12" of height stays under the beltline and
above the lower body crease.

Do **not** go to 24×18 — 18" of height runs past the Maverick's lower
character line into the curved section, and a magnet that bridges a
crease lifts at speed.

`magnet-door-20x10-clean.pdf` is the same artwork at 20×10 as a fallback
if the flat area turns out tighter than expected. Both carry 0.125"
bleed with type well inside the trim.

## Tailgate decals (Ford Maverick)

The Maverick tailgate has three obstructions: the recessed handle across
the top centre, the Ford oval in the middle, and the MAVERICK stamping
below it. Vinyl will not lie flat over any of them, so the artwork is
sized to the two clear panels either side of the Ford oval and above the
MAVERICK letters — roughly 22" wide × 9" tall each.

`decal-tailgate-20x8-navy.pdf` is the one to order: a navy panel on plain
white adhesive vinyl, kiss-cut to a rounded rectangle, 0.125" bleed built
in. Order **two**.

`decal-tailgate-20x8.pdf` is the same design with a transparent
background. Only use it if the printer explicitly offers **white ink on
clear vinyl** — most do not, and without it every white letter prints as
nothing.

`decal-tailgate-44x5_5.pdf` is a long single-line strip. It does not fit
the tailgate; it is sized for the rear window or the bed sides.

Measure the real panel on the truck before ordering — these dimensions
were derived from a photo, not a tape measure.

## VistaPrint magnets

The two `magnet-*` PDFs are built for VistaPrint car magnets: full-bleed
size = trim + 0.125" per side, no crop marks, all text at least 0.35" inside
the trim edge. Upload the PDF, pick the matching size (20"×10" doors,
24"×12" tailgate), and check their preview shows nothing important near
the edges. Magnets need a fully flat steel surface — keep them clear of
body creases, badges, and door handles, and press out any air gaps.

## Printing & laminating tips

1. Print the PDFs at **100% scale ("Actual size")** on US Letter — do not use
   "Fit to page", the files are already exact Letter size with no margins.
2. For the richest color, use **cardstock (65–110 lb)** and your printer's
   "Best" / photo quality setting.
3. Laminate with standard **Letter-size 3–5 mil pouches**. The designs run
   edge-to-edge, so the clear pouch border acts as a sealed frame.
4. Home printers can't print borderless by default — if you get a thin white
   edge, either enable borderless printing or trim to the ink line before
   laminating.

## Editing

Each design is a plain HTML file (`*.html`) sharing `brand-print.css`.
Open one in a browser and print to PDF (margins: none, background graphics: on)
after changing any text — phone, cities, services, etc.
