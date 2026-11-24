#!/usr/bin/env python3
"""Collect public FMF telephone-auction rows by vessel and product/size group.

Outputs a cumulative CSV and compact JSON. Each run discovers every sale listed
by FMF, downloads its report, and replaces that sale's previously stored rows.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import logging
import re
import sys
import time
from dataclasses import asdict, dataclass, fields
from decimal import Decimal, InvalidOperation
from pathlib import Path

import requests
from bs4 import BeautifulSoup

if sys.platform == "win32":
    try:
        import truststore
    except ImportError:
        truststore = None
    else:
        truststore.inject_into_ssl()

LIST_URL = "https://fmf.fo/soelulisti-telefon/?menuid=259"
REPORT_URL = "https://fmf.fo/reports/tlf_sola_rep.php?SolaNr=0"
USER_AGENT = "DeltaSeafoodFMFCollector/1.0 (public auction data; low-frequency daily fetch)"
LOG = logging.getLogger("fmf")


@dataclass
class Observation:
    sale_id: str
    sale_date: str
    sale_time: str
    product_group: str
    species: str
    size_group: str
    certification: str
    vessel: str
    registration: str
    minimum_price_dkk_kg: float | None
    quantity_kg: float
    fishing_area_method: str
    fishing_start_date: str
    landing_location: str
    landing_datetime: str
    section_index: int
    row_index: int
    source_url: str
    collected_utc: str


def clean(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split()).strip()


def number(value: str) -> float | None:
    value = clean(value).replace(" ", "")
    if not value or value in {"-", "–", "—"}:
        return None
    if re.fullmatch(r"-?\d{1,3}(?:\.\d{3})+(?:,\d+)?", value):
        value = value.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"-?\d+(?:,\d+)?", value):
        value = value.replace(",", ".")
    try:
        return float(Decimal(value))
    except (InvalidOperation, ValueError):
        return None


def split_product_group(label: str) -> tuple[str, str, str]:
    """Return species, size group, certification while preserving exact label."""
    label = clean(label)
    certification = "MSC" if re.search(r"\bMSC\b", label, re.I) else ""
    without_cert = re.sub(r"\s*\bMSC\b\s*", " ", label, flags=re.I).strip()
    match = re.match(r"^(.*?)(?:\s+(\d+(?:\s*-\s*\d+)?))?$", without_cert)
    species = clean(match.group(1)) if match else without_cert
    size = re.sub(r"\s+", "", match.group(2) or "") if match else ""
    return species, size, certification


def split_vessel(label: str) -> tuple[str, str]:
    match = re.match(r"^(.*?)\s+-\s+(.+)$", clean(label))
    return (clean(match.group(1)), clean(match.group(2))) if match else (clean(label), "")


def discover_sales(html: str) -> dict[str, str]:
    soup = BeautifulSoup(html, "html.parser")
    sales = {}
    for option in soup.select('select[name="lstVelSolu"] option[value]'):
        sale_id = clean(option.get("value", ""))
        if sale_id.isdigit() and sale_id != "0":
            sales[sale_id] = clean(option.get_text(" ", strip=True))
    if not sales:
        raise ValueError("FMF sale list contained no numeric sale IDs")
    return sales


def cells(row) -> list[str]:
    return [clean(cell.get_text(" ", strip=True)) for cell in row.find_all(["td", "th"], recursive=False)]


def parse_report(html: str, sale_id: str, collected_utc: str) -> list[Observation]:
    soup = BeautifulSoup(html, "html.parser")
    text = clean(soup.get_text(" ", strip=True))
    title = re.search(r"Telefon\s+søla\s+nr\.\s*(\d+)\s*-\s*(\d{2}-\d{2}-\d{4})\s*-\s*kl\.\s*([0-9:]+)", text, re.I)
    if not title or title.group(1) != sale_id:
        raise ValueError(f"Report did not identify requested sale {sale_id}")
    sale_date = dt.datetime.strptime(title.group(2), "%d-%m-%Y").date().isoformat()
    sale_time = title.group(3)
    source_url = f"{REPORT_URL} (POST lstVelSolu={sale_id})"
    observations: list[Observation] = []
    product_group = ""
    section_index = 0
    pending: Observation | None = None

    for row in soup.find_all("tr"):
        values = cells(row)
        if not values:
            continue
        first = values[0]
        # FMF section header: product/size, empty columns, MP, Nøgd.
        if len(values) >= 5 and clean(values[3]).upper() == "MP" and clean(values[4]).lower().startswith("nøgd"):
            product_group = first
            section_index += 1
            pending = None
            continue
        if not product_group or "samantalt" in first.lower():
            pending = None
            continue
        # Vessel offer row: vessel, ..., minimum price, quantity.
        if len(values) >= 5:
            price, quantity = number(values[3]), number(values[4])
            if quantity is not None and quantity >= 0 and first and not first.startswith(("VH:", "Veiðubyrjan", "Landa")):
                vessel, registration = split_vessel(first)
                species, size_group, certification = split_product_group(product_group)
                pending = Observation(
                    sale_id, sale_date, sale_time, product_group, species, size_group,
                    certification, vessel, registration, price, quantity, "", "", "", "",
                    section_index, len(observations) + 1, source_url, collected_utc,
                )
                observations.append(pending)
                continue
        if pending:
            if first.startswith("VH:"):
                pending.fishing_area_method = clean(first[3:])
            elif first.startswith("Veiðubyrjan"):
                raw = first.split(":", 1)[-1].strip(" .")
                try:
                    pending.fishing_start_date = dt.datetime.strptime(raw, "%d-%m-%Y").date().isoformat()
                except ValueError:
                    pending.fishing_start_date = raw
            elif first.startswith("Landa"):
                location = first.split(":", 1)[-1].strip(" .")
                raw_time = next((v for v in values[1:] if re.search(r"\d{2}-\d{2}-\d{4}", v)), "")
                pending.landing_location = location
                match = re.search(r"(\d{2}-\d{2}-\d{4})(?:\s+kl\.\s*([0-9:]+))?", raw_time)
                if match:
                    day = dt.datetime.strptime(match.group(1), "%d-%m-%Y").date().isoformat()
                    pending.landing_datetime = f"{day}T{match.group(2) or '00:00'}"

    if not observations:
        raise ValueError(f"No vessel observations found in FMF sale {sale_id}")
    return observations


def read_existing(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_outputs(rows: list[dict], csv_path: Path, json_path: Path) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    names = [field.name for field in fields(Observation)]
    ordered = sorted(rows, key=lambda r: (r["sale_date"], r["sale_id"], int(r["section_index"]), int(r["row_index"])))
    temporary = csv_path.with_suffix(".csv.tmp")
    with temporary.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=names)
        writer.writeheader(); writer.writerows(ordered)
    temporary.replace(csv_path)
    payload = {"version": 1, "updated_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "fields": names, "rows": ordered}
    temporary_json = json_path.with_suffix(".json.tmp")
    temporary_json.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    temporary_json.replace(json_path)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Collect FMF telephone-auction vessel, species, size and quantity data")
    parser.add_argument("--out", default="data/fmf", help="Output directory")
    parser.add_argument("--sale", action="append", help="Collect a specific sale ID; repeatable")
    parser.add_argument("--delay", type=float, default=2.0)
    args = parser.parse_args(argv)
    if args.delay < 1:
        parser.error("--delay must be at least 1 second")
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    output = Path(args.out)
    csv_path, json_path = output / "fmf_auctions.csv", output / "fmf_auctions.json"
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept-Language": "fo,en;q=0.8"})
    if args.sale:
        sales = {sale: "requested" for sale in args.sale}
    else:
        response = session.get(LIST_URL, timeout=(15, 90)); response.raise_for_status()
        sales = discover_sales(response.text)
    collected: list[Observation] = []
    collected_utc = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    for index, sale_id in enumerate(sorted(sales, key=int)):
        if index: time.sleep(args.delay)
        response = session.post(REPORT_URL, data={"lstVelSolu": sale_id, "submit1": "Vís sølu"},
                                headers={"Referer": LIST_URL}, timeout=(15, 120))
        response.raise_for_status(); response.encoding = response.apparent_encoding or "utf-8"
        rows = parse_report(response.text, sale_id, collected_utc)
        LOG.info("Sale %s: %s vessel/product observations", sale_id, len(rows))
        collected.extend(rows)
    existing = read_existing(csv_path)
    replaced = {item.sale_id for item in collected}
    merged = [row for row in existing if row.get("sale_id") not in replaced] + [asdict(item) for item in collected]
    write_outputs(merged, csv_path, json_path)
    LOG.info("Saved %s total observations to %s", len(merged), output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
