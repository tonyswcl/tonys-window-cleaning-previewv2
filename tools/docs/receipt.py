#!/usr/bin/env python3
"""Build a paid receipt in the house layout from a small JSON file, then render it.

The JSON lives OUTSIDE this repository (it names a customer). Example:

  {
    "no": "TWC-2609-XXX",
    "issued": "September 25, 2026",
    "customer": "First Last",
    "address": "123 Street, City, CA 92345",
    "short": "123 Street, City",
    "when": "Friday, September 25, 2026 &nbsp;·&nbsp; 12:30 PM",
    "items": [
      {"title": "Window cleaning, front of the home, outside and inside",
       "note": "6 windows. Screens, tracks and sills included.", "amount": 125},
      {"title": "Paint overspray removal", "note": "On us.", "amount": 0}
    ],
    "subtotal_label": "Job total, flat rate as quoted",
    "gratuity": 0,
    "gratuity_thanks": "Thank you",
    "band_note": "$125.00 for the front of the home. Nothing is owed.",
    "crew": [["T", "Tony", "Owner. Call or text 714-559-0300 any time."],
             ["D", "Dylan", "Crew. Worked alongside Tony on your windows."]],
    "callout_title": "Keeping them clear",
    "callout_html": "<p style=\\"margin-bottom:0\\">Most homes stay clear with a cleaning every 3 to 6 months.</p>",
    "callout_rows": [["Whole home, outside and inside", 299], ["Paid today", -125], ["Back of the home", 174]],
    "callout_total": ["Back of the home, when you're ready", 194],
    "firm": "$125.00, exactly as quoted. Nothing was added."
  }

Run:  python3 receipt.py job.json out-dir
It writes <no>.html into out-dir next to copies of twc.css and fonts-embedded.css, checks the page
fits one sheet (fit.js) and renders <no>.pdf (render.js). Nothing is written into the repository.
"""
import html
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def money(n):
    n = round(float(n), 2)
    s = "${:,.2f}".format(abs(n))
    return ("&minus;" + s) if n < 0 else s


def esc(s):
    return html.escape(str(s), quote=False)


STYLE = """
  .page{padding:0.5in 0.67in 0.62in}
  section{margin-bottom:12px}
  h2{font-size:12.8pt;margin-bottom:5px}
  p{margin-bottom:5px}
  .who{margin-bottom:14px;padding:9px 14px}
  .who .n{font-size:11.6pt}
  .who .a{font-size:9.4pt}
  td{padding:7px 10px}
  .band{margin:10px 0 12px;padding:10px 15px}
  .band .l{font-size:11.2pt}
  .band .r{font-size:17pt}
  .sm{font-size:9.2pt;color:var(--ink-2)}
  th.r{text-align:right}
  .thanks{color:var(--gold-deep);font-weight:700}
  .crew{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
  .crew .card{display:flex;gap:11px;align-items:center;padding:10px 12px}
  .crew .init{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:var(--gold);color:var(--navy);
    font-family:Archivo;font-weight:800;font-size:13pt;display:grid;place-items:center}
  .crew h4{font-size:11pt;margin-bottom:1px}
  .crew p{font-size:9.1pt}
  .callout{padding:9px 13px;font-size:9.3pt}
  .callout p b{display:inline;font-family:"Source Sans 3",system-ui,sans-serif;color:var(--navy);font-size:inherit;letter-spacing:0;text-transform:none;margin:0}
  .callout table{margin:6px 0 4px;font-size:9.3pt}
  .callout td{padding:3px 6px;border:0}
  .callout tr.tot td{font-weight:700;color:var(--navy);border-top:1px solid var(--rule);padding-top:5px}
  ol.terms li{margin-bottom:5px;font-size:9.35pt}
  .sig{margin-top:14px}
  .sig .line{height:26px}
  .sig .lbl{margin-top:3px;font-size:8pt}
"""


def build(j):
    items = j["items"]
    sub = round(sum(float(i["amount"]) for i in items), 2)
    tip = float(j.get("gratuity") or 0)
    total = round(sub + tip, 2)
    rows = []
    for i in items:
        note = ('<br><span class="sm">' + i["note"] + "</span>") if i.get("note") else ""
        rows.append('<tr><td><strong>%s</strong>%s</td><td class="r">%s</td></tr>' % (esc(i["title"]), note, money(i["amount"])))
    rows.append('<tr class="sub"><td>%s</td><td class="r">%s</td></tr>' % (esc(j.get("subtotal_label", "Job total, flat rate as quoted")), money(sub)))
    if tip:
        rows.append('<tr class="sub"><td>Gratuity <span class="thanks">&nbsp;%s</span></td><td class="r">%s</td></tr>' % (esc(j.get("gratuity_thanks", "Thank you")), money(tip)))
    rows.append('<tr class="tot"><td>Total paid</td><td class="r">%s</td></tr>' % money(total))
    crew = "".join('<div class="card"><div class="init">%s</div><div><h4>%s</h4><p>%s</p></div></div>' % (esc(c[0]), esc(c[1]), esc(c[2])) for c in j.get("crew", []))
    callout = ""
    if j.get("callout_title"):
        tbl = ""
        if j.get("callout_rows"):
            tbl = "<table>" + "".join('<tr><td>%s</td><td class="r">%s</td></tr>' % (esc(r[0]), money(r[1])) for r in j["callout_rows"])
            if j.get("callout_total"):
                tbl += '<tr class="tot"><td>%s</td><td class="r">%s</td></tr>' % (esc(j["callout_total"][0]), money(j["callout_total"][1]))
            tbl += "</table>"
        callout = '<div class="callout"><b>%s</b>%s%s%s</div>' % (esc(j["callout_title"]), j.get("callout_lead", ""), tbl, j.get("callout_html", ""))
    band_note = j.get("band_note") or ("%s for the job%s. Nothing is owed." % (money(sub), (" plus a %s tip" % money(tip)) if tip else ""))
    firm = j.get("firm") or ("%s, exactly as quoted. Nothing was added." % money(sub))
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Receipt %(no)s</title>
<link rel="stylesheet" href="fonts-embedded.css">
<link rel="stylesheet" href="twc.css">
<style>%(style)s</style>
</head>
<body>
<div class="page">
  <div class="lh">
    <div>
      <div class="name">Tony's <span>Window Cleaning</span></div>
      <div class="meta">Hesperia, California<br>714-559-0300 &nbsp;·&nbsp; twindowclean@gmail.com<br>twindowclean.com</div>
    </div>
    <div class="right">
      <b>Receipt &nbsp;·&nbsp; Paid</b>
      No. %(no)s<br>
      Issued %(issued)s<br>
      Paid in full
    </div>
  </div>
  <div class="who"><div class="n">%(customer)s</div><div class="a">%(address)s</div></div>
  <section>
    <p class="kicker">%(when)s</p>
    <h2>What we did</h2>
    <table><thead><tr><th>Item</th><th class="r" style="width:18%%">Amount</th></tr></thead><tbody>%(rows)s</tbody></table>
  </section>
  <div class="band"><div><div class="l">Paid in full</div><div class="s">%(band_note)s</div></div><div class="r">%(total)s</div></div>
  <section>
    <p class="kicker">Your cleaners</p>
    <h2>Who was at your home</h2>
    <div class="crew">%(crew)s</div>
  </section>
  %(callout)s
  <section style="margin-top:12px">
    <p class="kicker">Good to know</p>
    <ol class="terms">
      <li><b>Satisfaction guaranteed.</b> If anything isn't right, text or call 714-559-0300 and we'll make it right.</li>
      <li><b>Firm price.</b> %(firm)s</li>
      <li><b>Keep this receipt</b> for your records. It shows the work done, the date and the amount paid.</li>
    </ol>
  </section>
  <div class="sig">
    <div><div class="line"><span class="signed">Tony's Window Cleaning</span></div><div class="lbl">Received by</div></div>
    <div><div class="line"><span class="filled">%(issued)s</span></div><div class="lbl">Date</div></div>
  </div>
  <div class="foot"><span>Tony's Window Cleaning &nbsp;·&nbsp; %(no)s &nbsp;·&nbsp; %(short)s</span><span>Page 1 of 1</span></div>
</div>
</body>
</html>
""" % dict(no=esc(j["no"]), issued=esc(j["issued"]), customer=esc(j["customer"]), address=esc(j["address"]), when=j["when"],
           rows="".join(rows), band_note=band_note, total=money(total), crew=crew, callout=callout, firm=firm,
           short=esc(j.get("short", "")), style=STYLE)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src, out = sys.argv[1], os.path.abspath(sys.argv[2])
    if os.path.commonpath([out, os.path.dirname(HERE)]) == os.path.dirname(HERE):
        sys.exit("refusing to write a customer document inside the repository")
    j = json.load(open(src, encoding="utf-8"))
    os.makedirs(out, exist_ok=True)
    for f in ("twc.css", "fonts-embedded.css"):
        shutil.copyfile(os.path.join(HERE, f), os.path.join(out, f))
    page = os.path.join(out, j["no"] + ".html")
    open(page, "w", encoding="utf-8").write(build(j))
    env = dict(os.environ, NODE_PATH=os.environ.get("NODE_PATH") or subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip())
    fit = subprocess.run(["node", os.path.join(HERE, "fit.js"), page], capture_output=True, text=True, env=env)
    print(fit.stdout.strip() or fit.stderr.strip())
    if "ALL PAGES FIT" not in fit.stdout:
        sys.exit("the receipt does not fit one sheet; shorten a note and run again")
    pdf = os.path.join(out, j["no"] + ".pdf")
    subprocess.run(["node", os.path.join(HERE, "render.js"), page, pdf, "1"], check=True, env=env)
    print("wrote", pdf)


if __name__ == "__main__":
    main()
