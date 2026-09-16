import csv, pathlib
SITE="https://twindowclean.com"
def url(p, camp, grp): return f"{SITE}/{p}?utm_source=google&utm_medium=cpc&utm_campaign={camp}&utm_content={grp}"
HD="HD Search Sprint"; IE="IE Search Solar Pigeon"
CAMPS={HD:("35.00","hd-sprint"),IE:("15.00","ie-sprint")}
PHONE="Free Quote, Firm Price"
GROUPS=[
 (HD,"Window Cleaning","window-cleaning.html","windows",
  ["window cleaning","window cleaners near me","window cleaning near me","window washer near me","window washing","window washing service","residential window cleaning","window cleaning cost","window cleaning service near me"],
  ["window cleaning hesperia","window cleaning victorville","window cleaning apple valley"],
  ["Window Cleaning From $149","Screens & Tracks Included","Hesperia Based, HD Wide","Rated 5.0 On Google","Purified Water, No Spots","Text Us A Photo For A Price","Two Story From $249","Openings This Week","Hard Water? Free Test Pane",PHONE,"Owner On Every Job","Victorville & Apple Valley"],
  ["Exterior window cleaning from $149 with screens, tracks and sills included. Firm price.",
   "Locally owned in Hesperia. 5.0 from 25 Google reviews. Two story from $249. Same week.",
   "Cloudy band on your glass? That is hard water. We test one pane free before quoting.",
   "Free quote, firm price in writing before we start. Openings this week across the High Desert."]),
 (HD,"Solar Panel Cleaning","solar-panel-cleaning.html","solar",
  ["solar panel cleaning","solar panel cleaning near me","solar panel cleaning service","clean solar panels","solar cleaning","solar panel cleaners","solar panel cleaning cost"],
  ["solar panel cleaning hesperia","solar panel cleaning victorville","solar panel cleaning apple valley"],
  ["Solar Panel Cleaning From $7","Per Panel, Purified Water","Free Array Inspection","Pigeon Check Included","Rated 5.0 On Google","Hesperia, Victorville, AV","Same Week Appointments","Firm Price Before We Start","Openings This Week","Text Us A Photo For A Price","No Foot Traffic On Panels","20 Panels About $140 to $160"],
  ["Purified water and a soft brush on a water fed pole. Dries spot free. From $7 per panel.",
   "Free array inspection with every clean. We check for pigeon nesting while we are up there.",
   "Locally owned in Hesperia. 5.0 from 25 Google reviews. A 20 panel home runs $140 to $160.",
   "Firm price before we start. Openings this week. Free array inspection with every clean."]),
 (HD,"Pigeon Proofing","pigeon-proofing.html","pigeons",
  ["pigeon proofing","pigeon proofing solar panels","solar panel bird proofing","bird proofing solar panels","pigeons under solar panels","solar panel pigeon mesh","pigeon removal solar","pigeon proofing near me","pigeon removal","bird control solar panels","pigeon control","birds under solar panels"],
  ["pigeon proofing hesperia","pigeon proofing victorville","pigeon proofing apple valley"],
  ["Pigeon Proofing From $450","Two Year Warranty In Writing","Clips, Never Bolts","Nests & Droppings Removed","Free Roof Inspection","Panel Warranty Stays Intact","Rated 5.0 On Google","Hesperia Based Crew","Solar Wash Included Now","Openings This Week","Free Inspection This Week","Done In One Day"],
  ["Full cleanout, rust resistant mesh clipped to the frame, sealed. Two year warranty.",
   "Bolted mesh voids panel warranties and tears loose in wind. Ours is clipped. From $450.",
   "Free roof inspection, firm quote in writing, done in one day. Includes a solar panel wash.",
   "Locally owned in Hesperia, rated 5.0 on Google. Free roof inspection and a firm quote in writing."]),
 (HD,"Screen Repair","screen-repair.html","screens",
  ["window screen repair","screen repair near me","window screen replacement","rescreen windows","rescreen","patio screen door repair","sliding screen door repair","screen door repair near me","window screen replacement near me"],
  ["window screen repair hesperia","window screen repair victorville"],
  ["Screen Re-Mesh $64.99","All Weather Mesh, On Site","Keep Your Frames","Done The Same Visit","Two Year Warranty","Patio Doors Too","Rated 5.0 On Google","Hesperia, Victorville, AV","No Trip To A Shop","Openings This Week","Text A Photo, Get A Price","$149 Job Minimum"],
  ["$64.99 a screen, all weather mesh. Keep your frames, we re-mesh on site. $149 minimum.",
   "Sun rotted builder mesh replaced with mesh built for desert wind and sun. Sliders too.",
   "Locally owned in Hesperia. 5.0 from 25 Google reviews. Same week appointments.",
   "Send a photo of the worst one and we send a price the same day. Two year warranty."]),
 (HD,"Hard Water","hard-water-removal.html","hardwater",
  ["hard water stains on windows","hard water stain removal glass","remove hard water stains from windows","window hard water spot removal","hard water spots on windows"],
  [],
  ["Hard Water Stain Removal","From $12 Per Pane","Free Test Pane First","If Windex Failed, Call Us","Honest Call On Etched Glass","Rated 5.0 On Google","High Desert Glass Experts","Send A Photo Of The Pane","Openings This Week","Added To A $149 Clean"],
  ["The cloudy band on your windows is mineral, not dirt. We test one pane free, then restore.",
   "Stage one comes off completely. Stage two we tell you before you pay. Hesperia based.",
   "Text a photo of the worst pane and we tell you if it is stage one or two the same day."]),
 (HD,"Commercial Window Cleaning","commercial-window-cleaning.html","commercial",
  ["commercial window cleaning","storefront window cleaning","office window cleaning","business window cleaning","storefront window cleaning near me","commercial window cleaning near me"],
  ["commercial window cleaning victorville","commercial window cleaning hesperia","commercial window cleaning apple valley"],
  ["Storefront Glass From $89","Per Visit, After Hours","One Invoice A Month","Month To Month, No Contract","Weekly $69, Biweekly $79","Insured, COI On Request","Victorville, Hesperia, AV","Free Walkthrough This Week","Medical & Dental Suites","Free Walkthrough, Firm Price","Same Crew Every Visit","Graffiti & Adhesive Too"],
  ["Storefront glass inside and out from $89 a visit, worked after close. One invoice a month.",
   "Barbershops, restaurants, medical suites, property managers. Same crew every visit.",
   "Free walkthrough, firm per visit price. Weekly $69, biweekly $79, monthly $89.",
   "Certificate of insurance on request. Month to month, seven days notice, no fee."]),
 (HD,"Graffiti Removal","graffiti-removal.html","graffiti",
  ["graffiti removal","graffiti removal near me","graffiti removal service","remove graffiti from glass","window decal removal","vinyl lettering removal"],
  ["graffiti removal victorville"],
  ["Graffiti Removal From $129","Usually Same Day","Painted Or Etched? We Check","Photos For The City","Old Vinyl & Decals Off","Storefront Glass & Frames","Victorville, Hesperia, AV","Send A Photo Of The Tag","Ten Minutes From Old Town","Documented Before & After"],
  ["Tags off storefront glass, frames and signage, usually same day. From $129.",
   "We tell you if it is painted or etched before we start. Dated photos for the city.",
   "Old signage adhesive and vinyl lettering removed with a staged solvent process. From $129.",
   "Text a photo of the tag and we reply with a time and a price. Usually same day."]),
 (IE,"Solar Panel Cleaning IE","solar-panel-cleaning.html","solar-ie",
  ["solar panel cleaning","solar panel cleaning near me","solar panel cleaning service","clean solar panels","solar cleaning","solar panel cleaners"],
  ["solar panel cleaning fontana","solar panel cleaning rancho cucamonga","solar panel cleaning ontario"],
  ["Solar Panel Cleaning From $7","Per Panel, Purified Water","Free Array Inspection","Pigeon Check Included","Rated 5.0 On Google","Fontana & Rancho Cucamonga","Inland Empire, Same Week","Firm Price Before We Start","Openings This Week","Text Us A Photo For A Price","No Foot Traffic On Panels","20 Panels About $140 to $160"],
  ["Purified water and a soft brush on a water fed pole. Dries spot free. From $7 per panel.",
   "Free array inspection with every clean. We check for pigeon nesting while we are up there.",
   "Serving the Inland Empire on planned days. 5.0 from 25 Google reviews. Firm price first.",
   "Openings this week in Fontana, Rancho Cucamonga and Ontario. Firm price before we start."]),
 (IE,"Pigeon Proofing IE","pigeon-proofing.html","pigeons-ie",
  ["pigeon proofing","pigeon proofing solar panels","solar panel bird proofing","bird proofing solar panels","pigeons under solar panels","solar panel pigeon mesh","pigeon removal solar","pigeon proofing near me","bird control solar panels"],
  ["pigeon proofing fontana","pigeon proofing rancho cucamonga","pigeon proofing san bernardino"],
  ["Pigeon Proofing From $450","Two Year Warranty In Writing","Clips, Never Bolts","Nests & Droppings Removed","Free Roof Inspection","Panel Warranty Stays Intact","Rated 5.0 On Google","Fontana & Rancho Cucamonga","Solar Wash Included Now","Openings This Week","Free Inspection This Week","Done In One Day"],
  ["Full cleanout, rust resistant mesh clipped to the frame, sealed. Two year warranty.",
   "Bolted mesh voids panel warranties and tears loose in wind. Ours is clipped. From $450.",
   "Free roof inspection, firm quote in writing, done in one day. Includes a solar panel wash.",
   "Rated 5.0 on Google. Free roof inspection and a firm quote in writing, Inland Empire."]),
]
NEG="""phone screen
iphone
samsung
tv
laptop
monitor
computer
screen protector
screen printing
screen recorder
screenshot
diy
how to
job
jobs
hiring
career
salary
supplies
equipment for sale
squeegee
franchise
car
auto
windshield
tint
window replacement
window installation
glass repair
glass replacement
solar installation
solar installer
solar panels for sale
solar quote
solar cost
tesla
pest control near me
exterminator
rat
mice
termite
bee
wasp
pigeon for sale
pigeon racing
pigeon food
graffiti art
graffiti font
graffiti wallpaper
banksy
pressure washer rental
pressure washer for sale
solar panel cleaning kit
solar panel cleaning brush
pigeon spikes amazon
screen repair kit
home depot
lowes
los angeles
orange county
san diego
las vegas""".split("\n")
bad=[]
for c,g,p,u,ph,ex,hs,ds in GROUPS:
    bad+=[(g,"H",len(h),h) for h in hs if len(h)>30]
    bad+=[(g,"D",len(d),d) for d in ds if len(d)>90]
    if len(hs)<8 or len(ds)<3: bad.append((g,"COUNT",len(hs),len(ds)))
assert not bad, bad
cols=["Campaign","Campaign Type","Networks","Budget","Budget type","Bid Strategy Type","Maximum CPC bid limit","Campaign Status","Languages",
      "Ad Group","Ad Group Status","Max CPC","Keyword","Criterion Type","Status","Ad type"]+[f"Headline {i}" for i in range(1,13)]+[f"Description {i}" for i in range(1,5)]+["Final URL","Path 1","Path 2"]
rows=[]
def row(**kw):
    r={c:"" for c in cols}; r.update(kw); rows.append(r)
for camp,(budget,utm) in CAMPS.items():
    row(**{"Campaign":camp,"Campaign Type":"Search","Networks":"Google search","Budget":budget,"Budget type":"Daily",
           "Bid Strategy Type":"Maximize clicks","Maximum CPC bid limit":"6.00","Campaign Status":"Paused","Languages":"English"})
    for n in NEG: row(Campaign=camp,Keyword=n,**{"Criterion Type":"Negative Phrase"})
for camp,grp,page,utm,ph,ex,hs,ds in GROUPS:
    fu=url(page,CAMPS[camp][1],utm)
    row(**{"Campaign":camp,"Ad Group":grp,"Ad Group Status":"Enabled","Max CPC":"5.00"})
    for k in ph: row(**{"Campaign":camp,"Ad Group":grp,"Keyword":k,"Criterion Type":"Phrase","Status":"Enabled","Final URL":fu})
    for k in ex: row(**{"Campaign":camp,"Ad Group":grp,"Keyword":k,"Criterion Type":"Exact","Status":"Enabled","Final URL":fu})
    ad={"Campaign":camp,"Ad Group":grp,"Ad type":"Responsive search ad","Status":"Enabled","Final URL":fu,"Path 1":grp.split()[0].lower(),"Path 2":"high-desert" if camp==HD else "inland-empire"}
    for i,h in enumerate(hs,1): ad[f"Headline {i}"]=h
    for i,d in enumerate(ds,1): ad[f"Description {i}"]=d
    row(**ad)
out=pathlib.Path("google-ads-sprint-import.csv")
with out.open("w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=cols); w.writeheader(); w.writerows(rows)
kw=sum(1 for r in rows if r["Keyword"] and "Negative" not in r["Criterion Type"])
print(f"rows {len(rows)}  campaigns 2  ad groups {len(GROUPS)}  keywords {kw}  negatives {len(NEG)} per campaign  ads {len(GROUPS)}  bytes {out.stat().st_size}")
