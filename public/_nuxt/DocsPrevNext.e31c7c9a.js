import{a as y,u as t,o as a,i as r,c as u,w as h,m,k as p,t as i,l,a1 as f,L as k,M as g,x as w}from"./entry.21b9ec1a.js";const N={key:0,class:"docs-prev-next"},C={class:"wrapper"},B={key:0,class:"directory"},D={class:"title"},P={key:1},V={class:"wrapper"},F={key:0,class:"directory"},I={class:"title"},L=y({__name:"DocsPrevNext",setup(j){const{prev:e,next:s,navigation:v}=useContent(),{navDirFromPath:x}=useContentHelpers(),_=d=>{var n;const c=x(d._path,v.value||[]);if(c&&c[0])return((n=c[0])==null?void 0:n._path)??"";{const o=d.split("/");return(o.length>1?o[o.length-2]:"").split("-").map(f).join(" ")}};return(d,c)=>{const n=k,o=g;return t(e)||t(s)?(a(),r("div",N,[t(e)&&t(e)._path?(a(),u(o,{key:0,to:t(e)._path,class:"prev"},{default:h(()=>[m(n,{name:"heroicons-outline:arrow-sm-left",class:"icon"}),p("div",C,[_(t(e)._path)?(a(),r("span",B,i(_(t(e)._path)),1)):l("",!0),p("span",D,i(t(e).title),1)])]),_:1},8,["to"])):(a(),r("span",P)),t(s)&&t(s)._path?(a(),u(o,{key:2,to:t(s)._path,class:"next"},{default:h(()=>[p("div",V,[_(t(s)._path)?(a(),r("span",F,i(_(t(s)._path)),1)):l("",!0),p("span",I,i(t(s).title),1)]),m(n,{name:"heroicons-outline:arrow-sm-right",class:"icon"})]),_:1},8,["to"])):l("",!0)])):l("",!0)}}});const M=w(L,[["__scopeId","data-v-30e1aea1"]]);export{M as default};
