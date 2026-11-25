(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const speciesOrder = ["Blálonga","Brosma","Havtaska","Hvítingur","Hýsa","Kalvi","Kongafiskur","Longa","Reyðsprøka","Svartkalvi","Toskur","Upsi"];
  const colours = ["#74b5c5","#08752f","#9cb4d6","#dda879","#7650a5","#d19aa2","#b7dce5","#a17b00","#44a98c","#bd5ec8","#91ae16","#62aabd"];
  const fmt = new Intl.NumberFormat("fo-FO", {maximumFractionDigits:0});
  const dateFmt = new Intl.DateTimeFormat("fo-FO", {day:"2-digit",month:"2-digit",year:"numeric"});
  const dateTickLimit = (count,width) => Math.max(2,Math.min(count,Math.floor(Math.max(320,width||900)/85)));
  function separateTimelineLabels(fromLabel,toLabel,fromPercent,toPercent){let a="-50%",b="-50%";if(toPercent-fromPercent<12){if(toPercent>85){a="-200%";b="-100%"}else if(fromPercent<15){a="0";b="100%"}else{a="-100%";b="0"}}fromLabel.style.transform=`translateX(${a})`;toLabel.style.transform=`translateX(${b})`}
  let rows=[], minDate="", maxDate="", latestStart="", fullLoaded=false, metric="quantity", focusedSize="", chart;
  const selected = new Set(speciesOrder.slice(0,6));
  const selectedGroups = new Set();
  const objectRow = (fields,row) => { const item=Object.fromEntries(fields.map((field,index)=>[field,row[index]])); item.size_group=item.size_group||"Ikki upplýst"; item.ship_group=item.ship_group||"Ikki upplýst"; item.quantity_kg=Number(item.quantity_kg||0); return item; };
  const formatDate = value => dateFmt.format(new Date(`${value}T12:00:00Z`));
  const monthKey = day => day.slice(0,7);
  const weekKey = day => {const date=new Date(`${day}T12:00:00Z`);const offset=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-offset);return date.toISOString().slice(0,10);};
  const tint = (hex,amount) => {const value=parseInt(hex.slice(1),16),mix=channel=>Math.round(channel+(255-channel)*amount);return `rgb(${mix(value>>16)}, ${mix((value>>8)&255)}, ${mix(value&255)})`;};
  const datedRows = () => rows.filter(row => row.date >= $("from-date").value && row.date <= $("to-date").value && selected.has(row.species) && selectedGroups.has(row.ship_group));
  const seriesKey = row => `${row.species}|||${row.size_group}`;
  const visibleRows = () => datedRows().filter(row => !focusedSize || seriesKey(row)===focusedSize);

  function renderSpecies(){
    $("species").innerHTML=speciesOrder.map((name,index)=>`<button type="button" class="${selected.has(name)?"active":""}" data-name="${name}" style="--c:${colours[index]}">${name}</button>`).join("");
    $("species").querySelectorAll("button").forEach(button=>button.onclick=()=>{selected.has(button.dataset.name)?selected.delete(button.dataset.name):selected.add(button.dataset.name);focusedSize="";renderSpecies();render();});
  }
  function renderGroups(){
    const groups=[...new Set(rows.map(row=>row.ship_group))].sort((a,b)=>a.localeCompare(b,"fo"));
    if(!selectedGroups.size) groups.forEach(group=>selectedGroups.add(group));
    $("groupOptions").innerHTML=groups.map(group=>`<label><input type="checkbox" value="${group.replaceAll('"','&quot;')}" ${selectedGroups.has(group)?"checked":""}>${group}</label>`).join("");
    $("groupOptions").querySelectorAll("input").forEach(input=>input.onchange=()=>{input.checked?selectedGroups.add(input.value):selectedGroups.delete(input.value);render();});
  }
  function renderSizes(){
    const totals=new Map(); datedRows().forEach(row=>totals.set(seriesKey(row),(totals.get(seriesKey(row))||0)+row.quantity_kg));
    const groups=[...totals].sort((a,b)=>b[1]-a[1]);
    $("sizes").innerHTML=groups.length?groups.map(([key,kg])=>{const [species,size]=key.split("|||");const match=size.match(/\d+/),sizeNumber=match?Number(match[0]):0;const colour=tint(colours[speciesOrder.indexOf(species)],Math.min(sizeNumber*.1,.6));return `<button type="button" class="size-row ${focusedSize===key?"active":""}" data-key="${key}"><i style="--dot:${colour}"></i><span><b>${species}</b> · ${size}</span><strong>${fmt.format(kg)} kg</strong></button>`;}).join(""):'<span>Ongir støddarbólkar.</span>';
    $("sizes").querySelectorAll("button").forEach(button=>button.onclick=()=>{focusedSize=focusedSize===button.dataset.key?"":button.dataset.key;render();});
  }
  function render(){
    renderSizes(); const data=visibleRows();
    const days=(new Date($("to-date").value)-new Date($("from-date").value))/86400000;
    const sizeMode=metric==="size", monthly=!sizeMode&&days>400;
    const bucket=day=>sizeMode?weekKey(day):(monthly?monthKey(day):day);
    const keys=[...new Set(data.map(row=>bucket(row.date)))].sort();
    chart.config.type=metric==="total"||sizeMode?"bar":"line";
    chart.options.scales.x.stacked=sizeMode;chart.options.scales.y.stacked=sizeMode;
    chart.options.scales.x.ticks.maxTicksLimit=metric==="total"?12:dateTickLimit(keys.length,chart.width);chart.options.scales.x.ticks.autoSkip=true;chart.options.scales.x.ticks.maxRotation=metric==="total"?45:0;chart.options.scales.x.ticks.minRotation=metric==="total"?45:0;
    const splitGroups=$("splitGroups").classList.contains("active");
    const lineKey=row=>sizeMode?`${row.species}|||${row.size_group}${splitGroups?`|||${row.ship_group}`:""}`:`${row.species}${splitGroups?`|||${row.ship_group}`:""}`;
    const series=[...new Map(data.map(row=>[lineKey(row),{key:lineKey(row),label:lineKey(row).replaceAll("|||"," · "),species:row.species}])).values()];
    chart.data.labels=metric==="total"?series.map(item=>item.label):keys.map(key=>monthly?key:formatDate(key));
    if(metric==="total") chart.data.datasets=[{label:"Kilo tilsamans",data:series.map(item=>data.filter(row=>lineKey(row)===item.key).reduce((sum,row)=>sum+row.quantity_kg,0)),backgroundColor:series.map(item=>colours[speciesOrder.indexOf(item.species)])}];
    else {
      chart.data.datasets=series.map(item=>{const base=colours[speciesOrder.indexOf(item.species)],match=item.label.match(/Stødd (\d+)/),sizeNumber=match?Number(match[1]):0,colour=sizeMode?tint(base,Math.min(sizeNumber*.1,.6)):base;return{label:item.label,data:keys.map(key=>data.filter(row=>lineKey(row)===item.key&&bucket(row.date)===key).reduce((sum,row)=>sum+row.quantity_kg,0)),stack:sizeMode?item.species:undefined,borderColor:sizeMode?base:colour,backgroundColor:sizeMode?colour:colour+"22",borderWidth:sizeMode?1:2,borderRadius:sizeMode?3:0,borderSkipped:false,tension:.16,pointRadius:monthly?2:1,barPercentage:.82,categoryPercentage:.78};});
    }
    chart.update();
    const total=data.reduce((sum,row)=>sum+row.quantity_kg,0); $("summary").textContent=`${fmt.format(total)} kg · ${data.length.toLocaleString("fo-FO")} skrásetingar${focusedSize?` · ${focusedSize.replace("|||"," · ")}`:""}`;
    $("rows").innerHTML=data.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.quantity_kg-a.quantity_kg).slice(0,1200).map(row=>`<tr><td>${formatDate(row.date)}</td><td>${row.species}</td><td>${row.size_group}</td><td>${row.ship_group}</td><td>${fmt.format(row.quantity_kg)}</td></tr>`).join("");
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
  const dayAt = index => {const date=new Date(`${minDate}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+Number(index));return date.toISOString().slice(0,10);};
  function updateTimeline(){
    const from=$("rangeFrom"),to=$("rangeTo"),maximum=Number(to.max)||1;
    if(Number(from.value)>Number(to.value)) from.value=to.value;
    $("from-date").value=dayAt(from.value);$("to-date").value=dayAt(to.value);
    const left=Number(from.value)/maximum*100,right=100-Number(to.value)/maximum*100;
    $("timeline").style.setProperty("--from",`calc(18px + (100% - 36px) * ${left/100})`);$("timeline").style.setProperty("--to",`calc(18px + (100% - 36px) * ${right/100})`);
    const toPercent=Number(to.value)/maximum*100;$("fromBubble").style.left=`calc(18px + (100% - 36px) * ${left/100})`;$("toBubble").style.left=`calc(18px + (100% - 36px) * ${toPercent/100})`;
    $("fromBubble").textContent=formatDate($("from-date").value);$("toBubble").textContent=formatDate($("to-date").value);separateTimelineLabels($("fromBubble"),$("toBubble"),left,toPercent);
  }
  function setupTimeline(){
    const maximum=Math.round((new Date(`${maxDate}T12:00:00Z`)-new Date(`${minDate}T12:00:00Z`))/86400000);
    [$("rangeFrom"),$("rangeTo")].forEach(input=>{input.min=0;input.max=maximum});$("rangeTo").value=maximum;$("rangeFrom").value=Math.max(0,maximum-89);
    const firstYear=Number(minDate.slice(0,4)),lastYear=Number(maxDate.slice(0,4));$("months").innerHTML=Array.from({length:lastYear-firstYear+1},(_,index)=>`<span>${firstYear+index}</span>`).join("");
    updateTimeline();
    [$("rangeFrom"),$("rangeTo")].forEach(input=>{input.oninput=()=>{updateTimeline();render()};input.onchange=async()=>{updateTimeline();await ensureFullHistory();render()};});
  }
  fetch("data/norway/norway-latest.json",{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}).then(payload=>{
    rows=payload.rows.map(row=>objectRow(payload.fields,row)); minDate=payload.min_date; maxDate=payload.max_date; latestStart=payload.latest_start;
    [$("from-date"),$("to-date")].forEach(control=>{control.min=minDate;control.max=maxDate}); $("updated").textContent=`Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
    chart=new Chart($("chart"),{
      type:"line",
      data:{labels:[],datasets:[]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        interaction:{mode:"index",intersect:false},
        plugins:{
          legend:{display:false},
          tooltip:{
            itemSort:(a,b)=>b.parsed.y-a.parsed.y,
            filter:item=>Number(item.parsed.y)>0
          }
        },
        scales:{
          x:{grid:{display:false},ticks:{maxTicksLimit:12}},
          y:{beginAtZero:true,title:{display:true,text:"Kilo"},ticks:{callback:value=>fmt.format(value)}}
        }
      }
    });
    $("status").hidden=true; $("dashboard").hidden=false; renderSpecies(); renderGroups(); setupTimeline(); render();
    $("allSpecies").onclick=()=>{selected.clear();speciesOrder.forEach(name=>selected.add(name));focusedSize="";renderSpecies();render()};
    $("metrics").querySelectorAll("button").forEach(button=>button.onclick=()=>{metric=button.dataset.metric;$("metrics").querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===button));render()});
    $("splitGroups").onclick=()=>{$("splitGroups").classList.toggle("active");render()};
  }).catch(error=>{$("status").textContent=`Norsku tølini kundu ikki vísast: ${error.message}`;$("updated").textContent="Tøl ikki tøk"});
})();
