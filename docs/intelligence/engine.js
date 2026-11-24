(function(root){
"use strict";
const currencies=new Set(["USD","EUR","GBP"]);
const fail=m=>{throw new Error(m)};
function units(v,name,negative=false,places=2){
 if(typeof v!=="string"||!(/^-?\d{1,12}(\.\d{1,4})?$/).test(v))fail(name+": enter a decimal value");
 const neg=v.startsWith("-"),s=neg?v.slice(1):v,[a,b=""]=s.split(".");
 if((neg&&!negative)||b.length>places)fail(name+": unsupported sign or precision");
 const x=BigInt(a)*10n**BigInt(places)+BigInt(b.padEnd(places,"0")||"0");
 if(x>100000000000000n)fail(name+": value exceeds supported range");
 return neg?-x:x;
}
function fmt(x){const sign=x<0n?"-":"";x=x<0n?-x:x;return sign+(x/100n)+"."+(x%100n).toString().padStart(2,"0")}
function round(n,d){return n<0n?-round(-n,d):(n+d/2n)/d}
function identity(d){
 if(!d||typeof d!=="object"||!currencies.has(d.currency))fail("Select USD, EUR or GBP");
 if(typeof d.period!=="string"||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(d.period))fail("Enter a valid monthly period");
 return {currency:d.currency,period:d.period};
}
function settlement(d){
 const id=identity(d);
 if(!["GGR","NGR"].includes(d.basis))fail("Explicit contract basis required");
 if(!["SIGNED","FLOOR_ZERO"].includes(d.negative_policy))fail("Explicit negative-base policy required");
 const wagers=units(d.wagers,"Aggregate stakes"),payouts=units(d.payouts,"Aggregate payouts"),deductions=units(d.deductions,"Approved deductions");
 const rate=units(d.rate,"Contract rate",false,4);
 if(rate>1000000n)fail("Rate must be between 0 and 100%");
 const fixed=units(d.fixed,"Fixed fee"),adjustment=units(d.adjustment,"Signed adjustment",true),invoice=units(d.invoice,"Pre-tax invoice",true);
 const ggr=wagers-payouts,ngr=ggr-deductions,raw=d.basis==="GGR"?ggr:ngr;
 const base=d.negative_policy==="FLOOR_ZERO"&&raw<0n?0n:raw;
 const expected=round(base*rate+ (fixed+adjustment)*1000000n,1000000n),delta=invoice-expected;
 return {...id,source_status:"SUPPLIED_UNVERIFIED",inputs:{...d},status:delta===0n?"MATCH":"REVIEW_VARIANCE",basis:d.basis,ggr:fmt(ggr),ngr:fmt(ngr),charge_base:fmt(base),expected_fee:fmt(expected),invoice:fmt(invoice),variance:fmt(delta),scope:"Supplied historical aggregates only; pre-tax, one monthly flat-rate contract, final half-up rounding. No proof of recoverable money."};
}
function studio(d){
 const id=identity(d),revenue=units(d.revenue,"Recognized service revenue",true),staff=units(d.staff,"Staff costs"),facilities=units(d.facilities,"Facilities"),tech=units(d.tech,"Technology"),other=units(d.other,"Other operating costs");
 const costs=staff+facilities+tech+other,contribution=revenue-costs;
 const hours=units(d.hours,"Delivered table-hours",false,2);
 const margin=revenue>0n?fmt(round(contribution*10000n,revenue)) : null;
 return {...id,source_status:"SUPPLIED_UNVERIFIED",inputs:{...d},status:"DESCRIPTIVE_REVIEW",revenue:fmt(revenue),costs:fmt(costs),contribution:fmt(contribution),margin_percent:margin,cost_per_delivered_hour:hours>0n?fmt(round(costs*100n,hours)):null,revenue_per_delivered_hour:hours>0n?fmt(round(revenue*100n,hours)):null,scope:"Historical monthly studio service P&L, supplied figures only. Not operator GGR, not a full accounting P&L, no staffing or wagering recommendations."};
}
const api={settlement,studio};if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.LabEngine=api;
})(globalThis);
