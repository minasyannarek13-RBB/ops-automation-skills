import json, random, subprocess, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CLI=ROOT/"skills/single-action-receipt-check/scripts/check.py"
JS=ROOT/"docs/checker.js"
K=dict(run_id="r",action_id="a",target="staging",business_key="k")
def r(id="1",status="CONFIRMED",dest="A",**kw):
    return dict(dict(K,receipt_id=id,status=status,destination_id=dest,proof_type="DESTINATION_READBACK"),**kw)
class BrowserParity(unittest.TestCase):
    def test_parity(self):
        cases=[[],[r()],[r(),r()],[r(),r("2",dest="B")],[r(dest="B"),r()],[r(status="ACCEPTED")],[r(status="FAILED")],[r(status="FAILED"),r("2")],[r(run_id="old")],[r(proof_type="TOOL_SUCCESS")],[r(status=[])],[None],[r("ack","ACCEPTED"),r()],[r("ack","ACCEPTED","B"),r()]]
        rng=random.Random(127)
        pool=[r(),r("2",dest="B"),r("3","ACCEPTED"),r("4","FAILED"),r(run_id="old"),r(proof_type="TOOL_SUCCESS"),{"status":"FAILED"}]
        cases += [[rng.choice(pool) for _ in range(rng.randrange(0,6))] for _ in range(100)]
        data=[{"expected":K,"receipts":x} for x in cases]+[{},None,{"expected":{},"receipts":[]}]
        node="const c=require(process.argv[1]);let d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(d.map(c.check)))"
        actual=json.loads(subprocess.check_output(["node","-e",node,str(JS)],input=json.dumps(data),text=True))
        for i,(x,y) in enumerate(zip(data,actual)):
            with self.subTest(case=i):
                expected=json.loads(subprocess.check_output([sys.executable,str(CLI)],input=json.dumps(x),text=True))
                self.assertEqual(y,expected)
        self.assertEqual(len(actual),117)
    def test_invalid_json(self):
        node="const c=require(process.argv[1]);console.log(JSON.stringify([c.parse('{'),c.parse('x'.repeat(1000001))]))"
        self.assertEqual([x["verdict"] for x in json.loads(subprocess.check_output(["node","-e",node,str(JS)],text=True))],["UNKNOWN","UNKNOWN"])
if __name__=="__main__":unittest.main()
