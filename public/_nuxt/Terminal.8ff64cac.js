import{u as m}from"./index.2ad7adae.js";import{a as v,o as s,i as o,u as i,l as _,k as e,F as h,a2 as y,s as f,v as k,t as C,x as b}from"./entry.21b9ec1a.js";const c=t=>(f("data-v-63eb7158"),t=t(),k(),t),g={key:0,class:"copied"},x=c(()=>e("div",{class:"scrim"},null,-1)),S=c(()=>e("div",{class:"content"}," Copied! ",-1)),w=[x,S],B=c(()=>e("div",{class:"header"},[e("div",{class:"controls"},[e("div"),e("div"),e("div")]),e("div",{class:"title"}," Bash ")],-1)),I={class:"window"},T=c(()=>e("span",{class:"sign"},"$",-1)),F={class:"content"},N={key:1,class:"prompt"},V=v({__name:"Terminal",props:{content:{type:[Array,String],required:!0}},setup(t){const a=t,{copy:p}=m(),n=ref("init"),r=computed(()=>typeof a.content=="string"?[a.content]:a.content),l=u=>{p(r.value.join(`
`)).then(()=>{n.value="copied",setTimeout(()=>{n.value="init"},1e3)}).catch(()=>{console.warn("Couldn't copy to clipboard!")})};return(u,j)=>(s(),o("div",{class:"terminal",onClick:l},[i(n)==="copied"?(s(),o("div",g,w)):_("",!0),B,e("div",I,[(s(!0),o(h,null,y(i(r),d=>(s(),o("span",{key:d,class:"line"},[T,e("span",F,C(d),1)]))),128))]),i(n)!=="copied"?(s(),o("div",N," Click to copy ")):_("",!0)]))}});const D=b(V,[["__scopeId","data-v-63eb7158"]]);export{D as default};
