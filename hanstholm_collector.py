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
FIELDS = ["auction_date", "species", "msc", "grade", "catch_method", "boxes", "quantity_kg"]
OLD_FIELDS = ["auction_date", "species", "msc", "grade", "boxes", "quantity_kg"]
VESSEL_FIELDS = ["auction_date", "vessel", "quantity_kg"]
GEARS = [
    ("Bomtrawl", "1"), ("Bundgarn", "2"), ("Fly", "3"), ("Garn", "4"),
    ("Krog", "5"), ("Kroge og liner", "6"), ("Partrawl", "7"),
    ("Pilk", "8"), ("Tejner", "9"), ("Trawl", "10"), ("Vod", "11"),
]
SPECIES_FAROESE = {
    "Blålange": "Blálonga",
    "Brosme": "Brosma",
    "Havtaske": "Havtaska",
    "Helleflynder": "Kalvi",
    "Hvilling": "Hvítingur",
    "Kuller": "Hýsa",
    "Lange": "Longa",
    "Mørksej": "Upsi",
    "Rødfisk": "Kongafiskur",
    "Rødspætte": "Reyðsprøka",
    "Hellefisk": "Svartkalvi",
    "Grønlandsk hellefisk": "Svartkalvi",
    "Torsk": "Toskur",
    "Torsk, Blanke": "Toskur",
}


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


def translate_grade(value: str) -> str:
    if value.lower() == "uspec.":
        return "Ógreinað"
    match = re.fullmatch(r"Sort\s+(\d+)", value, re.I)
    return f"Stødd {match.group(1)}" if match else value


def parse(html: str, allow_empty: bool = False) -> tuple[str, list[list], list[list]]:
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
        source_species = re.sub(r"\s+MSC$", "", label, flags=re.I).strip()
        species = SPECIES_FAROESE.get(source_species)
        if not species:
            continue
        for tr in table.find_all("tr"):
            cells = [clean(cell.get_text(" ", strip=True)) for cell in tr.find_all(["td", "th"], recursive=False)]
            if len(cells) < 3:
                continue
            grade = translate_grade(cells[0])
            if not grade or grade.lower() in {"sort", "total"}:
                continue
            boxes, kg = number(cells[1]), number(cells[2])
            if kg is None:
                continue
            rows.append([auction_date, species, msc, grade, int(boxes) if boxes is not None else None, kg])

    combined: dict[tuple, list] = {}
    for day, species, msc, grade, boxes, kg in rows:
        key = (day, species, msc, grade)
        if key not in combined:
            combined[key] = [day, species, msc, grade, boxes, kg]
        else:
            if boxes is not None:
                combined[key][4] = (combined[key][4] or 0) + boxes
            combined[key][5] += kg
    rows = list(combined.values())

    if not rows and not allow_empty:
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
    if payload.get("fields") == OLD_FIELDS:
        payload["rows"] = [row[:4] + ["Ikki upplýst"] + row[4:] for row in payload.get("rows", [])]
        payload["fields"] = FIELDS
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
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "da,en;q=0.8"}
    response = requests.get(URL, timeout=(15, 120), headers=headers)
    response.raise_for_status()
    response.encoding = "utf-8"
    auction_date, base_rows, vessels = parse(response.text)
    method_rows: list[list] = []
    for method, value in GEARS:
        session = requests.Session()
        source = session.get(URL, timeout=(15, 120), headers=headers)
        source.raise_for_status()
        source.encoding = "utf-8"
        soup = BeautifulSoup(source.text, "html.parser")
        form: dict[str, str] = {
            item["name"]: item.get("value", "")
            for item in soup.select("input[name]")
            if item.get("type", "").lower() not in {"image", "button"}
        }
        for select in soup.select("select[name]"):
            option = select.select_one("option[selected]") or select.select_one("option")
            form[select["name"]] = option.get("value", "") if option else ""
        form["__EVENTTARGET"] = ""
        form["ctl00$phMain$cboFishingGear"] = value
        form["ctl00$phMain$btnPrint"] = "Udskriv"
        filtered = session.post(URL, data=form, timeout=(15, 120), headers=headers)
        filtered.raise_for_status()
        filtered.encoding = "utf-8"
        filtered_date, gear_rows, _ = parse(filtered.text, allow_empty=True)
        if filtered_date != auction_date:
            raise ValueError(f"Gear response date changed from {auction_date} to {filtered_date}")
        method_rows.extend(row[:4] + [method] + row[4:] for row in gear_rows)
        LOG.info("Collected %s rows for %s", len(gear_rows), method)

    known: dict[tuple, list[float]] = {}
    for day, species, msc, grade, _method, boxes, kg in method_rows:
        totals = known.setdefault((day, species, msc, grade), [0.0, 0.0])
        totals[0] += float(boxes or 0)
        totals[1] += float(kg or 0)
    for day, species, msc, grade, boxes, kg in base_rows:
        used_boxes, used_kg = known.get((day, species, msc, grade), [0.0, 0.0])
        remaining_kg = max(0.0, float(kg or 0) - used_kg)
        remaining_boxes = max(0.0, float(boxes or 0) - used_boxes) if boxes is not None else None
        if remaining_kg > 0.01:
            method_rows.append([day, species, msc, grade, "Ikki upplýst", int(round(remaining_boxes)) if remaining_boxes is not None else None, remaining_kg])
    rows = method_rows
    if not rows:
        raise ValueError("No gear-specific Hanstholm rows; refusing to replace stored data")
    destination = Path(args.out)
    write(destination, auction_date, rows, vessels)
    LOG.info("Saved %s species/grade rows and %s vessels for %s", len(rows), len(vessels), auction_date)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
