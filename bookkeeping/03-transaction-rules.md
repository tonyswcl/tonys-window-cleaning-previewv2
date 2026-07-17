# 3. Transaction Rules & Naming Conventions

Consistent descriptions make your books searchable and your bank feed
self-categorizing. Format for memos:

- **Job costs:** `[Customer] – [what] – [job]` → `Miller – 4 mesh rolls + clips – 22-panel pigeon proofing`
- **Vehicle:** `Maverick – [what]` → `Maverick – fuel, Chevron Hesperia`
- **Overhead:** `[what] – [period]` → `Liability insurance – July 2026`
- **Owner money:** `Owner draw – [purpose]` / `Owner contribution – Zelle from personal`

## The rules table

"Billable?" = check the Billable box and pick the customer, so the cost can
flow onto their invoice (pairs with item "Pigeon Proofing – Materials &
Hardware" / "Materials Reimbursement"). Sales tax applies to none of these —
you *pay* tax at the register (it's part of the expense amount, don't split it out).

| Transaction | Category | Suggested memo | Billable? | Notes |
|---|---|---|---|---|
| Gas station (Chevron, Circle K, Shell…) | 6100 Vehicle – Fuel | `Maverick – fuel, [station] [city]` | No | Only the work truck. Spouse/personal car fuel from a business account → Owner's Draw |
| Home Depot / Lowe's — job materials | 5000 Job Materials & Supplies | `[Customer] – mesh/clips/screen roll – [job]` | **Yes**, when you itemize materials on their invoice | Keep the receipt photo attached |
| Home Depot / Lowe's — tools | 6500 Small Tools & Equipment | `[tool] – replacement/new` | No | Split one receipt across both categories when it's mixed — QuickBooks lets you split |
| Amazon — business | 5000 or 6500 by contents | `[what] – [job or "stock"]` | Sometimes | Amazon is where personal sneaks in. If it's household stuff → Owner's Draw |
| Screen mesh/frame suppliers | 5000 Job Materials & Supplies | `[Customer] – [mesh type] x[qty]` | Yes if itemized | |
| Equipment > ~$2,500 (water-fed pole system) | 1500 Equipment (Fixed Asset) | `[equipment] – [vendor]` | No | CPA depreciates or Section-179s it at year-end |
| General liability insurance | 6200 Insurance – General Liability | `Liability policy – [month/period]` | No | |
| Truck insurance | 6120 Vehicle – Insurance & Registration | `Maverick – insurance [period]` | No | Skip if CPA chooses standard mileage |
| Cell phone (Verizon, T-Mobile…) | 6400 Phone & Internet | `Cell – [month] (business %)` | No | If the plan is personal, pay it personally and let your CPA deduct the business-use % at tax time — cleaner than splitting monthly |
| Facebook / Google ads | 6000 Advertising & Marketing | `FB ads – [campaign/month]` | No | |
| Website, domain, hosting | 6010 Website & Software | `[vendor] – [what] [period]` | No | |
| QuickBooks subscription | 6010 Website & Software | `QBO subscription – [month]` | No | |
| QuickBooks Payments / Stripe / Square fees | 6300 Merchant Processing Fees | auto-memo is fine | No | These post automatically — just make sure the rule targets 6300 |
| Helper paid per job (cash/Zelle/check) | 5100 Subcontracted Labor | `[Name] – [job] – [date]` | No | W-9 on file; 1099-NEC if $600+/year |
| CPA / bookkeeper / legal | 6800 Professional Fees | `[who] – [what]` | No | |
| Business license / permits | 6900 Licenses & Permits | `[city/agency] – [year]` | No | |
| Bank service charge, business CC interest | 7000 Bank Fees & Interest | auto | No | Interest on *personal* cards → Owner's Draw |
| Meals with a business purpose | 7100 Meals | `[who/why]` | No | 50% deductible; solo lunch on a workday is NOT deductible — Owner's Draw |
| **Customer payment arriving in bank** (Zelle, ACH, check deposit) | **Match** to the invoice payment | — | — | Never categorize as income directly — receive the payment against the invoice first (or let QB Payments do it), then Match. Otherwise revenue double-counts |
| **Cash job** | Sales Receipt same day → Undeposited Funds → Bank deposit | `Cash – [customer] – [service]` | — | Every cash job gets a sales receipt, no exceptions — it's your audit trail |
| **Zelle to yourself / ATM withdrawal** | 3100 Owner's Draws | `Owner draw` | No | |
| **Zelle from personal → business** | 3000 Owner's Contributions | `Owner contribution – business funding` | No | This is your "I Zelle myself to fund the business" answer |
| **Transfer between your own accounts** | Transfer (QBO's transfer type) | `Transfer [from] → [to]` | No | Never income, never expense. If both accounts are in QBO, record once and Match on the other side — recording both sides creates duplicates |
| **W-2 paycheck landing in a connected personal account** | *W-2 Job Income (Non-Business) equity — existing account | `W-2 pay – not business` | No | Only until personal accounts leave the file (doc 04) |
| Personal spending from any business account | 3100 Owner's Draws | `Owner draw – personal` | No | No judgment, just consistency — it keeps your P&L honest |
| Estimated tax payment (IRS / FTB) | 3100 Owner's Draws | `Est. tax Q[n] 2026` | No | Income tax is personal for a sole prop — never a business expense |

## Bank rules to create in QuickBooks

Banking → Rules → New rule. Create these seven — they'll handle most of your feed:

1. Description contains `CHEVRON`, `CIRCLE K`, `SHELL`, `ARCO` → 6100 Vehicle – Fuel
2. Description contains `HOME DEPOT` or `LOWES` → 5000 Job Materials & Supplies, **but leave "Auto-add" OFF** — review each one, some are tools (6500)
3. Description contains `INTUIT` → 6010 Website & Software (the payments-fee ones auto-post separately to 6300)
4. Description contains `FACEBK` or `GOOGLE ADS` → 6000 Advertising & Marketing
5. Description contains your insurer's name → 6200 Insurance – General Liability
6. Description contains `ZELLE TO [YOUR NAME]` → 3100 Owner's Draws
7. Description contains `ZELLE FROM [YOUR NAME]` → 3000 Owner's Contributions

Rules 1, 3, 4, 5 are safe to auto-add after a month of spot-checking. Never
auto-add rules for deposits — customer payments must always be **matched**, not added.
