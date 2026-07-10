#!/usr/bin/env python3
"""Static, live-HTTP and Web3Forms audit for kamlaelectrodes.com."""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse, urldefrag

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SKIP_SCHEMES = ("mailto:", "tel:", "javascript:", "data:", "sms:", "whatsapp:")


@dataclass
class Finding:
    level: str
    page: str
    message: str


def html_files() -> list[Path]:
    return sorted(ROOT.glob("*.html"))


def is_external(value: str) -> bool:
    parsed = urlparse(value)
    return bool(parsed.scheme or parsed.netloc)


def local_target(source: Path, raw: str) -> tuple[Path | None, str]:
    value = raw.strip()
    if not value or value.startswith(SKIP_SCHEMES) or value.startswith("//") or is_external(value):
        return None, ""
    clean, fragment = urldefrag(value)
    clean = clean.split("?", 1)[0]
    if not clean:
        return source, fragment
    if clean.startswith("/"):
        target = ROOT / clean.lstrip("/")
    else:
        target = (source.parent / clean).resolve()
    if target.is_dir():
        target = target / "index.html"
    return target, fragment


def static_audit() -> tuple[list[Finding], list[dict]]:
    findings: list[Finding] = []
    forms: list[dict] = []
    pages = html_files()
    if not pages:
        return [Finding("error", "repository", "No root HTML pages found")], forms

    for page in pages:
        text = page.read_text(encoding="utf-8")
        soup = BeautifulSoup(text, "html.parser")
        rel = page.relative_to(ROOT).as_posix()

        if not soup.title or not soup.title.get_text(strip=True):
            findings.append(Finding("error", rel, "Missing document title"))
        if not soup.find("meta", attrs={"name": "description"}):
            findings.append(Finding("warning", rel, "Missing meta description"))
        if not soup.find("script", src=lambda value: value and "app.js" in value):
            findings.append(Finding("error", rel, "Shared app.js is not included"))
        elif "app.js?v=12" not in text:
            findings.append(Finding("error", rel, "Shared app.js cache version is not v12"))

        for tag, attr in (("a", "href"), ("link", "href"), ("script", "src"), ("img", "src")):
            for node in soup.find_all(tag):
                raw = node.get(attr)
                if not raw:
                    continue
                target, fragment = local_target(page, raw)
                if target is None:
                    continue
                try:
                    target.relative_to(ROOT)
                except ValueError:
                    findings.append(Finding("error", rel, f"Local reference escapes repository: {raw}"))
                    continue
                if not target.exists():
                    findings.append(Finding("error", rel, f"Broken local reference: {raw}"))
                    continue
                if fragment and target.suffix.lower() == ".html":
                    target_soup = soup if target == page else BeautifulSoup(target.read_text(encoding="utf-8"), "html.parser")
                    if not target_soup.find(id=fragment) and not target_soup.find(attrs={"name": fragment}):
                        findings.append(Finding("warning", rel, f"Missing fragment target in {raw}"))

        for index, form in enumerate(soup.find_all("form"), start=1):
            fields = []
            for control in form.find_all(["input", "select", "textarea"]):
                name = control.get("name")
                if not name:
                    continue
                fields.append({
                    "name": name,
                    "tag": control.name,
                    "type": control.get("type", ""),
                    "required": control.has_attr("required"),
                })
            forms.append({
                "page": rel,
                "index": index,
                "action": form.get("action", ""),
                "method": form.get("method", "get").lower(),
                "fields": fields,
            })

    return findings, forms


def live_audit(base_url: str, pages: Iterable[Path], cache_key: str) -> list[Finding]:
    findings: list[Finding] = []
    session = requests.Session()
    session.headers.update({
        "User-Agent": "KamlaElectrodesWebsiteAudit/1.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    })
    for page in pages:
        rel = page.name
        path = "" if rel == "index.html" else rel
        url = urljoin(base_url.rstrip("/") + "/", path)
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}qa={cache_key}"
        try:
            response = session.get(url, timeout=30, allow_redirects=True)
        except requests.RequestException as exc:
            findings.append(Finding("error", rel, f"Live request failed: {exc}"))
            continue
        if response.status_code != 200:
            findings.append(Finding("error", rel, f"Live HTTP status {response.status_code} at {response.url}"))
            continue
        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type.lower():
            findings.append(Finding("warning", rel, f"Unexpected live content type: {content_type}"))
        soup = BeautifulSoup(response.text, "html.parser")
        if not soup.title or not soup.title.get_text(strip=True):
            findings.append(Finding("error", rel, "Live page has no title"))
        if len(response.content) < 500:
            findings.append(Finding("warning", rel, f"Live response is unusually small ({len(response.content)} bytes)"))

    for asset in ("app.js?v=12", "plant-partapur.webp", "head-office-chhipi-tank.webp", "style.css?v=5"):
        url = urljoin(base_url.rstrip("/") + "/", asset)
        try:
            response = session.get(url, timeout=30, allow_redirects=True)
            if response.status_code != 200:
                findings.append(Finding("error", "live-assets", f"{asset} returned HTTP {response.status_code}"))
            elif len(response.content) < 100:
                findings.append(Finding("warning", "live-assets", f"{asset} response is unexpectedly small"))
        except requests.RequestException as exc:
            findings.append(Finding("error", "live-assets", f"{asset} request failed: {exc}"))
    return findings


def first_option(select) -> str:
    for option in select.find_all("option"):
        value = option.get("value")
        if value is None:
            value = option.get_text(strip=True)
        if value:
            return value
    return "Test"


def form_value(name: str, control, timestamp: str) -> str:
    key = name.lower()
    fixed = {
        "name": "KE Website Audit",
        "company": "Kamla Electrodes Website QA",
        "email": "contact@kamlaelectrodes.com",
        "phone": "9999999999",
        "location": "Meerut, Uttar Pradesh 250001",
        "gstin": "",
        "primary_brand": "Kmatic X-45",
        "quantity": "50 boxes",
        "minimum_monthly_purchase_quantity": "300 boxes/month",
        "current_lines": "Welding consumables and industrial products",
        "territory": "Meerut and surrounding markets — automated test audit only",
        "warehouse_capacity": "Test entry — not an application",
        "years_in_trade": "1",
        "product_interest": "Kmatic X-45 — automated test",
        "message": f"Automated test submission from the KE website audit at {timestamp}. Please ignore.",
    }
    if key in fixed:
        return fixed[key]
    if control.name == "select":
        return first_option(control)
    control_type = control.get("type", "").lower()
    if control_type == "email":
        return "contact@kamlaelectrodes.com"
    if control_type in {"tel", "number"} or "phone" in key:
        return "9999999999"
    if "date" in key:
        return time.strftime("%Y-%m-%d")
    return f"Website audit test {timestamp}"


def submit_web3forms(timestamp: str) -> tuple[list[Finding], list[str]]:
    findings: list[Finding] = []
    subjects: list[str] = []
    session = requests.Session()
    session.headers.update({"Accept": "application/json", "User-Agent": "KamlaElectrodesWebsiteAudit/1.0"})

    for page in html_files():
        soup = BeautifulSoup(page.read_text(encoding="utf-8"), "html.parser")
        for form in soup.find_all("form"):
            action = form.get("action", "")
            if "api.web3forms.com/submit" not in action:
                continue
            data: dict[str, str | list[str]] = {}
            for control in form.find_all(["input", "select", "textarea"]):
                name = control.get("name")
                if not name:
                    continue
                control_type = control.get("type", "").lower()
                if control_type in {"submit", "button", "file", "checkbox", "radio"}:
                    continue
                value = control.get("value", "")
                if not value or name in {"subject", "from_name"}:
                    value = form_value(name, control, timestamp)
                data[name] = value

            subject = f"[TEST] KE Website Audit — {page.name} — {timestamp}"
            data["subject"] = subject
            data["from_name"] = "KamlaElectrodes.com Website Audit"
            data["botcheck"] = ""
            data.pop("redirect", None)
            try:
                response = session.post(action, data=data, timeout=30)
                payload = response.json() if response.content else {}
            except (requests.RequestException, ValueError) as exc:
                findings.append(Finding("error", page.name, f"Real form submission failed: {exc}"))
                continue
            if not response.ok or payload.get("success") is False:
                findings.append(Finding("error", page.name, f"Web3Forms rejected test: HTTP {response.status_code}, {payload}"))
                continue
            subjects.append(subject)
            findings.append(Finding("info", page.name, f"Real Web3Forms test accepted: {subject}"))
    if not subjects:
        findings.append(Finding("error", "forms", "No Web3Forms test submissions were accepted"))
    return findings, subjects


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--live-base", default="https://kamlaelectrodes.com/")
    parser.add_argument("--send-forms", action="store_true")
    parser.add_argument("--report", default="audit-report.json")
    args = parser.parse_args()

    timestamp = time.strftime("%Y-%m-%dT%H-%M-%SZ", time.gmtime())
    findings, forms = static_audit()
    findings.extend(live_audit(args.live_base, html_files(), timestamp))
    subjects: list[str] = []
    if args.send_forms:
        form_findings, subjects = submit_web3forms(timestamp)
        findings.extend(form_findings)

    report = {
        "timestamp_utc": timestamp,
        "pages_checked": [p.name for p in html_files()],
        "forms": forms,
        "test_submission_subjects": subjects,
        "findings": [asdict(item) for item in findings],
    }
    report_path = ROOT / args.report
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Pages checked: {len(report['pages_checked'])}")
    print(f"Forms found: {len(forms)}")
    for item in findings:
        print(f"[{item.level.upper()}] {item.page}: {item.message}")
    if subjects:
        print("Accepted test submission subjects:")
        for subject in subjects:
            print(f"  - {subject}")

    errors = [item for item in findings if item.level == "error"]
    print(f"Errors: {len(errors)}; warnings: {sum(1 for item in findings if item.level == 'warning')}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
