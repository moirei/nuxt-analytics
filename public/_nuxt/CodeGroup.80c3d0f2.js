import _ from"./TabsHeader.5e52ec8d.js";import{x as o}from"./entry.21b9ec1a.js";const s=(t,d)=>t.type&&t.type.tag&&t.type.tag===d,v=defineComponent({data(){return{activeTabIndex:0,counter:0}},render(){var c,i;const t=((i=(c=this.$slots)==null?void 0:c.default)==null?void 0:i.call(c))||[],d=t.map((e,r)=>{var a,n,p;return{label:((a=e==null?void 0:e.props)==null?void 0:a.filename)||((n=e==null?void 0:e.props)==null?void 0:n.label)||`${r}`,active:((p=e==null?void 0:e.props)==null?void 0:p.active)||!1,component:e}});return h("div",{class:{"code-group":!0,"first-tab":this.activeTabIndex===0}},[h(_,{ref:"tabs-header",activeTabIndex:this.activeTabIndex,tabs:d,"onUpdate:activeTabIndex":e=>this.activeTabIndex=e}),h("div",{class:"code-group-content",text:this.activeTabIndex},t.map((e,r)=>{var a,n;return h("div",{style:{display:r===this.activeTabIndex?"block":"none"},class:{"":!s(e,"code")}},[s(e,"code")?e:h("div",{class:{"preview-canvas":!0}},[((n=(a=e.children)==null?void 0:a.default)==null?void 0:n.call(a))||e.children])])}))])}});const x=o(v,[["__scopeId","data-v-3d961ac0"]]);export{x as default};
