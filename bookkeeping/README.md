# Tony's Window Cleaning — QuickBooks Bookkeeping System

Built July 17, 2026, from a live review of your QuickBooks Online file
(Tonys Window Cleaning, industry 561720 – Janitorial Services).
Everything in these documents is based on your actual data — your 14
invoices from 2026, your 63-item product list, your P&L, and your
balance sheet — not generic templates.

## The documents

| File | What it covers |
|---|---|
| [01-chart-of-accounts.md](01-chart-of-accounts.md) | The account structure: income by service line, COGS, expenses, equity (including how to handle Zelle-ing yourself money) |
| [02-products-and-services.md](02-products-and-services.md) | The 18 standard items to replace your current 63, which income account each maps to, and the cleanup map |
| [03-transaction-rules.md](03-transaction-rules.md) | Naming conventions, category + memo + billable + tax for every common transaction, and the QuickBooks bank rules to create |
| [04-cleanup-plan.md](04-cleanup-plan.md) | What I found in your file (with evidence), your payment verification checklist, month-by-month review, and the fix list in priority order |
| [05-best-practices.md](05-best-practices.md) | Tags, customer naming, estimates vs. invoices, recurring transactions, and the monthly reports to read |
| [06-billing-guide.md](06-billing-guide.md) | How invoicing really works: items → income accounts, the six billing rules, worked examples from your real jobs, and the billing cheat sheet |

## Start here — one-time setup, ~20 minutes in QuickBooks

The 9 missing standard items were already created for you (July 17). Three
things remain that can only be clicked in QuickBooks itself:

1. **Create the income & core accounts** (Gear → Chart of accounts → New).
   Minimum set: the six income accounts 4000/4010/4100/4200/4300/4400, plus
   5000 Job Materials & Supplies (COGS), 3000 Owner's Contributions, and
   rename "Owner's Pay & Personal Expenses" → 3100 Owner's Draws (doc 01 has
   the full table — add the rest as you go).
2. **Repoint items** (Sales → Products & services → Edit each): every kept or
   new item gets its income account from doc 02's table. **Most important
   one: "Customer Deposit Received" must point to "Customer Deposit
   (Liability)"** — never an income account.
3. **Deactivate the old items** from doc 02's "make inactive" list (Edit →
   Make inactive). History is preserved.

After that, the system runs on the weekly workflow below, and invoices only
ever use the standard items — vary quantity, rate, and description, never
create a new item per job.

## Your weekly workflow (under 1 hour)

Do this every Monday morning. After the first month it takes 30–40 minutes.

**1. Bank feed sweep (15–20 min)** — QuickBooks → Transactions → Bank transactions.
Work every account to zero "For review":
- Match customer payments to invoices (never "Add" a customer payment as income — always **Match**, or it double-counts).
- Accept rule-suggested categories (rules are defined in doc 03).
- Zelle **to** yourself → Owner's Draw. Zelle **from** yourself into the business → Owner's Contribution.
- Anything personal → Owner's Pay & Personal Expenses (equity), never a business expense.
- Transfers between your own accounts → record as Transfer, never income/expense.

**2. Invoicing & collections (10 min)**
- Invoice every job completed last week, same day as the work if possible.
- Check open invoices (Sales → Invoices → filter Unpaid). Send reminders at 3 days past due.

**3. Receipts (5 min)** — Snap photos into the QuickBooks mobile app as you buy
(Home Depot, gas). Monday: attach any stragglers to their transactions.

**4. Quick sanity check (5 min)**
- Undeposited Funds should be $0 or only payments from the last few days.
- No bank account should show a negative balance.
- A/R shouldn't show negative amounts (that means an unapplied payment — apply it).

## Monthly close (last day of the month, ~30 min)

1. Reconcile every business bank and credit card account against the statement.
2. Run **P&L (this month)** — read every expense line. Anything that surprises you, click into it.
3. Run **Sales by Product/Service** — this is your profitability-by-service view.
4. Run **A/R Aging** — chase anything over 14 days.
5. Move 25–30% of the month's net profit to a tax-reserve savings account.
6. Skim the month in doc 04's format: income, expenses by category, largest expense, anything unusual.

## Where things stand (July 17, 2026)

- 2026 invoiced & collected: **$5,568.80** across 14 invoices — all paid. ✅
  Bank-side verification is tracked in [payment-log-2026.csv](payment-log-2026.csv) — pending the business checking export.
- Standard service items created directly in QuickBooks on July 17 (doc 02) — finish with the "Start here" steps above.
- Categorized expenses: **only $356.84** — your books are missing most of your real costs (materials, fuel, insurance, phone). Fixing this is priority #1 in doc 04.
- Revenue mix: pigeon proofing ≈ 58%, windows ≈ 16%, screens ≈ 15%, solar ≈ 5%, bundles ≈ 6%.
- The file currently mixes personal accounts (W-2 paychecks, personal loan, Honda Civic loan, several personal cards) with the business — the cleanup plan in doc 04 separates them.
