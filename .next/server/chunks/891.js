"use strict";exports.id=891,exports.ids=[891],exports.modules={2257:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]])},7358:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]])},361:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},8998:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},3855:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},3869:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]])},1215:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]])},9508:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]])},8091:(e,t,i)=>{i.d(t,{Z:()=>s});let s=(0,i(2881).Z)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]])},4468:(e,t,i)=>{i.d(t,{Z:()=>N});var s=i(326),a=i(7577),r=i(1223),l=i(9682),n=i(4396),d=i(4471),o=i(5729),c=i(9105),m=i(6283),p=i(4019),u=i(3855),x=i(8091),g=i(2257),h=i(3869),b=i(1215);let y=[{value:"draft",label:"Draft"},{value:"pending_approval",label:"Pending Approval"},{value:"sent",label:"Sent"},{value:"accepted",label:"Accepted"},{value:"rejected",label:"Rejected"},{value:"expired",label:"Expired"},{value:"converted",label:"Converted"}],v=["Labour","Materials","Equipment","Transportation","Permits & Fees","Overhead","Other"],f=["pcs","units","sqm","sqft","lot","set","days","hours","m","kg","tons"],j=["Prices valid for 30 days","Payment terms: 30 days from invoice date","Work completion as per agreed timeline","All materials comply with Singapore standards","Subject to final measurements and variations"];function N({quotation:e,isOpen:t,onClose:i,onSave:N,mode:w,isLoading:k=!1}){let{clients:C}=(0,l.a)(),{tenders:P}=(0,n.i)(),{user:I}=(0,d.a)(),{getActiveFrequentlyUsedItems:$}=(0,o.r)(),[S,q]=(0,a.useState)({title:e?.title||"",clientId:e?.clientId||"",tenderId:e?.tenderId||"",projectId:e?.projectId||"",description:e?.description||"",status:e?.status||"draft",validUntil:e?.validUntil?new Date(e.validUntil).toISOString().split("T")[0]:"",discount:e?.discount||0,notes:e?.notes||"",terms:e?.terms?e.terms.join("\n"):j.join("\n")}),[A,D]=(0,a.useState)(e?.items||[]),[U,M]=(0,a.useState)({}),[_,Z]=(0,a.useState)({subtotal:0,gst:0,totalAmount:0}),[z,T]=(0,a.useState)([]),Q=(e,t)=>{q(i=>({...i,[e]:t})),U[e]&&M(t=>({...t,[e]:""}))},E=e=>e?$().filter(t=>t.description.toLowerCase().includes(e.toLowerCase())).slice(0,5):[],G=(e,t,i)=>{D(s=>{let a=[...s];return a[e]={...a[e],[t]:i},("quantity"===t||"unitPrice"===t)&&(a[e].totalPrice=a[e].quantity*a[e].unitPrice),a}),"description"===t&&T(t=>{let i=[...t];return i[e]=!0,i})},O=e=>{D(t=>t.filter((t,i)=>i!==e))},F=()=>{let e={};if(S.title.trim()||(e.title="Quotation title is required"),S.clientId||(e.clientId="Client selection is required"),S.description.trim()||(e.description="Description is required"),S.validUntil||(e.validUntil="Valid until date is required"),0===A.length&&(e.items="At least one item is required"),A.forEach((t,i)=>{t.description.trim()||(e[`item_${i}_description`]="Item description is required"),t.quantity<=0&&(e[`item_${i}_quantity`]="Quantity must be greater than 0"),t.unitPrice<=0&&(e[`item_${i}_unitPrice`]="Unit price must be greater than 0")}),S.validUntil){let t=new Date(S.validUntil),i=new Date;i.setHours(0,0,0,0),t<i&&(e.validUntil="Valid until date must be in the future")}return M(e),0===Object.keys(e).length},V=async e=>{if(e.preventDefault(),!F())return;let t={title:S.title.trim(),clientId:S.clientId,tenderId:S.tenderId||void 0,projectId:S.projectId||void 0,description:S.description.trim(),status:S.status,validUntil:new Date(S.validUntil),items:A,discount:S.discount,terms:S.terms.split("\n").filter(e=>e.trim()).map(e=>e.trim()),notes:S.notes.trim()||void 0,preparedBy:I?.id||"",subtotal:_.subtotal,gst:_.gst,totalAmount:_.totalAmount};await N(t)},L=e=>new Intl.NumberFormat("en-SG",{style:"currency",currency:"SGD"}).format(e);return t?s.jsx("div",{className:"fixed inset-0 z-50 overflow-y-auto",children:(0,s.jsxs)("div",{className:"flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",children:[s.jsx("div",{className:"fixed inset-0 transition-opacity","aria-hidden":"true",children:s.jsx("div",{className:"absolute inset-0 bg-gray-500 opacity-75",onClick:i})}),(0,s.jsxs)("div",{className:"inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full",children:[s.jsx("div",{className:"bg-white px-6 py-4 border-b border-gray-200",children:(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{className:"flex items-center space-x-3",children:[s.jsx("div",{className:"w-10 h-10 bg-ampere-100 rounded-lg flex items-center justify-center",children:s.jsx(m.Z,{className:"h-5 w-5 text-ampere-600"})}),(0,s.jsxs)("div",{children:[s.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"add"===w?"Create New Quotation":"Edit Quotation"}),s.jsx("p",{className:"text-sm text-gray-600",children:"add"===w?"Prepare a new quotation for client":"Update quotation details and items"})]})]}),s.jsx("button",{onClick:i,className:"text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100",children:s.jsx(p.Z,{className:"h-5 w-5"})})]})}),(0,s.jsxs)("form",{onSubmit:V,className:"p-6",children:[(0,s.jsxs)("div",{className:"space-y-8",children:[(0,s.jsxs)("div",{children:[s.jsx("h4",{className:"text-md font-semibold text-gray-900 mb-4",children:"Quotation Details"}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,s.jsxs)("div",{className:"md:col-span-2",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Quotation Title *"}),s.jsx("input",{type:"text",value:S.title,onChange:e=>Q("title",e.target.value),className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U.title?"border-red-300":"border-gray-300"),placeholder:"Enter quotation title"}),U.title&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U.title})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Client *"}),(0,s.jsxs)("select",{value:S.clientId,onChange:e=>Q("clientId",e.target.value),className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U.clientId?"border-red-300":"border-gray-300"),children:[s.jsx("option",{value:"",children:"Select Client"}),C.filter(e=>"active"===e.status).map(e=>s.jsx("option",{value:e.id,children:e.name},e.id))]}),U.clientId&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U.clientId})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Related Tender (Optional)"}),(0,s.jsxs)("select",{value:S.tenderId,onChange:e=>Q("tenderId",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",children:[s.jsx("option",{value:"",children:"No related tender"}),P.filter(e=>!S.clientId||e.clientId===S.clientId).map(e=>s.jsx("option",{value:e.id,children:e.title},e.id))]})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Status"}),s.jsx("select",{value:S.status,onChange:e=>Q("status",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",children:y.map(e=>s.jsx("option",{value:e.value,children:e.label},e.value))})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Valid Until *"}),s.jsx("input",{type:"date",value:S.validUntil,onChange:e=>Q("validUntil",e.target.value),className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U.validUntil?"border-red-300":"border-gray-300")}),U.validUntil&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U.validUntil})]})]}),(0,s.jsxs)("div",{className:"mt-4",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Description *"}),s.jsx("textarea",{value:S.description,onChange:e=>Q("description",e.target.value),rows:3,className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U.description?"border-red-300":"border-gray-300"),placeholder:"Describe the quotation scope and requirements..."}),U.description&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U.description})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[s.jsx("h4",{className:"text-md font-semibold text-gray-900",children:"Quotation Items"}),(0,s.jsxs)("button",{type:"button",onClick:()=>{let e={id:Math.random().toString(36).substr(2,9),description:"",quantity:1,unit:"pcs",unitPrice:0,totalPrice:0,category:"Materials",notes:""};D(t=>[...t,e]),T(e=>[...e,!1])},className:"btn-secondary flex items-center space-x-2",children:[s.jsx(u.Z,{className:"h-4 w-4"}),s.jsx("span",{children:"Add Item"})]})]}),U.items&&s.jsx("p",{className:"mb-4 text-sm text-red-600",children:U.items}),(0,s.jsxs)("div",{className:"space-y-4",children:[A.map((e,t)=>(0,s.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-12 gap-4",children:[(0,s.jsxs)("div",{className:"md:col-span-4",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Description *"}),(0,s.jsxs)("div",{className:"relative",children:[s.jsx("input",{type:"text",value:e.description,onChange:e=>G(t,"description",e.target.value),className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U[`item_${t}_description`]?"border-red-300":"border-gray-300"),placeholder:"Item description",onBlur:()=>{setTimeout(()=>{T(e=>{let i=[...e];return i[t]=!1,i})},150)}}),z[t]&&E(e.description).length>0&&s.jsx("div",{className:"absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto",children:E(e.description).map(e=>(0,s.jsxs)("div",{className:"px-4 py-2 hover:bg-ampere-50 cursor-pointer",onClick:()=>{G(t,"description",e.description),G(t,"unit",e.unit),G(t,"unitPrice",e.unitPrice),G(t,"category",e.category);let i=[...A];i[t]={...i[t],unit:e.unit,unitPrice:e.unitPrice,category:e.category,totalPrice:i[t].quantity*e.unitPrice},D(i),T(e=>{let i=[...e];return i[t]=!1,i})},children:[s.jsx("div",{className:"font-medium",children:e.description}),(0,s.jsxs)("div",{className:"text-sm text-gray-600",children:[e.unitPrice.toFixed(2)," SGD per ",e.unit," • ",e.category]})]},e.id))})]}),U[`item_${t}_description`]&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U[`item_${t}_description`]})]}),(0,s.jsxs)("div",{className:"md:col-span-2",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Quantity *"}),s.jsx("input",{type:"number",value:e.quantity,onChange:e=>G(t,"quantity",parseFloat(e.target.value)||0),className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U[`item_${t}_quantity`]?"border-red-300":"border-gray-300"),min:"0",step:"0.01"}),U[`item_${t}_quantity`]&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U[`item_${t}_quantity`]})]}),(0,s.jsxs)("div",{className:"md:col-span-1",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Unit"}),s.jsx("select",{value:e.unit,onChange:e=>G(t,"unit",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",children:f.map(e=>s.jsx("option",{value:e,children:e},e))})]}),(0,s.jsxs)("div",{className:"md:col-span-2",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Unit Price (SGD) *"}),s.jsx("input",{type:"number",value:e.unitPrice,onChange:e=>G(t,"unitPrice",parseFloat(e.target.value)||0),className:(0,r.cn)("w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",U[`item_${t}_unitPrice`]?"border-red-300":"border-gray-300"),min:"0",step:"0.01"}),U[`item_${t}_unitPrice`]&&s.jsx("p",{className:"mt-1 text-sm text-red-600",children:U[`item_${t}_unitPrice`]})]}),(0,s.jsxs)("div",{className:"md:col-span-2",children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Total Price"}),s.jsx("div",{className:"px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium",children:L(e.totalPrice)})]}),s.jsx("div",{className:"md:col-span-1 flex items-end",children:s.jsx("button",{type:"button",onClick:()=>O(t),className:"p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50",title:"Remove Item",children:s.jsx(x.Z,{className:"h-4 w-4"})})})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 mt-4",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Category"}),s.jsx("select",{value:e.category,onChange:e=>G(t,"category",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",children:v.map(e=>s.jsx("option",{value:e,children:e},e))})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Notes (Optional)"}),s.jsx("input",{type:"text",value:e.notes||"",onChange:e=>G(t,"notes",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",placeholder:"Additional notes for this item"})]})]})]},e.id)),0===A.length&&(0,s.jsxs)("div",{className:"text-center py-8 border-2 border-dashed border-gray-300 rounded-lg",children:[s.jsx(g.Z,{className:"h-8 w-8 text-gray-400 mx-auto mb-2"}),s.jsx("p",{className:"text-gray-500",children:'No items added yet. Click "Add Item" to start.'})]})]})]}),A.length>0&&(0,s.jsxs)("div",{className:"bg-gray-50 rounded-lg p-6",children:[s.jsx("h4",{className:"text-md font-semibold text-gray-900 mb-4",children:"Quotation Summary"}),(0,s.jsxs)("div",{className:"space-y-4",children:[s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Discount (SGD)"}),s.jsx("input",{type:"number",value:S.discount,onChange:e=>Q("discount",parseFloat(e.target.value)||0),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",min:"0",step:"0.01"})]})}),s.jsx("div",{className:"border-t border-gray-200 pt-4",children:(0,s.jsxs)("div",{className:"space-y-2",children:[(0,s.jsxs)("div",{className:"flex justify-between",children:[s.jsx("span",{className:"text-sm text-gray-600",children:"Subtotal:"}),s.jsx("span",{className:"font-medium",children:L(_.subtotal)})]}),(0,s.jsxs)("div",{className:"flex justify-between",children:[s.jsx("span",{className:"text-sm text-gray-600",children:"GST (7%):"}),s.jsx("span",{className:"font-medium",children:L(_.gst)})]}),S.discount>0&&(0,s.jsxs)("div",{className:"flex justify-between",children:[s.jsx("span",{className:"text-sm text-gray-600",children:"Discount:"}),(0,s.jsxs)("span",{className:"font-medium text-red-600",children:["-",L(S.discount)]})]}),(0,s.jsxs)("div",{className:"flex justify-between text-lg font-bold border-t border-gray-200 pt-2",children:[s.jsx("span",{children:"Total Amount:"}),s.jsx("span",{className:"text-ampere-600",children:L(_.totalAmount)})]})]})})]})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Terms & Conditions"}),s.jsx("textarea",{value:S.terms,onChange:e=>Q("terms",e.target.value),rows:6,className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",placeholder:"Enter terms and conditions (one per line)"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Additional Notes"}),s.jsx("textarea",{value:S.notes,onChange:e=>Q("notes",e.target.value),rows:6,className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500",placeholder:"Any additional notes or special instructions..."})]})]})]}),(0,s.jsxs)("div",{className:"flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200",children:[s.jsx("button",{type:"button",onClick:i,disabled:k,className:"btn-secondary disabled:opacity-50 disabled:cursor-not-allowed",children:"Cancel"}),"edit"===w&&(0,s.jsxs)("button",{type:"button",onClick:()=>{let t={id:e?.id||"temp",quotationNumber:e?.quotationNumber||"QUO-TEMP",title:S.title,clientId:S.clientId,description:S.description,status:S.status,validUntil:new Date(S.validUntil),items:A,subtotal:_.subtotal,gst:_.gst,discount:S.discount,totalAmount:_.totalAmount,terms:S.terms.split("\n").filter(e=>e.trim()),notes:S.notes,preparedBy:I?.id||"",createdAt:e?.createdAt||new Date,updatedAt:new Date,...e?.projectId&&{projectId:e.projectId},...e?.tenderId&&{tenderId:e.tenderId},...e?.sentDate&&{sentDate:e.sentDate}},i=C.find(e=>e.id===S.clientId);(0,c.n)(t,i)},className:"btn-secondary flex items-center space-x-2",disabled:k,children:[s.jsx(h.Z,{className:"h-4 w-4"}),s.jsx("span",{children:"Print Preview"})]}),s.jsx("button",{type:"submit",disabled:k,className:"btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed",children:k?(0,s.jsxs)(s.Fragment,{children:[s.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white"}),s.jsx("span",{children:"add"===w?"Creating...":"Saving..."})]}):(0,s.jsxs)(s.Fragment,{children:[s.jsx(b.Z,{className:"h-4 w-4"}),s.jsx("span",{children:"add"===w?"Create Quotation":"Save Changes"})]})})]})]})]})]})}):null}},9105:(e,t,i)=>{i.d(t,{n:()=>a});let s=(e,t)=>{let i;let s=e=>new Intl.NumberFormat("en-SG",{style:"currency",currency:"SGD"}).format(e),a=e=>new Date(e).toLocaleDateString("en-SG",{day:"2-digit",month:"short",year:"numeric"}),r=`
    <table class="items-table">
      <thead>
        <tr>
          <th width="40%" style="text-align: left;">Description</th>
          <th width="15%" style="text-align: left;">Quantity</th>
          <th width="15%" style="text-align: left;">Unit</th>
          <th width="15%" style="text-align: right;">Unit Price</th>
          <th width="15%" style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${e.items.map(e=>`
          <tr>
            <td style="text-align: left;">${e.description}</td>
            <td style="text-align: left;">${e.quantity}</td>
            <td style="text-align: left;">${e.unit}</td>
            <td style="text-align: right;">${s(e.unitPrice)}</td>
            <td style="text-align: right;">${s(e.totalPrice)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `,l=e.terms&&e.terms.length>0?`
    <ul class="list-disc pl-5 space-y-1">
      ${e.terms.map(e=>`<li class="text-sm text-gray-600">${e}</li>`).join("")}
    </ul>
  `:"";return`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quotation ${e.quotationNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin: 0 0 5px 0;
        }
        .company-info p {
          margin: 2px 0;
          font-size: 14px;
          color: #6b7280;
        }
        .quotation-info {
          text-align: right;
        }
        .quotation-info h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 10px 0;
          color: #1f2937;
        }
        .quotation-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .client-info div {
          margin: 5px 0;
          font-size: 14px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .items-table th {
          background-color: #f9fafb;
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .totals-table {
          width: 300px;
        }
        .totals-table tr:not(:last-child) td {
          padding-bottom: 8px;
        }
        .totals-table td {
          padding-top: 8px;
        }
        .totals-table td:first-child {
          text-align: left;
        }
        .totals-table td:last-child {
          text-align: right;
          width: 15%; /* Match the width of the Total column in items table */
        }
        .total-row {
          font-weight: bold;
          font-size: 16px;
        }
        .terms-list {
          padding-left: 20px;
        }
        .terms-list li {
          margin: 5px 0;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature-box {
          width: 45%;
        }
        .signature-line {
          margin-top: 60px;
          border-top: 1px solid #000;
          padding-top: 5px;
          font-size: 14px;
        }
        .accreditations {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
          padding: 20px 0;
        }
        .accreditation-logo {
          height: 50px;
        }
        .company-logo {
          height: 40px;
          margin-bottom: 10px;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <img src="/images/ampere-logo.png" alt="Ampere Engineering Pte Ltd" class="company-logo" />
          <h1>Ampere Engineering Pte Ltd</h1>
          <p>101 Upper Cross Street, #04-05 People's Park Centre</p>
          <p>Singapore 058357</p>
          <p>Phone: +65 6123 4567</p>
          <p>Email: projects@ampere.com.sg</p>
          <p>GST Registration No: 201021612W</p>
        </div>
        <div class="quotation-info">
          <h2>QUOTATION</h2>
          <p><strong>Number:</strong> ${e.quotationNumber}</p>
          <p><strong>Date:</strong> ${a(e.createdAt)}</p>
          <p><strong>Valid Until:</strong> ${a(e.validUntil)}</p>
          <div style="margin-top: 10px;">${i=e.status,`
      <span class="${({draft:"bg-gray-100 text-gray-800",pending_approval:"bg-yellow-100 text-yellow-800",sent:"bg-blue-100 text-blue-800",accepted:"bg-green-100 text-green-800",rejected:"bg-red-100 text-red-800",expired:"bg-orange-100 text-orange-800",converted:"bg-purple-100 text-purple-800"})[i]||"bg-gray-100 text-gray-800"} px-2 py-1 text-xs font-medium rounded-full">
        ${({draft:"Draft",pending_approval:"Pending Approval",sent:"Sent",accepted:"Accepted",rejected:"Rejected",expired:"Expired",converted:"Converted"})[i]||i}
      </span>
    `}</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Client Information</h3>
        <div class="client-info">
          <div><strong>${t?.name||"N/A"}</strong></div>
          <div>${t?.contactPerson||"N/A"}</div>
          <div>${t?.address?.street||""} ${t?.address?.building||""} ${t?.address?.unit||""}</div>
          <div>Singapore ${t?.address?.postalCode||""}</div>
          <div>Phone: ${t?.phone||"N/A"}</div>
          <div>Email: ${t?.email||"N/A"}</div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Quotation Details</h3>
        <p>${e.description||"No description provided"}</p>
      </div>

      <div class="section">
        <h3 class="section-title">Items</h3>
        ${r}
        
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td width="70%" style="text-align: right;">Subtotal:</td>
              <td width="15%" style="text-align: right;">${s(e.subtotal)}</td>
            </tr>
            <tr>
              <td style="text-align: right;">GST (7%):</td>
              <td style="text-align: right;">${s(e.gst)}</td>
            </tr>
            ${e.discount&&e.discount>0?`
            <tr>
              <td style="text-align: right;">Discount:</td>
              <td style="text-align: right;">-${s(e.discount)}</td>
            </tr>
            `:""}
            <tr class="total-row">
              <td style="text-align: right;">Total Amount:</td>
              <td style="text-align: right;">${s(e.totalAmount)}</td>
            </tr>
          </table>
        </div>
      </div>

      ${e.terms&&e.terms.length>0?`
      <div class="section">
        <h3 class="section-title">Terms & Conditions</h3>
        ${l}
      </div>
      `:""}

      ${e.notes?`
      <div class="section">
        <h3 class="section-title">Notes</h3>
        <p>${e.notes}</p>
      </div>
      `:""}

      <div class="signature-section">
        <div class="signature-box">
          <div>Prepared by:</div>
          <div class="signature-line">Authorized Signature</div>
        </div>
        <div class="signature-box">
          <div>Accepted by:</div>
          <div class="signature-line">Client Signature</div>
        </div>
      </div>

      <div class="accreditations">
        <img src="/images/bizsafe-logo.png" alt="BizSafe Star Accredited" class="accreditation-logo" />
        <img src="/images/iso45001-logo.png" alt="ISO 45001 Certified" class="accreditation-logo" />
      </div>

      <div class="footer">
        <p>This quotation is generated by Ampere Engineering Pte Ltd. Please contact us for any inquiries.</p>
        <p>Quotation is valid for 30 days from the date of issue unless otherwise stated.</p>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="background-color: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          Print Quotation
        </button>
        <button onclick="window.close()" style="background-color: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `},a=(e,t)=>{let i=s(e,t),a=window.open("","_blank");a&&(a.document.write(i),a.document.close(),a.focus())}}};