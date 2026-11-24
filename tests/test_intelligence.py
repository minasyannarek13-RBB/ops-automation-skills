import json,random,subprocess,unittest
from decimal import Decimal as D,ROUND_HALF_UP
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def q(x):return str(x.quantize(D(".01"),rounding=ROUND_HALF_UP))
def node(code,data=None):
 return json.loads(subprocess.check_output(["node","-e","const m=require(process.argv[1]);"+code,str(ROOT/"docs/intelligence/engine.js")],input=json.dumps(data),text=True))
class LabTests(unittest.TestCase):
 def test_settlement(self):
  rng=random.Random(127);cases=[]
  for i in range(250):
   cases.append(dict(currency="USD",period="2026-10",basis=rng.choice(["GGR","NGR"]),negative_policy=rng.choice(["SIGNED","FLOOR_ZERO"]),wagers=str(D(rng.randrange(1000000))/100),payouts=str(D(rng.randrange(1000000))/100),deductions=str(D(rng.randrange(10000))/100),rate=str(D(rng.randrange(1000001))/10000),fixed="100",adjustment="-50",invoice="200"))
  out=node("const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(d.map(m.settlement)))",cases)
  self.assertEqual(len(out),250)
  for d,r in zip(cases,out):
   g=D(d["wagers"])-D(d["payouts"]);n=g-D(d["deductions"]);b=g if d["basis"]=="GGR" else n
   if d["negative_policy"]=="FLOOR_ZERO":b=max(D(0),b)
   ex=D(q(b*D(d["rate"])/100+50))
   self.assertEqual((r["ggr"],r["ngr"],r["charge_base"],r["expected_fee"],r["variance"]),(q(g),q(n),q(b),q(ex),q(D(200)-ex)))
 def test_studio(self):
  rng=random.Random(19);cases=[]
  for i in range(250):
   cases.append(dict(currency="EUR",period="2026-10",revenue=str(D(rng.randrange(-10000,1000000))/100),staff=str(D(rng.randrange(100000))/100),facilities="30",tech="40",other="50",hours=str(D(rng.randrange(0,10000))/100)))
  cases.append(dict(currency="USD",period="2026-10",revenue="0",staff="0",facilities="0",tech="0",other="0",hours="0"))
  out=node("const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(d.map(m.studio)))",cases)
  self.assertEqual(len(out),251)
  for d,r in zip(cases,out):
   rev=D(d["revenue"]);cost=sum(D(d[k]) for k in ("staff","facilities","tech","other"));c=rev-cost;h=D(d["hours"])
   self.assertEqual((r["costs"],r["contribution"],r["margin_percent"],r["cost_per_delivered_hour"],r["revenue_per_delivered_hour"]),(q(cost),q(c),q(c/rev*100) if rev>0 else None,q(cost/h) if h>0 else None,q(rev/h) if h>0 else None))
 def test_invalid(self):
  d=dict(currency="USD",period="2026-10",basis="NGR",negative_policy="SIGNED",wagers="1000",payouts="500",deductions="0",rate="12",fixed="0",adjustment="0",invoice="60")
  cases=[dict(d,**x) for x in [dict(currency="JPY"),dict(period="2026-13"),dict(basis="OTHER"),dict(negative_policy=""),dict(rate="101"),dict(rate="1e2"),dict(wagers="-1"),dict(payouts="0.001"),dict(invoice=""),dict(deductions="NaN"),dict(fixed="10000000000000")]]
  self.assertEqual(node("const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(d.map(x=>{try{m.settlement(x);return false}catch(e){return true}})))",cases),[True]*len(cases))
