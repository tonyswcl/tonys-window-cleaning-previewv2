#!/usr/bin/env python3
"""Regenerate every QR code used across the print pieces.

    pip install segno && python3 build-qr.py

Sources are the links the website itself publishes. Re-run after changing
any of them, then re-export the affected PDFs.
"""
import segno

LINKS = {
    "quote":    "https://twindowclean.com/#quote",
    "google":   "https://g.page/r/CWQH1O3JGKh4EAE/review",
    "facebook": "https://www.facebook.com/tonyswindowcleaninghd",
    "yelp":     "https://www.yelp.com/biz/tony-s-window-cleaning-hesperia",
    "site":     "https://twindowclean.com/",
}

for name, url in LINKS.items():
    qr = segno.make(url, error="q")          # 25% error correction
    path = "assets/qr-quote.png" if name == "quote" else f"assets/qr/qr-{name}.png"
    scale = 100 if name == "quote" else 60
    qr.save(path, scale=scale, border=2, dark="#0a2138", light="#ffffff")
    print(f"{path} <- {url}")
