# Campaign Architecture — Tony's Window Cleaning

---

## Google Local Services Ads (LSA)

### Setup
- Business category: **Window Cleaning**
- Add secondary category: **Solar Panel Cleaning** (if available in LSA)
- Verify Google Guaranteed badge (background check + license + insurance upload)
- Link to Google Business Profile

### Service Areas (Geo targeting)
Primary ZIP codes to cover:
- High Desert: 92392, 92394, 92395 (Victorville), 92345 (Hesperia), 92307, 92308 (Apple Valley)
- Inland Empire: 92316, 92335, 92336, 92337 (Fontana), 91730, 91764 (Ontario/Rancho Cucamonga)
- Set max travel radius = 25 miles from Victorville (adjust after 30 days based on job profitability)

### Services Listed in LSA
- [ ] Window cleaning (residential)
- [ ] Window cleaning (commercial)
- [ ] Solar panel cleaning
- [ ] Glass cleaning

### Bid Strategy
- Set max CPL at **$60** to start
- Review weekly in first month; adjust down to $45 once 10+ leads received
- Dispute invalid leads immediately (wrong service type, wrong area, voicemails with no callback)

### Naming Convention
```
LSA_WindowCleaning_HighDesert_IE_2026Q3
```

---

## Meta (Facebook/Instagram)

### Account Structure

```
Ad Account: Tony's Window Cleaning
│
├── Campaign 1: Local Awareness — Residential
│   Objective: Reach / Brand Awareness
│   Budget: $5/day ($150/mo)
│   │
│   ├── Ad Set 1A: Homeowners — High Desert
│   │   Targeting: 25-mile radius Victorville | Age 28-65 | Homeowners interest
│   │   Placements: Facebook Feed, Instagram Feed, Reels
│   │   Creative: Before/after photo, "Free Quote" CTA
│   │
│   └── Ad Set 1B: Homeowners — Inland Empire
│       Targeting: 15-mile radius Rancho Cucamonga | Age 28-65
│       Creative: Same as 1A (duplicate and monitor performance split)
│
├── Campaign 2: Solar Panel Owners
│   Objective: Lead Generation (native Lead Form or click-to-call)
│   Budget: $3/day ($90/mo)
│   │
│   └── Ad Set 2A: Solar Panel Owners
│       Targeting: 30-mile radius Victorville | Age 30-65
│       Interest: Solar panels, solar energy, home solar
│       Creative: "Dirty solar panels lose up to 25% efficiency" hook
│
└── Campaign 3: Retargeting
    Objective: Conversions / Traffic
    Budget: $2/day ($60/mo)
    │
    └── Ad Set 3A: Website Visitors (30 days) + FB/IG Engagers (60 days)
        Audience: Custom — website visitors + page engagers
        Creative: Offer-driven ("$20 off your first clean — call today")
        CTA: Call Now
```

### Naming Convention
```
META_[Objective]_[Audience]_[Geo]_[Date]
Examples:
META_REACH_Homeowners_HighDesert_2026Q3
META_LEADGEN_SolarOwners_IE_2026Q3
META_RETARG_Engagers_AllAreas_2026Q3
```

---

## Ad Copy Templates

### Google LSA Profile Description
```
Tony's Window Cleaning — locally owned and serving the High Desert and Inland 
Empire. Residential, commercial, and solar panel cleaning. Streak-free results 
using purified water and waterfed poles. Licensed, insured, and Google 
Guaranteed. Call or text for a free quote.
```

### Meta Ad Headlines (test all)
- "Your Windows. Spotless. Guaranteed."
- "Dirty Solar Panels Are Costing You Money"
- "High Desert's Trusted Window Cleaners"
- "Before & After Results That Speak for Themselves"
- "Call Tony — Same-Week Service Available"

### Meta Primary Text Templates
**Residential:**
```
Tired of streaky windows blocking your view? 

Tony's Window Cleaning serves all of the High Desert and Inland Empire — 
residential, commercial, and solar panels.

✅ Streak-free results
✅ Locally owned & operated
✅ Licensed & insured
✅ Free quotes — call or text 714-559-0300

[Before/after image]
```

**Solar Panel:**
```
Did you know dirty solar panels can lose up to 25% of their efficiency?

Tony's uses a waterfed pole with purified water — no chemicals, no streaks, 
safe for your panels and your warranty.

Serving Victorville, Hesperia, Apple Valley & the Inland Empire.
📞 Call/text: 714-559-0300
```

**Retargeting Offer:**
```
Still thinking about getting those windows cleaned? 

First-time customers get $20 off — just mention this ad when you call.

📞 714-559-0300 | Serving the High Desert & Inland Empire
```
