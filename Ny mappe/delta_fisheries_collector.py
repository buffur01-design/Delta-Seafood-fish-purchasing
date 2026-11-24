#!/usr/bin/env python3
"""Delta Seafood | Vørn daily fisheries collector.

Retrieves public landing reports and group drill-downs, stores verified daily
species x skipabólkur figures in SQLite, and exports chart-ready XLSX.

Requires: requests, beautifulsoup4. On Windows, install truststore so HTTPS uses
the Windows certificate store. No website server or Microsoft login needed.

IMPORTANT: The Vørn website is an external system. Its HTML may change. This
collector intentionally refuses unknown layouts rather than inventing data.
The live source couldn't be tested in the authoring environment. Test one day,
compare against Vørn's visible totals, and get permission before bulk harvesting.
"""
from __future__ import annotations

import argparse
import datetime as dt
import decimal
import hashlib
import html as html_lib
import json
import logging
import re
import sqlite3
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

import requests
from bs4 import BeautifulSoup

if sys.platform == "win32":
    try:
        import truststore
    except ImportError:
        truststore = None
    else:
        # Vørn's certificate chain is accepted by Windows but may not be in
        # Python/Certifi's separate CA bundle. Keep verification enabled while
        # using the same trusted roots as the browser and PowerShell.
        truststore.inject_into_ssl()

LOG = logging.getLogger("vorn")
PARENT = "https://hagtol.vorn.fo/fvePortal.exe/showLandingRep"
DETAIL = "https://hagtol.vorn.fo/fvePortal.exe/ShowLandingRepShip"
REGIONS = "1,2,3,4,5,6,7,9,10,8,11,"
METRICS = ("AMOUNT", "VALUE")
D = decimal.Decimal

SPECIES_ENGLISH = {
    "Annað": "Other", "Blálonga": "Blue ling", "Brislingur": "European sprat",
    "Brosma": "Tusk", "Búrfiskur": "Orange roughy", "Gulllaksur": "Silver smelt",
    "Havtaska": "Monkfish", "Hemari": "Porbeagle",
    "Heystgýtandi sild": "Autumn-spawning herring", "Hummari": "Langoustine",
    "Hvítingur": "Whiting", "Hýsa": "Haddock", "Kalvi": "Atlantic halibut",
    "Kongafiskur": "Redfish", "Krabbi": "Crab", "Langasporl": "Grenadier",
    "Liri (Spotted wolffish)": "Spotted wolffish", "Lodna": "Capelin",
    "Longa": "Ling", "Makrelur": "Mackerel",
    "Norðurhavssild": "Norwegian spring-spawning herring",
    "Prikkafiskur": "Lanternfish", "Reyðsprøka": "European plaice",
    "Rossamakrelur": "Horse mackerel", "Rækjur": "Cold-water shrimp",
    "Sild": "Herring", "Skeggbrosma / lítlabrosma": "Forkbeard / lesser forkbeard",
    "Skeljar": "Shellfish", "Skøta": "Skate", "Steinbítur": "Atlantic wolffish",
    "Steinbítur (Wolffishes/Catfish": "Wolffish / catfish",
    "Stinglaksur": "Black scabbardfish", "Svartkalvi": "Greenland halibut",
    "Svartkjaftur": "Blue whiting", "Toskur": "Cod", "Tunga": "Lemon sole",
    "Upsi": "Saithe",
}

GROUP_ENGLISH = {
    "Flakatrolarar": "Factory trawlers", "Garnaskip": "Gillnet vessels",
    "Hummarabátar": "Langoustine vessels",
    "Nóta- og ídnaðarskip": "Purse seiners and industrial vessels",
    "Rækjuskip": "Shrimp vessels", "Skjeljabátar": "Shellfish vessels",
}


def params_for(day: dt.date, metric: str, *, group_id: str | None = None) -> dict:
    p = {"XPANDEDMENUES": "6", "PARAMTYPE": "1",
         "BEGIN": day.strftime("%d-%m-%Y"), "END": day.strftime("%d-%m-%Y"),
         "REGIONS": REGIONS, "SUMCOLUMN": metric, "OnlyFBK": "0"}
    if group_id is None:
        p["REPTYPE"] = "SHIPGR"
    else:
        p["SHIPGROUPID"] = group_id
    return p


def rows_in_table(table):
    """Ignore rows belonging to tables nested inside this table."""
    for tr in table.find_all("tr"):
        if tr.find_parent("table") is table:
            cells = tr.find_all(["td", "th"], recursive=False)
            if cells:
                yield cells


def clean(s: str) -> str:
    return " ".join(s.replace("\xa0", " ").split()).strip()


def is_total(s: str) -> bool:
    return clean(s).lower().strip(" .:") in {"tils", "total", "sum", "samlað"}


def number(s: str):
    """Parse Faroese grouping (1.234.567) and optional comma decimals."""
    s = clean(s).replace(" ", "").replace("\u202f", "")
    if not s or s in {"-", "—", "–"}:
        return None
    s = s.replace("−", "-")
    # Accept 1.234.567, 1234, 1.234,50, 1,234.50
    if re.fullmatch(r"-?\d{1,3}(?:\.\d{3})+(?:,\d+)?", s):
        s = s.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"-?\d{1,3}(?:,\d{3})+(?:\.\d+)?", s):
        s = s.replace(",", "")
    elif re.fullmatch(r"-?\d+(?:,\d+)?", s):
        s = s.replace(",", ".")
    elif not re.fullmatch(r"-?\d+(?:\.\d+)?", s):
        return None
    try:
        return D(s)
    except decimal.InvalidOperation:
        return None


def validate_vorn_page(html: str):
    text = clean(BeautifulSoup(html, "html.parser").get_text(" ", strip=True)).lower()
    if not text or ("avreiðing" not in text and "veiða" not in text):
        raise ValueError("Response is not identifiable as a Vørn landings report (possibly an error page)")


def discover_groups(html: str) -> dict[str, str]:
    """Discover ALL group IDs and labels from linked group drill-downs.

    Group IDs are never guessed or hard-coded. Raises if no links are found.
    """
    validate_vorn_page(html)
    soup = BeautifulSoup(html, "html.parser")
    groups = {}
    for a in soup.find_all("a", href=True):
        href = html_lib.unescape(a["href"])
        absolute = urllib.parse.urljoin(PARENT, href)
        parts = urllib.parse.urlsplit(absolute)
        if "showlandingrepship" not in parts.path.lower() or "fishsizes" in parts.path.lower():
            continue
        query = urllib.parse.parse_qs(parts.query)
        ids = next((v for k, v in query.items() if k.upper() == "SHIPGROUPID"), None)
        if not ids:
            continue
        group_id = ids[0].strip()
        if not re.fullmatch(r"[0-9]+", group_id):
            continue
        label = clean(a.get_text(" ", strip=True))
        if not label:
            parent = a.find_parent(["td", "th"])
            label = clean(parent.get_text(" ", strip=True)) if parent else ""
        if is_total(label) or not label or re.fullmatch(r"\d[\d., ]*", label):
            # Keep ID, but don't pretend to have a confirmed group name.
            label = f"SHIPGROUPID {group_id} (check name)"
        if group_id not in groups or groups[group_id].startswith("SHIPGROUPID"):
            groups[group_id] = label
    if not groups:
        raise ValueError("No clickable SHIPGROUPID links in top-level report; cannot discover all groups safely")
    return groups


def parse_parent_matrix(html: str) -> tuple[dict[str, str], dict[str, dict[str, D]]]:
    """Parse species x ship-group values directly from the top-level report.

    The parent table contains all ship groups as columns. Reading that matrix
    avoids a separate request for every group while retaining the same public
    figures. Duplicate species rows are summed within each group.
    """
    validate_vorn_page(html)
    soup = BeautifulSoup(html, "html.parser")
    for table in soup.find_all("table"):
        rows = list(rows_in_table(table))
        if not rows:
            continue
        headers = [clean(c.get_text(" ", strip=True)) for c in rows[0]]
        if len(headers) < 3 or not is_total(headers[-1]):
            continue

        groups: dict[str, str] = {}
        columns: list[tuple[int, str]] = []
        for index, cell in enumerate(rows[0][1:-1], 1):
            anchor = cell.find("a", href=True)
            if anchor is None:
                continue
            absolute = urllib.parse.urljoin(PARENT, html_lib.unescape(anchor["href"]))
            query = urllib.parse.parse_qs(urllib.parse.urlsplit(absolute).query)
            ids = next((v for k, v in query.items() if k.upper() == "SHIPGROUPID"), None)
            if not ids or not re.fullmatch(r"[0-9]+", ids[0].strip()):
                continue
            gid = ids[0].strip()
            label = headers[index]
            if not label:
                raise ValueError(f"Missing ship-group label for ID {gid}")
            groups[gid] = label
            columns.append((index, gid))
        if not groups or len(groups) != len(headers) - 2:
            raise ValueError("Could not identify every ship-group column in parent report")

        values = defaultdict(lambda: defaultdict(lambda: D(0)))
        for cells in rows[1:]:
            row = [clean(c.get_text(" ", strip=True)) for c in cells]
            if len(row) != len(headers):
                raise ValueError("Parent report contains a row with an unexpected column count")
            species = row[0]
            if is_total(species):
                break
            if not species:
                continue
            for index, gid in columns:
                amount = number(row[index])
                if amount is not None:
                    values[gid][species] += amount
        return groups, {gid: dict(species) for gid, species in values.items()}
    raise ValueError("No recognizable species x ship-group matrix in parent report")


def parse_group_details(html: str) -> dict[str, D]:
    """Read each species' *right-hand Tils.* column from vessel-detail tables.

    Supports repeated vessel blocks and repeated species entries. Ignores vessel
    columns and subtotal rows to prevent double-counting. Refuses layouts
    without a recognizable totals-header and totals-row pair.
    """
    validate_vorn_page(html)
    soup = BeautifulSoup(html, "html.parser")
    totals = defaultdict(lambda: D(0))
    matched_blocks = 0
    saw_detail_rows = False
    for table in soup.find_all("table"):
        active = False
        found_total_row = False
        block = defaultdict(lambda: D(0))
        for cells in rows_in_table(table):
            values = [clean(c.get_text(" ", strip=True)) for c in cells]
            if len(values) < 2:
                continue
            saw_detail_rows = True
            first, last = values[0], values[-1]
            if is_total(last) and not is_total(first):
                # Vessel header: last column labelled Tils. (not a number).
                active = True
                found_total_row = False
                continue
            if not active:
                continue
            if is_total(first):
                found_total_row = True
                for sp, total in block.items():
                    totals[sp] += total
                matched_blocks += 1
                active = False
                block.clear()
                continue
            n = number(last)
            if n is None:
                continue
            if not first or re.fullmatch(r"\d+", first):
                continue
            # Species labels, not the vessel names: a genuine header was seen.
            if len(first) > 110 or first.lower().startswith(("tøl seinast", "tíðarskeið")):
                continue
            block[first] += n
        # Some HTML reports can split the totals row into a separate table. Do
        # not accept an unfinished block (otherwise a partial block looks valid).
        if active and not found_total_row:
            LOG.warning("Skipped a table with no closing Tils. row")
    if matched_blocks == 0:
        # The parent report links every known ship group, including groups with
        # no landings in the selected period.  Vørn returns a report shell with
        # no multi-cell detail rows for those groups; that is valid empty data,
        # not a changed table layout.  A non-empty but unrecognized table still
        # fails closed below.
        if not saw_detail_rows:
            return {}
        raise ValueError("No verifiable vessel blocks: expected headers and a closing Tils. row")
    return dict(totals)


def parse_vessel_name(label: str) -> tuple[str, str, str]:
    """Split Vørn's vessel heading into name, registration and call sign."""
    label = clean(label)
    match = re.match(r"^(.*?)\s+-\s+([^()]+?)(?:\s+\(([^()]*)\))?$", label)
    if not match:
        return label, "", ""
    return clean(match.group(1)), clean(match.group(2)), clean(match.group(3) or "")


def parse_vessel_details(html: str) -> dict[tuple[str, str], D]:
    """Return non-zero values keyed by (full vessel label, species)."""
    validate_vorn_page(html)
    soup = BeautifulSoup(html, "html.parser")
    totals = defaultdict(lambda: D(0))
    recognized = False
    saw_multi_cell_rows = False
    for table in soup.find_all("table"):
        rows = list(rows_in_table(table))
        if not rows:
            continue
        header = [clean(cell.get_text(" ", strip=True)) for cell in rows[0]]
        if len(header) < 3:
            continue
        saw_multi_cell_rows = True
        if not is_total(header[-1]):
            continue
        vessels = header[1:-1]
        if not vessels or any(not vessel for vessel in vessels):
            continue
        recognized = True
        for cells in rows[1:]:
            values = [clean(cell.get_text(" ", strip=True)) for cell in cells]
            if len(values) != len(header):
                raise ValueError("Vessel detail row has an unexpected column count")
            species = values[0]
            if is_total(species):
                break
            if not species:
                continue
            for vessel, raw_value in zip(vessels, values[1:-1]):
                value = number(raw_value)
                if value is not None and value != 0:
                    totals[(vessel, species)] += value
    if recognized:
        return dict(totals)
    if not saw_multi_cell_rows:
        return {}
    raise ValueError("No recognizable vessel-by-species table in detail report")


def setup_db(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(db_path)
    c.execute("PRAGMA journal_mode=WAL")
    c.executescript("""
    CREATE TABLE IF NOT EXISTS daily (
      date TEXT NOT NULL,
      species TEXT NOT NULL,
      group_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      quantity_kg REAL,
      sales_value_dkk REAL,
      quality TEXT NOT NULL,
      amount_url TEXT NOT NULL,
      value_url TEXT NOT NULL,
      collected_utc TEXT NOT NULL,
      PRIMARY KEY (date, group_id, species)
    );
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      outcome TEXT NOT NULL,
      note TEXT,
      groups_found INTEGER,
      records INTEGER,
      checked_utc TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_vessel (
      date TEXT NOT NULL,
      vessel_label TEXT NOT NULL,
      vessel_name TEXT NOT NULL,
      registration TEXT NOT NULL,
      call_sign TEXT NOT NULL,
      species TEXT NOT NULL,
      group_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      quantity_kg REAL,
      sales_value_dkk REAL,
      quality TEXT NOT NULL,
      amount_url TEXT NOT NULL,
      value_url TEXT NOT NULL,
      collected_utc TEXT NOT NULL,
      PRIMARY KEY (date, group_id, vessel_label, species)
    );
    CREATE INDEX IF NOT EXISTS ix_daily_vessel_date ON daily_vessel(date);
    CREATE INDEX IF NOT EXISTS ix_daily_vessel_name ON daily_vessel(vessel_name);
    CREATE TABLE IF NOT EXISTS vessel_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      outcome TEXT NOT NULL,
      note TEXT,
      groups_fetched INTEGER,
      records INTEGER,
      checked_utc TEXT NOT NULL
    );
    """)
    c.commit()
    return c


def seed_daily_from_web_json(c, source: Path) -> int:
    """Bootstrap an empty database from the public dashboard JSON."""
    if c.execute("SELECT 1 FROM daily LIMIT 1").fetchone() or not source.exists():
        return 0
    payload = json.loads(source.read_text(encoding="utf-8"))
    if payload.get("fields") != ["date", "species", "ship_group", "quantity_kg", "sales_value_dkk"]:
        raise ValueError(f"Unexpected dashboard seed format: {source}")
    collected = payload.get("updated_utc") or dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    records = [
        (day, species, f"seed:{group}", group, kg, value, "MATCHED", "", "", collected)
        for day, species, group, kg, value in payload.get("rows", [])
    ]
    with c:
        c.executemany("INSERT OR IGNORE INTO daily VALUES (?,?,?,?,?,?,?,?,?,?)", records)
    return len(records)


def seed_vessels_from_web_json(c, directory: Path) -> int:
    """Bootstrap empty vessel history from the published yearly JSON files."""
    if c.execute("SELECT 1 FROM daily_vessel LIMIT 1").fetchone() or not directory.exists():
        return 0
    collected = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    total = 0
    with c:
        for source in sorted(directory.glob("[0-9][0-9][0-9][0-9].json")):
            payload = json.loads(source.read_text(encoding="utf-8"))
            expected = ["date", "species", "ship_group", "vessel", "identity", "quantity_kg", "sales_value_dkk"]
            if payload.get("fields") != expected:
                raise ValueError(f"Unexpected vessel seed format: {source}")
            records = []
            for day, species, group, vessel, identity, kg, value in payload.get("rows", []):
                vessel_label = f"{vessel}|{identity}"
                records.append((day, vessel_label, vessel, identity, "", species,
                                f"seed:{group}", group, kg, value, "MATCHED", "", "", collected))
            c.executemany("INSERT OR IGNORE INTO daily_vessel VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", records)
            total += len(records)
    return total


def record_run(c, day, outcome, note, groups=0, records=0):
    c.execute("INSERT INTO runs (date,outcome,note,groups_found,records,checked_utc) VALUES (?,?,?,?,?,?)",
              (str(day), outcome, str(note)[:1500], groups, records, dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")))
    c.commit()


def record_vessel_run(c, day, outcome, note, groups=0, records=0):
    c.execute("INSERT INTO vessel_runs (date,outcome,note,groups_fetched,records,checked_utc) VALUES (?,?,?,?,?,?)",
              (str(day), outcome, str(note)[:1500], groups, records,
               dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")))
    c.commit()


def fetch(session, url, p, raw_path, *, offline_dir=None):
    uri = url + "?" + urllib.parse.urlencode(p)
    if offline_dir:
        if not raw_path.exists():
            raise FileNotFoundError(f"Offline report missing: {raw_path.name}")
        raw = raw_path.read_bytes()
        html = raw.decode("utf-8", errors="replace")
        # Prefer UTF-8 saved in the original site when available.
        validate_vorn_page(html)
        return html, uri
    r = session.get(url, params=p, timeout=(12, 60))
    r.raise_for_status()
    r.encoding = r.apparent_encoding or "utf-8"
    html = r.text
    validate_vorn_page(html)
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path.write_text(html, encoding="utf-8")
    return html, r.url


def collect_day(c, day, session, raw_root, delay, *, offline_dir=None):
    directory = (Path(offline_dir) if offline_dir else raw_root) / day.isoformat()
    directory.mkdir(parents=True, exist_ok=True)
    groups_by_metric = {}
    parents = {}
    matrices = {}
    try:
        for metric in METRICS:
            h, u = fetch(session, PARENT, params_for(day, metric), directory / f"PARENT_{metric}.html", offline_dir=offline_dir)
            parents[metric] = u
            groups_by_metric[metric], matrices[metric] = parse_parent_matrix(h)
            if not offline_dir:
                time.sleep(delay)
        ids_amount = set(groups_by_metric["AMOUNT"])
        ids_value = set(groups_by_metric["VALUE"])
        if ids_amount != ids_value:
            raise ValueError("Group IDs differ between AMOUNT and VALUE parent reports; not safe to join")
        if len(ids_amount) < 1:
            raise ValueError("No vessel groups detected")
        group_data = defaultdict(dict)
        for gid in sorted(ids_amount, key=lambda s:int(s)):
            kg = matrices["AMOUNT"].get(gid, {})
            dkk = matrices["VALUE"].get(gid, {})
            for species in sorted(set(kg) | set(dkk)):
                q = kg.get(species)
                v = dkk.get(species)
                if q is None or v is None:
                    quality = "UNMATCHED"
                elif q <= 0:
                    quality = "NO_POSITIVE_KG"
                else:
                    quality = "MATCHED"
                group_data[gid][species] = (q, v, quality, parents["AMOUNT"], parents["VALUE"])
        count = sum(len(v) for v in group_data.values())
        if count == 0:
            raise ValueError("No species totals found; rejecting day rather than overwriting historical records")
        now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
        with c:
            # Replace a day's rows only after ALL groups and metrics succeed.
            c.execute("DELETE FROM daily WHERE date = ?", (day.isoformat(),))
            for gid, species_map in group_data.items():
                name = groups_by_metric["AMOUNT"][gid]
                for species, (q, v, quality, u1, u2) in species_map.items():
                    c.execute("""INSERT INTO daily VALUES (?,?,?,?,?,?,?,?,?,?)""",
                              (day.isoformat(), species, gid, name,
                               float(q) if q is not None else None,
                               float(v) if v is not None else None,
                               quality, u1, u2, now))
        unmatched = sum(1 for ss in group_data.values() for vals in ss.values() if vals[2] != "MATCHED")
        message = f"{count} species/group rows; {unmatched} unmatched/no-kg rows"
        LOG.info("%s OK: %s groups, %s", day, len(ids_amount), message)
        record_run(c, day, "OK" if unmatched == 0 else "REVIEW", message, len(ids_amount), count)
        return True
    except (requests.RequestException, FileNotFoundError, ValueError) as exc:
        LOG.error("%s FAILED (previous database records remain): %s", day, exc)
        record_run(c, day, "FAILED", str(exc), len(groups_by_metric.get("AMOUNT", {})), 0)
        return False


def collect_vessel_day(c, day, session, raw_root, delay, *, offline_dir=None):
    """Collect every non-zero vessel x species observation for one date."""
    directory = (Path(offline_dir) if offline_dir else raw_root) / day.isoformat()
    directory.mkdir(parents=True, exist_ok=True)
    groups_by_metric = {}
    matrices = {}
    parents = {}
    fetched_groups = 0
    try:
        for metric in METRICS:
            html, url = fetch(session, PARENT, params_for(day, metric),
                              directory / f"PARENT_{metric}.html", offline_dir=offline_dir)
            parents[metric] = url
            groups_by_metric[metric], matrices[metric] = parse_parent_matrix(html)
            if not offline_dir:
                time.sleep(delay)
        if set(groups_by_metric["AMOUNT"]) != set(groups_by_metric["VALUE"]):
            raise ValueError("Group IDs differ between AMOUNT and VALUE parent reports")

        active_groups = {
            gid for metric in METRICS for gid, species in matrices[metric].items()
            if any(value != 0 for value in species.values())
        }
        observations = defaultdict(dict)
        for gid in sorted(active_groups, key=lambda value: int(value)):
            per_metric = {}
            for metric in METRICS:
                html, url = fetch(session, DETAIL, params_for(day, metric, group_id=gid),
                                  directory / f"GROUP_{gid}_{metric}.html", offline_dir=offline_dir)
                per_metric[metric] = (parse_vessel_details(html), url)
                if not offline_dir:
                    time.sleep(delay)
            fetched_groups += 1
            amount, amount_url = per_metric["AMOUNT"]
            value, value_url = per_metric["VALUE"]
            if not amount and not value:
                raise ValueError(f"Active ship group {gid} returned no vessel observations")
            for key in sorted(set(amount) | set(value)):
                kg = amount.get(key)
                dkk = value.get(key)
                quality = "MATCHED" if kg is not None and dkk is not None and kg > 0 else (
                    "NO_POSITIVE_KG" if kg is not None and kg <= 0 else "UNMATCHED"
                )
                observations[gid][key] = (kg, dkk, quality, amount_url, value_url)

        now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
        with c:
            c.execute("DELETE FROM daily_vessel WHERE date = ?", (day.isoformat(),))
            for gid, vessel_species in observations.items():
                group_name = groups_by_metric["AMOUNT"][gid]
                for (vessel_label, species), (kg, dkk, quality, amount_url, value_url) in vessel_species.items():
                    vessel_name, registration, call_sign = parse_vessel_name(vessel_label)
                    c.execute("""INSERT INTO daily_vessel VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                              (day.isoformat(), vessel_label, vessel_name, registration, call_sign,
                               species, gid, group_name,
                               float(kg) if kg is not None else None,
                               float(dkk) if dkk is not None else None,
                               quality, amount_url, value_url, now))
        count = sum(len(values) for values in observations.values())
        unmatched = sum(1 for values in observations.values() for row in values.values() if row[2] != "MATCHED")
        if not active_groups:
            outcome, message = "EMPTY", "No landings reported; stored as a verified empty day"
        else:
            outcome = "OK" if unmatched == 0 else "REVIEW"
            message = f"{count} vessel/species rows; {unmatched} unmatched/no-kg rows"
        LOG.info("%s VESSELS %s: %s active groups, %s", day, outcome, len(active_groups), message)
        record_vessel_run(c, day, outcome, message, fetched_groups, count)
        return True
    except (requests.RequestException, FileNotFoundError, ValueError) as exc:
        LOG.error("%s VESSELS FAILED (previous records remain): %s", day, exc)
        record_vessel_run(c, day, "FAILED", str(exc), fetched_groups, 0)
        return False


def excel_col(n):
    value = ""
    while n:
        n, d = divmod(n-1, 26)
        value = chr(65+d) + value
    return value


def excel_date(day_str):
    return (dt.date.fromisoformat(day_str) - dt.date(1899, 12, 30)).days


def xml_ok(value):
    return "".join(ch for ch in str(value) if ch in "\t\r\n" or ord(ch) >= 32)


def make_sheet(rows, *, dates=(), decimals=(), formulas=None, widths=None):
    main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    root = ET.Element("worksheet", xmlns=main)
    views = ET.SubElement(root, "sheetViews")
    v = ET.SubElement(views, "sheetView", workbookViewId="0")
    ET.SubElement(v, "pane", ySplit="1", topLeftCell="A2", activePane="bottomLeft", state="frozen")
    cols = ET.SubElement(root, "cols")
    for j, width in enumerate(widths or [], 1):
        ET.SubElement(cols, "col", min=str(j), max=str(j), width=str(width), customWidth="1")
    data = ET.SubElement(root, "sheetData")
    for i, row in enumerate(rows, 1):
        rr = ET.SubElement(data, "row", r=str(i), ht="23" if i == 1 else "18", customHeight="1")
        for j, value in enumerate(row, 1):
            if value is None or value == "":
                continue
            ref = f"{excel_col(j)}{i}"
            st = "1" if i == 1 else ("2" if j in dates else ("4" if j in decimals else "3" if isinstance(value,(float,int,D)) else "0"))
            if i > 1 and formulas and j in formulas:
                # Formula cells cache a numeric result so previews work too.
                computed = float(value) if isinstance(value, (int, float, D)) else None
                cell = ET.SubElement(rr, "c", r=ref, s="4")
                ET.SubElement(cell, "f").text = formulas[j](i)
                ET.SubElement(cell, "v").text = "" if computed is None else str(computed)
            elif i > 1 and j in dates:
                c = ET.SubElement(rr, "c", r=ref, s="2")
                ET.SubElement(c, "v").text = str(excel_date(str(value)))
            elif isinstance(value, (int,float,D)):
                c = ET.SubElement(rr, "c", r=ref, s=st)
                ET.SubElement(c,"v").text = str(value)
            else:
                c = ET.SubElement(rr, "c", r=ref, t="inlineStr", s=st)
                inline = ET.SubElement(c, "is")
                ET.SubElement(inline, "t").text = xml_ok(value)
    if len(rows) > 1:
        ET.SubElement(root, "autoFilter", ref=f"A1:{excel_col(max(len(r) for r in rows))}{len(rows)}")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def write_workbook(dest, sheets):
    """Create numeric, formatted, filterable XLSX with standard-library OOXML."""
    pkg = "http://schemas.openxmlformats.org/package/2006/relationships"
    od = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    ss = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    ct = "http://schemas.openxmlformats.org/package/2006/content-types"
    dest.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(dest, "w", ZIP_DEFLATED) as z:
        types = ET.Element("Types", xmlns=ct)
        ET.SubElement(types,"Default",Extension="rels",ContentType="application/vnd.openxmlformats-package.relationships+xml")
        ET.SubElement(types,"Default",Extension="xml",ContentType="application/xml")
        ET.SubElement(types,"Override",PartName="/xl/workbook.xml",ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml")
        ET.SubElement(types,"Override",PartName="/xl/styles.xml",ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml")
        for i in range(1,len(sheets)+1):
            ET.SubElement(types,"Override",PartName=f"/xl/worksheets/sheet{i}.xml",ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml")
        z.writestr("[Content_Types].xml", ET.tostring(types,encoding="utf-8",xml_declaration=True))
        relationships = ET.Element("Relationships", xmlns=pkg)
        ET.SubElement(relationships,"Relationship",Id="rId1",Type=od+"/officeDocument",Target="xl/workbook.xml")
        z.writestr("_rels/.rels",ET.tostring(relationships,encoding="utf-8",xml_declaration=True))
        ET.register_namespace("r", od)
        wb = ET.Element("workbook", xmlns=ss)
        shs = ET.SubElement(wb,"sheets")
        wb_rels = ET.Element("Relationships",xmlns=pkg)
        for i, (name, rows, dates, decimals, formulas, widths) in enumerate(sheets,1):
            ET.SubElement(shs,"sheet",name=name,sheetId=str(i),attrib={f"{{{od}}}id":f"rId{i}"})
            ET.SubElement(wb_rels,"Relationship",Id=f"rId{i}",Type=od+"/worksheet",Target=f"worksheets/sheet{i}.xml")
            z.writestr(f"xl/worksheets/sheet{i}.xml",make_sheet(rows,dates=dates,decimals=decimals,formulas=formulas,widths=widths))
        # OOXML requires calcPr after sheets. Excel repairs the workbook when
        # this element appears before sheets, even though many readers accept
        # the out-of-order XML.
        ET.SubElement(wb, "calcPr", fullCalcOnLoad="1", calcId="191029")
        ET.SubElement(wb_rels,"Relationship",Id=f"rId{len(sheets)+1}",Type=od+"/styles",Target="styles.xml")
        z.writestr("xl/workbook.xml",ET.tostring(wb,encoding="utf-8",xml_declaration=True))
        z.writestr("xl/_rels/workbook.xml.rels",ET.tostring(wb_rels,encoding="utf-8",xml_declaration=True))
        styles=ET.Element("styleSheet",xmlns=ss)
        nfmt=ET.SubElement(styles,"numFmts",count="3")
        for id_,fmt in [(164,"yyyy-mm-dd"),(165,'#,##0.00'),(166,'#,##0')]:
            ET.SubElement(nfmt,"numFmt",numFmtId=str(id_),formatCode=fmt)
        fonts=ET.SubElement(styles,"fonts",count="2")
        ET.SubElement(ET.SubElement(fonts,"font"),"sz",val="10")
        f=ET.SubElement(fonts,"font")
        ET.SubElement(f,"b");ET.SubElement(f,"sz",val="10")
        ET.SubElement(f,"color",rgb="FFFFFFFF")
        fills=ET.SubElement(styles,"fills",count="3")
        ET.SubElement(ET.SubElement(fills,"fill"),"patternFill",patternType="none")
        ET.SubElement(ET.SubElement(fills,"fill"),"patternFill",patternType="gray125")
        fill=ET.SubElement(fills,"fill")
        pat=ET.SubElement(fill,"patternFill",patternType="solid")
        ET.SubElement(pat,"fgColor",rgb="FF163B52")
        ET.SubElement(pat,"bgColor",indexed="64")
        borders=ET.SubElement(styles,"borders",count="1")
        border=ET.SubElement(borders,"border")
        for edge in ("left","right","top","bottom","diagonal"):
            ET.SubElement(border,edge)
        xfs=ET.SubElement(styles,"cellStyleXfs",count="1")
        ET.SubElement(xfs,"xf",numFmtId="0",fontId="0",fillId="0",borderId="0")
        cfx=ET.SubElement(styles,"cellXfs",count="5")
        for nf,fi,fl in [(0,0,0),(0,1,2),(164,0,0),(166,0,0),(165,0,0)]:
            ET.SubElement(cfx,"xf",numFmtId=str(nf),fontId=str(fi),fillId=str(fl),borderId="0",xfId="0",applyNumberFormat="1",applyFill="1")
        cell_styles=ET.SubElement(styles,"cellStyles",count="1")
        ET.SubElement(cell_styles,"cellStyle",name="Normal",xfId="0",builtinId="0")
        z.writestr("xl/styles.xml",ET.tostring(styles,encoding="utf-8",xml_declaration=True))


def export(c, out_path):
    records = list(c.execute("SELECT date,species,group_name,quantity_kg,sales_value_dkk,group_id,quality,amount_url,value_url,collected_utc FROM daily ORDER BY date,species,group_name,group_id"))
    daily = [["Date","Species","Skipabólkur","Quantity (kg)","Sales value (DKK)","Reported DKK/kg","Group ID","Status","KG report URL","DKK report URL","Collected UTC"]]
    month = defaultdict(lambda:[0.,0.])
    year = defaultdict(lambda:[0.,0.])
    for day,sp,name,kg,dkk,gid,quality,u1,u2,checked in records:
        price = dkk/kg if kg is not None and dkk is not None and kg>0 else None
        daily.append([day,sp,name,kg,dkk,price,gid,quality,u1,u2,checked])
        if quality == "MATCHED":
            mkey=(day[:7],sp,name,gid)
            ykey=(day[:4],sp,name,gid)
            for agg,key in ((month,mkey),(year,ykey)):
                agg[key][0] += kg
                agg[key][1] += dkk
    monthly=[["Month","Species","Skipabólkur","Quantity (kg)","Sales value (DKK)","Weighted DKK/kg","Group ID"]]
    for (period,sp,name,gid),(kg,dkk) in sorted(month.items()):
        monthly.append([period,sp,name,kg,dkk,dkk/kg if kg>0 else None,gid])
    annual=[["Year","Species","Skipabólkur","Quantity (kg)","Sales value (DKK)","Weighted DKK/kg","Group ID"]]
    for (period,sp,name,gid),(kg,dkk) in sorted(year.items()):
        annual.append([int(period),sp,name,kg,dkk,dkk/kg if kg>0 else None,gid])
    runs=[["Day","Outcome","Notes","Groups","Rows","Checked UTC"]]
    runs.extend(list(c.execute("SELECT date,outcome,note,groups_found,records,checked_utc FROM runs ORDER BY id DESC LIMIT 5000")))
    unmatched=[["Date","Species","Skipabólkur","Quantity (kg)","Sales value (DKK)","Issue","Group ID"]]
    unmatched.extend([[d,sp,g,kg,dkk,q,gid] for d,sp,g,kg,dkk,_,gid,q,*_ in daily[1:] if q!="MATCHED"])
    readme=[
        ["DELTA SEAFOOD | VØRN LANDINGS REPORTS"],
        ["Field","Explanation"],
        ["Daily Data","One row per report date, species, skipabólkur; duplicate species rows from vessel blocks are summed"],
        ["Monthly Summary","Weighted average = sum(sales DKK) / sum(kg) across valid daily records"],
        ["Annual Summary","Weighted average = sum(sales DKK) / sum(kg) across valid daily records"],
        ["Reported DKK/kg","NOT necessarily FMF auction price or price for a uniform fresh-fish product"],
        ["Quantity interpretation","Vørn reports can contain processed product weight, not whole-fish equivalents"],
        ["Unmatched Data","Records with missing one of AMOUNT/VALUE or no positive kg excluded from weighted summaries"],
        ["Fetch Log","FAILED days retain old database data; REVIEW days contain unmatched records"],
        ["Source","https://hagtol.vorn.fo/fvePortal.exe/ParamsLanding?XPANDEDMENUES=6&dummy=0"],
        ["Limits","Site structure, history, revisions, permissions and total validation require checking against the live source"],
        ["Frequency","Schedule script externally; running once does not create a background service"],
        ["Database","SQLite file alongside reports; keep database out of public website repositories"],
        ["Excel","All numeric columns are numeric; dates formatted as actual Excel dates"],
    ]
    def price_formula(i):return f'IF(D{i}>0,E{i}/D{i},"")'
    sheets=[
        ("Daily Data",daily,(1,),(4,5,6),{6:price_formula},[14,27,32,17,21,20,12,18,65,65,27]),
        ("Monthly Summary",monthly,(),(4,5,6),{6:price_formula},[13,27,32,17,21,20,12]),
        ("Annual Summary",annual,(),(4,5,6),{6:price_formula},[13,27,32,17,21,20,12]),
        ("Unmatched Data",unmatched,(1,),(4,5),None,[14,27,32,17,21,20,12]),
        ("Fetch Log",runs,(1,),(),None,[14,15,80,12,12,28]),
        ("Read Me",readme,(),(),None,[32,112]),
    ]
    write_workbook(out_path,sheets)
    return len(daily)-1, len(unmatched)-1


def export_web_json(c, destination: Path):
    """Write a compact, public, chart-ready dataset for the static website."""
    records = c.execute("""
        SELECT date, species, group_name, quantity_kg, sales_value_dkk
        FROM daily
        WHERE quality = 'MATCHED' AND quantity_kg > 0
        ORDER BY date, species, group_name, group_id
    """).fetchall()
    payload = {
        "version": 1,
        "updated_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": "Vorn public landing reports",
        "fields": ["date", "species", "ship_group", "quantity_kg", "sales_value_dkk"],
        "rows": [
            [day, species, group, round(float(kg), 3), round(float(value), 2)]
            for day, species, group, kg, value in records
        ],
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".tmp")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    temporary.replace(destination)
    return len(records)


def export_web_vessel_json(c, directory: Path):
    """Write deterministic yearly vessel files for lazy website tooltips."""
    directory.mkdir(parents=True, exist_ok=True)
    years = [row[0] for row in c.execute(
        "SELECT DISTINCT substr(date,1,4) FROM daily_vessel ORDER BY 1"
    )]
    total = 0
    for year in years:
        records = c.execute("""
            SELECT date,species,group_name,vessel_name,registration,call_sign,quantity_kg,sales_value_dkk
            FROM daily_vessel
            WHERE quality='MATCHED' AND quantity_kg>0 AND substr(date,1,4)=?
            ORDER BY date,species,group_name,vessel_name,vessel_label
        """, (year,)).fetchall()
        rows = []
        for day, species, group, vessel, registration, call_sign, kg, dkk in records:
            identity = registration
            if call_sign:
                identity = f"{registration} / {call_sign}" if registration else call_sign
            rows.append([day, species, group, vessel, identity, round(float(kg), 3), round(float(dkk), 2)])
        payload = {
            "version": 1,
            "fields": ["date", "species", "ship_group", "vessel", "identity", "quantity_kg", "sales_value_dkk"],
            "rows": rows,
        }
        destination = directory / f"{year}.json"
        temporary = destination.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        temporary.replace(destination)
        total += len(rows)
    manifest = {
        "version": 1,
        "updated_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "years": years,
        "rows": total,
    }
    temporary = directory / "manifest.json.tmp"
    temporary.write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
    temporary.replace(directory / "manifest.json")
    return total, len(years)


def export_vessel_workbook(c, destination: Path):
    """Export all vessel observations into one worksheet per year."""
    years = [row[0] for row in c.execute(
        "SELECT DISTINCT substr(date,1,4) FROM daily_vessel ORDER BY 1"
    )]
    sheets = []
    total_rows = 0

    def price_formula(row_number):
        return f'IF(F{row_number}>0,G{row_number}/F{row_number},"")'

    for year in years:
        rows = [["Date", "Vessel", "Registration / call sign", "Ship group", "Species",
                 "Landed kg", "Sales value DKK", "Average DKK/kg"]]
        records = c.execute("""
            SELECT date,vessel_name,registration,call_sign,group_name,species,
                   quantity_kg,sales_value_dkk
            FROM daily_vessel
            WHERE substr(date,1,4)=?
            ORDER BY date,vessel_name,species,group_id
        """, (year,)).fetchall()
        for day, vessel, registration, call_sign, group_name, species, kg, dkk in records:
            identity = registration
            if call_sign:
                identity = f"{registration} / {call_sign}" if registration else call_sign
            rows.append([
                day, vessel, identity, GROUP_ENGLISH.get(group_name, group_name),
                SPECIES_ENGLISH.get(species, species), kg, dkk,
                dkk / kg if kg is not None and dkk is not None and kg > 0 else None,
            ])
        total_rows += len(records)
        sheets.append((f"Vessels {year}", rows, (1,), (6, 7, 8), {8: price_formula},
                       [14, 30, 25, 34, 30, 17, 21, 19]))

    summary = [["Vessel", "Registration / call sign", "Species", "Total landed kg",
                "Total sales DKK", "Weighted DKK/kg", "First landing", "Last landing"]]
    summary_records = c.execute("""
        SELECT vessel_name,registration,call_sign,species,
               SUM(quantity_kg),SUM(sales_value_dkk),MIN(date),MAX(date)
        FROM daily_vessel
        WHERE quality='MATCHED'
        GROUP BY vessel_label,species
        ORDER BY vessel_name,species
    """).fetchall()
    for vessel, registration, call_sign, species, kg, dkk, first_day, last_day in summary_records:
        identity = registration
        if call_sign:
            identity = f"{registration} / {call_sign}" if registration else call_sign
        summary.append([
            vessel, identity, SPECIES_ENGLISH.get(species, species), kg, dkk,
            dkk / kg if kg and dkk is not None else None, first_day, last_day,
        ])
    sheets.append(("Vessel Summary", summary, (7, 8), (4, 5, 6), None,
                   [30, 25, 30, 19, 21, 19, 14, 14]))

    runs = [["Date", "Outcome", "Notes", "Groups fetched", "Rows", "Checked UTC"]]
    runs.extend(c.execute("""
        SELECT date,outcome,note,groups_fetched,records,checked_utc
        FROM vessel_runs ORDER BY id DESC
    """).fetchall())
    sheets.append(("Fetch Log", runs, (1,), (), None, [14, 14, 80, 16, 14, 28]))

    readme = [
        ["DELTA SEAFOOD | VESSEL-LEVEL LANDINGS"],
        ["Worksheet", "Explanation"],
        ["Vessels YYYY", "One row per report date, vessel and species; no source URLs are displayed"],
        ["Vessel Summary", "Totals by vessel and species across the full collected history"],
        ["Average DKK/kg", "Sales value divided by landed kg for an observation"],
        ["Weighted DKK/kg", "Sum of sales value divided by sum of landed kg"],
        ["Quantity", "Vørn may report processed product weight rather than whole-fish equivalent"],
        ["Source language", "Species and named ship groups are displayed in English; original labels remain in SQLite"],
        ["Technical data", "Source URLs, quality flags and timestamps remain in SQLite and are intentionally omitted here"],
        ["Source", "Vørn public landing reports"],
    ]
    sheets.append(("Read Me", readme, (), (), None, [32, 112]))
    write_workbook(destination, sheets)
    return total_rows, len(summary_records)


def daterange(start,end):
    for x in range((end-start).days+1):
        yield start+dt.timedelta(days=x)


def main(argv=None):
    ap=argparse.ArgumentParser(description="Collect Vørn landing value and kg by species x skipabólkur; export Excel")
    ap.add_argument("--start",help="First date YYYY-MM-DD; defaults to 14-day refresh window")
    ap.add_argument("--end",help="Last date YYYY-MM-DD; defaults to yesterday")
    ap.add_argument("--refresh-days",type=int,default=14,help="Default lookback window when --start omitted")
    ap.add_argument("--max-days",type=int,default=31,help="Safety cap; only increase once automated access is approved")
    ap.add_argument("--delay",type=float,default=2.0,help="Seconds between HTTP requests (minimum 1.5)")
    ap.add_argument("--out",default="reports",help="Directory for SQLite, HTML and Excel reports")
    ap.add_argument("--excel",help="Optional additional Excel output path (e.g. company OneDrive folder)")
    ap.add_argument("--offline-dir",help="Test using saved HTML under FOLDER/YYYY-MM-DD/; skips network")
    ap.add_argument("--export-only",action="store_true",help="Recreate Excel from local database, without making requests")
    ap.add_argument("--resume",action="store_true",help="Skip dates already recorded as OK or REVIEW in the run log")
    ap.add_argument("--web-json",help="Also export compact website JSON to this path")
    ap.add_argument("--web-vessel-dir",help="Also export yearly vessel JSON files to this website directory")
    ap.add_argument("--seed-web-json",help="Seed an empty database from an existing website JSON file")
    ap.add_argument("--seed-web-vessel-dir",help="Seed empty vessel history from existing yearly website JSON files")
    ap.add_argument("--collect-vessels",action="store_true",help="Collect vessel observations in addition to ship-group totals")
    ap.add_argument("--vessels-only",action="store_true",help="Collect/export vessel observations without repeating ship-group collection")
    args=ap.parse_args(argv)
    logging.basicConfig(level=logging.INFO,format="%(levelname)s: %(message)s")
    if args.refresh_days < 1 or args.max_days < 1 or args.delay < 1.5:
        ap.error("refresh-days/max-days must be positive; delay must be >= 1.5 seconds")
    out=Path(args.out).expanduser().resolve()
    c=setup_db(out/"fisheries.sqlite")
    try:
        if args.seed_web_json:
            seeded = seed_daily_from_web_json(c, Path(args.seed_web_json).expanduser().resolve())
            if seeded:
                LOG.info("Seeded %s dashboard rows from existing website JSON", seeded)
        if args.seed_web_vessel_dir:
            seeded = seed_vessels_from_web_json(c, Path(args.seed_web_vessel_dir).expanduser().resolve())
            if seeded:
                LOG.info("Seeded %s vessel rows from existing website JSON", seeded)
        failed=0
        if not args.export_only:
            end=dt.date.fromisoformat(args.end) if args.end else dt.date.today()-dt.timedelta(days=1)
            start=dt.date.fromisoformat(args.start) if args.start else end-dt.timedelta(days=args.refresh_days-1)
            count=(end-start).days+1
            if count<1 or count>args.max_days:
                ap.error(f"Date range must be between 1 and {args.max_days} days. Increase --max-days only after confirming access terms.")
            completed = set()
            vessel_completed = set()
            if args.resume:
                if not args.vessels_only:
                    completed = {row[0] for row in c.execute(
                        "SELECT DISTINCT date FROM runs WHERE outcome IN ('OK','REVIEW')"
                    )}
                if args.collect_vessels or args.vessels_only:
                    vessel_completed = {row[0] for row in c.execute(
                        "SELECT DISTINCT date FROM vessel_runs WHERE outcome IN ('OK','REVIEW','EMPTY')"
                    )}
                LOG.info("Resume mode: %s group day(s), %s vessel day(s) will be skipped",
                         len(completed), len(vessel_completed))
            with requests.Session() as sess:
                sess.headers.update({"User-Agent":"DeltaSeafoodResearchCollector/1.0 (+please-contact-site-operator-before-bulk-access)","Accept-Language":"fo,en;q=0.8"})
                for day in daterange(start,end):
                    day_text = day.isoformat()
                    day_ok = True
                    if not args.vessels_only and day_text not in completed:
                        day_ok = collect_day(c,day,sess,out/"raw_html",args.delay,offline_dir=args.offline_dir) and day_ok
                    if (args.collect_vessels or args.vessels_only) and day_text not in vessel_completed:
                        day_ok = collect_vessel_day(c,day,sess,out/"raw_vessel_html",args.delay,offline_dir=args.offline_dir) and day_ok
                    failed += (not day_ok)
        if not args.vessels_only:
            main_excel=out/"delta_fisheries.xlsx"
            rowcount,unmatched=export(c,main_excel)
            LOG.info("Excel export: %s (%s data rows, %s unmatched)",main_excel,rowcount,unmatched)
            if args.web_json:
                web_rows=export_web_json(c,Path(args.web_json).expanduser().resolve())
                LOG.info("Website JSON export: %s (%s matched rows)",args.web_json,web_rows)
        if args.collect_vessels or args.vessels_only:
            vessel_excel=out/"delta_fisheries_vessels.xlsx"
            vessel_rows,vessel_summary=export_vessel_workbook(c,vessel_excel)
            LOG.info("Vessel Excel export: %s (%s observations, %s summary rows)",
                     vessel_excel,vessel_rows,vessel_summary)
        if args.web_vessel_dir:
            vessel_web_rows,vessel_web_years=export_web_vessel_json(
                c,Path(args.web_vessel_dir).expanduser().resolve())
            LOG.info("Website vessel JSON export: %s (%s rows across %s years)",
                     args.web_vessel_dir,vessel_web_rows,vessel_web_years)
        if args.excel:
            from shutil import copy2
            requested=Path(args.excel).expanduser()
            requested.parent.mkdir(parents=True,exist_ok=True)
            copy2(vessel_excel if args.vessels_only else main_excel,requested)
            LOG.info("Copied Excel to %s",requested)
        if failed:
            LOG.warning("%s requested day(s) failed; check Fetch Log. No invalid rows were inserted.",failed)
            return 1
        return 0
    finally:
        c.close()


if __name__=="__main__":
    sys.exit(main())
