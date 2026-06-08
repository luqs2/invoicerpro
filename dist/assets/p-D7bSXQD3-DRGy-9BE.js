import{as as n,at as o,au as r,av as i,aw as m}from"./index-B97arZqZ.js";/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const d=()=>{const e=window;e.addEventListener("statusTap",()=>{n(()=>{const s=document.elementFromPoint(e.innerWidth/2,e.innerHeight/2);if(!s)return;const t=o(s);t&&new Promise(a=>r(t,a)).then(()=>{i(async()=>{t.style.setProperty("--overflow","hidden"),await m(t,300),t.style.removeProperty("--overflow")})})})})};export{d as startStatusTap};
