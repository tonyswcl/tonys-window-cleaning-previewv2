# 6. Billing Guide — How to List Your Billing Properly

## Why everything says "Sales" today

In QuickBooks, an invoice line never posts to an income account directly.
Every line uses an **item** (a Product/Service), and each item is wired to
exactly one **income account**. The item is what the customer sees; the
income account is where the money gets filed. All 63 of your items were wired
to the same account — "Sales" — so no matter what you billed, the P&L lumped
it into one number.

Think of it as two layers:

- **Chart of Accounts (income accounts)** = the filing cabinet. Your P&L is
  just a printout of the cabinet's drawers: 4000 Windows, 4100 Solar,
  4300 Pigeon Proofing…
- **Products & Services (items)** = the menu you bill from. Every menu entry
  is wired to one drawer.

Bill with the right menu item → the money files itself → your P&L shows
profit by service with zero extra work. That's the entire trick.

## Rewire once, then never think about it

For each item you're keeping (doc 02): **Sales → Products & services → Edit →
Income account → pick the right 4000-series account → Save.**

When you change an item's income account, QuickBooks asks: *"Also update this
account in historical transactions."* **Check it.** That retroactively refiles
every past invoice line that used the item — meaning your January-to-today
P&L instantly reads by service, without editing a single old invoice.

## The six billing rules

**1. One line per service, standard items only.** A job = one invoice, one
line per distinct service performed. The item is fixed; what varies per job
is **quantity, rate, and description**. The description is free text the
customer sees — customize it every time ("22-panel array, north-facing roof");
it has zero effect on the accounting. Creating a new item per job is what
produced the 63-item pile.

**2. Combo jobs = multiple lines, never a bundle item.** Windows + solar on
the same visit is two lines: a window item and a solar item. If you quoted one
package price, adjust the line rates so they add up to the quote. Your old
invoice 1053 ("Exterior / Interior / + 12 solar panels home bundle $300" as
one item) hid $96 of solar revenue inside the windows number forever. Done
right:

| Line item | Qty | Rate | Amount | Files to |
|---|---|---|---|---|
| Window Cleaning - 1 Story Exterior Only | 1 | $149 | $149 | 4000 Windows |
| Window Cleaning - 1 Story Interior Add-on | 1 | $75 | $75 | 4000 Windows |
| Solar Panel Cleaning (per panel) | 12 | $8 | $96 | 4100 Solar |
| **Total** | | | **$320** | |

Same $320 the customer agreed to — but now your P&L knows the solar line
earns money.

**3. Deposits use the deposit item, both directions.** Taking 20% down on a
pigeon job: invoice one line, **Customer Deposit Received**, +$140 → files to
the Customer Deposit *liability* (it's not income yet — you haven't done the
work). Final invoice: all the real service lines, plus one more line,
**Customer Deposit Received, −$140**, which empties the liability and reduces
what's owed. Never subtract a deposit with the Discount field (that's what
happened on invoice 1033 — it made your discount report lie).

**4. Discounts use the Discount field only.** One place, every time; it files
to Discounts Given so you can see exactly what price flexibility costs you
per year. Never a negative service line, never a lower rate silently typed in
(you lose the information that you discounted).

**5. Free/courtesy work lives in descriptions, not $0 lines.** "Includes
complimentary roof tile crack sealing" inside the paid line's description.
$0 lines and $0 invoices (your invoice 1048) clutter every report — a scope
breakdown before the sale is an **Estimate**, not an invoice.

**6. Materials get their own line only when you mean it.** If you itemize
materials for the customer, use **Pigeon Proofing - Materials & Supplies**
(pigeon jobs) or **Materials Reimbursement** (pass-throughs, at cost) — they
file to 4800 so service labor and materials don't blur. Otherwise price
lump-sum and skip the materials line entirely (simplest, and cleanest for
California sales tax — see doc 02).

## A real job, redone: Mike Miller (invoice 1061)

What you billed: five lines from five ad-hoc items, all → "Sales", $81
subtracted as a "discount."

The proper version, assuming the $81 was an earlier deposit:

| Line item | Amount | Files to |
|---|---|---|
| Pigeon Proofing - Cleanout & Debris Removal | $145.00 | 4300 Pigeon Proofing |
| Pigeon Proofing - Installation & Sealing *(desc: "22 panels, incl. haul-away & site cleanup")* | $344.01 | 4300 Pigeon Proofing |
| Pigeon proofing spinners | $150.00 | 4300 Pigeon Proofing |
| Pigeon Proofing - Materials & Supplies | $320.99 | 4800 Materials |
| Customer Deposit Received | −$81.00 | 2100 Deposit liability (cleared) |
| **Total due** | **$879.00** | |

Customer sees the same professional breakdown and the same total. Your books
now show: pigeon-proofing service revenue $639.01, materials $320.99, deposit
properly closed out. (If the $81 was a true discount, it goes in the Discount
field → 4950 instead.)

## The billing cheat sheet

| You did… | Bill with item | Files to |
|---|---|---|
| Residential window wash (ext) | Window Cleaning - 1 or 2 Story Exterior Only | 4000 |
| Interior added | Window Cleaning - Interior Add-on | 4000 |
| Storefront/commercial | Window Cleaning - Commercial | 4010 |
| Hard water spots | Hard Water Stain Removal | 4500 |
| Solar wash | Solar Panel Cleaning (per panel) ×N, or flat | 4100 |
| Re-mesh screens | Screen Repair - Standard / Pet Proof (per screen) ×N | 4200 |
| Whole new screen | Screen - New Frame & Screen (per screen) | 4200 |
| Pigeon mesh install | Pigeon Proofing - Installation & Sealing | 4300 |
| Nest cleanout/sanitize | Pigeon Proofing - Cleanout & Debris Removal | 4300 |
| Spinners | Pigeon proofing spinners | 4300 |
| Mesh/clips itemized | Pigeon Proofing - Materials & Supplies | 4800 |
| Gutters | Gutter Cleaning | 4400 |
| Roof wash, bins, pressure wash | Exterior Cleaning - Other (or the Trash Bin items) | 4400 |
| Odd labor, custom rigging | Miscellaneous Labor | 4900 |
| Minimum visit / travel | Service Call / Trip Fee | 4900 |
| Pass-through purchase | Materials Reimbursement | 4800 |
| Deposit in / applied | Customer Deposit Received (+/−) | 2100 liability |
| Price break | Discount field | 4950 |

## Billing vs. expenses — the two flows never mix

- **Money in:** job → invoice with items → payment received → matched in the
  bank feed. Items decide the income account. You never pick an income
  account by hand on an invoice.
- **Money out:** purchase → bank/card feed → you pick the expense category
  per doc 03. Expenses never appear on invoices — with one exception: a
  purchase marked **billable** to a customer, which then flows onto their
  invoice as a Materials line.

## How you'll read the results

- **Profit & Loss** — income by account: your service lines as drawers of the
  cabinet. This answers "which service makes me money."
- **Sales by Product/Service Summary** — by item: finer grain (standard vs
  pet-proof mesh, per-panel counts). This answers "what exactly am I selling."

Both become meaningful the moment the items are rewired.
