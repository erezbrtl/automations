#!/usr/bin/env python3
"""Regenerate assets/css/fonts.css + assets/fonts/ from Google Fonts.

Keeps only the hebrew and latin subsets. Run from the repo root:
    python3 tools/fetch-fonts.py
"""
import os
import re
import urllib.request

CSS_URL = "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
KEEP = {"hebrew", "latin"}


def get(url, ua=UA):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": ua}), timeout=60).read()


def main():
    src = get(CSS_URL).decode("utf-8")
    os.makedirs("assets/fonts", exist_ok=True)
    faces = []
    for subset, block in re.findall(r"/\* (\S+) \*/\s*(@font-face \{.*?\})", src, re.S):
        if subset not in KEEP:
            continue
        family = re.search(r"font-family: '([^']+)'", block).group(1)
        weight = re.search(r"font-weight: (\d+)", block).group(1)
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        name = "{}-{}-{}.woff2".format(family.lower().replace(" ", "-"), weight, subset)
        with open(os.path.join("assets/fonts", name), "wb") as fh:
            fh.write(get(url))
        faces.append("/* {} {} — {} */\n{}".format(family, weight, subset,
                                                   block.replace(url, "/assets/fonts/" + name)))
    header = ("/* Self-hosted subsets (hebrew + latin) of Rubik - the single typeface for the site.\n"
              "   Source: Google Fonts (Open Font License). Regenerate with tools/fetch-fonts.py */\n\n")
    with open("assets/css/fonts.css", "w", encoding="utf-8") as fh:
        fh.write(header + "\n\n".join(faces) + "\n")
    print("wrote {} faces".format(len(faces)))


if __name__ == "__main__":
    main()
