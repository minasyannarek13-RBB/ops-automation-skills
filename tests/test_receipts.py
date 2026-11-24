import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "skills/single-action-receipt-check"
EXAMPLE = json.loads((ROOT / "examples/accepted-only.json").read_text())
EXPECTED = EXAMPLE["expected"]

def receipt(rid="r1", status="CONFIRMED", dest="d1", **kw):
    return dict(dict(EXPECTED, receipt_id=rid, status=status, destination_id=dest,
                     proof_type="DESTINATION_READBACK"), **kw)

class ReceiptTests(unittest.TestCase):
    def test_cases(self):
        r = receipt()
        cases = [
            ("accepted only", EXAMPLE["receipts"], "UNKNOWN"),
            ("confirmed", [r], "VERIFIED_FOR_SUPPLIED_EVIDENCE"),
            ("same receipt", [r, r], "VERIFIED_FOR_SUPPLIED_EVIDENCE"),
            ("duplicate destinations", [r, receipt("r2", dest="d2")], "DUPLICATE"),
            ("stale", [receipt(run_id="older")], "UNKNOWN"),
            ("conflicting id", [r, receipt(dest="d2")], "UNKNOWN"),
            ("failed", [receipt(status="FAILED")], "FAILED_ATTEMPT"),
            ("matched acceptance", [receipt("ack", "ACCEPTED"), r], "VERIFIED_FOR_SUPPLIED_EVIDENCE"),
            ("unresolved acceptance", [receipt("ack", "ACCEPTED", "d2"), r], "UNKNOWN"),
            ("unsupported proof", [receipt(proof_type="TOOL_SUCCESS")], "UNKNOWN"),
            ("failed plus confirmed", [receipt("f", "FAILED"), r], "UNKNOWN"),
            ("invalid status", [receipt(status=[])], "UNKNOWN"),
            ("missing identity", [{"status": "CONFIRMED"}], "UNKNOWN"),
            ("none", [], "UNKNOWN"),
        ]
        for name, rs, expected in cases:
            with self.subTest(case=name):
                out = subprocess.check_output([sys.executable, str(ROOT / "scripts/check.py")],
                    input=json.dumps({"expected": EXPECTED, "receipts": rs}), text=True)
                self.assertEqual(json.loads(out)["verdict"], expected)

if __name__ == "__main__":
    unittest.main()
