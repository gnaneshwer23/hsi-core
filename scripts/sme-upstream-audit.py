#!/usr/bin/env python3
"""Static upstream audit; never installs or executes upstream code."""
import hashlib
import json
import pathlib
import re
import datetime
import sys
import tomllib
import urllib.request

SOURCES = [
 ("garrytan/gbrain","7e5ce356337699d57508c86d4904feda906e4e03","bun.lock","Bun"),
 ("akitaonrails/ai-memory","ccc7dc0db1271e94785b3e7e5a1758a89fde202d","Cargo.lock","crates.io"),
 ("smixs/agent-second-brain","7828ed62cf76aae87bee7f2660468ab88495cf3d","uv.lock","PyPI"),
 ("itechmeat/open-second-brain","d1d1d50644a247ed1a8c28e97c11730f9078dec6","bun.lock","Bun"),
 ("jessepinkman9900/claude-second-brain","599f55ad50afceb9eae4f31746aa37274087d239","package-lock.json","npm"),
]
def request(url, body=None):
    req = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(), headers={"Content-Type":"application/json","User-Agent":"HSI-SME-static-audit"})
    with urllib.request.urlopen(req, timeout=45) as response:
        data = response.read(10_000_001)
        if len(data)>10_000_000:
            raise ValueError("response exceeds limit")
        return data

def inventory(raw, ecosystem):
    if ecosystem == "Bun":
        clean = re.sub(r'("(?:\\.|[^"\\])*")|,(?=\s*[}\]])', lambda m: m.group(1) or "", raw.decode())
        doc = json.loads(clean)
        if doc["lockfileVersion"] != 1:
            raise ValueError("unsupported Bun lock version")
        rows = []
        for key, entry in doc["packages"].items():
            name, sep, version = entry[0].rpartition("@")
            if not sep or not re.fullmatch(r"\d+\.\d+\.\d+(?:[-+][\w.+-]+)?", version) or entry[1] not in ("", None):
                raise ValueError("unclassified Bun entry: "+key)
            rows.append((name,version))
        return sorted(set(rows))
    if ecosystem == "npm":
        rows = []
        for path, item in json.loads(raw)["packages"].items():
            if not path:
                continue
            if item.get("link") or not item.get("version") or not path.startswith("node_modules/"):
                raise ValueError("unsupported npm package entry: "+path)
            rows.append((item.get("name") or path.rsplit("node_modules/",1)[-1],item["version"]))
        return sorted(set(rows))
    rows=[]
    for item in tomllib.loads(raw.decode())["package"]:
        source=item.get("source")
        if ecosystem=="crates.io" and source=="registry+https://github.com/rust-lang/crates.io-index":
            rows.append((item["name"],item["version"]))
        elif ecosystem=="PyPI" and isinstance(source,dict) and source.get("registry") in ("https://pypi.org/simple","https://pypi.org/simple/"):
            rows.append((item["name"],item["version"]))
        elif (ecosystem=="crates.io" and source is None) or (ecosystem=="PyPI" and isinstance(source,dict) and source.get("editable")=="."):
            continue  # local source remains outside registry coverage
        else:
            raise ValueError("unclassified source for "+item["name"])
    return sorted(set(rows))

def main():
    report={"timestamp":datetime.datetime.now(datetime.timezone.utc).isoformat(),"scope":"public pinned lockfiles only; no runtime or licence clearance","sources":[]}
    for repo,sha,path,ecosystem in SOURCES:
        row={"repo":repo,"commit":sha,"lockfile":path,"ecosystem":ecosystem,"status":"blocked"}
        report["sources"].append(row)
        try:
            raw=request(f"https://raw.githubusercontent.com/{repo}/{sha}/{path}")
            row["sha256"]=hashlib.sha256(raw).hexdigest()
            packages=inventory(raw,ecosystem)
            row["inventory"]=[{"name":n,"version":v} for n,v in packages]
            row["findings"]=[]
            for start in range(0,len(packages),100):
                batch=packages[start:start+100]
                result=json.loads(request("https://api.osv.dev/v1/querybatch",{"queries":[{"package":{"name":n,"ecosystem":"npm" if ecosystem=="Bun" else ecosystem},"version":v} for n,v in batch]}))
                if len(result["results"])!=len(batch):
                    raise ValueError("OSV response count mismatch")
                for (n,v),entry in zip(batch,result["results"]):
                    if entry.get("next_page_token"):
                        raise ValueError("OSV pagination requires review")
                    if entry.get("vulns"):
                        row["findings"].append({"name":n,"version":v,"advisories":entry["vulns"]})
            row["status"]="findings" if row["findings"] else "no_findings_in_queried_inventory"
        except Exception as exc:
            row["error"]=str(exc)
    report["uncovered"]=["COG skills and external tools","Karpathy gist revision/licence","vendored code and additional workspace manifests","transitive licences","runtime tests"]
    report["approval"]="blocked"
    for row in report["sources"]:
        row["integration_decision"]="reference_only_no_install_no_code_import"
        print(row["repo"],row["status"],row.get("error",""),"affected packages:",len(row.get("findings",[])))
    out=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else "sme-upstream-audit.json")
    out.write_text(json.dumps(report,indent=2)+"\n")
    components=[{"type":"library","name":item["name"],"version":item["version"],"bom-ref":row["repo"]+":"+item["name"]+"@"+item["version"]} for row in report["sources"] for item in row.get("inventory",[])]
    bom={"bomFormat":"CycloneDX","specVersion":"1.5","version":1,"metadata":{"properties":[{"name":"hsi:coverage","value":"partial registry inventory"}]},"components":components}
    out.with_suffix(".cdx.json").write_text(json.dumps(bom,indent=2)+"\n")
    print("Static audit report:",out)
    # Evidence collection is not dependency clearance. Strict mode remains fail-closed.
    if "--reference-only" in sys.argv[2:]:
        return 0 if all(r["status"] in ("blocked","findings","no_findings_in_queried_inventory") for r in report["sources"]) else 1
    return 1 if any(r["status"] in ("blocked","findings") for r in report["sources"]) else 0
if __name__=="__main__":
    sys.exit(main())
