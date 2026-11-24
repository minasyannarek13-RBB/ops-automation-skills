import json
import sys

KEYS = ("run_id", "action_id", "target", "business_key")
STATES = {"ACCEPTED", "CONFIRMED", "FAILED"}

def check(data):
    if not isinstance(data, dict) or not isinstance(data.get("expected"), dict) or not isinstance(data.get("receipts"), list):
        return {"verdict": "UNKNOWN", "reason": "Invalid input shape"}
    exp = data["expected"]
    if any(not isinstance(exp.get(k), str) or not exp[k].strip() for k in KEYS):
        return {"verdict": "UNKNOWN", "reason": "Missing expected identity"}
    if len(data["receipts"]) > 1000:
        return {"verdict": "UNKNOWN", "reason": "Input limit exceeded"}
    seen = {}
    excluded = 0
    conflict = False
    incomplete = False
    destinations = set()
    unresolved = False
    failed = False
    accepted = []
    for r in data["receipts"]:
        if not isinstance(r, dict) or any(not isinstance(r.get(k),str) or not r[k].strip() for k in KEYS):
            incomplete = True
            continue
        if any(r[k] != exp[k] for k in KEYS):
            excluded += 1
            continue
        rid = r.get("receipt_id")
        status = r.get("status")
        if not isinstance(rid, str) or not rid.strip() or not isinstance(status,str) or status not in STATES:
            incomplete = True
            continue
        fingerprint = json.dumps(r, sort_keys=True, ensure_ascii=True)
        if rid in seen:
            if seen[rid] != fingerprint:
                conflict = True
            continue
        seen[rid] = fingerprint
        dest = r.get("destination_id")
        if status == "CONFIRMED":
            if r.get("proof_type") == "DESTINATION_READBACK" and isinstance(dest,str) and dest.strip():
                destinations.add(dest)
            else:
                incomplete = True
        elif status == "ACCEPTED":
            accepted.append(dest if isinstance(dest,str) else None)
        else:
            failed = True
    unresolved = any(x not in destinations for x in accepted)
    if conflict:
        verdict, reason = "UNKNOWN", "Conflicting receipt ID"
    elif len(destinations) > 1:
        verdict, reason = "DUPLICATE", "Distinct matching destination records"
    elif incomplete or unresolved or (failed and destinations):
        verdict, reason = "UNKNOWN", "Incomplete or unresolved receipt evidence"
    elif len(destinations) == 1:
        verdict, reason = "VERIFIED_FOR_SUPPLIED_EVIDENCE", "Exactly one matching destination readback"
    elif failed and not accepted:
        verdict, reason = "FAILED_ATTEMPT", "Explicit failed attempt; absence of side effect not established"
    else:
        verdict, reason = "UNKNOWN", "No confirmed destination readback"
    return {"verdict": verdict, "reason": reason, "receipt_ids": sorted(seen), "excluded_receipts": excluded, "verified_destinations": sorted(destinations), "next_check": "Retain scoped evidence; no automatic action" if verdict.startswith("VERIFIED") else "Reconcile destination before any authorized retry"}

if __name__ == "__main__":
    try:
        raw = sys.stdin.read(1000001)
        result = check(json.loads(raw)) if len(raw) <= 1000000 else {"verdict":"UNKNOWN","reason":"Input limit exceeded"}
    except (ValueError, TypeError):
        result = {"verdict":"UNKNOWN","reason":"Invalid JSON"}
    print(json.dumps(result, indent=2, sort_keys=True))
