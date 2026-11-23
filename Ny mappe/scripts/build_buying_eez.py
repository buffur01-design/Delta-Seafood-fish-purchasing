"""Build a lightweight North Atlantic EEZ GeoJSON from Marine Regions WFS."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from urllib.parse import urlencode


WFS_URL = "https://geo.vliz.be/geoserver/MarineRegions/wfs"
BBOX = (-180.0, 40.0, 180.0, 85.0)  # west, south, east, north
TOLERANCE = 0.03
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "buying-eez.geojson"

MARKETS = {
    "FRO": "faroe-waters",
    "ISL": "iceland-waters",
    "NOR": "norway-waters",
    "GRL": "greenland-waters",
    "CAN": "canadian-waters",
    "RUS": "russian-waters",
    "DNK": "denmark-waters",
    "IRL": "eu-waters",
    "FRA": "eu-waters",
    "ESP": "eu-waters",
    "PRT": "eu-waters",
    "NLD": "eu-waters",
    "BEL": "eu-waters",
    "DEU": "eu-waters",
}


def perpendicular_distance(point, start, end):
    x, y = point
    x1, y1 = start
    x2, y2 = end
    if start == end:
        return ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
    numerator = abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1)
    denominator = ((y2 - y1) ** 2 + (x2 - x1) ** 2) ** 0.5
    return numerator / denominator


def simplify(points, tolerance=TOLERANCE):
    if len(points) <= 2:
        return points
    greatest = 0.0
    index = 0
    for position in range(1, len(points) - 1):
        distance = perpendicular_distance(points[position], points[0], points[-1])
        if distance > greatest:
            greatest = distance
            index = position
    if greatest <= tolerance:
        return [points[0], points[-1]]
    left = simplify(points[: index + 1], tolerance)
    right = simplify(points[index:], tolerance)
    return left[:-1] + right


def clip_edge(points, inside, intersect):
    if not points:
        return []
    result = []
    previous = points[-1]
    previous_inside = inside(previous)
    for current in points:
        current_inside = inside(current)
        if current_inside:
            if not previous_inside:
                result.append(intersect(previous, current))
            result.append(current)
        elif previous_inside:
            result.append(intersect(previous, current))
        previous = current
        previous_inside = current_inside
    return result


def clip_ring(ring):
    west, south, east, north = BBOX
    points = [list(point[:2]) for point in ring]
    if points and points[0] == points[-1]:
        points.pop()

    def vertical(a, b, x):
        if b[0] == a[0]:
            return [x, a[1]]
        ratio = (x - a[0]) / (b[0] - a[0])
        return [x, a[1] + ratio * (b[1] - a[1])]

    def horizontal(a, b, y):
        if b[1] == a[1]:
            return [a[0], y]
        ratio = (y - a[1]) / (b[1] - a[1])
        return [a[0] + ratio * (b[0] - a[0]), y]

    points = clip_edge(points, lambda p: p[0] >= west, lambda a, b: vertical(a, b, west))
    points = clip_edge(points, lambda p: p[0] <= east, lambda a, b: vertical(a, b, east))
    points = clip_edge(points, lambda p: p[1] >= south, lambda a, b: horizontal(a, b, south))
    points = clip_edge(points, lambda p: p[1] <= north, lambda a, b: horizontal(a, b, north))
    if len(points) < 3:
        return []
    points.append(points[0])
    simplified = simplify(points)
    if simplified[0] != simplified[-1]:
        simplified.append(simplified[0])
    return simplified if len(simplified) >= 4 else []


def clip_geometry(geometry):
    geometry_type = geometry.get("type")
    source = geometry.get("coordinates", [])
    polygons = source if geometry_type == "MultiPolygon" else [source]
    clipped_polygons = []
    for polygon in polygons:
        rings = [clip_ring(ring) for ring in polygon]
        rings = [ring for ring in rings if ring]
        if rings:
            clipped_polygons.append(rings)
    if not clipped_polygons:
        return None
    if len(clipped_polygons) == 1:
        return {"type": "Polygon", "coordinates": clipped_polygons[0]}
    return {"type": "MultiPolygon", "coordinates": clipped_polygons}


def fetch_territory(code):
    query = urlencode(
        {
            "service": "WFS",
            "version": "1.0.0",
            "request": "GetFeature",
            "typeName": "eez",
            "cql_filter": f"iso_ter1='{code}'",
            "outputformat": "application/json",
        }
    )
    url = f"{WFS_URL}?{query}"
    powershell = (
        "[Console]::OutputEncoding=[Text.Encoding]::UTF8;"
        "$ProgressPreference='SilentlyContinue';"
        f"(Invoke-WebRequest -UseBasicParsing -Uri '{url}' -TimeoutSec 180).Content"
    )
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-Command", powershell],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(result.stdout).get("features", [])


def main():
    features = []
    for code, market in MARKETS.items():
        for feature in fetch_territory(code):
            geometry = clip_geometry(feature.get("geometry") or {})
            if not geometry:
                continue
            properties = feature.get("properties") or {}
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "market": market,
                        "mrgid": properties.get("mrgid"),
                        "geoname": properties.get("geoname"),
                        "territory": properties.get("territory1"),
                        "iso": code,
                        "source": "Marine Regions World EEZ v12",
                    },
                    "geometry": geometry,
                }
                )
    collection = {
        "type": "FeatureCollection",
        "name": "Delta Seafood buying-market EEZ boundaries",
        "attribution": "Flanders Marine Institute (VLIZ), MarineRegions.org, World EEZ v12, CC BY 4.0",
        "features": features,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(collection, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(features)} features to {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
