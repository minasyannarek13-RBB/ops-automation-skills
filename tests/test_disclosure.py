import json,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=dict(provider="Demo",game="Fictional",version="1",configuration="A",jurisdiction="DEMO",mode="base",record_id="r1",source_ref="fictional",source_type="PROVIDER_DISCLOSURE",source_url="https://example.invalid/data",observed_on="2026-11-24",reviewed_against_source=True,rtp_percent="96.00")
def r(**kw):return dict(BASE,**kw)
def run(records,as_of="2026-11-25"):
 js="const m=require(process.argv[1]);const d=JSON.parse(require('fs').readFileSync(0,'utf8'));try{console.log(JSON.stringify(m.audit(d)))}catch(e){console.log(JSON.stringify({error:e.message}))}"
 return json.loads(subprocess.check_output(["node","-e",js,str(ROOT/"docs/evidence/engine.js")],input=json.dumps(dict(records=records,as_of=as_of)),text=True))
class DisclosureTests(unittest.TestCase):
 def test_single(self):self.assertEqual(run([r()])["rows"][0]["status"],"SINGLE_SOURCE")
 def test_equal(self):self.assertEqual(run([r(),r(record_id="r2",rtp_percent="96")])["rows"][0]["status"],"CONSISTENT_SUPPLIED_RECORDS")
 def test_conflict(self):self.assertEqual(run([r(),r(record_id="r2",rtp_percent="95")])["conflict_scopes"],1)
 def test_versions(self):
  x=run([r(),r(record_id="r2",version="2",rtp_percent="95")]);self.assertEqual(len(x["rows"]),2);self.assertEqual(x["conflict_scopes"],0)
 def test_duplicate(self):self.assertEqual(run([r(),r()])["duplicate_scopes"],1)
 def test_cross_scope_id(self):self.assertEqual(run([r(),r(version="2")])["duplicate_scopes"],2)
 def test_invalid_metadata(self):
  for x in [dict(source_url="javascript:alert(1)"),dict(source_url="https://user:secret@example.invalid"),dict(reviewed_against_source=False),dict(observed_on="2026-02-30"),dict(observed_on="2026-12-01"),dict(source_type="BLOG"),dict(version=""),dict(rtp_percent="101"),dict(rtp_percent="96.00001"),dict(rtp_percent=96),dict(source_ref="")]:
   with self.subTest(x=x):self.assertEqual(run([r(**x)])["unresolved_records"],1)
 def test_limits(self):
  for records,date in [([],"2026-11-25"),([r()],"2026-02-30"),([r()]*1001,"2026-11-25")]:self.assertIn("error",run(records,date))
