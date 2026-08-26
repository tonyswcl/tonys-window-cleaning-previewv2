---
name: meta-ads-campaign
description: End-to-end workflow to build, QA and launch a Meta ad campaign for Tony's Window Cleaning — pre-flight checks, exact Ads Manager steps, paste-ready copy per service, and a launch QA gate. Pairs with /ads for the account data.
metadata:
  short-description: Meta Campaign Builder
---
# /meta-ads-campaign — Build & Launch Workflow

**This is the procedure. `/ads` is the data.** Load `/ads` first for account IDs, real pricing, performance history, ZIP lists and the mistake catalog. This skill is the sequence that turns that into a live campaign.

Work the phases in order. Do not skip Phase 0 or Phase 6.

---

## PHASE 0 — Pre-flight (never skip)

1. **Pull live state** — `ads_get_ad_entities` at campaign level, then adset, then ad. Never advise from memory of a past session.
2. **Check for conflicts.** If another campaign is ACTIVE or SCHEDULED, say so before building. Two campaigns splitting a $30–50/day budget means neither ever learns. Recommend pausing the old one or editing it instead.
3. **If a campaign already exists and is approved → edit it, don't rebuild.** A fresh build restarts ad review and can miss a scheduled launch time.
4. **Verify current Google review count** before writing copy — it's rising and stale numbers make the ad look neglected.
5. **Confirm the landing/privacy URLs resolve**: `twindowclean.com/privacy.html` must be live or lead forms get rejected.

Report findings before proceeding.

---

## PHASE 1 — Lock the offer

Pick one service as the hook. Do not bundle three services in one ad — the account's worst performer ($310, zero calls) was a Solar+Window+Pigeon combo ad.

| Service | Hook | Ticket |
|---|---|---|
| **Pigeon proofing** (default) | + FREE solar wash & roof wash | $450–900 |
| Solar cleaning | Dust is costing you output | $96–300 |
| Window cleaning | Screens/tracks/sills included | $149–400 |
| Screen repair | On-site, same visit | $149+ |

**Default to pigeon proofing.** Highest ticket, ~58% of revenue, and almost no local competition.

Confirm current pricing against `/ads` before writing a number into an ad.

---

## PHASE 2 — Campaign

```
+ Create → Leads → Continue
Name:  [Region] [Service] — Instant Form — [Month]
Special ad categories: NONE
Advantage campaign budget: OFF
```

---

## PHASE 3 — Ad set

**ONE ad set. Always.** At this budget the account can't reach 50 conversions/week to exit learning; splitting guarantees it never learns.

```
Name:              [Region] — [n] ZIPs — Form
Conversion:        Instant forms
Performance goal:  Maximize number of leads  →  QUALITY_LEAD ("Higher intent")
Budget:            $30–50/day  DAILY (never lifetime)
Schedule:          Start date, NO end date
Age:               30–65
Advantage+ audience: OFF  ("Switch to original audience options")
Detailed targeting: NONE
Placements:        Advantage+ placements ON
```

**Locations — the step that breaks most often:**
- Delete every default entry first
- Add **ZIP codes only**, no cities, no radius
- Set dropdown to **"People living in this location"** — not "living in or recently in"
- ZIP list comes from `/ads`
- **Verify the audience estimate reads 200K–500K.** Over 1M means a stray radius survived. Under 150K means frequency will spike.

---

## PHASE 4 — Creative

**Real job photo. Never stock, never heavy graphic overlay.** Photos live in `assets/photos/` in the website repo. Turn OFF Advantage+ creative enhancements — auto overlays fight the photo.

Write copy with **concrete nouns**, not abstractions. Meta's ranking reads semantic content to decide who sees the ad: "pigeons nesting in the gap under your solar panels, droppings on roof tile" targets; "protect your investment" does not.

Every ad includes: the bundle in the headline · a real Google review quote · "5.0 · [current count] reviews" · the starting price · a firm-quote reassurance.

### Template — Pigeon proofing (primary)

> Pigeons are nesting in the four-inch gap under your solar panels. Shaded, warm, sheltered — and they don't leave on their own. They breed there, the droppings pile onto your roof tile, and your panels quietly lose output every month.
>
> **[REGION] — right now:**
> Pigeon proofing from $450, including a **FREE full solar panel wash + roof wash**.
>
> ✔ Nests, eggs and droppings removed and hauled off
> ✔ Rust-resistant mesh clipped to the panel frame — no drilling, no voided warranty
> ✔ Full perimeter sealed so they can't walk back in
> ✔ 2-year pigeon-free warranty
> ✔ Panels washed with purified water before we leave
>
> "I hired Tony's to clean my 10 solar panels and pigeon proof them. He did a great job — I recommend them to anyone looking to get their solar pigeon proofed." — Oswaldo F. ⭐⭐⭐⭐⭐
>
> 5.0 on Google · [N] reviews · Free inspection, firm quote before anything starts.
>
> Tap Get Quote → 6 quick questions → we call you today.

**Headline:** `Pigeon Proofing + FREE Solar Wash`
**Description:** `From $450 · 2-year warranty · Free inspection`
**CTA:** Get quote

### Template — Solar cleaning

> Your panels look fine from the ground. That's the problem.
>
> High Desert dust doesn't wash off — we get almost no rain to do it. Output just drifts down month over month and nothing tells you. Most homeowners we clean for have never opened their inverter app.
>
> ✔ Purified deionized water — dries spot-free, no mineral spots blocking light
> ✔ Soft brush and water-fed pole, safe for panel coatings
> ✔ Full array inspection included — about half the roofs we open have birds under them
>
> From $7 per panel. Market rate out here is $10–12.
>
> 5.0 on Google · [N] reviews · Free quote.

**Headline:** `Solar Panel Cleaning — From $7/Panel`
**Description:** `Purified water · Free array inspection`

### Template — Window cleaning

> That cloudy band at the bottom of your windows isn't dirt. It's hard water etched into the glass by sprinkler overspray — and no amount of Windex touches it.
>
> ✔ Screens, tracks and sills included in every exterior clean — not an upsell
> ✔ Purified water finish, dries clear with no residue
> ✔ Two-story is standard for us, not a special request
> ✔ Hard water restoration available when a wash isn't enough
>
> From $149 single story, $249 two-story.
>
> 5.0 on Google · [N] reviews · Free quote.

**Headline:** `Window Cleaning — Screens Included`
**Description:** `From $149 · Purified water · Free quote`

---

## PHASE 5 — Instant form

**Form type: Higher intent** (adds the review step).

Six questions. Friction is the feature — a browser quits at Q3, someone with six months of droppings finishes all six.

1. Do you own the home? → `Yes, I own it` / `I rent` ← disqualifier
2. Do you have solar panels? → `Yes, pigeons are under my panels` / `Yes, but no pigeons yet` / `No solar, pigeons on roof/eaves`
3. How long have the pigeons been there? → `Months — there's a real mess` / `A few weeks` / `Just started`
4. How soon do you want it handled? → `This week` / `Within the month` / `Just pricing it out`
5. Roughly how many solar panels? *(short answer)*
6. What city are you in? *(short answer)*

Plus prefilled **Full name** and **Phone**.

```
Intro headline: Claim: Free Solar Wash + Roof Wash
Intro text:     [Region] homeowners. Pigeon proofing from $450. Free
                inspection, firm written quote before any work. Answer 6
                quick questions and Tony calls you back today.
Privacy URL:    https://twindowclean.com/privacy.html
Completion:     Tony calls you back today from 714-559-0300 — save the number.
Completion CTA: Call now → 714-559-0300
```

Adapt Q2/Q3/Q5 for non-pigeon services; keep Q1, Q4, Q6 always — ownership, urgency, geography.

---

## PHASE 6 — QA gate (run every single time)

Check each against the live config, not against what you intended to set:

- [ ] Budget is **DAILY**, not lifetime — and the number is right (a $210 lifetime once got entered as $210/day)
- [ ] **Advantage+ audience OFF** — confirm `advantage_audience: 0`
- [ ] **No radius** on any location entry
- [ ] **`location_types` = home only**, not `["home","recent"]`
- [ ] Audience estimate **200K–500K**
- [ ] Age 30–65
- [ ] **One ad set only**
- [ ] Optimization = `QUALITY_LEAD`
- [ ] Privacy URL present and resolving
- [ ] Advantage+ creative enhancements OFF
- [ ] Review count in copy matches reality
- [ ] Prices in copy match `/ads` current pricing
- [ ] No other campaign ACTIVE competing for the same budget
- [ ] If edited via API: **re-activate campaign AND ad set** — Meta auto-pauses on edit

---

## PHASE 7 — Launch and monitor

**Turn on lead notifications immediately.** Leads Center (All tools → Instant forms) → email + push. A lead nobody sees is money burned.

**The 15-minute rule decides the campaign, not the ad.** Form leads called back within 15 minutes book at multiples of one called that evening.

**Lead scoring:**
- 🔥 owns + solar + months + this week → **call in 15 min**
- 🟡 owns + solar + this month → same day
- 🔵 no pigeons yet / just pricing → text quote, follow up in 2 weeks
- ⛔ renter or outside ZIP list → ignore

**Then leave it alone for 7 days.** Every edit resets learning.

| Checkpoint | Green | Red — act |
|---|---|---|
| Day 3 | Leads under $35 | Zero leads → swap the photo only, change nothing else |
| Day 7 | ≥1 booked job | $50+/lead → new headline + image, keep targeting |

**Judge on booked jobs, not lead count.** One $650 pigeon job pays roughly three weeks at $30/day.

---

## Scaling rules

- Cost per booked job under $150 → raise budget **20% per week**, no more. Bigger jumps reset learning.
- Never scale a campaign that hasn't produced a booked job, no matter how cheap the leads look.
- New region → duplicate the winning ad set, swap ZIPs only. Do not change creative and geography in the same test.
