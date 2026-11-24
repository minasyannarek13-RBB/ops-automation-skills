"use strict";
const el=id=>document.getElementById(id);
const expected={run_id:"run-demo",action_id:"save-demo",target:"staging",business_key:"record-1"};
const confirmed=(receipt_id,destination_id)=>({...expected,receipt_id,status:"CONFIRMED",destination_id,proof_type:"DESTINATION_READBACK"});
const samples={
 accepted:[{...expected,receipt_id:"ack-1",status:"ACCEPTED"}],
 verified:[confirmed("readback-1","record-A")],
 duplicate:[confirmed("readback-1","record-A"),confirmed("readback-2","record-B")],
 failed:[{...expected,receipt_id:"failed-1",status:"FAILED"}]
};
function show(r){
 el("verdict").textContent=r.verdict;
 el("verdict").className=r.verdict.startsWith("VERIFIED")?"result-verified":"result-warning";
 el("reason").textContent=r.reason;
 el("dest").textContent=r.verified_destinations?.length??"—";
 el("excluded").textContent=r.excluded_receipts??"—";
 el("next").textContent=r.next_check??"Correct the input and recheck. No action performed.";
 el("output").textContent=JSON.stringify(r,null,2);
}
function run(){show(ReceiptChecker.parse(el("input").value))}
function sample(n){el("input").value=JSON.stringify({expected,receipts:samples[n]},null,2);run()}
document.querySelectorAll("[data-example]").forEach(b=>b.addEventListener("click",()=>sample(b.dataset.example)));
el("run").addEventListener("click",run);
el("clear").addEventListener("click",()=>{el("input").value="";show({verdict:"Not checked",reason:"Supply redacted JSON or select a sample."});el("input").focus()});
sample("accepted");
