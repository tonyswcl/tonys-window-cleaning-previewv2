---
name: ads
description: Build, audit, or fix a Meta ad campaign for Tony's Window Cleaning using the account's real performance history, proven offers, and target geography.
metadata:
  short-description: Meta Ads Playbook
---
# /ads — Tony's Window Cleaning Meta Ads Playbook

Everything below is from this account's actual spend and results. Use it instead of generic Meta advice.

## Account facts

| | |
|---|---|
| Ad account ID | `683769241163243` |
| Facebook Page ID | `635945532944470` |
| Phone | 714-559-0300 |
| Website | twindowclean.com |
| Pigeon landing page | twindowclean.com/pigeon-proofing.html |
| Privacy policy (required for lead forms) | twindowclean.com/privacy.html |
| Google rating | 5.0, 23 reviews (rising — verify current count before writing copy) |
| Meta Pixel | **None exists.** Verified via API — zero datasets on the account. Must be created in Events Manager before any pixel/retargeting work. |

## Services and real pricing

- **Pigeon proofing — from $450.** 2-year pigeon-free warranty. Rust-resistant mesh secured with **clips, not bolts** (bolts void panel warranties and fail in High Desert wind — this is the #1 differentiator and it converts). Includes nest/dropping removal, hauling, sanitizing, perimeter seal.
- **Solar panel cleaning — from $7/panel.** Real invoices run $8/panel. Market rate is $10–12. Never publish a flat minimum that contradicts the per-panel price.
- **Window cleaning — from $149** single story, **$249** two-story. Screens, tracks, sills included.
- **Screen re-mesh — $33.99/screen**, pet-proof $46.99, $149 job minimum.
- **Proven bundle offer:** pigeon proofing + **FREE solar panel wash + roof wash**. Competitors (SLIK, SunsUp) run this exact hook, so it's market-validated. The wash cost is absorbed into pigeon labor; the customer then converts to $7/panel maintenance washes later.

## What has actually worked and failed — do not relearn this

~$1,653 spent over 90 days produced ~7 phone calls (~$236/call average). The average hides everything; the spread is the lesson.

| Campaign | Spend | CTR | CPC | Result |
|---|---:|---:|---:|---|
| **Boosted post: "52 Solar Panels Fully Washed & Pigeon Proofed"** | $60.60 | **3.33%** | **$0.54** | **$60.60/call — best ever** |
| Boosted post: "HUGE Solar Transformation with Pigeon Proofing" | $43.00 | 2.74% | $0.39 | strong engagement |
| "High Desert 🐪 July 26" | $394.23 | 2.90% | $0.63 | $131.41/call |
| HD + IE Leads — Calls — Lifetime $210 | $260.61 | 1.61% | $1.25 | $260.61/call |
| **IE Messages — Solar+Window+Pigeon (broad IE)** | $310.45 | **1.55%** | **$0.86** | **zero calls** |
| All Messenger campaigns combined | ~$272 | high | $0.20 | **14 chats, 0 bookings** |

**Three hard rules that follow from this:**

1. **Never use Messenger/click-to-message.** It buys cheap tappers, not buyers. Proven over ~$272 and 14 conversations with zero jobs.
2. **Boosted real-job posts beat designed creative.** The winning ads are photos of actual jobs with a specific number in the caption. Polished graphics underperform them on every metric.
3. **Broad Inland Empire targeting fails.** The one campaign that used it produced zero calls at the worst CTR in the account. IE must be targeted by specific ZIP, never by region.

## Campaign structure that works

**Objective:** Leads (`OUTCOME_LEADS`)
**Conversion location:** Instant forms — keeps the lead in-app, no website funnel
**Performance goal:** `QUALITY_LEAD` (the "Higher intent" form type). Fewer leads, but Tony's roof hours are scarcer than ad dollars.
**Structure:** ONE campaign, ONE ad set. At $30–50/day the account will never hit 50 conversions/week to exit learning phase — splitting into multiple ad sets guarantees it never learns anything.
**Budget:** $30–50/day daily budget. Not lifetime (see mistakes below).
**Advantage campaign budget:** OFF. Budget at ad set level.

### Targeting

- **Age 30–65.** Under 30 is renters filling forms.
- **Advantage+ audience: OFF.** Always. Switch to original audience options.
- **No detailed interest targeting.** Meta killed homeowner targeting in 2022; creative does the filtering now.
- **Location type: "People living in this location."** Not "living in or recently in" — `recent` includes commuters driving through.
- **ZIP codes, no radius.** City + radius overlaps badly in the dense IE and spills into LA/Riverside county.

**Inland Empire pigeon-proofing ZIPs** (solar density × ticket size × flock pressure):

`91739` Etiwanda · `91737` Alta Loma · `91701` Rancho Cucamonga · `92336` N. Fontana · `92880` Eastvale · `91709` Chino Hills · `91784` N. Upland · `92374` Redlands · `91761` Ontario (proven — real job here)

Overflow if audience reads small: `92373` Redlands, `91786` Upland.

**Audience size target: 200K–500K.** Under 150K at $30/day means frequency spikes and CPMs climb. Over 1M means the targeting is broken — check for a stray radius.

**High Desert cities** (organic/GBP territory, lower ad priority): Victorville, Hesperia, Apple Valley, Adelanto, Oak Hills, Phelan, Barstow, Lucerne Valley.

## The lead filter — six questions

Junk leads cost roof time, which is the real constraint. Friction is the feature: a curious browser quits at Q3, someone with six months of droppings finishes all six.

1. **Do you own the home?** → `Yes, I own it` / `I rent` ← disqualifier
2. **Do you have solar panels?** → `Yes, pigeons are under my panels` / `Yes, but no pigeons yet` / `No solar, pigeons on roof/eaves`
3. **How long have the pigeons been there?** → `Months — there's a real mess` / `A few weeks` / `Just started`
4. **How soon do you want it handled?** → `This week` / `Within the month` / `Just pricing it out`
5. **Roughly how many solar panels?** (short answer)
6. **What city are you in?** (short answer)

Plus prefilled name + phone. Privacy URL: `https://twindowclean.com/privacy.html`. Completion button: **Call now** → 714-559-0300.

**Lead scoring:**
- 🔥 **HOT** — owns + solar + months + this week → **call within 15 minutes**
- 🟡 **WARM** — owns + solar + this month → same day
- 🔵 **COOL** — no pigeons yet / just pricing → text quote, follow up in 2 weeks
- ⛔ **DEAD** — renter or outside the ZIP list → ignore

**The 15-minute rule decides the campaign, not the ad.** Form leads called back inside 15 minutes book at multiples of one called that evening.

## Creative rules

**Meta's ranking now reads the semantic content of the image and copy to decide who sees the ad** (Hierarchical Interest Representation). Concrete nouns beat clever lines — "pigeons nesting in the gap under your solar panels, droppings on roof tile" gives the model something to match; "protect your investment" gives it nothing. This is why real job photos win.

- **Use real job photos.** Live pigeons on a roof, or a mesh install close-up. Never stock, never heavy graphic overlay.
- **Turn off Advantage+ creative enhancements** — auto text overlays fight the photo.
- **Lead the headline with the bundle**, e.g. `Pigeon Proofing + FREE Solar Wash`.
- **Include a real Google review quote** plus "5.0 · 23 reviews".
- **Brand look:** light baby blue (`#eaf6fc`, `#c0e0f0`) with gold (`#f0b040`), navy (`#103050`) as text only. Navy-heavy designs were rejected as tacky.
- Processed job photos live in the repo at `assets/photos/` named `{city}-{service}-{nn}.jpg`; hub images are `hub-pigeon-proofing-*`, `hub-solar-*`, `hub-window-*`, `hub-screen-repair-*`.

## Mistakes already made — check for these every time

- **$210 entered as daily instead of lifetime.** Caught after $58. Always confirm the budget type.
- **Advantage+ audience left on** → audience estimate ballooned to 2.9–3.5M.
- **25-mile default radius** silently undid a careful city list.
- **`location_types` including `recent`** → paying for people driving through.
- **`tel:` link rejected** as an ad destination. Meta requires a website URL in the `link` field; the phone number goes only in the CTA value.
- **`pacing_type: ["day_parting"]` is required** when using `adset_schedule`, or the API errors.
- **Meta auto-pauses the ad set on edit** (`status_forced_to_paused: true`). Re-activate campaign *and* ad set after any API change.
- **Image upload API is gated on this account.** Workaround: commit the image to the website repo and reference the public URL.
- **Editing resets learning.** Batch all changes into one pass, then leave it alone 7 days.

## Judging a campaign

| Checkpoint | Green | Red — act |
|---|---|---|
| Day 3 | Leads under $35 | Zero leads → swap the photo only |
| Day 7 | ≥1 booked job | $50+/lead → new headline + image, keep targeting |

**Judge on booked jobs, not lead count.** One $650 IE pigeon job pays roughly three weeks at $30/day.

## When invoked

1. Pull live account state first (`ads_get_ad_entities` at campaign → adset → ad level) before recommending anything. Never advise from memory of a past state.
2. Check the mistake list above against the live config — those specific errors recur.
3. If a campaign is already live and approved, **prefer editing it over rebuilding**; a fresh build restarts ad review and can miss a scheduled launch.
4. Give step-by-step desktop Ads Manager instructions with exact paste-ready copy, not concepts.
