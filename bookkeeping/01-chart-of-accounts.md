# 1. Chart of Accounts

Designed for a solo/small-crew exterior-cleaning company in California, on
QuickBooks Online. Three principles:

1. **One income account per service line** — so your P&L answers "which service
   makes me money" without any extra reports.
2. **Direct job costs in Cost of Goods Sold (COGS)** — mesh, clips, screen
   material, chemicals. Gross profit then means "what a job actually earns."
3. **Owner money through equity, never income/expense** — every time you Zelle
   yourself money to fund the business, that's **Owner's Contribution**. Every
   time you take money out or pay something personal from a business account,
   that's **Owner's Draw**. Neither ever touches the P&L.

Turn on account numbers first: Gear → Account and settings → Advanced →
Chart of accounts → Enable account numbers.

## Income (4000s)

| # | Account | QBO Type / Detail | What goes here |
|---|---|---|---|
| 4000 | Window Cleaning – Residential | Income / Service income | All residential window work, incl. tracks & screens wiped as part of a wash |
| 4010 | Window Cleaning – Commercial | Income / Service income | Storefront/route work — ready for when you launch it |
| 4100 | Solar Panel Cleaning | Income / Service income | Per-panel and flat-rate panel washes |
| 4200 | Screen Repair & Replacement | Income / Service income | Re-mesh, new screens, sliding doors |
| 4300 | Pigeon Proofing / Bird Exclusion | Income / Service income | Mesh installs, spinners, cleanouts, sanitizing — your biggest line (≈58% of 2026 revenue) |
| 4400 | Exterior Cleaning – Other | Income / Service income | Gutter cleaning, roof wash, trash bin cleaning, pressure washing |
| 4500 | Hard Water Stain Removal | Income / Service income | Glass restoration jobs (also fine to fold into 4000 if rare) |
| 4800 | Materials & Reimbursements | Income / Service income | Materials you itemize on invoices (mesh rolls, plywood reimbursements). Pairs with COGS 5000 |
| 4900 | Other Service Income | Income / Service income | Misc labor, service call / trip fees |
| 4950 | Discounts Given | Income / Discounts-refunds given | **Already exists** as "Discounts given" — keep it. Always negative |

Your existing generic **"Sales"** and **"Billable Expense Income"** accounts get
retired: once the new items (doc 02) point at 4000–4900, new invoices stop
feeding them. Don't delete them (history lives there); just make them inactive
after the item remap.

## Cost of Goods Sold (5000s)

| # | Account | QBO Type / Detail | What goes here |
|---|---|---|---|
| 5000 | Job Materials & Supplies | COGS / Supplies & materials – COGS | Wire mesh rolls, clips, fasteners, spinners, screen mesh/spline/frames, roof-wash chemicals, DI resin/filters, soap |
| 5100 | Subcontracted Labor | COGS / Cost of labor – COGS | Any helper you 1099 for job work |
| 5200 | Equipment Rental | COGS / Equipment rental – COGS | Lift/ladder rentals for specific jobs |

Rule of thumb: if you bought it **for jobs**, it's COGS. If you bought it
**to run the company**, it's an expense (6000s).

## Expenses (6000s)

| # | Account | What goes here |
|---|---|---|
| 6000 | Advertising & Marketing | Facebook/Google ads, flyers, door hangers, yard signs |
| 6010 | Website & Software | Domain, hosting, QuickBooks subscription, CRM, Google Workspace |
| 6100 | Vehicle – Fuel | Rename your existing "Ford Maverick - Auto Fuel" to this |
| 6110 | Vehicle – Repairs & Maintenance | Oil changes, tires, washes for the work truck |
| 6120 | Vehicle – Insurance & Registration | Truck insurance + DMV |
| 6200 | Insurance – General Liability | Your business liability policy |
| 6300 | Merchant Processing Fees | Rename "QuickBooks Payments Fees" to this; Stripe/Square fees too if you add them |
| 6400 | Phone & Internet | Business share of your cell plan |
| 6500 | Small Tools & Equipment | Squeegees, poles, ladders, drills — anything under ~$2,500 |
| 6600 | Uniforms & Safety Gear | Shirts, harness, fall protection, gloves |
| 6700 | Office Supplies & Postage | Printer ink, paper, stamps |
| 6800 | Professional Fees | CPA, bookkeeper, legal |
| 6900 | Licenses & Permits | Business license, any city registrations |
| 7000 | Bank Fees & Interest | Business account fees, business credit card interest |
| 7100 | Meals (50% deductible) | Your existing "Meals - Business Owner" — keep, rename if you like |
| 7200 | Training & Certifications | Courses, IWCA-type memberships |
| 7900 | Miscellaneous Expense | Truly doesn't fit anywhere — should stay near $0 |

**Payroll accounts (7300 Wages, 7310 Payroll Taxes, 7320 Payroll Service Fees):**
create these only when you hire your first W-2 employee. Until then, helpers
paid per-job are 5100 Subcontracted Labor (collect a W-9; 1099-NEC at year-end
if you pay anyone $600+).

## Vehicles — one decision to make with your CPA

The 2025 Ford Maverick appears in the file with its $33,950 loan. Two ways to
deduct it, and you **cannot combine them**:

- **Standard mileage** (simplest): track business miles (an app like MileIQ or
  QuickBooks' own tracker), deduct the IRS rate. Then fuel/repairs/insurance
  are NOT also deducted — code them to Owner's Draw or keep them out of the file.
- **Actual expenses**: keep the truck, its loan, fuel, insurance, repairs, and
  depreciation in the books, deducted by business-use %.

Until you and a CPA choose, keep logging fuel to 6100 — it's easy to
reclassify later, and mileage tracking should start **now** either way.
The 2019 Honda Civic loan looks personal — it leaves the business file
entirely (see doc 04).

## Assets, Liabilities, Equity

| # | Account | Type | Notes |
|---|---|---|---|
| 1000 | Business Checking (BofA 0802) | Bank | Your "Business Adv Fundamentals - 0802" — the one true business account |
| 1010 | Tax Reserve Savings | Bank | Open one; move 25–30% of net profit monthly |
| 1100 | Accounts Receivable | A/R | Built-in |
| 1200 | Undeposited Funds | Other Current Asset | Built-in ("Payments to deposit") |
| 1500 | Equipment | Fixed Asset | Only single purchases over ~$2,500 (e.g., a water-fed pole system) |
| 1510 | Vehicles | Fixed Asset | Only if CPA chooses actual-expense method |
| 2000 | Business Credit Card | Credit Card | Whichever ONE card you designate for business |
| 2100 | Customer Deposits | Other Current Liability | **Already exists** as "Customer Deposit (Liability)" — this is the right way to take job deposits (see doc 02) |
| 2500 | Vehicle Loan – Ford Maverick | Long Term Liability | Only if actual-expense method |
| 3000 | Owner's Contributions | Equity / Owner's equity | **Every Zelle from you into the business goes here.** This is the answer to "I Zelle myself to fund my business" |
| 3100 | Owner's Draws | Equity / Owner's equity | Money you take out + any personal spending from business accounts. Your existing "Owner's Pay & Personal Expenses" can be renamed to this |
| 3900 | Retained Earnings | Equity | Built-in |

**Two important tax notes for a sole proprietor / single-member LLC:**
- Your **own pay is never an expense.** Paying yourself = Owner's Draw. Your
  profit is taxed whether you draw it or not.
- **Estimated tax payments to the IRS/FTB are Owner's Draws too** — income tax
  is your personal expense, not the business's. (Sales tax, if you ever owe it,
  is the liability account QuickBooks manages.)

The accounts currently in the file that don't appear above — the SchoolsFirst
and Wescom personal accounts, "06 PERSONAL LOAN", the personal credit cards,
"*W-2 Job Income (Non-Business)", "Opening Balance Equity" — are handled in
the cleanup plan (doc 04). Don't create anything new for them.
