#!/usr/bin/env python3
"""
Fetch CMS Medicare Inpatient Hospitals by Provider and Service (IPPS-style summary),
filter Florida MS-DRG 469 and 470, aggregate to one row per hospital, export JSON.

Requires: Python 3.9+ (stdlib only).
Run from repo root: python3 scripts/build_healthcare_cost_explorer.py
"""

from __future__ import annotations

import json
import statistics
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

CMS_DATASET_ID = "690ddc6c-2767-4618-b277-420ffb2bf27c"
CMS_DATA_URL = f"https://data.cms.gov/data-api/v1/dataset/{CMS_DATASET_ID}/data"
CMS_DATASET_PAGE = (
    "https://data.cms.gov/provider-summary/hospitals/"
    "inpatient-provider-summary-and-charges"
)

OUTPUT_PATH = "healthcare-cost-explorer/data/explorer.json"

# Florida regions (city as reported by CMS; adjust as needed)
JAX = {
    "Jacksonville",
    "Jacksonville Beach",
    "Orange Park",
    "Saint Augustine",
}
ORL = {
    "Orlando",
    "Ocoee",
    "Oviedo",
    "Clermont",
    "Davenport",
    "Daytona Beach",
    "Palm Coast",
    "Cocoa Beach",
    "Melbourne",
    "Palm Bay",
    "Tavares",
    "The Villages",
    "Leesburg",
    "Ocala",
}
TAMPA = {
    "Tampa",
    "Clearwater",
    "Saint Petersburg",
    "Bradenton",
    "Dunedin",
    "Wesley Chapel",
    "Trinity",
    "Sarasota",
    "North Venice",
    "Englewood",
    "Lakeland",
}
MIAMI = {
    "Miami",
    "Miami Beach",
    "Aventura",
    "Fort Lauderdale",
    "Boca Raton",
    "Boynton Beach",
    "Coral Gables",
    "Davie",
    "Delray Beach",
    "West Palm Beach",
    "Palm Beach Gardens",
    "Pembroke Pines",
    "Tamarac",
    "Weston",
    "Jupiter",
    "Atlantis",
}


def region_for_city(city: str) -> str:
    c = city.strip()
    if c in JAX:
        return "Jacksonville"
    if c in ORL:
        return "Orlando"
    if c in TAMPA:
        return "Tampa Bay"
    if c in MIAMI:
        return "Miami metro"
    return "Other Florida"


def title_hospital(name: str) -> str:
    s = " ".join(name.split())
    return s.title()


def fetch_drg_state(state: str, drg: int) -> list[dict]:
    params = urllib.parse.urlencode(
        {
            "filter[Rndrng_Prvdr_State_Abrvtn]": state,
            "filter[DRG_Cd]": str(drg),
            "size": "5000",
        }
    )
    url = f"{CMS_DATA_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "RishiAlva-portfolio-builder/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


def aggregate_rows(rows: list[dict]) -> list[dict]:
    """One row per CCN; drop DRG lines with discharges < 10; drop hospitals with total discharges < 10."""
    by_ccn: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        n = int(str(row["Tot_Dschrgs"]).strip())
        if n < 10:
            continue
        by_ccn[row["Rndrng_Prvdr_CCN"]].append(row)

    out: list[dict] = []
    for ccn, grp in by_ccn.items():
        total_n = sum(int(r["Tot_Dschrgs"]) for r in grp)
        if total_n < 10:
            continue

        def wavg(key: str) -> float:
            num = sum(float(r[key]) * int(r["Tot_Dschrgs"]) for r in grp)
            return num / total_n

        name = title_hospital(grp[0]["Rndrng_Prvdr_Org_Name"])
        city = grp[0]["Rndrng_Prvdr_City"].strip()
        drg_codes = sorted({int(r["DRG_Cd"]) for r in grp})

        out.append(
            {
                "provider_ccn": ccn,
                "provider_name": name,
                "city": city,
                "region": region_for_city(city),
                "total_discharges": total_n,
                "avg_covered_charges": round(wavg("Avg_Submtd_Cvrd_Chrg"), 2),
                "avg_total_payments": round(wavg("Avg_Tot_Pymt_Amt"), 2),
                "avg_medicare_payments": round(wavg("Avg_Mdcr_Pymt_Amt"), 2),
                "drg_codes": drg_codes,
            }
        )

    out.sort(key=lambda x: x["provider_name"].lower())
    return out


def analyze(hospitals: list[dict]) -> dict:
    if not hospitals:
        return {"error": "No hospitals after filters"}

    def stats_for(key: str) -> dict:
        vals = [h[key] for h in hospitals]
        vals_sorted = sorted(vals)
        lo, hi = min(vals), max(vals)
        spread = hi / lo if lo > 0 else None
        return {
            "min": round(lo, 2),
            "max": round(hi, 2),
            "median": round(statistics.median(vals_sorted), 2),
            "spread_ratio": round(spread, 2) if spread is not None else None,
        }

    by_charge = sorted(hospitals, key=lambda x: x["avg_covered_charges"], reverse=True)

    def top_slice(lst: list[dict], n: int, *, reverse: bool) -> list[dict]:
        s = sorted(lst, key=lambda x: x["avg_covered_charges"], reverse=reverse)
        return [
            {
                "provider_name": h["provider_name"],
                "city": h["city"],
                "region": h["region"],
                "avg_covered_charges": h["avg_covered_charges"],
                "avg_total_payments": h["avg_total_payments"],
            }
            for h in s[:n]
        ]

    regions = sorted({h["region"] for h in hospitals})
    by_region = []
    for reg in regions:
        subset = [h for h in hospitals if h["region"] == reg]
        charges = [h["avg_covered_charges"] for h in subset]
        pays = [h["avg_total_payments"] for h in subset]
        by_region.append(
            {
                "region": reg,
                "hospital_count": len(subset),
                "median_covered_charges": round(statistics.median(charges), 2),
                "median_total_payments": round(statistics.median(pays), 2),
            }
        )
    by_region.sort(key=lambda x: x["region"])

    cheapest_city = min(
        ((h["city"], h["avg_covered_charges"]) for h in hospitals),
        key=lambda t: t[1],
    )
    priciest_city = max(
        ((h["city"], h["avg_covered_charges"]) for h in hospitals),
        key=lambda t: t[1],
    )

    return {
        "n_hospitals": len(hospitals),
        "covered_charges": stats_for("avg_covered_charges"),
        "total_payments": stats_for("avg_total_payments"),
        "top10_expensive_covered": top_slice(hospitals, 10, reverse=True),
        "top10_least_expensive_covered": top_slice(hospitals, 10, reverse=False),
        "by_region": by_region,
        "cheapest_city_by_avg_charge": {"city": cheapest_city[0], "avg_covered_charges": cheapest_city[1]},
        "priciest_city_by_avg_charge": {"city": priciest_city[0], "avg_covered_charges": priciest_city[1]},
    }


def main() -> None:
    rows: list[dict] = []
    for drg in (469, 470):
        rows.extend(fetch_drg_state("FL", drg))

    hospitals = aggregate_rows(rows)
    analysis = analyze(hospitals)

    spread = None
    if isinstance(analysis, dict) and analysis.get("covered_charges"):
        spread = analysis["covered_charges"].get("spread_ratio")

    payload = {
        "meta": {
            "title": "Florida joint replacement hospital charges (MS-DRG 469 & 470)",
            "dataset_name": "Medicare Inpatient Hospitals by Provider and Service",
            "dataset_catalog_url": CMS_DATASET_PAGE,
            "dataset_api_id": CMS_DATASET_ID,
            "state": "FL",
            "drg_codes": [469, 470],
            "drg_short_description": (
                "Major hip and knee joint replacement or reattachment of lower extremity "
                "(with and without MCC/complications, per CMS DRG labels in source file)"
            ),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "headline_spread_covered_charges": spread,
            "methodology": [
                "Source: CMS Medicare Inpatient Hospitals by Provider and Service via data.cms.gov API.",
                "Included MS-DRG 469 and 470 only, Florida providers (Rndrng_Prvdr_State_Abrvtn = FL).",
                "Dropped detail rows with fewer than 10 discharges (CMS suppresses small counts; aligns with public use guidance).",
                "Aggregated multiple DRG rows per hospital (469 and/or 470) using discharge-weighted averages for dollar fields.",
                "Dropped hospitals whose combined discharge count across included rows was still below 10.",
                "Standardized provider name casing with simple title case.",
                "Average covered charges are hospital list prices as submitted on the claim; they are not patient out-of-pocket costs.",
                "Average total payments reflect Medicare and other payer amounts in the CMS file; still not the same as a consumer price.",
            ],
        },
        "hospitals": hospitals,
        "analysis": analysis,
    }

    import os

    out = OUTPUT_PATH
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(hospitals)} hospitals to {out}")
    if spread:
        print(f"Covered charge spread ratio (max/min): {spread}x")


if __name__ == "__main__":
    main()
