"use strict";
const e=id=>document.getElementById(id);
let report=null;
const demo={provider:"Fictional Provider",game:"Fictional Game",version:"1.0",configuration:"demo-A",jurisdiction:"DEMO",mode:"base",source_type:"PROVIDER_DISCLOSURE",source_url:"https://example.invalid/disclosure",observed_on:"2026-11-24",reviewed_against_source:true,rtp_percent:"96.00"};
function sample(n){
 const a={...demo,record_id:"synthetic-1",source_ref:"Fictional document A"};
 const b={...demo,record_id:"synthetic-2",source_ref:"Fictional document B"};
 if(n==="conflict")b.rtp_percent="95.00";
 if(n==="missing")b.reviewed_against_source=false;
 if(n==="versions"){b.version="2.0";b.rtp_percent="95.00";}
 e("input").value=JSON.stringify({as_of:"2026-11-25",records:[a,b]},null,2);run();
}
function reset(){
 report=null;e("export").disabled=true;e("metrics").replaceChildren();e("findings").replaceChildren();e("output").textContent="";
}
function run(){
 reset();try{
  const raw=e("input").value;if(raw.length>2000000)throw Error("Input exceeds 2 million characters.");
  report=DisclosureAudit.audit(JSON.parse(raw));
  e("status").textContent=report.status.replaceAll("_"," ");
  for(const [label,value] of [["Supplied records",report.record_count],["Incomplete",report.unresolved_records],["Conflict scopes",report.conflict_scopes],["Duplicate ID scopes",report.duplicate_scopes]]){
   const d=document.createElement("div"),s=document.createElement("span"),b=document.createElement("strong");s.textContent=label;b.textContent=String(value);d.append(s,b);e("metrics").append(d);
  }
  for(const r of report.rows){const p=document.createElement("p");p.textContent=r.scope.game+" / "+r.scope.version+" / "+r.scope.configuration+": "+r.status.replaceAll("_"," ");e("findings").append(p)}
  for(const r of report.invalid){const p=document.createElement("p");p.textContent="Record "+r.row+": missing or invalid "+r.issues.join(", ");e("findings").append(p)}
  e("note").textContent=report.limits;e("output").textContent=JSON.stringify(report,null,2);e("export").disabled=false;
 }catch(err){e("status").textContent="INPUT REQUIRED";e("note").textContent=err.message}
}
document.querySelectorAll("[data-case]").forEach(b=>b.addEventListener("click",()=>sample(b.dataset.case)));
e("run").addEventListener("click",run);e("clear").addEventListener("click",()=>{e("input").value="";reset();e("status").textContent="Not checked";e("note").textContent="No source verification performed."});
e("input").addEventListener("input",()=>{reset();e("status").textContent="INPUT CHANGED — RECHECK";e("note").textContent="Run review again."});
e("export").addEventListener("click",()=>{if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="disclosure-evidence-review.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),500)});
for(const s of EvidenceSources){const d=document.createElement("article");d.className="source";const h=document.createElement("h3"),a=document.createElement("a"),date=document.createElement("small"),p=document.createElement("p");a.href=s.url;a.textContent=s.label;h.append(a);date.textContent=s.date;p.textContent=s.note;d.append(h,date,p);e("sources").append(d)}
sample("consistent");
