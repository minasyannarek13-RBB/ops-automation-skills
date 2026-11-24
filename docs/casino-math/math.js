(function(root){
"use strict";
function scaled(s,places,max){
 if(typeof s!=="string"||!/^\d{1,10}(\.\d{1,4})?$/.test(s))throw Error("Enter a nonnegative decimal number.");
 const [a,b=""]=s.split(".");
 if(b.length>places)throw Error("Too many decimal places.");
 const x=BigInt(a)*10n**BigInt(places)+BigInt(b.padEnd(places,"0")||"0");
 if(x>max)throw Error("Value exceeds supported range.");
 return x;
}
function round(n,d){return (n+d/2n)/d}
function fmt(n){return (n/100n).toString()+"."+(n%100n).toString().padStart(2,"0")}
function rtp(amount,percent){
 const a=scaled(amount,2,100000000000n), p=scaled(percent,4,1000000n);
 const returned=round(a*p,1000000n);
 return {turnover:fmt(a),expected_return:fmt(returned),expected_cost:fmt(a-returned)};
}
function blackjack(amount){
 const a=scaled(amount,2,100000000000n);
 const x=round(a*3n,2n),y=round(a*6n,5n);
 return {stake:fmt(a),profit_3_2:fmt(x),profit_6_5:fmt(y),difference:fmt(x-y)};
}
const api={rtp,blackjack};if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.CasinoMath=api;
})(globalThis);
