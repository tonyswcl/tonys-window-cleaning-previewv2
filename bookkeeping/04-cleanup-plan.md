# 4. Cleanup Plan — Findings, Verification & Monthly Review

Everything below comes from your live QuickBooks data as of **July 17, 2026**.

## A. What I found (in priority order)

### 1. Personal and business are mixed — the structural problem
Connected to the business file right now:

| Account in QBO | Balance | Reality |
|---|---|---|
| Business Adv Fundamentals - 0802 | $3,931.99 | ✅ Your real business checking |
| 01 Primary Regular Share Account | $56.62 | Personal (credit union) |
| Regular Savings | $525.97 | Personal |
| Schoolsp Checking | $0.32 | Personal |
| Wescom Checking | **−$12,387.84** | Personal — and a bank account can't truly be negative $12k: transactions are missing, duplicated, or opening balance was never set |
| 06 PERSONAL LOAN | **−$13,757.96** | A loan connected as if it were a *bank asset* — belongs out of the file (or as a liability, if it funded the business) |
| 5 credit cards (QuicksilverOne, Savor, Schools MC, Schools Rewards, Wescom Visa) | $12,411.34 total | Mostly personal cards |
| 2019 Honda Civic loan | $17,478.58 | Personal vehicle |
| 2025 Ford Maverick loan | $33,950.15 | The work truck — keeps or leaves depending on the mileage-vs-actual decision (doc 01) |
| Opening Balance Equity | −$66,690.11 | A dumping ground QBO creates when accounts get connected without setup — a large balance here always means cleanup needed |
| *W-2 Job Income (Non-Business) | $2,677.73 | Your day-job paychecks flowing through the business file |

**The fix (do not delete anything yet):** decide which accounts are truly
business (my read: BofA 0802 + at most one credit card + the Maverick loan
if going actual-expense). Then, one account at a time: personal accounts get
their transactions swept to Owner's equity accounts and the account
disconnected from feeds and made inactive. A CPA/ProAdvisor should bless the
Opening Balance Equity journal entry that zeroes it out — that's a
one-time fix, not a weekly chore.

### 2. Expenses are barely being recorded — you're overpaying taxes
Seven months of 2026 show **$356.84 total expenses**: one fuel purchase
($64.27, January), meals ($39.29), and QuickBooks Payments fees ($253.28).
Meanwhile your invoices bill customers for mesh rolls, clips, spinners, and
plywood — so the Home Depot purchases exist, they're just not categorized.
February shows literally zero activity of any kind. Every uncategorized
expense is a lost tax deduction (roughly 25–35 cents per dollar).

**The fix:** work the bank feed backlog with doc 03's rules, starting January
1. That's the "under an hour a week" habit — the backlog is a one-time
2–3 hour session.

### 3. Income can't be read by service
Everything flows to one "Sales" account (plus "Billable Expense Income" and
"Discounts given"). Docs 01–02 fix this going forward. Optional: reclassify
the 14 existing 2026 invoices to the new items (they're few — 30 minutes) so
full-year reports read by service.

### 4. Payment hygiene (small, quick fixes)
- **−$65 in unapplied customer payments** sitting in A/R: Ron D −$50 (Jul 2025),
  Isaac −$10 (Aug 2025), Sample Customer −$5. Open each payment and apply it to
  its invoice, or refund/write off. "Sample Customer" is leftover test data —
  clean it up and make the customer inactive.
- **$81 in Customer Deposit (Liability)** — verify it ties to a real pending
  job. (Note: invoice 1061 shows an $81 discount; if that was actually a
  deposit being applied, the liability needs to be cleared against it.)
- **Deposits netted through the Discount field** — invoice 1033 subtracted
  Miguel's $140 deposit as a "discount." Use the Customer Deposit item method
  from doc 02 instead: your discounts report is currently overstated.

### 5. Invoice number gaps to verify (5 minutes in the Audit Log)
2026 invoices on file: 1032–1034, 1047–1049, 1051, 1053, 1054, 1056,
1059–1062. **Missing: 1035–1046, 1050, 1052, 1055, 1057, 1058** (17 numbers).
Deleted drafts and estimates can explain gaps, but confirm nothing real
disappeared: Gear → Audit Log, filter deleted/voided transactions. Gaps are
also what an auditor asks about first.

### 6. A discrepancy to resolve during cleanup
The balance sheet's year-to-date net income (−$358.81) doesn't match the P&L
(+$5,211.96). This usually means transactions in accounts outside the normal
P&L window, or personal flows hitting income/expense accounts. It should
self-resolve as items 1–2 get fixed — re-check after; if it persists, that's
a question for the ProAdvisor session.

## B. Payment verification checklist — Jan 1 to Jul 17, 2026

All 14 invoices are **paid in full** — genuinely good news. Total invoiced =
total collected = **$5,568.80**. ✅ No missing customer payments at the
invoice level. What's NOT yet verified is the bank side (that each payment
actually landed in the bank, once, in the right account) — that needs the
bank transactions (next step, section D).

| Inv # | Date | Customer | Service | Amount | Balance | Notes |
|---|---|---|---|---|---|---|
| 1032 | 03/17 | Linda | Window cleaning – exterior | $249.00 | $0 | |
| 1034 | 04/28 | Miguel | 20% materials deposit | $140.00 | $0 | Deposit — should have gone to liability, not income |
| 1033 | 05/03 | Miguel | Pigeon proofing (materials, cleanout, labor) | $1,560.00 | $0 | $1,700 less $140 "discount" = the deposit netted |
| 1047 | 05/28 | Carie | Window cleaning ext+int | $220.00 | $0 | |
| 1048 | 05/28 | Irene Atteberry | Pigeon proofing (itemized) | $0.00 | $0 | ⚠️ $0 invoice — should have been an estimate; was this job ever billed? |
| 1049 | 05/28 | Antonio | Solar panel cleaning | $120.00 | $0 | |
| 1054 | 06/02 | Wayne | Window cleaning – exterior 1-story | $55.00 | $0 | |
| 1051 | 06/04 | Staci | Pet-proof re-mesh ×10 + slider | $570.89 | $0 | |
| 1053 | 06/16 | Heather | Windows + 12 solar panels bundle | $320.00 | $0 | |
| 1056 | 06/23 | Bridget Paley | Pigeon proofing, 27-panel array | $675.00 | $0 | |
| 1059 | 07/07 | Linda Smith | Ext windows + solar | $239.00 | $0 | |
| 1060 | 07/09 | Sarah Residence | Ext+int windows + solar | $280.00 | $0 | |
| 1061 | 07/15 | Mike Miller | Pigeon proofing, 22-panel + spinners | $879.00 | $0 | $960 less $81 discount — verify vs. the $81 deposit liability |
| 1062 | 07/16 | Linda Smith | Standard re-mesh ×9 | $260.91 | $0 | $305.91 less $45 discount; repeat customer ✅ |

**Deposit-to-bank reconciliation (pending bank data):** for each payment above,
confirm — deposit date, bank account it landed in, exactly one deposit per
payment, and QuickBooks Payments payouts net of fees match invoice totals
minus the fee posted to 6300. Merchant fees YTD are $253.28 ≈ 4.5% of revenue
— worth nudging customers toward ACH/bank transfer (~1%) over cards on
bigger jobs like the pigeon-proofing installs.

## C. Month-by-month 2026 (from your P&L)

| Month | Income | Expenses | Net | What happened |
|---|---|---|---|---|
| Jan | $0 | $86.98 | −$86.98 | No jobs invoiced; fuel + meals only |
| Feb | $0 | $0.00 | $0.00 | ⚠️ Zero activity at all — feeds stopped being worked |
| Mar | $249.00 | $11.81 | $237.19 | First job of the year (Linda) |
| Apr | $140.00 | $6.64 | $133.36 | Miguel's deposit only |
| May | $1,900.00 | $88.98 | $1,811.02 | Big pigeon-proofing job (Miguel) — best full month |
| Jun | $1,620.89 | $84.59 | $1,536.30 | 5 invoices — busiest month by count |
| Jul 1–17 | $1,658.91 | $77.84 | $1,581.07 | On pace to beat June — momentum is real |
| **YTD** | **$5,568.80** | **$356.84** | **$5,211.96** | Expenses are undercounted (finding #2), so true net is lower |

**Revenue by service, YTD:** Pigeon proofing **$3,254 (58%)** · Window cleaning
≈$873 (16%) · Screens $832 (15%) · Mixed bundle $320 (6%) · Solar $290 (5%).
Your website's bet on pigeon proofing matches where the money actually is.
Solar cleaning is your smallest line but rides along on pigeon jobs — the
per-panel add-on price is doing its job.

## D. The fix sequence

Work top to bottom; each step is standalone. Steps 1–2 are things I can do
with you; 3–6 are one QBO session each.

1. ☐ **You confirm which accounts are truly business** (see the one question
   in my summary).
2. ☐ **Bank-feed backlog + deposit verification** — export or share the 2026
   bank/card transactions and we categorize per doc 03 and tie out section B's
   deposit column.
3. ◐ **Items: done July 17** — the nine missing standard items were created
   in QuickBooks via the connector. Still by hand (README "Start here"):
   create the income/COGS/equity accounts, repoint items to them, deactivate
   the old items.
4. ☐ Apply the −$65 unapplied payments; resolve the $81 deposit; audit-log
   check on invoice gaps.
5. ☐ Disconnect personal accounts; sweep their history to equity; CPA blesses
   the Opening Balance Equity zero-out and the vehicle method.
6. ☐ Reconcile each business account Jan→Jul, then start the weekly workflow
   (README).
