# Tracking Setup — Tony's Window Cleaning

---

## Tracking Philosophy

The primary conversion for Tony's Window Cleaning is a **phone call**.
All tracking infrastructure should be built around measuring calls — not form fills, not page views.

---

## Priority Tracking Setup

| Platform | Setup | Priority | Effort |
|----------|-------|----------|--------|
| Google Business Profile | Claim + verify + link to LSA | P0 | 30 min |
| Google LSA call tracking | Built-in (Google provides forwarding number) | P1 | Automatic |
| Meta Pixel | Install on website | P1 | 15 min |
| Google Analytics 4 (GA4) | Install on website | P2 | 30 min |
| Call tracking (CallRail or similar) | Separate numbers per channel | P2 | 1–2 hrs |

---

## Step-by-Step Setup

### Step 0: Google Business Profile (GBP) — Do First
1. Go to business.google.com
2. Claim "Tony's Window Cleaning" (or create if not claimed)
3. Verify via postcard or phone
4. Add all services: window cleaning (residential), window cleaning (commercial), solar panel cleaning
5. Add service areas: all High Desert + Inland Empire ZIP codes
6. Upload 10+ photos (truck, team, before/after jobs)
7. Link GBP to Google Ads account when LSA is set up

**Why this matters:** LSA requires a verified GBP. Reviews on GBP feed directly into LSA ranking.

---

### Step 1: Google LSA — Built-in Tracking
Google LSA provides automatic call tracking:
- Every lead gets a Google forwarding number
- Calls and messages are logged in the LSA dashboard
- You pay only for verified leads (wrong number, spam, out-of-area = dispute for refund)

**Actions:**
- [ ] Review every lead in LSA dashboard weekly
- [ ] Dispute invalid leads within 30 days (Google refunds valid disputes)
- [ ] Track: lead → booked job → completed job in a simple spreadsheet

---

### Step 2: Meta Pixel Installation
Add to `<head>` section of index.html:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

**Track click-to-call as a Lead event:**
```html
<a href="tel:7145590300" 
   onclick="fbq('track', 'Lead', {content_name: 'phone_call_click'})"
   id="call-cta">714-559-0300</a>
```

Add the same `onclick` to every phone number link on the page.

**Get your Pixel ID:** Facebook → Events Manager → Create Pixel → copy the numeric ID

---

### Step 3: Simple Lead Tracking Spreadsheet
Until call tracking software is set up, use a spreadsheet to track every lead manually.

| Date | Source | Name | Phone | Service | Status | Job Value |
|------|--------|------|-------|---------|--------|-----------|
| 6/10 | LSA | John S. | 760-xxx | Residential | Booked | $175 |
| 6/11 | Facebook | Maria G. | 909-xxx | Solar | Quoted | — |

Track source by asking every caller: "How did you hear about us?"

---

### Step 4 (Month 2+): Call Tracking Numbers
Once ads are running, set up separate tracking numbers to measure each channel precisely.

**Recommended tool:** CallRail (~$45/mo for 3 numbers)

| Number | Assign To | Measures |
|--------|-----------|---------|
| Tracking #1 | Google LSA | Calls from LSA specifically |
| Tracking #2 | Meta ads | Calls from Facebook/Instagram ads |
| Tracking #3 | Website | Direct/organic calls |
| Real number (714-559-0300) | GBP, Yelp, offline | Keep for existing presence |

All tracking numbers forward to 714-559-0300 seamlessly.

---

## Key Metrics to Review Weekly

| Metric | Where to Find | Target |
|--------|--------------|--------|
| LSA leads received | Google LSA dashboard | 5–15/mo |
| LSA CPL | LSA dashboard → total spend ÷ leads | <$50 |
| Invalid lead disputes filed | LSA dashboard | File within 30 days |
| Meta reach | Facebook Ads Manager | Growing week-over-week |
| Meta link clicks | Facebook Ads Manager | CTR >1.5% |
| Meta CPL | Ads Manager → cost per lead | <$35 |
| Call-to-booking rate | Spreadsheet | 35%+ |
