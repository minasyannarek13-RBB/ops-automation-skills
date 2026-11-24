import json,random,subprocess,unittest
from decimal import Decimal as D,ROUND_HALF_UP
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def fmt(x):return str(x.quantize(D(".01"),rounding=ROUND_HALF_UP))
class TestCasinoMath(unittest.TestCase):
 def test_arithmetic(self):
  rng=random.Random(2026)
  cases=[["1000","96"],["0","0"],["1","100"],["0.01","50"],["10","99.9999"]]+[[str(D(rng.randrange(1000000))/100),str(D(rng.randrange(1000001))/10000)] for _ in range(200)]
  js="const m=require(process.argv[1]),d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(d.map(([a,p])=>[m.rtp(a,p),m.blackjack(a)])))"
  out=json.loads(subprocess.check_output(["node","-e",js,str(ROOT/"docs/casino-math/math.js")],input=json.dumps(cases),text=True))
  for (a,p),(r,b) in zip(cases,out):
   a=D(a);p=D(p);ret=D(fmt(a*p/100));x=D(fmt(a*D("1.5")));y=D(fmt(a*D("1.2")))
   self.assertEqual(r,dict(turnover=fmt(a),expected_return=fmt(ret),expected_cost=fmt(a-ret)))
   self.assertEqual(b,dict(stake=fmt(a),profit_3_2=fmt(x),profit_6_5=fmt(y),difference=fmt(x-y)))
 def test_invalid(self):
  js="const m=require(process.argv[1]);let n=0;for(const [a,p] of [['-1','96'],['1','101'],['1e3','96'],['1.001','96'],['1','NaN'],['1','96.12345'],['','96']]){try{m.rtp(a,p)}catch(e){n++}}console.log(n)"
  self.assertEqual(subprocess.check_output(["node","-e",js,str(ROOT/"docs/casino-math/math.js")],text=True).strip(),"7")
