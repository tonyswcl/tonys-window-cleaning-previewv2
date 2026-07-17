# 2. Products & Services

Your file currently has **63 items**. Most are one-offs created for a single
invoice ("Exterior / Interior / + 12 solar panels home bundle $300"), duplicates
("Mano de obea" / "Mano de obra"), items with the price typed into the name
("Pigeon Nest & Debris Removal - $35.00"), or catch-alls ("Sales", "Custom
Amount"). Nearly everything maps to one generic **Sales** income account, which
is why your P&L can't show profit by service.

## The standard list (18 items)

Create these, map each to its income account from doc 01, and stop creating
new items per job — vary the **quantity, rate, and description**, not the item.
All are QBO type **Service**, all **non-taxable** (see the sales-tax note below).

| Item name | Default rate | Income account | Notes |
|---|---|---|---|
| Window Cleaning – Exterior (Residential) | $149 (1-story) / $249 (2-story) | 4000 | Your existing tiered descriptions are good — keep them |
| Window Cleaning – Interior Add-on | $109 / $189 | 4000 | |
| Window Cleaning – Commercial | per bid | 4010 | Ready for launch |
| Hard Water Stain Removal | per bid | 4500 | |
| Solar Panel Cleaning (per panel) | $8 | 4100 | Qty = panel count |
| Solar Panel Cleaning – Flat Rate | $120 min | 4100 | For small arrays / minimums |
| Screen Re-Mesh – Standard (per screen) | $33.99 | 4200 | |
| Screen Re-Mesh – Pet-Proof (per screen) | $46.99 | 4200 | Merge your two pet-proof variants ($43.99/$46.99) into one — pick one price |
| Screen – New Frame & Screen (per screen) | per bid | 4200 | For full replacements, not just mesh |
| Pigeon Proofing – Solar Array Mesh Install | per bid | 4300 | Labor + install, perimeter sealing |
| Pigeon Proofing – Cleanout & Sanitize | $145 | 4300 | Nest/debris removal, disinfect |
| Pigeon Proofing – Deterrent Spinners | $150 | 4300 | Includes hardware + install |
| Pigeon Proofing – Materials & Hardware | per job | 4800 | Mesh rolls, clips, fasteners you itemize |
| Gutter Cleaning | per bid | 4400 | |
| Exterior Cleaning – Other | per bid | 4400 | Roof wash, trash bins, pressure washing |
| Service Call / Trip Fee | $49 | 4900 | Minimum-visit or long-distance fee |
| Miscellaneous Labor | per hour | 4900 | The "Custom Access Platform Fee" type of charge |
| Materials Reimbursement | at cost | 4800 | Pass-through purchases (your plywood example) |

Plus two special items:

| Item name | Maps to | How it works |
|---|---|---|
| **Customer Deposit Received** | 2100 Customer Deposits (**liability**, not income) | When you take a deposit (like Miguel's 20% / $140), invoice this item. It's not income yet — you haven't done the work. On the final invoice, add a second line, same item, **negative** amount, which drains the liability and the final invoice shows the true remaining balance. Stop netting deposits through the Discount field (that's what happened on invoice 1033, and it understates your revenue and your discounts) |
| **Discount / Price Adjustment** | 4950 Discounts Given | Or just use QuickBooks' built-in Discount field on the invoice — either is fine, pick one and be consistent. Never type a negative "service" line |

## Cleanup map for the existing 63

Items can't be deleted in QBO, only **made inactive** — history stays intact.
After creating the 18 above:

- **Make inactive — duplicates & one-offs:** "Mano de obea", "Mano de obra",
  "Materiales", "Limpieza de paneles", "Seguro", "Depósito de materiales (20%)",
  "Custom Amount", "Sales" (the item), every item with a price in its name
  ("…- $35.00", "…- 95.00"), all the "Complimentary …" items, "Exterior /
  Interior / + 12 solar panels home bundle $300", "Solar Panel Wash + Free
  Maintenance clean in March", "Window Cleaning" (non-inventory), "Exterior
  Wash", "Interior Wash", "Exterior + Interior Window Cleaning", "Exterior
  Window Cleaning", "Window Cleaning - 1 Story", the old screen variants,
  the old pigeon-proofing material variants.
- **Keep (already match the standard list):** "Window Cleaning - 1 Story
  Exterior Only", "…Interior Add-on", "…2 Story…", "Solar Panel Cleaning (per
  panel)", "Screen Repair - Standard Mesh (per screen)", "Screen Repair - Pet
  Proof Mesh (per screen)", "Pigeon Proofing - Cleanout & Debris Removal",
  "Pigeon Proofing - Installation & Sealing", "Trash Bin Cleaning" (fold both
  under Exterior Cleaning – Other pricing, or keep as-is if you like the two
  tiers). Just repoint their income accounts per the table above.
- **Stop selling "insurance" as a line item** ("Seguro", "Insurance & Job
  Overhead", "Liability & Insurance Coverage", "Safety Equipment & Roof
  Safety"). Customers shouldn't see your overhead itemized — build it into your
  labor/install price. It also looks odd in an audit: you're not an insurance
  seller. Same for "Lifetime Warranty" as a $40 line — bake it into the price
  and mention the warranty in the description.

## How free/courtesy work should be recorded

Instead of $0 items ("Complimentary Roof Wash"), put it in the invoice line
**description** of the paid service ("Includes complimentary roof tile crack
sealing"). Zero-dollar lines clutter reports; invoice 1048 was even a $0
invoice — that should have been an **estimate** (doc 05).

## California sales tax — read this once, then relax

- **Services are not taxable in California.** Window cleaning, solar panel
  cleaning, pigeon-proofing labor, gutter cleaning — no sales tax. Your
  invoices already (correctly) charge none.
- **The nuance is materials.** When you itemize "Materials & Supplies
  $320.99" as its own line, the CDTFA can treat you as the **retailer** of that
  mesh — which technically requires a seller's permit and collecting sales tax
  on the materials portion. The simple, safe pattern for a service business:
  **pay sales tax when you buy materials at Home Depot, and price jobs
  lump-sum** (labor + materials in one service price), or itemize materials
  **at your cost** as reimbursement. If you want to keep marking up an
  itemized materials line, ask a CPA whether a seller's permit is worth it.
  Worth one conversation at tax time — not urgent, but stop expanding the
  itemized-materials pattern until then.
