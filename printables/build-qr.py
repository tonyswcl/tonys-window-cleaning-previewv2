#!/usr/bin/env python3
"""Regenerate the QR code used on the windshield magnet.

    pip install segno && python3 build-qr.py

Change QR_URL below to repoint the code, then re-export the magnet PDF.
"""
import segno

QR_URL = "https://twindowclean.com/#quote"

qr = segno.make(QR_URL, error="q")          # 'q' = 25% error correction
qr.save("assets/qr-quote.png", scale=100, border=2,
        dark="#0a2138", light="#ffffff")
print(f"wrote assets/qr-quote.png for {QR_URL}")
