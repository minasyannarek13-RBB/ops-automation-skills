(function(root){
"use strict";
const keys=["run_id","action_id","target","business_key"], states=new Set(["ACCEPTED","CONFIRMED","FAILED"]);
const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const str=x=>typeof x==="string"&&x.trim().length>0;
const identity=x=>obj(x)&&keys.every(k=>str(x[k]));
const unknown=reason=>({verdict:"UNKNOWN",reason});
function canonical(x){
 if(Array.isArray(x))return "["+x.map(canonical).join(",")+"]";
 if(obj(x))return "{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+canonical(x[k])).join(",")+"}";
 if(typeof x==="number"&&!Number.isSafeInteger(x))throw Error("Use strings for exact numeric metadata");
 return JSON.stringify(x);
}
function check(d){
 if(!obj(d)||!obj(d.expected)||!Array.isArray(d.receipts))return unknown("Invalid input shape");
 if(!identity(d.expected))return unknown("Missing expected identity");
 if(d.receipts.length>1000)return unknown("Input limit exceeded");
 const seen=new Map(), dest=new Set(), accepted=[];
 let excluded=0,conflict=false,incomplete=false,failed=false;
 for(const r of d.receipts){
  if(!identity(r)){incomplete=true;continue;}
  if(keys.some(k=>r[k]!==d.expected[k])){excluded++;continue;}
  if(!str(r.receipt_id)||!states.has(r.status)){incomplete=true;continue;}
  let fingerprint;try{fingerprint=canonical(r)}catch(e){return unknown(e.message)}
  if(seen.has(r.receipt_id)){if(seen.get(r.receipt_id)!==fingerprint)conflict=true;continue;}
  seen.set(r.receipt_id,fingerprint);
  if(r.status==="CONFIRMED"){
   if(r.proof_type==="DESTINATION_READBACK"&&str(r.destination_id))dest.add(r.destination_id);else incomplete=true;
  }else if(r.status==="ACCEPTED"){accepted.push(typeof r.destination_id==="string"?r.destination_id:null);}
  else failed=true;
 }
 let verdict,reason;
 if(conflict){verdict="UNKNOWN";reason="Conflicting receipt ID";}
 else if(dest.size>1){verdict="DUPLICATE";reason="Distinct matching destination records";}
 else if(incomplete||accepted.some(x=>!dest.has(x))||(failed&&dest.size)){verdict="UNKNOWN";reason="Incomplete or unresolved receipt evidence";}
 else if(dest.size===1){verdict="VERIFIED_FOR_SUPPLIED_EVIDENCE";reason="Exactly one matching destination readback";}
 else if(failed&&!accepted.length){verdict="FAILED_ATTEMPT";reason="Explicit failed attempt; absence of side effect not established";}
 else{verdict="UNKNOWN";reason="No confirmed destination readback";}
 return {verdict,reason,receipt_ids:[...seen.keys()].sort(),excluded_receipts:excluded,verified_destinations:[...dest].sort(),next_check:verdict.startsWith("VERIFIED")?"Retain scoped evidence; no automatic action":"Reconcile destination before any authorized retry"};
}
function parse(raw){
 if(typeof raw!=="string"||raw.length>1000000)return unknown("Input limit exceeded");
 try{return check(JSON.parse(raw))}catch(e){return unknown("Invalid JSON or unsupported nesting")}
}
const api={check,parse};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.ReceiptChecker=api;
})(typeof globalThis==="undefined"?this:globalThis);
