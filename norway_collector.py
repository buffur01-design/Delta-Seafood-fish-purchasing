#!/usr/bin/env python3
"""Aggregate Norwegian Directorate of Fisheries landing data for the dashboard."""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import logging
import shutil
import sys
import tempfile
import zipfile
from collections import defaultdict
from pathlib import Path

import requests

if sys.platform == "win32":
    try:
        import truststore
    except ImportError:
        pass
    else:
        truststore.inject_into_ssl()

LOG = logging.getLogger("norway")
URL_TEMPLATE = "https://register.fiskeridir.no/uttrekk/fangstdata_{year}.csv.zip"
SOURCE = "https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-yrkesfiske/apne-data-fangstdata-seddel-koblet-med-fartoydata"
USER_AGENT = "DeltaSeafoodNorwayCollector/1.0 (public open-data aggregation; daily fetch)"
FIELDS = ["date", "species", "quantity_kg"]
SPECIES = {
    "BLI": "Blálonga",
    "USK": "Brosma",
    "MON": "Havtaska",
    "WHG": "Hvítingur",
    "HAD": "Hýsa",
    "HAL": "Kalvi",
    "RED": "Kongafiskur",
    "REG": "Kongafiskur",
    "REB": "Kongafiskur",
    "LIN": "Longa",
    "PLE": "Reyðsprøka",
    "GHL": "Svartkalvi",
    "COD": "Toskur",
    "POK": "Upsi",
}


def number(value: str) -> float:
    value = (value or "").strip().replace(" ", "").replace(",", ".")
    if not value:
        return 0.0
    try:
        return float(value)
    except ValueError as exc:
        raise ValueError(f"Unexpected numeric value: {value!r}") from exc


def collect_year(year: int, session: requests.Session) -> list[list]:
    url = URL_TEMPLATE.format(year=year)
    LOG.info("Downloading %s", url)
    with session.get(url, stream=True, timeout=(20, 300)) as response:
        response.raise_for_status()
        with tempfile.TemporaryFile() as archive:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    archive.write(chunk)
            archive.seek(0)
            with zipfile.ZipFile(archive) as zipped:
                names = [name for name in zipped.namelist() if name.lower().endswith(".csv")]
                if len(names) != 1:
                    raise ValueError(f"Expected one CSV in {url}, found {names}")
                totals: dict[tuple[str, str], float] = defaultdict(float)
                with zipped.open(names[0]) as raw:
                    reader = csv.DictReader(io.TextIOWrapper(raw, encoding="utf-8-sig", newline=""), delimiter=";")
                    required = {"Landingsdato", "Art FAO (kode)", "Rundvekt"}
                    if not reader.fieldnames or not required.issubset(reader.fieldnames):
                        raise ValueError(f"Unexpected Norwegian CSV schema; missing {required - set(reader.fieldnames or [])}")
                    for row in reader:
                        species = SPECIES.get((row["Art FAO (kode)"] or "").strip().upper())
                        if not species:
                            continue
                        raw_date = (row["Landingsdato"] or "").strip()
                        try:
                            day = dt.datetime.strptime(raw_date, "%d.%m.%Y").date()
                        except ValueError:
                            try:
                                day = dt.date.fromisoformat(raw_date[:10])
                            except ValueError as exc:
                                raise ValueError(f"Unexpected landing date: {raw_date!r}") from exc
                        if day.year != year:
                            continue
                        totals[(day.isoformat(), species)] += number(row["Rundvekt"])
    if not totals:
        raise ValueError(f"No selected species found in official file for {year}")
    rows = [[day, species, round(kg, 3)] for (day, species), kg in sorted(totals.items()) if kg > 0]
    LOG.info("%s: %s daily species totals", year, len(rows))
    return rows


def load_existing(path: Path) -> dict:
    if not path.exists():
        return {"rows": []}
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("fields") != FIELDS:
        raise ValueError("Existing Norway dataset has an unexpected schema")
    return payload


def main(argv=None) -> int:
    today = dt.date.today()
    parser = argparse.ArgumentParser(description="Aggregate Norwegian open landing data")
    parser.add_argument("--start-year", type=int, default=today.year - 2)
    parser.add_argument("--end-year", type=int, default=today.year)
    parser.add_argument("--out", default="data/norway/norway-landings.json")
    args = parser.parse_args(argv)
    if args.start_year < 2000 or args.end_year < args.start_year or args.end_year > today.year:
        parser.error("Invalid year range")
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    destination = Path(args.out)
    existing = load_existing(destination)
    refreshed_years = set(range(args.start_year, args.end_year + 1))
    retained = [row for row in existing.get("rows", []) if int(row[0][:4]) not in refreshed_years]
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/zip"})
    collected: list[list] = []
    for year in sorted(refreshed_years):
        collected.extend(collect_year(year, session))
    rows = sorted(retained + collected, key=lambda row: (row[0], row[1]))
    payload = {
        "version": 1,
        "updated_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": SOURCE,
        "fields": FIELDS,
        "species": sorted(set(SPECIES.values())),
        "years": sorted({int(row[0][:4]) for row in rows}),
        "rows": rows,
        "note": "Rundvekt (live weight). Very recent data may temporarily include both landing and final-sales quantities.",
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    temporary.replace(destination)
    LOG.info("Saved %s rows covering %s-%s", len(rows), payload["years"][0], payload["years"][-1])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
