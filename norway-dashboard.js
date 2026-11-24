(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const speciesOrder = ["Blálonga","Brosma","Havtaska","Hvítingur","Hýsa","Kalvi","Kongafiskur","Longa","Reyðsprøka","Svartkalvi","Toskur","Upsi"];
  const colours = ["#74b5c5","#08752f","#9cb4d6","#dda879","#7650a5","#d19aa2","#b7dce5","#a17b00","#44a98c","#bd5ec8","#91ae16","#62aabd"];
  const fmt = new Intl.NumberFormat("fo-FO", {maximumFractionDigits:0});
  const dateFmt = new Intl.DateTimeFormat("fo-FO", {day:"2-digit",month:"2-digit",year:"numeric"});
  let rows=[], minDate="", maxDate="", latestStart="", fullLoaded=false, metric="quantity", focusedSize="", chart;
  const selected = new Set(speciesOrder.slice(0,6));
  const objectRow = (fields,row) => { const item=Object.fromEntries(fields.map((field,index)=>[field,row[index]])); item.size_group=item.size_group||"Ikki upplýst"; item.quantity_kg=Number(item.quantity_kg||0); return item; };
  const formatDate = value => dateFmt.format(new Date(`${value}T12:00:00Z`));
  const monthKey = day => day.slice(0,7);
  const datedRows = () => rows.filter(row => row.date >= $("from-date").value && row.date <= $("to-date").value && selected.has(row.species));
  const visibleRows = () => datedRows().filter(row => !focusedSize || row.size_group===focusedSize);

  function renderSpecies(){
    $("species").innerHTML=speciesOrder.map((name,index)=>`<button type="button" class="${selected.has(name)?"active":""}" data-name="${name}" style="--c:${colours[index]}">${name}</button>`).join("");
    $("species").querySelectorAll("button").forEach(button=>button.onclick=()=>{selected.has(button.dataset.name)?selected.delete(button.dataset.name):selected.add(button.dataset.name);focusedSize="";renderSpecies();render();});
  }
  function renderSizes(){
    const totals=new Map(); datedRows().forEach(row=>totals.set(row.size_group,(totals.get(row.size_group)||0)+row.quantity_kg));
    const groups=[...totals].sort((a,b)=>b[1]-a[1]);
    $("sizes").innerHTML=groups.length?groups.map(([name,kg],index)=>`<button type="button" class="size-row ${focusedSize===name?"active":""}" data-size="${name}"><i style="--dot:${colours[index%colours.length]}"></i><span>${name}</span><strong>${fmt.format(kg)} kg</strong></button>`).join(""):'<span>Ongir støddarbólkar.</span>';
    $("sizes").querySelectorAll("button").forEach(button=>button.onclick=()=>{focusedSize=focusedSize===button.dataset.size?"":button.dataset.size;render();});
  }
  function render(){
    renderSizes(); const data=visibleRows();
    const days=(new Date($("to-date").value)-new Date($("from-date").value))/86400000;
    const monthly=days>400, keys=[...new Set(data.map(row=>monthly?monthKey(row.date):row.date))].sort();
    chart.config.type=metric==="total"?"bar":"line";
    chart.data.labels=metric==="total"?[...selected]:keys.map(key=>monthly?key:formatDate(key));
    if(metric==="total") chart.data.datasets=[{label:"Kilo tilsamans",data:[...selected].map(name=>data.filter(row=>row.species===name).reduce((sum,row)=>sum+row.quantity_kg,0)),backgroundColor:[...selected].map(name=>colours[speciesOrder.indexOf(name)])}];
    else {
      const names=metric==="size"?[...new Set(data.map(row=>row.size_group))]:[...selected];
      chart.data.datasets=names.map((name,index)=>({label:name,data:keys.map(key=>data.filter(row=>(metric==="size"?row.size_group:row.species)===name&&(monthly?monthKey(row.date)===key:row.date===key)).reduce((sum,row)=>sum+row.quantity_kg,0)),borderColor:metric==="size"?colours[index%colours.length]:colours[speciesOrder.indexOf(name)],backgroundColor:(metric==="size"?colours[index%colours.length]:colours[speciesOrder.indexOf(name)])+"22",borderWidth:2,tension:.16,pointRadius:monthly?2:1}));
    }
    chart.update();
    const total=data.reduce((sum,row)=>sum+row.quantity_kg,0); $("summary").textContent=`${fmt.format(total)} kg · ${data.length.toLocaleString("fo-FO")} skrásetingar${focusedSize?` · ${focusedSize}`:""}`;
    $("rows").innerHTML=data.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.quantity_kg-a.quantity_kg).slice(0,1200).map(row=>`<tr><td>${formatDate(row.date)}</td><td>${row.species}</td><td>${row.size_group}</td><td>${fmt.format(row.quantity_kg)}</td></tr>`).join("");
  }
  async function ensureFullHistory(){
    if(fullLoaded || $("from-date").value>=latestStart)return;
    $("updated").textContent="Lesur eldri norsk landingartøl…";
    const response=await fetch("data/norway/norway-landings.json",{cache:"no-store"}); if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json(); rows=payload.rows.map(row=>objectRow(payload.fields,row)); fullLoaded=true; $("updated").textContent=`Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
  }
  async function setPeriod(value){
    $("to-date").value=maxDate;
    if(value==="all") $("from-date").value=minDate; else {const date=new Date(`${maxDate}T12:00:00Z`);date.setUTCDate(date.getUTCDate()-Number(value)+1);$("from-date").value=date.toISOString().slice(0,10)<minDate?minDate:date.toISOString().slice(0,10);}
    document.querySelectorAll(".period").forEach(button=>button.classList.toggle("active",button.dataset.days===String(value))); await ensureFullHistory(); render();
  }
  fetch("data/norway/norway-latest.json",{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}).then(payload=>{
    rows=payload.rows.map(row=>objectRow(payload.fields,row)); minDate=payload.min_date; maxDate=payload.max_date; latestStart=payload.latest_start;
    [$("from-date"),$("to-date")].forEach(control=>{control.min=minDate;control.max=maxDate}); $("updated").textContent=`Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
    chart=new Chart($("chart"),{type:"line",data:{labels:[],datasets:[]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{itemSort:(a,b)=>b.parsed.y-a.parsed.y}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:12}},y:{beginAtZero:true,title:{display:true,text:"Kilo"},ticks:{callback:value=>fmt.format(value)}}}});
    $("status").hidden=true; $("dashboard").hidden=false; renderSpecies(); setPeriod(90);
    [$("from-date"),$("to-date")].forEach(control=>control.onchange=async()=>{document.querySelectorAll(".period").forEach(button=>button.classList.remove("active"));await ensureFullHistory();render()});
    document.querySelectorAll(".period").forEach(button=>button.onclick=()=>setPeriod(button.dataset.days));
    $("metrics").querySelectorAll("button").forEach(button=>button.onclick=()=>{metric=button.dataset.metric;$("metrics").querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===button));render()});
  }).catch(error=>{$("status").textContent=`Norsku tølini kundu ikki vísast: ${error.message}`;$("updated").textContent="Tøl ikki tøk"});
})();
