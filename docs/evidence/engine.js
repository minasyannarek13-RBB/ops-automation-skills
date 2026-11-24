(function(root){
"use strict";
const fields=["provider","game","version","configuration","jurisdiction","mode"];
const str=x=>typeof x==="string"&&x.trim().length>0&&x.length<=250;
const obj=x=>x&&typeof x==="object"&&!Array.isArray(x);
function date(s){if(typeof s!=="string"||!/^20\d{2}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s}
function url(s){try{const u=new URL(s);return u.protocol==="https:"&&!u.username&&!u.password&&u.hostname.includes(".")&&s.length<=2000}catch{return false}}
function rtp(s){if(typeof s!=="string"||!/^\d{1,3}(\.\d{1,4})?$/.test(s))return null;const [a,b=""]=s.split(".");const n=Number(a)*10000+Number(b.padEnd(4,"0"));return n<=1000000?n:null}
function audit(input){
 if(!obj(input)||!Array.isArray(input.records)||!date(input.as_of)||input.records.length===0||input.records.length>1000)throw Error("Supply 1–1,000 records and a valid review date.");
 const groups=new Map(),invalid=[],ids=new Map();
 for(const [i,r] of input.records.entries()){
  const missing=[];
  if(!obj(r)){invalid.push({row:i+1,issues:["Not an object"]});continue}
  for(const k of [...fields,"record_id","source_ref"])if(!str(r[k]))missing.push(k);
  if(!url(r.source_url))missing.push("source_url");
  if(!["PROVIDER_DISCLOSURE","OPERATOR_DISCLOSURE","TEST_CERTIFICATE"].includes(r.source_type))missing.push("source_type");
  if(!date(r.observed_on)||r.observed_on>input.as_of)missing.push("observed_on");
  const n=rtp(r.rtp_percent);if(n===null)missing.push("rtp_percent");
  if(r.reviewed_against_source!==true)missing.push("reviewed_against_source");
  if(missing.length){invalid.push({row:i+1,record_id:str(r.record_id)?r.record_id:null,issues:missing});continue}
  const scope=JSON.stringify(fields.map(k=>r[k]));
  if(!groups.has(scope))groups.set(scope,{scope:Object.fromEntries(fields.map(k=>[k,r[k]])),records:[],values:new Set(),duplicate:false});
  const g=groups.get(scope);g.records.push({record_id:r.record_id,source_ref:r.source_ref,source_url:r.source_url,source_type:r.source_type,observed_on:r.observed_on,rtp_percent:r.rtp_percent});
  g.values.add(n);
  if(ids.has(r.record_id)){g.duplicate=true;ids.get(r.record_id).duplicate=true}else ids.set(r.record_id,g);
 }
 const rows=[...groups.values()].map(g=>({scope:g.scope,status:g.duplicate?"DUPLICATE_ID":g.values.size>1?"CONFLICT":g.records.length===1?"SINGLE_SOURCE":"CONSISTENT_SUPPLIED_RECORDS",records:g.records}));
 const status=invalid.length||rows.some(r=>r.status==="DUPLICATE_ID"||r.status==="CONFLICT")?"REVIEW_REQUIRED":"STRUCTURE_CHECKED";
 return {version:"0.2.0",as_of:input.as_of,status,record_count:input.records.length,valid_records:input.records.length-invalid.length,unresolved_records:invalid.length,conflict_scopes:rows.filter(r=>r.status==="CONFLICT").length,duplicate_scopes:rows.filter(r=>r.status==="DUPLICATE_ID").length,rows,invalid,limits:"Checks metadata and consistency of supplied assertions only. Does not fetch sources, authenticate certificates, validate regulatory compliance or rank games. A matching disclosure is not a prediction of play."};
}
const api={audit};if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.DisclosureAudit=api;
})(globalThis);
