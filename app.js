
const KEY="anchanto_rfp_survey_v1";
const STAGES=[
  {id:"warehouse",title:"Warehouse Setup"},
  {id:"customers",title:"Customers"},
  {id:"users",title:"Users & Workforce"},
  {id:"inventory",title:"Inventory & Products"},
  {id:"inbound",title:"Inbound"},
  {id:"outbound",title:"Outbound"},
  {id:"integrations",title:"Integrations"},
  {id:"goals",title:"Challenges & Goals"},
  {id:"review",title:"Review"}
];

let state=load();
let view={page:"dashboard",id:null,stage:0};

function load(){try{return JSON.parse(localStorage.getItem(KEY))||{discoveries:[]}}catch{return{discoveries:[]}}}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1700)}
function now(){return new Date().toISOString()}
function current(){return state.discoveries.find(d=>d.id===view.id)}
function pct(d){return Math.round(((d.stage||0)/(STAGES.length-1))*100)}
function saveD(d,msg="Auto-saved"){d.updatedAt=now();persist(); if(msg) toast(msg)}
function val(d,k){return d.answers?.[k]??""}
function hasB2C(d){return ["B2C","Both"].includes(val(d,"customer_type"))||["B2C","Both"].includes(val(d,"outbound_type"))||val(d,"orders_received")==="Sales Channel"}
function brand(){return `<div class="brand"><div class="brand-mark"></div><div><div class="brand-sub">Anchanto</div><div class="brand-title">RFP Survey</div></div></div>`}
function shell(content,action=""){return `<div class="shell"><header class="topbar">${brand()}${action}</header><main class="container">${content}</main></div>`}

function dashboard(){
 const cards=state.discoveries.map(d=>`
  <div class="card discovery-card">
    <span class="pill">${esc(d.customerType)} · ${esc(d.solution)}</span>
    <h3>${esc(d.company)}</h3>
    <div class="muted">${esc(d.contact)}${d.email?` · ${esc(d.email)}`:""}</div>
    <div class="progress"><span style="width:${d.status==="Completed"?100:pct(d)}%"></span></div>
    <div class="row" style="justify-content:space-between"><span class="status ${d.status.toLowerCase()}">${d.status}</span><span class="muted">${d.status==="Completed"?"100":pct(d)}% complete</span></div>
    <div class="row" style="margin-top:16px">
      <button class="btn primary" onclick="openDiscovery('${d.id}')">${d.status==="Completed"?"View / Edit":"Continue"}</button>
      ${d.status==="Completed"?`<button class="btn secondary" onclick="exportExcel('${d.id}')">Download Excel</button>`:""}
    </div>
  </div>`).join("");
 const body=state.discoveries.length?`
  <section class="hero"><h1>Anchanto RFP Survey</h1><p>Run a structured customer discovery, capture the right operational requirements, and keep every opportunity ready for review.</p></section>
  <div class="section-head"><div><h2>Discoveries</h2><div class="muted">Continue drafts or review completed surveys.</div></div></div>
  <div class="grid">${cards}</div>`:
  `<section class="hero"><h1>Anchanto RFP Survey</h1><p>Build a complete customer discovery without missing critical questions.</p></section>
   <div class="card empty"><h2>Start your first discovery</h2><p class="muted">Create a customer profile and move through a guided WMS + OXM discovery.</p><button class="btn primary" onclick="newDiscovery()">+ New Discovery</button></div>`;
 app.innerHTML=shell(body,`<button class="top-action" onclick="newDiscovery()">+ New Discovery</button>`);
}

function newDiscovery(){view={page:"new",id:null,stage:0};render()}
function newForm(){
 const body=`<div class="form-card"><div class="wizard-head"><div class="pill">New Opportunity</div><h1>Customer Information</h1><p class="muted">Create the discovery record before starting the survey.</p></div>
 <form class="card form-grid" id="newForm">
  ${field("Contact Name","contact","text",true)}
  ${field("Company Name","company","text",true)}
  ${field("Email","email","email",true)}
  ${field("Mobile Number","mobile","tel",false)}
  <div class="field"><label>Customer Type</label><select name="customerType"><option>3PL</option></select></div>
  <div class="field"><label>Required Solution</label><select name="solution"><option>WMS + OXM</option></select></div>
  <div class="field full row" style="justify-content:flex-end"><button type="button" class="btn secondary" onclick="goDashboard()">Cancel</button><button class="btn primary">Start Discovery →</button></div>
 </form></div>`;
 app.innerHTML=shell(body);
 document.querySelector("#newForm").onsubmit=e=>{
  e.preventDefault(); const f=Object.fromEntries(new FormData(e.currentTarget));
  const d={id:crypto.randomUUID(),...f,status:"Draft",stage:0,answers:{},createdAt:now(),updatedAt:now()};
  state.discoveries.unshift(d);persist();view={page:"wizard",id:d.id,stage:0};render();toast("Discovery created");
 }
}
function field(label,name,type="text",req=false){return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" ${req?"required":""}></div>`}

function qInput(d,key,title,type="text",opts=[]){
 const v=val(d,key);
 if(type==="choice"||type==="multi"){
   const selected=type==="multi"?(Array.isArray(v)?v:[]):[v];
   return `<div class="question"><div class="question-title">${title}</div><div class="options">${opts.map(o=>`<button type="button" class="option ${selected.includes(o)?"selected":""}" onclick="setChoice('${key}','${o}',${type==="multi"})">${o}</button>`).join("")}</div></div>`
 }
 if(type==="textarea") return `<div class="question"><div class="question-title">${title}</div><textarea oninput="setAnswer('${key}',this.value)">${esc(v)}</textarea></div>`;
 return `<div class="question"><div class="question-title">${title}</div><input type="${type}" value="${esc(v)}" oninput="setAnswer('${key}',this.value)"></div>`;
}
function setAnswer(k,v){const d=current();d.answers[k]=v;saveD(d,"");showSaved()}
function setChoice(k,v,multi=false){const d=current();if(multi){let a=Array.isArray(d.answers[k])?[...d.answers[k]]:[];a=a.includes(v)?a.filter(x=>x!==v):[...a,v];d.answers[k]=a}else d.answers[k]=v;saveD(d,"");renderWizard();showSaved()}
function showSaved(){const s=document.querySelector("#saved");if(s){s.textContent="Auto-saved ✓";setTimeout(()=>{if(s)s.textContent=""},900)}}

function questions(d,stage){
 switch(stage){
 case 0:return [
  qInput(d,"warehouses","How many warehouses do you operate?","number"),
  qInput(d,"locations_labeled","Are warehouse locations / bins labeled?","choice",["Yes","No"]),
  qInput(d,"wifi","Is Wi-Fi coverage available across the warehouse?","choice",["Yes","No"]),
  qInput(d,"printers","Are printers available?","choice",["Yes","No"])
 ].join("");
 case 1:return [
  qInput(d,"customers_count","How many customers do you currently manage?","number"),
  qInput(d,"customer_type","What type of customers do you serve?","choice",["B2B","B2C","Both"]),
  qInput(d,"onboard_frequency","How frequently do you onboard new customers?","choice",["Weekly","Monthly","Quarterly","Rarely"]),
  qInput(d,"billing_method","How do you currently bill your customers?","multi",["By Order","By Storage","By Inbound","Other"]),
  qInput(d,"billing_details","Please describe your current customer billing model.","textarea"),
  qInput(d,"storage_handling","How is customer storage handled?","multi",["By Location","By Pallet","Other"]),
  qInput(d,"storage_handling_details","Please describe how customer storage is handled.","textarea")
 ].join("");
 case 2:return [
  qInput(d,"system_users","How many system users will use the WMS?","number"),
  qInput(d,"warehouse_workers","How many warehouse workers / operators do you have?","number")
 ].join("");
 case 3:{
  let s=[
   qInput(d,"product_types","What types of products do you handle?","multi",["Fashion","Cosmetics","Food","Electronics","General Merchandise","Other"]),
   qInput(d,"product_size","What is the typical product size?","choice",["Small","Medium","Large","Mixed"]),
   qInput(d,"active_skus","Approximately how many active SKUs do you manage?","number"),
   qInput(d,"batch_tracking","Do you require Batch tracking?","choice",["Yes","No"]),
   qInput(d,"expiry_tracking","Do you require Expiry Date tracking?","choice",["Yes","No"])
  ];
  if((Array.isArray(val(d,"product_types"))?val(d,"product_types"):[val(d,"product_types")]).includes("Electronics")){
   s.push(qInput(d,"serial_tracking","Do you require Serial Number tracking?","choice",["Yes","No"]));
   if(val(d,"serial_tracking")==="Yes")s.push(qInput(d,"multi_serial","Can one unit have multiple serial numbers?","choice",["Yes","No"]));
  }
  return s.join("");
 }
 case 4:{
  let s=[
   qInput(d,"inbound_notification","How are you notified about an upcoming inbound?","choice",["System","Email","Phone / WhatsApp","Goods arrive directly","Other"])
  ];
  if(val(d,"inbound_notification")==="System")s.push(qInput(d,"inbound_system","Which system do you currently use?"));
  s.push(qInput(d,"asn_po","Do you receive an ASN / PO / inbound reference before goods arrive?","choice",["Yes","No"]));
  if(val(d,"asn_po")==="Yes")s.push(qInput(d,"asn_method","How do you receive it?","choice",["ERP","Customer System","Email / File","API","Other"]));
  s.push(
   qInput(d,"receiving_steps","What is your current inbound receiving process?","multi",["Receiving","Counting","QC","Labeling","Sorting","Putaway","Other"]),
   qInput(d,"storage_decision","How do you decide where received inventory should be stored?","choice",["Manual Decision","Fixed Locations","System Recommendation","Other"]),
   qInput(d,"dedicated_storage","Does each customer have a dedicated storage area?","choice",["Yes","No","Depends on Customer"]),
   qInput(d,"inbound_volume","Approximately how many inbound shipments do you receive per day / week?"),
   qInput(d,"pre_inbound_info","What information do you normally receive before inbound arrives?","multi",["SKU","Expected Quantity","Batch","Expiry","Serial Number","PO / Reference Number","None"])
  );
  return s.join("");
 }
 case 5:{
  let s=[
   qInput(d,"orders_day","Approximately how many outbound orders do you process per day?","number"),
   qInput(d,"outbound_type","What types of outbound orders do you handle?","choice",["B2B","B2C","Both"]),
   qInput(d,"picking_method","How do you currently pick orders?","multi",["Order by Order","Batch / Multiple Orders","Wave Picking","Other"]),
   qInput(d,"pick_priority","How do you prioritize which orders should be picked first?","multi",["Carrier / Courier","Customer","Delivery Area","Number of SKUs / Order Size","Order Time / SLA","Manual Priority","Other"]),
   qInput(d,"packaging","Do you use packaging materials during packing?","choice",["Yes","No"])
  ];
  if(val(d,"packaging")==="Yes")s.push(qInput(d,"track_packaging","Do you need the WMS to track and deduct packaging materials from inventory?","choice",["Yes","No"]));
  s.push(
   qInput(d,"orders_received","How are orders received today?","choice",["Sales Channel","ERP","Customer Portal","Excel / File Upload","Manual Entry","API","Other"]),
   qInput(d,"after_packing","What happens after packing?","choice",["Carrier Pickup","Own Fleet","Customer Pickup","Other"])
  );
  return s.join("");
 }
 case 6:{
  let s=[qInput(d,"erp","Do you currently use an ERP?","choice",["Yes","No"])];
  if(val(d,"erp")==="Yes"){
    s.push(qInput(d,"erp_name","Which ERP?","choice",["SAP","Oracle","Dynamics 365","Odoo","Zoho","Other"]));
    s.push(qInput(d,"erp_data","What information needs to be exchanged with the ERP?","multi",["Products","Purchase Orders","Inventory","Outbound Orders","Returns","Other"]));
  }
  if(hasB2C(d)){
    s.push(qInput(d,"sales_channels","Which sales channels do you use?","multi",["Salla","Shopify","Amazon","Noon","Trendyol","Other"]));
  }
  if(val(d,"after_packing")==="Carrier Pickup"){
    s.push(qInput(d,"carriers","Which carriers do you currently use?"));
    s.push(qInput(d,"carrier_integration","Do you require direct carrier integration?","choice",["Yes","No"]));
    if(val(d,"carrier_integration")==="Yes")s.push(qInput(d,"carrier_scope","What carrier capabilities are required?","multi",["Shipment Creation","AWB / Label","Tracking","Cancellation"]));
  }
  if(val(d,"after_packing")==="Own Fleet")s.push(qInput(d,"own_fleet","Do you need to manage your own drivers and delivery operations?","choice",["Yes","No"]));
  return s.join("");
 }
 case 7:return [
  qInput(d,"why_wms","Why are you looking for a WMS / OXM now?","textarea"),
  qInput(d,"challenges","What are the main challenges with your current operation?","textarea"),
  qInput(d,"top_improvements","What are the top 3 things you want the new solution to improve?","textarea"),
  qInput(d,"target_date","Do you have a target go-live date?","choice",["Yes","No"]),
  val(d,"target_date")==="Yes"?qInput(d,"go_live_date","Target go-live date","date"):""
 ].join("");
 default:return review(d);
 }
}

function renderWizard(){
 const d=current(); if(!d)return goDashboard();
 const stage=view.stage;
 d.stage=Math.max(d.stage||0,stage);saveD(d,"");
 const chips=STAGES.map((s,i)=>`<button class="step-chip ${i===stage?"active":i<=(d.stage||0)?"done":""}" onclick="jump(${i})">${i+1}. ${s.title}</button>`).join("");
 const body=`<div class="wizard-wrap">
   <div class="wizard-head"><div class="pill">${esc(d.company)} · ${esc(d.customerType)} · ${esc(d.solution)}</div><h1>${STAGES[stage].title}</h1><div class="muted">Step ${stage+1} of ${STAGES.length}</div></div>
   <div class="progress"><span style="width:${Math.round((stage/(STAGES.length-1))*100)}%"></span></div>
   <div class="stepper">${chips}</div>
   <div class="card">${questions(d,stage)}</div>
   <div class="wizard-footer">
    <div class="row"><button class="btn secondary" onclick="saveExit()">Save & Exit</button>${stage>0?`<button class="btn secondary" onclick="prev()">← Back</button>`:""}</div>
    <div class="row"><span class="saved" id="saved"></span>${stage<STAGES.length-1?`<button class="btn primary" onclick="next()">Save & Continue →</button>`:""}</div>
   </div>
  </div>`;
 app.innerHTML=shell(body,`<button class="top-action" onclick="saveExit()">Dashboard</button>`);
}
function jump(i){view.stage=i;renderWizard()}
function next(){const d=current();d.stage=Math.max(d.stage,view.stage+1);saveD(d,"Section saved");view.stage++;renderWizard()}
function prev(){view.stage--;renderWizard()}
function saveExit(){saveD(current(),"Progress saved");goDashboard()}
function openDiscovery(id){const d=state.discoveries.find(x=>x.id===id);view={page:"wizard",id,stage:d.status==="Completed"?STAGES.length-1:Math.min(d.stage||0,STAGES.length-1)};render()}
function goDashboard(){view={page:"dashboard",id:null,stage:0};render()}

const LABELS={
 warehouses:"Number of warehouses",locations_labeled:"Locations / bins labeled",wifi:"Wi-Fi coverage",printers:"Printers available",
 customers_count:"Number of customers",customer_type:"Customer type",onboard_frequency:"Customer onboarding frequency",billing_method:"Customer billing method",billing_details:"Customer billing details",storage_handling:"Storage handling basis",storage_handling_details:"Storage handling details",
 system_users:"System users",warehouse_workers:"Warehouse workers / operators",
 product_types:"Product types",product_size:"Typical product size",active_skus:"Active SKUs",batch_tracking:"Batch tracking",expiry_tracking:"Expiry tracking",serial_tracking:"Serial tracking",multi_serial:"Multiple serials per unit",
 inbound_notification:"Inbound notification",inbound_system:"Current inbound system",asn_po:"ASN / PO before arrival",asn_method:"ASN / PO received via",receiving_steps:"Inbound receiving steps",storage_decision:"Storage decision",dedicated_storage:"Dedicated customer storage",inbound_volume:"Inbound volume",pre_inbound_info:"Pre-inbound information",
 orders_day:"Outbound orders / day",outbound_type:"Outbound type",picking_method:"Picking method",pick_priority:"Picking priority",packaging:"Packaging materials",track_packaging:"Track packaging inventory",orders_received:"Orders received via",after_packing:"After packing",
 erp:"ERP used",erp_name:"ERP",erp_data:"ERP data exchange",sales_channels:"Sales channels",carriers:"Carriers",carrier_integration:"Carrier integration",carrier_scope:"Carrier integration scope",own_fleet:"Own fleet management",
 why_wms:"Why WMS / OXM now?",challenges:"Current challenges",top_improvements:"Top improvements",target_date:"Target go-live date required?",go_live_date:"Target go-live date"
};
const STAGE_KEYS={
 "Warehouse Setup":["warehouses","locations_labeled","wifi","printers"],
 "Customers":["customers_count","customer_type","onboard_frequency","billing_method","billing_details","storage_handling","storage_handling_details"],
 "Users & Workforce":["system_users","warehouse_workers"],
 "Inventory & Products":["product_types","product_size","active_skus","batch_tracking","expiry_tracking","serial_tracking","multi_serial"],
 "Inbound":["inbound_notification","inbound_system","asn_po","asn_method","receiving_steps","storage_decision","dedicated_storage","inbound_volume","pre_inbound_info"],
 "Outbound":["orders_day","outbound_type","picking_method","pick_priority","packaging","track_packaging","orders_received","after_packing"],
 "Integrations":["erp","erp_name","erp_data","sales_channels","carriers","carrier_integration","carrier_scope","own_fleet"],
 "Challenges & Goals":["why_wms","challenges","top_improvements","target_date","go_live_date"]
};
function display(v){return Array.isArray(v)?v.join(", "):(v||"—")}
function review(d){
 let sections=Object.entries(STAGE_KEYS).map(([section,keys],idx)=>{
  const rows=keys.filter(k=>d.answers[k]!==undefined&&d.answers[k]!==""&&!(Array.isArray(d.answers[k])&&!d.answers[k].length)).map(k=>`<div class="qa"><div class="q">${LABELS[k]||k}</div><div>${esc(display(d.answers[k]))}</div></div>`).join("");
  return `<div class="card review-section"><div class="review-title"><h3>${section}</h3><button class="btn ghost" onclick="jump(${idx})">Edit</button></div>${rows||`<div class="muted">No answers captured.</div>`}</div>`
 }).join("");
 return `<div class="review-title"><div><h2 style="margin:0">Discovery Review</h2><p class="muted">Review and edit any section before completing the discovery.</p></div><span class="status ${d.status.toLowerCase()}">${d.status}</span></div>
 <div class="card review-section"><div class="review-title"><h3>Customer Information</h3></div>
 <div class="qa"><div class="q">Contact</div><div>${esc(d.contact)}</div></div><div class="qa"><div class="q">Company</div><div>${esc(d.company)}</div></div><div class="qa"><div class="q">Email</div><div>${esc(d.email)}</div></div><div class="qa"><div class="q">Mobile</div><div>${esc(d.mobile||"—")}</div></div></div>
 ${sections}
 <div class="card"><div class="row" style="justify-content:flex-end"><button class="btn secondary" onclick="exportExcel('${d.id}')">Download Excel</button><button class="btn primary" onclick="completeDiscovery()">Complete Discovery ✓</button></div></div>`;
}
function completeDiscovery(){
 const d=current();
 d.status="Completed";d.stage=STAGES.length-1;saveD(d,"Discovery completed");
 view={page:"complete",id:d.id,stage:STAGES.length-1};
 render();
}
function exportExcel(id){
 const d=state.discoveries.find(x=>x.id===id); if(!d)return;
 const rows=[["Section","Question","Answer"],
 ["Customer Information","Contact Name",d.contact],["Customer Information","Company Name",d.company],["Customer Information","Email",d.email],["Customer Information","Mobile Number",d.mobile||""],["Customer Information","Customer Type",d.customerType],["Customer Information","Required Solution",d.solution]];
 Object.entries(STAGE_KEYS).forEach(([section,keys])=>keys.forEach(k=>{if(d.answers[k]!==undefined&&d.answers[k]!=="")rows.push([section,LABELS[k]||k,display(d.answers[k])])}));
 const html=`<html><head><meta charset="UTF-8"></head><body><table>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
 const blob=new Blob([html],{type:"application/vnd.ms-excel"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${d.company.replace(/[^a-z0-9]+/gi,"_")}_RFP_Discovery.xls`;a.click();URL.revokeObjectURL(a.href);toast("Excel downloaded");
}

function completionPage(){
 const d=current(); if(!d)return goDashboard();
 const body=`<div class="form-card">
   <div class="card completion-card">
     <div class="completion-icon">✓</div>
     <div class="pill">Discovery Completed</div>
     <h1>Congratulations!</h1>
     <p>Your customer discovery survey has been completed successfully.</p>
     <p class="muted">Please download the Excel file and send it to the Anchanto team for review.</p>
     <div class="completion-company">${esc(d.company)} · ${esc(d.customerType)} · ${esc(d.solution)}</div>
     <div class="row completion-actions">
       <button class="btn primary" onclick="exportExcel('${d.id}')">Download Excel</button>
       <button class="btn secondary" onclick="view={page:'wizard',id:'${d.id}',stage:${STAGES.length-1}};render()">Review / Edit Answers</button>
       <button class="btn secondary" onclick="goDashboard()">Back to Dashboard</button>
     </div>
   </div>
 </div>`;
 app.innerHTML=shell(body);
}

function render(){if(view.page==="new")newForm();else if(view.page==="wizard")renderWizard();else if(view.page==="complete")completionPage();else dashboard()}
render();
