"use strict";
const e=id=>document.getElementById(id);
const v=id=>e(id).value.trim();
const reports={};
function show(prefix,fn,labels){
 const result=e(prefix+"-result");result.replaceChildren();reports[prefix]=null;
 try{
  const r=fn();reports[prefix]=r;
  e(prefix+"-status").textContent=r.status.replaceAll("_"," ");
  for(const [k,label] of labels){
   const box=document.createElement("div"),name=document.createElement("span"),value=document.createElement("strong");
   name.textContent=label;value.textContent=r[k]===null?"N/A":r[k]+(k==="margin_percent"?"%":" "+r.currency);
   box.append(name,value);result.append(box);
  }
  e(prefix+"-note").textContent=r.scope;e(prefix+"-export").disabled=false;
 }catch(err){e(prefix+"-status").textContent="INPUT REQUIRED";e(prefix+"-note").textContent=err.message;e(prefix+"-export").disabled=true;}
}
function settlement(){show("s",()=>LabEngine.settlement({period:v("s-period"),currency:v("s-currency"),wagers:v("s-wagers"),payouts:v("s-payouts"),deductions:v("s-deductions"),rate:v("s-rate"),basis:v("s-basis"),negative_policy:v("s-policy"),fixed:v("s-fixed"),adjustment:v("s-adjustment"),invoice:v("s-invoice")}),[["ggr","GGR"],["ngr","NGR"],["charge_base","Contract base"],["expected_fee","Expected fee"],["invoice","Invoice"],["variance","Signed difference"]]);}
function studio(){show("o",()=>LabEngine.studio({period:v("o-period"),currency:v("o-currency"),revenue:v("o-revenue"),staff:v("o-staff"),facilities:v("o-facilities"),tech:v("o-tech"),other:v("o-other"),hours:v("o-hours")}),[["revenue","Service revenue"],["costs","Operating costs"],["contribution","Contribution"],["margin_percent","Contribution margin"],["cost_per_delivered_hour","Cost / delivered hour"],["revenue_per_delivered_hour","Revenue / delivered hour"]]);}
for(const [p,run] of [["s",settlement],["o",studio]]){
 e(p+"-run").addEventListener("click",run);
 e(p+"-export").addEventListener("click",()=>{
  if(!reports[p])return;
  const blob=new Blob([JSON.stringify({generated_at:new Date().toISOString(),tool_version:"0.1.0",...reports[p]},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="igaming-"+(p==="s"?"settlement":"studio")+"-review.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
 });
 const parent=e(p+"-run").parentElement;
 parent.querySelectorAll("input,select").forEach(x=>x.addEventListener("input",()=>{reports[p]=null;e(p+"-export").disabled=true;e(p+"-status").textContent="INPUT CHANGED — RECHECK";e(p+"-result").replaceChildren();e(p+"-note").textContent="Run the review again."}));
 run();
}
