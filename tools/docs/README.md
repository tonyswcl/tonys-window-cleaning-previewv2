# Customer document system

Letterhead, quotes, invoices, service agreements and condition reports.
One layout across every customer-facing document.

## Files

| File | What it is |
|---|---|
| `twc.css` | The whole layout. Letterhead, tables, price band, terms list, signature block. |
| `fonts-embedded.css` | Archivo and Source Sans 3 inlined as base64 woff2. |
| `fit.js` | Checks every `.page` fits one Letter sheet before rendering. |
| `render.js` | Renders the HTML to PDF plus PNG previews. |
| `template-quote.html` | Skeleton to copy for a new document. |
| `template-receipt.html` | Paid receipt: line items, gratuity, total paid, "Your cleaners", upkeep note. |

## Why the fonts are embedded

Chromium cannot reach `fonts.googleapis.com` in the build environment, so a
document linking Google Fonts silently renders in DejaVu Sans and Liberation
Serif instead. A signed agreement went out that way once. Loading the
faces from `fonts-embedded.css` removes the network entirely.

## Why fit.js exists

`.page` is `height: 11in; overflow: hidden`. Content past that is **clipped**,
not flowed onto the next sheet, and a `.page` taller than 11in spills across
two physical pages leaving one half empty. Always run `fit.js` before
`render.js`.

```sh
export NODE_PATH=$(npm root -g)
node fit.js my-quote.html          # must print ALL PAGES FIT
node render.js my-quote.html My-Quote.pdf 1
```

## Customer documents are not stored here

This repository is public and serves twindowclean.com. Finished customer
documents contain names, home addresses, phone numbers and email addresses,
so they are kept out of it. Only the reusable layout lives here.
