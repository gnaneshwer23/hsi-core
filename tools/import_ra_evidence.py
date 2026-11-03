#!/usr/bin/env python3
"""Operator-side primary-source import. Runtime apps consume only the validated JSON release.
No patient input, model calls, DTD resolution, clinical advice or evidence approval.

Licence attestation: prefer an explicit Creative Commons URI on JATS permissions.
When JATS has Attribution prose but no license URI, accept a receipted Crossref works
licence URL (content-version vor or unspecified only — never TDM-only, never invented).
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 10_000_000
API = "https://www.ebi.ac.uk/europepmc/webservices/rest"
CROSSREF = "https://api.crossref.org"

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def normalized(element: ET.Element) -> str:
    return re.sub(r"\s+", " ", "".join(element.itertext())).strip()

def name(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1]

def licence_uri(value: str) -> str:
    """An explicit URI is required; 'open access' or 'free in PMC' is not a licence."""
    value = value.strip()
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in ("https", "http") or parsed.hostname != "creativecommons.org" or parsed.query or parsed.fragment or parsed.username:
        raise ValueError("Article licence is not an accepted explicit Creative Commons URI")
    path = parsed.path.rstrip("/") + "/"
    if not re.fullmatch(r"/licenses/by/(?:1\.0|2\.0|2\.5|3\.0|4\.0)/|/publicdomain/zero/1\.0/", path):
        raise ValueError("NC, ND, SA, restricted or unknown terms are not enabled for this commercial research release")
    return "https://creativecommons.org" + path

def origin_redirects(hostname: str):
    class Handler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            parsed = urllib.parse.urlparse(newurl)
            if parsed.scheme != "https" or parsed.hostname != hostname:
                raise ValueError(f"Source redirect left the registered HTTPS origin ({hostname})")
            return super().redirect_request(req, fp, code, msg, headers, newurl)
    return Handler

def download(url: str, hostname: str) -> tuple[bytes, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": "HSI-research-evidence-import/1", "Accept-Encoding": "identity"})
    # Uses the environment proxy and normal system TLS trust. Never disable verification.
    with urllib.request.build_opener(origin_redirects(hostname)).open(req, timeout=30) as response:
        if response.status != 200 or response.headers.get("Content-Encoding", "identity") != "identity":
            raise ValueError("Unexpected primary-source response")
        declared = response.headers.get("Content-Length")
        if declared and int(declared) > MAX_BYTES:
            raise ValueError("Primary source exceeds import size limit")
        data = response.read(MAX_BYTES + 1)
        if not data or len(data) > MAX_BYTES:
            raise ValueError("Empty or oversized primary-source response")
        return data, {"url": url, "responseUrl": response.geturl(), "status": 200, "sha256": sha(data), "retrievedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")}

def article(raw: bytes, expected: dict) -> dict:
    if len(raw) > MAX_BYTES:
        raise ValueError("XML exceeds the import size limit")
    try:
        raw.decode("utf-8-sig", errors="strict")
    except UnicodeDecodeError as error:
        raise ValueError("Only UTF-8 JATS is accepted by this importer") from error
    if b"<!ENTITY" in raw.upper() or re.search(br"<!DOCTYPE[^>]*\[", raw, re.I):
        raise ValueError("Oversize XML or an internal entity declaration is not accepted")
    # ElementTree does not fetch external DTDs. Internal declarations are rejected above.
    root = ET.fromstring(raw)
    if name(root) != "article":
        raise ValueError("Expected a single JATS article")
    front = root.find("./front/article-meta")
    if front is None:
        raise ValueError("Missing article front matter")
    identities = {}
    for item in front.findall("./article-id"):
        kind = item.attrib.get("pub-id-type", "").lower()
        if kind in identities:
            raise ValueError("Ambiguous duplicated article identity")
        identities[kind] = normalized(item)
    pmcid = identities.get("pmc", identities.get("pmcid", ""))
    if pmcid.isdigit(): pmcid = "PMC" + pmcid
    if identities.get("pmid") != expected["pmid"] or pmcid != expected["pmcid"] or identities.get("doi", "").lower() != expected["doi"].lower():
        raise ValueError("JATS front-matter PMID/PMCID/DOI differs from the registered source")
    title_element = front.find("./title-group/article-title")
    title = normalized(title_element) if title_element is not None else ""
    if not title or len(title) > 4000:
        raise ValueError("Missing or oversized article title")
    if root.attrib.get("article-type", "").lower() in ("retraction", "withdrawal", "correction") or re.search(r"^(retracted|retraction|withdrawn)\b", title, re.I):
        raise ValueError("Retraction, withdrawal and correction articles require separate review")
    licences = front.findall("./permissions/license")
    if not licences:
        raise ValueError("No explicit article-level permission")
    uris = []
    for lic in licences:
        href = lic.attrib.get("{http://www.w3.org/1999/xlink}href", lic.attrib.get("href", ""))
        if not href:
            links = [e.attrib.get("{http://www.w3.org/1999/xlink}href", "") for e in lic.iter() if name(e) == "ext-link"]
            href = next((v for v in links if "creativecommons.org" in v), "")
        notice = normalized(lic)
        if re.search(r"non[ -]?commercial|no derivatives|all rights reserved", notice, re.I):
            raise ValueError("Conflicting article reuse restriction")
        if href:
            uris.append(licence_uri(href))
    if uris and len(set(uris)) != 1:
        raise ValueError("Ambiguous article-level licences")
    authors = []
    for group in front.findall("./contrib-group"):
        group_authors = group.attrib.get("content-type", "").lower() == "author"
        for author in group.findall("./contrib"):
            kind = author.attrib.get("contrib-type", "").lower()
            # Prefer explicit contrib-type=author; also accept unmarked contribs in an author group (common in older JATS).
            if kind == "author" or (not kind and group_authors):
                pass
            else:
                continue
            display = author.find("./name")
            if display is not None:
                parts = [normalized(e) for e in list(display)]
                if parts: authors.append(" ".join(parts))
            else:
                collab = author.find("./collab")
                if collab is not None: authors.append(normalized(collab))
    if not authors:
        raise ValueError("Attribution requires recorded authors")
    passages = []
    for ai, abstract in enumerate(front.findall("./abstract"), 1):
        # Translations/graphical abstracts are not silently substituted.
        if abstract.attrib.get("abstract-type", "").lower() in ("graphical", "toc", "translated"): continue
        language = abstract.attrib.get("{http://www.w3.org/XML/1998/namespace}lang", "en")
        if language.lower() not in ("en", "eng"): continue
        def walk(parent: ET.Element, path: str):
            counts = {}
            for child in list(parent):
                tag = name(child); counts[tag] = counts.get(tag, 0) + 1
                locator = f"{path}/{tag}[{counts[tag]}]"
                if tag == "p":
                    text = normalized(child)
                    if not text or len(text) > 20000: raise ValueError("Empty or oversized abstract paragraph")
                    passages.append({"text": text, "locator": locator + "; XML itertext with whitespace collapsed", "sha256": sha(text.encode("utf-8"))})
                elif tag == "sec": walk(child, locator)
        walk(abstract, f"/article/front/article-meta/abstract[{ai}]")
    if not passages or len(passages) > 20:
        raise ValueError("Expected one to twenty complete abstract paragraphs")
    return {
        "title": title,
        "authors": authors,
        "licenceUrl": uris[0] if uris else None,
        "licenceNotice": normalized(licences[0]),
        "passages": passages,
    }

def metadata(raw: bytes, expected: dict) -> dict:
    if len(raw) > MAX_BYTES: raise ValueError("Metadata exceeds size limit")
    data = json.loads(raw)
    rows = data.get("resultList", {}).get("result", [])
    if data.get("hitCount") != 1 or len(rows) != 1: raise ValueError("Metadata identity is missing or ambiguous")
    row = rows[0]
    if str(row.get("id")) != expected["pmid"] or row.get("source") != "MED" or row.get("pmcid") != expected["pmcid"] or row.get("doi", "").lower() != expected["doi"].lower():
        raise ValueError("Europe PMC identity differs from the registered source")
    if str(row.get("isOpenAccess", "")).upper() != "Y": raise ValueError("Source is not reported as open access")
    if any(str(row.get(k, "")).lower() in ("y", "yes", "true") for k in ("isRetracted", "isWithdrawn")):
        raise ValueError("Metadata reports a withdrawn/retracted source")
    for comment in row.get("commentCorrectionList", {}).get("commentCorrection", []):
        if "retract" in str(comment.get("type", "")).lower(): raise ValueError("Retraction link requires curator review")
    return row

def crossref_licence_uri(raw: bytes, expected_doi: str) -> str:
    """Select a single accepted CC BY/CC0 URL from Crossref works.licence (never invent)."""
    if len(raw) > MAX_BYTES:
        raise ValueError("Crossref response exceeds size limit")
    payload = json.loads(raw)
    message = payload.get("message")
    if not isinstance(message, dict):
        raise ValueError("Crossref works payload missing message")
    doi = str(message.get("DOI", "")).lower()
    if doi != expected_doi.lower():
        raise ValueError("Crossref DOI differs from the registered source")
    rows = message.get("license")
    if not isinstance(rows, list) or not rows:
        raise ValueError("Crossref works record has no licence URLs")
    by_priority: dict[str, list[str]] = {"vor": [], "unspecified": [], "other": []}
    for row in rows:
        if not isinstance(row, dict):
            continue
        version = str(row.get("content-version", "")).strip().lower()
        if version == "tdm":
            continue
        url = str(row.get("URL", "")).strip()
        if not url:
            continue
        try:
            uri = licence_uri(url)
        except ValueError:
            continue
        if version == "vor":
            by_priority["vor"].append(uri)
        elif version in ("", "unspecified"):
            by_priority["unspecified"].append(uri)
        else:
            by_priority["other"].append(uri)
    for key in ("vor", "unspecified", "other"):
        pool = by_priority[key]
        if not pool:
            continue
        if len(set(pool)) != 1:
            raise ValueError("Ambiguous Crossref CC BY/CC0 licence URLs")
        return pool[0]
    raise ValueError("No Crossref VOR/unspecified CC BY or CC0 licence URL for this DOI")

def cached(cache: Path, key: str, url: str, hostname: str, offline: bool) -> tuple[bytes, dict]:
    data_path = cache / key
    receipt_path = cache / (key + ".receipt.json")
    if not offline:
        data, receipt = download(url, hostname)
        cache.mkdir(parents=True, exist_ok=True)
        data_path.write_bytes(data)
        receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    else:
        if data_path.stat().st_size > MAX_BYTES or receipt_path.stat().st_size > 10000: raise ValueError("Oversized cache entry")
        data = data_path.read_bytes(); receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    if receipt.get("url") != url or receipt.get("responseUrl") != url or receipt.get("status") != 200 or receipt.get("sha256") != sha(data):
        raise ValueError("Primary-source cache receipt does not match exact URL and bytes")
    stamp = receipt.get("retrievedAt", "")
    when = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
    if when.tzinfo is None or when > datetime.now(timezone.utc): raise ValueError("Invalid retrieval timestamp")
    return data, receipt

def build(protocol: dict, cache: Path, offline: bool) -> dict:
    sources, passages, receipts, candidates = [], [], [], []
    for expected in protocol["sources"]:
        if not re.fullmatch(r"[1-9][0-9]{0,8}", expected["pmid"]) or not re.fullmatch(r"PMC[1-9][0-9]*", expected["pmcid"]): raise ValueError("Invalid registered publication identifiers")
        query = urllib.parse.urlencode({"query": f"EXT_ID:{expected['pmid']} AND SRC:MED", "format": "json", "resultType": "core", "pageSize": "2"})
        meta_url = API + "/search?" + query
        xml_url = API + "/" + expected["pmcid"] + "/fullTextXML"
        meta_raw, meta_receipt = cached(cache, expected["pmid"] + ".metadata.json", meta_url, "www.ebi.ac.uk", offline)
        xml_raw, xml_receipt = cached(cache, expected["pmcid"] + ".xml", xml_url, "www.ebi.ac.uk", offline)
        row = metadata(meta_raw, expected); parsed = article(xml_raw, expected)
        if re.sub(r"\W+", "", row.get("title", "")).lower() != re.sub(r"\W+", "", parsed["title"]).lower(): raise ValueError("Article titles disagree between metadata and JATS")
        licence_url = parsed["licenceUrl"]
        licence_attestation = "jats"
        crossref_receipt = None
        if licence_url is None:
            crossref_url = f"{CROSSREF}/works/{urllib.parse.quote(expected['doi'])}"
            crossref_raw, crossref_receipt = cached(cache, expected["pmid"] + ".crossref.json", crossref_url, "api.crossref.org", offline)
            licence_url = crossref_licence_uri(crossref_raw, expected["doi"])
            licence_attestation = "crossref_works"
        source_id = "PMID-" + expected["pmid"]
        sources.append({"id": source_id, "title": ", ".join(parsed["authors"]) + " — " + parsed["title"], "kind": "publication", "dataClass": "public_real", "pmid": expected["pmid"], "doi": expected["doi"], "url": "https://europepmc.org/articles/" + expected["pmcid"], "licence": {"status": "permitted", "identifier": licence_url, "passageUsePermitted": True}, "provenance": {"product": "hsi", "datasetId": "ra-anti-tnf-source-release", "version": xml_receipt["sha256"], "retrievedAt": xml_receipt["retrievedAt"]}})
        ids = []
        for index, passage in enumerate(parsed["passages"], 1):
            pid = source_id + "-ABSTRACT-" + str(index); ids.append(pid)
            passages.append({"id": pid, "sourceId": source_id, "sourceVersion": xml_receipt["sha256"], "text": passage["text"], "locator": passage["locator"], "dataClass": "public_real", "sha256": passage["sha256"]})
        receipts.append({"sourceId": source_id, "pmcid": expected["pmcid"], "metadata": meta_receipt, "articleXml": xml_receipt, "authors": parsed["authors"], "articleTitle": parsed["title"], "licenceUrl": licence_url, "licenceNotice": parsed["licenceNotice"], "normalization": "xml_itertext_whitespace_collapse", "licenceAttestation": licence_attestation, "crossref": crossref_receipt})
        candidates.append({"sourceId": source_id, "passageIds": ids, "plannedRole": expected["role"], "studyDesign": "unassessed", "claimSupport": "unassessed", "scientificReview": "unreviewed", "graphMapping": "related_context_only"})
    content = {"schemaVersion": "hsi-ra-evidence-release-1", "protocolId": protocol["id"], "protocolVersion": protocol["version"], "question": protocol["question"], "containsPhi": False, "clinicalAdvice": False, "kgWrite": False, "scientificReview": "unreviewed", "sources": sources, "passages": passages, "receipts": receipts, "candidates": candidates}
    # Hash content with stable object ordering; freshness is retained in each receipt.
    content["version"] = sha(json.dumps(content, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))
    return content

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--offline", action="store_true", help="Verify previously downloaded exact bytes and receipts; this does not establish fresh provider access")
    args = parser.parse_args()
    protocol = json.loads((ROOT / "research/ra-anti-tnf/protocol.json").read_text())
    output = args.output.resolve(); output.parent.mkdir(parents=True, exist_ok=True)
    lock = output.with_suffix(output.suffix + ".lock")
    descriptor = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    temporary = None
    try:
        release = build(protocol, args.cache_dir.resolve(), args.offline)
        payload = (json.dumps(release, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        if len(payload) > 500000: raise ValueError("Evidence release exceeds 500 KB")
        with tempfile.NamedTemporaryFile(dir=output.parent, delete=False) as handle:
            temporary = Path(handle.name); handle.write(payload); handle.flush(); os.fsync(handle.fileno())
        os.replace(temporary, output); temporary = None
        print(json.dumps({"sources": len(release["sources"]), "passages": len(release["passages"]), "scientificReview": "unreviewed", "version": release["version"], "mode": "offline_receipts" if args.offline else "live_source_retrieval", "licenceAttestations": [r["licenceAttestation"] for r in release["receipts"]]}))
    finally:
        if temporary is not None: temporary.unlink(missing_ok=True)
        os.close(descriptor); lock.unlink()

if __name__ == "__main__":
    main()
