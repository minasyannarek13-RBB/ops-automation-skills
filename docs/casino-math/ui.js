"use strict";
const e=id=>document.getElementById(id);
function rtp(){try{const x=CasinoMath.rtp(e("turnover").value.trim(),e("rtp").value.trim());e("ret").textContent=x.expected_return;e("cost").textContent=x.expected_cost;e("rtp-msg").textContent="Theoretical long-run arithmetic only. Actual outcomes vary."}catch(err){e("ret").textContent=e("cost").textContent="—";e("rtp-msg").textContent=err.message}}
function bj(){try{const x=CasinoMath.blackjack(e("stake").value.trim());e("p32").textContent=x.profit_3_2;e("p65").textContent=x.profit_6_5;e("diff").textContent=x.difference;e("bj-msg").textContent="Conditional natural blackjack profit only; no forecast."}catch(err){e("p32").textContent=e("p65").textContent=e("diff").textContent="—";e("bj-msg").textContent=err.message}}
e("rtp-run").addEventListener("click",rtp);e("bj-run").addEventListener("click",bj);rtp();bj();
