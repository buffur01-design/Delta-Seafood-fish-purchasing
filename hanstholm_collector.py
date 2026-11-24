#!/usr/bin/env python3
"""Collect public expected landings from Hanstholm Fiskeauktion's Specs page."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import logging
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

if sys.platform == "win32":
    try:
        import truststore
    except ImportError:
        pass
    else:
        truststore.inject_into_ssl()

URL = "https://www.hanstholmfiskeauktion.dk/Specs"
USER_AGENT = "DeltaSeafoodHanstholmCollector/1.0 (public expected-landings data; daily fetch)"
LOG = logging.getLogger("hanstholm")
FIELDS = ["auction_date", "species", "msc", "grade", "boxes", "quantity_kg"]
VESSEL_FIELDS = ["auction_date", "vessel", "quantity_kg"]


def clean(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split()).strip()


def number(value: str) -> float | None:
    value = clean(value).replace(".", "").replace(" ", "").replace(",", ".")
    if not value or value in {"-", "–", "—"}:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def parse(html: str) -> tuple[str, list[list], list[list]]:
    soup = BeautifulSoup(html, "html.parser")
    date_input = soup.select_one("#phMain_dtSpecificationDate_I")
    if not date_input or not date_input.get("value"):
        raise ValueError("Hanstholm page did not contain the expected auction-date control")
    try:
        auction_date = dt.datetime.strptime(date_input["value"], "%d-%m-%Y").date().isoformat()
    except ValueError as exc:
        raise ValueError(f"Unexpected auction date: {date_input['value']}") from exc

    rows: list[list] = []
    for block in soup.select("div.specDiv"):
        heading = block.find("h3")
        table = block.find("table")
        if not heading or not table:
            continue
        label = clean(heading.get_text(" ", strip=True))
        msc = bool(re.search(r"\s+MSC$", label, re.I))
        species = re.sub(r"\s+MSC$", "", label, flags=re.I).strip()
        if not species:
            continue
        for tr in table.find_all("tr"):
            cells = [clean(cell.get_text(" ", strip=True)) for cell in tr.find_all(["td", "th"], recursive=False)]
            if len(cells) < 3:
                continue
            grade = cells[0]
            if not grade or grade.lower() in {"sort", "total"}:
                continue
            boxes, kg = number(cells[1]), number(cells[2])
            if kg is None:
                continue
            rows.append([auction_date, species, msc, grade, int(boxes) if boxes is not None else None, kg])

    if not rows:
        raise ValueError("No recognizable species/grade rows; refusing to replace stored data")

    vessels: list[list] = []
    boats = soup.select_one("#phMain_divBoats")
    if boats:
        for tr in boats.select("tr"):
            cells = [clean(cell.get_text(" ", strip=True)) for cell in tr.find_all(["td", "th"], recursive=False)]
            if len(cells) < 2 or cells[0].lower() in {"", "båd"}:
                continue
            kg = number(cells[1])
            if kg is not None and kg > 0:
                vessels.append([auction_date, cells[0], kg])
    vessels = [list(item) for item in sorted({tuple(item) for item in vessels})]
    return auction_date, rows, vessels


def load_existing(path: Path) -> dict:
    if not path.exists():
        return {"rows": [], "vessels": []}
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("fields") != FIELDS or payload.get("vessel_fields") != VESSEL_FIELDS:
        raise ValueError("Existing Hanstholm dataset has an unexpected schema")
    return payload


def write(path: Path, auction_date: str, rows: list[list], vessels: list[list]) -> None:
    existing = load_existing(path)
    merged_rows = [row for row in existing.get("rows", []) if row[0] != auction_date] + rows
    merged_vessels = [row for row in existing.get("vessels", []) if row[0] != auction_date] + vessels
    merged_rows.sort(key=lambda row: (row[0], row[1], row[2], row[3]))
    merged_vessels.sort(key=lambda row: (row[0], row[1]))
    payload = {
        "version": 1,
        "updated_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": URL,
        "fields": FIELDS,
        "rows": merged_rows,
        "vessel_fields": VESSEL_FIELDS,
        "vessels": merged_vessels,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    temporary.replace(path)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Collect Hanstholm public expected-landings data")
    parser.add_argument("--out", default="data/hanstholm/hanstholm.json")
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    response = requests.get(URL, timeout=(15, 120), headers={"User-Agent": USER_AGENT, "Accept-Language": "da,en;q=0.8"})
    response.raise_for_status()
    response.encoding = "utf-8"
    auction_date, rows, vessels = parse(response.text)
    destination = Path(args.out)
    write(destination, auction_date, rows, vessels)
    LOG.info("Saved %s species/grade rows and %s vessels for %s", len(rows), len(vessels), auction_date)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
