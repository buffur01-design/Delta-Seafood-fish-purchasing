(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const speciesOrder = ["Blálonga","Brosma","Havtaska","Hvítingur","Hýsa","Kalvi","Kongafiskur","Longa","Reyðsprøka","Svartkalvi","Toskur","Upsi"];
  const colours = ["#74b5c5","#08752f","#9cb4d6","#dda879","#7650a5","#d19aa2","#b7dce5","#a17b00","#44a98c","#bd5ec8","#91ae16","#62aabd"];
  const sizeColours = ["#64748b","#d1495b","#ed9b40","#3d7ea6","#159d8c","#7b2cbf","#e76f51"];
  const gearColours = ["#0077b6","#f4a261","#2a9d8f","#9b5de5","#e63946","#6c757d"], conditionColours={"Ferskt":"#20a37a","Fryst":"#4b7bec"};
  const fmt = new Intl.NumberFormat("fo-FO", {maximumFractionDigits:0});
  const dateFmt = new Intl.DateTimeFormat("fo-FO", {day:"2-digit",month:"2-digit",year:"numeric"});
  const dateTickLimit = (count,width) => Math.max(2,Math.min(count,Math.floor(Math.max(320,width||900)/85)));
  function separateTimelineLabels(fromLabel,toLabel,fromPercent,toPercent){let a="-50%",b="-50%";if(toPercent-fromPercent<12){if(toPercent>85){a="-200%";b="-100%"}else if(fromPercent<15){a="0";b="100%"}else{a="-100%";b="0"}}fromLabel.style.transform=`translateX(${a})`;toLabel.style.transform=`translateX(${b})`}
  let rows=[], minDate="", maxDate="", latestStart="", fullLoaded=false, metric="quantity", focusedSize="", chart, timelineStart=0, timelineEnd=0, timelineMaximum=0, filtersInitialized=false;
  const selected = new Set(speciesOrder.slice(0,6));
  const selectedGearGroups = new Set(), selectedConditions = new Set();
  const catchGroups = [
    ["Trol (Trawl) · aktive slæberedskaber",["Bunntrål","Bunntrål par","Bomtrål","Flytetrål","Reketrål (herunder sputniktrål)","Krepsetrål","Udefinert trål"]],
    ["Nót (Vod / Not) · indkredsende redskaber",["Snurpenot/ringnot","Landnot","Snurrevad","Udefinert not"]],
    ["Gørn · passive netredskaber",["Settegarn","Drivgarn","Udefinert garn"]],
    ["Línu (Krogredskaber) · line- og snørefiskeri",["Autoline","Flyteline","Andre liner","Dorg/harp/snik","Juksa/pilk","Udefinert krokredskap"]],
    ["Teiner og ruser · fælder",["Teiner","Havteiner","Ruser"]],
    ["Øvrigt",["Annet"]]
  ];
  const gearGroup = method => (catchGroups.find(([,methods])=>methods.includes(method))||catchGroups[catchGroups.length-1])[0].split(" · ")[0];
  const sizeColour = size => {const match=size.match(/\d+/);return sizeColours[match?Math.min(Number(match[0]),sizeColours.length-1):0]};
  const objectRow = (fields,row) => { const item=Object.fromEntries(fields.map((field,index)=>[field,row[index]])); item.size_group=item.size_group||"Ikki upplýst"; item.catch_method=item.catch_method||"Ikki upplýst"; item.condition=item.condition||"Ikki upplýst"; item.quantity_kg=Number(item.quantity_kg||0); return item; };
  const formatDate = value => dateFmt.format(new Date(`${value}T12:00:00Z`));
  const monthKey = day => day.slice(0,7);
  const weekKey = day => {const date=new Date(`${day}T12:00:00Z`);const offset=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-offset);return date.toISOString().slice(0,10);};
  const tint = (hex,amount) => {const value=parseInt(hex.slice(1),16),mix=channel=>Math.round(channel+(255-channel)*amount);return `rgb(${mix(value>>16)}, ${mix((value>>8)&255)}, ${mix(value&255)})`;};
  const periodSpeciesRows = () => rows.filter(row => row.date >= $("from-date").value && row.date <= $("to-date").value && selected.has(row.species));
  const datedRows = () => periodSpeciesRows().filter(row => selectedGearGroups.has(gearGroup(row.catch_method)) && selectedConditions.has(row.condition));
  const seriesKey = row => `${row.species}|||${row.size_group}`;
  const visibleRows = () => datedRows().filter(row => !focusedSize || seriesKey(row)===focusedSize);

  function renderSpecies(){
    $("species").innerHTML=speciesOrder.map((name,index)=>`<button type="button" class="${selected.has(name)?"active":""}" data-name="${name}" style="--c:${colours[index]}">${name}</button>`).join("");
    $("species").querySelectorAll("button").forEach(button=>button.onclick=()=>{selected.has(button.dataset.name)?selected.delete(button.dataset.name):selected.add(button.dataset.name);focusedSize="";renderSpecies();render();});
  }
  function renderChoiceFilter(id,values,selectedValues,totals){
    $(id).innerHTML=values.map(value=>`<label class="filter-total"><input type="checkbox" value="${value.replaceAll('"','&quot;')}" ${selectedValues.has(value)?"checked":""}><span>${value}</span><strong>${fmt.format(totals.get(value)||0)} kg</strong></label>`).join("");
    $(id).querySelectorAll("input").forEach(input=>input.onchange=()=>{input.checked?selectedValues.add(input.value):selectedValues.delete(input.value);render()});
  }
  function renderSideFilter(id,values,selectedValues,totals,palette){
    $(id).innerHTML=values.map((value,index)=>`<label class="filter-side-row ${selectedValues.has(value)?"active":""}"><input type="checkbox" value="${value.replaceAll('"','&quot;')}" ${selectedValues.has(value)?"checked":""}><i style="--dot:${palette[value]||palette[index]||"#64748b"}"></i><span>${value}</span><strong>${fmt.format(totals.get(value)||0)} kg</strong></label>`).join("");
    $(id).querySelectorAll("input").forEach(input=>input.onchange=()=>{input.checked?selectedValues.add(input.value):selectedValues.delete(input.value);render()});
  }
  function renderFilters(){
    const gearValues=catchGroups.map(([title])=>title.split(" · ")[0]),conditions=["Ferskt","Fryst"];
    if(!filtersInitialized){gearValues.forEach(value=>selectedGearGroups.add(value));conditions.forEach(value=>selectedConditions.add(value));filtersInitialized=true}
    const gearTotals=new Map(),conditionTotals=new Map();
    periodSpeciesRows().forEach(row=>{if(selectedConditions.has(row.condition)){const group=gearGroup(row.catch_method);gearTotals.set(group,(gearTotals.get(group)||0)+row.quantity_kg)}if(selectedGearGroups.has(gearGroup(row.catch_method)))conditionTotals.set(row.condition,(conditionTotals.get(row.condition)||0)+row.quantity_kg)});
    renderChoiceFilter("catchOptions",gearValues,selectedGearGroups,gearTotals);renderChoiceFilter("conditionOptions",conditions,selectedConditions,conditionTotals);renderSideFilter("gearSummary",gearValues,selectedGearGroups,gearTotals,gearColours);renderSideFilter("conditionSummary",conditions,selectedConditions,conditionTotals,conditionColours);
  }
  function renderSizes(){
    const totals=new Map(); datedRows().forEach(row=>totals.set(seriesKey(row),(totals.get(seriesKey(row))||0)+row.quantity_kg));
    const groups=[...totals].sort((a,b)=>b[1]-a[1]);
    $("sizes").innerHTML=groups.length?groups.map(([key,kg])=>{const [species,size]=key.split("|||");const colour=sizeColour(size);return `<button type="button" class="size-row ${focusedSize===key?"active":""}" data-key="${key}"><i style="--dot:${colour}"></i><span><b>${species}</b> · ${size}</span><strong>${fmt.format(kg)} kg</strong></button>`;}).join(""):'<span>Ongir støddarbólkar.</span>';
    $("sizes").querySelectorAll("button").forEach(button=>button.onclick=()=>{focusedSize=focusedSize===button.dataset.key?"":button.dataset.key;render();});
  }
  function render(){
    renderFilters();renderSizes(); const data=visibleRows();
    const days=(new Date($("to-date").value)-new Date($("from-date").value))/86400000;
    const sizeMode=metric==="size", monthly=!sizeMode&&days>400;
    const bucket=day=>sizeMode?weekKey(day):(monthly?monthKey(day):day);
    const keys=[...new Set(data.map(row=>bucket(row.date)))].sort();
    chart.config.type=metric==="total"||sizeMode?"bar":"line";
    chart.options.scales.x.stacked=sizeMode;chart.options.scales.y.stacked=sizeMode;
    chart.options.scales.x.ticks.maxTicksLimit=metric==="total"?12:dateTickLimit(keys.length,chart.width);chart.options.scales.x.ticks.autoSkip=true;chart.options.scales.x.ticks.maxRotation=metric==="total"?45:0;chart.options.scales.x.ticks.minRotation=metric==="total"?45:0;
    const lineKey=row=>sizeMode?`${row.species}|||${row.size_group}`:row.species;
    const series=[...new Map(data.map(row=>[lineKey(row),{key:lineKey(row),label:lineKey(row).replaceAll("|||"," · "),species:row.species}])).values()];
    chart.data.labels=metric==="total"?series.map(item=>item.label):keys.map(key=>monthly?key:formatDate(key));
    if(metric==="total") chart.data.datasets=[{label:"Kilo tilsamans",data:series.map(item=>data.filter(row=>lineKey(row)===item.key).reduce((sum,row)=>sum+row.quantity_kg,0)),backgroundColor:series.map(item=>colours[speciesOrder.indexOf(item.species)])}];
    else {
      chart.data.datasets=series.map(item=>{const base=colours[speciesOrder.indexOf(item.species)],size=item.label.split(" · ").pop(),colour=sizeMode?sizeColour(size):base;return{label:item.label,data:keys.map(key=>data.filter(row=>lineKey(row)===item.key&&bucket(row.date)===key).reduce((sum,row)=>sum+row.quantity_kg,0)),stack:sizeMode?item.species:undefined,borderColor:colour,backgroundColor:sizeMode?colour:colour+"22",borderWidth:sizeMode?1:2,borderRadius:sizeMode?3:0,borderSkipped:false,tension:.16,pointRadius:monthly?2:1,barPercentage:.82,categoryPercentage:.78};});
    }
    chart.$breakdownLines=metric==="total"?[]:keys.map(key=>{const pointRows=data.filter(row=>bucket(row.date)===key),gearTotals=new Map(),conditionTotals=new Map();pointRows.forEach(row=>{const group=gearGroup(row.catch_method);gearTotals.set(group,(gearTotals.get(group)||0)+row.quantity_kg);conditionTotals.set(row.condition,(conditionTotals.get(row.condition)||0)+row.quantity_kg)});const gearLines=catchGroups.map(([title])=>title.split(" · ")[0]).filter(group=>gearTotals.get(group)>0).map(group=>`${group}: ${fmt.format(gearTotals.get(group))} kg`),conditionLines=["Ferskt","Fryst"].filter(condition=>conditionTotals.get(condition)>0).map(condition=>`${condition}: ${fmt.format(conditionTotals.get(condition))} kg`);return [...(gearLines.length?["Veiðiháttur:",...gearLines]:[]),...(conditionLines.length?["Ferskt / fryst:",...conditionLines]:[])]});
    chart.update();
    const total=data.reduce((sum,row)=>sum+row.quantity_kg,0); $("summary").textContent=`${fmt.format(total)} kg · ${data.length.toLocaleString("fo-FO")} skrásetingar${focusedSize?` · ${focusedSize.replace("|||"," · ")}`:""}`;
    $("rows").innerHTML=data.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.quantity_kg-a.quantity_kg).slice(0,1200).map(row=>`<tr><td>${formatDate(row.date)}</td><td>${row.species}</td><td>${row.size_group}</td><td>${gearGroup(row.catch_method)}</td><td>${row.condition}</td><td>${fmt.format(row.quantity_kg)}</td></tr>`).join("");
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
  function renderTimelineMonths(){const span=Math.max(1,timelineEnd-timelineStart),start=new Date(`${dayAt(timelineStart)}T12:00:00Z`),end=new Date(`${dayAt(timelineEnd)}T12:00:00Z`),ticks=[];let cursor=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),1));if(cursor<start)cursor.setUTCMonth(cursor.getUTCMonth()+1);while(cursor<=end){ticks.push(new Date(cursor));cursor.setUTCMonth(cursor.getUTCMonth()+1)}const step=Math.max(1,Math.ceil(ticks.length/7)),fmtMonth=new Intl.DateTimeFormat("fo-FO",{month:"short",year:ticks.length>12?"2-digit":undefined,timeZone:"UTC"});$("months").innerHTML=ticks.filter((_,i)=>i%step===0||i===ticks.length-1).map(date=>{const index=Math.round((date-new Date(`${minDate}T12:00:00Z`))/86400000);return `<span style="left:${(index-timelineStart)/span*100}%">${fmtMonth.format(date)}</span>`}).join("")}
  function fitTimelineWindow(){const from=Number($("rangeFrom").value),to=Number($("rangeTo").value),span=Math.max(1,to-from);timelineStart=Math.max(0,from-span);timelineEnd=Math.min(timelineMaximum,to+Math.max(1,Math.round(span*.15)));[$("rangeFrom"),$("rangeTo")].forEach(input=>{input.min=timelineStart;input.max=timelineEnd});renderTimelineMonths()}
  function panTimelineAtEdge(index){const input=index===0?$("rangeFrom"):$("rangeTo"),span=Math.max(1,timelineEnd-timelineStart),edge=Math.max(3,Math.round(span*.05)),shift=Math.max(14,Math.round(span*.5));if(index===0&&Number(input.value)<=timelineStart+edge&&timelineStart>0)timelineStart=Math.max(0,timelineStart-shift);if(index===1&&Number(input.value)>=timelineEnd-edge&&timelineEnd<timelineMaximum)timelineEnd=Math.min(timelineMaximum,timelineEnd+shift);[$("rangeFrom"),$("rangeTo")].forEach(item=>{item.min=timelineStart;item.max=timelineEnd});renderTimelineMonths()}
  function updateTimeline(){
    const from=$("rangeFrom"),to=$("rangeTo"),maximum=Math.max(1,timelineEnd-timelineStart);
    if(Number(from.value)>Number(to.value)) from.value=to.value;
    $("from-date").value=dayAt(from.value);$("to-date").value=dayAt(to.value);
    const left=(Number(from.value)-timelineStart)/maximum*100,right=100-(Number(to.value)-timelineStart)/maximum*100;
    $("timeline").style.setProperty("--from",`calc(18px + (100% - 36px) * ${left/100})`);$("timeline").style.setProperty("--to",`calc(18px + (100% - 36px) * ${right/100})`);
    const toPercent=(Number(to.value)-timelineStart)/maximum*100;$("fromBubble").style.left=`calc(18px + (100% - 36px) * ${left/100})`;$("toBubble").style.left=`calc(18px + (100% - 36px) * ${toPercent/100})`;
    $("fromBubble").textContent=formatDate($("from-date").value);$("toBubble").textContent=formatDate($("to-date").value);separateTimelineLabels($("fromBubble"),$("toBubble"),left,toPercent);
  }
  function setupTimeline(){
    const maximum=Math.round((new Date(`${maxDate}T12:00:00Z`)-new Date(`${minDate}T12:00:00Z`))/86400000);
    timelineMaximum=maximum;[$("rangeFrom"),$("rangeTo")].forEach(input=>{input.min=0;input.max=maximum});$("rangeTo").value=maximum;$("rangeFrom").value=Math.max(0,maximum-89);fitTimelineWindow();
    updateTimeline();
    [$("rangeFrom"),$("rangeTo")].forEach((input,index)=>{input.oninput=()=>{panTimelineAtEdge(index);updateTimeline();render()};input.onchange=async()=>{fitTimelineWindow();updateTimeline();await ensureFullHistory();render()};});
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
            filter:item=>Number(item.parsed.y)>0,
            callbacks:{afterBody:items=>items.length&&chart.$breakdownLines?(chart.$breakdownLines[items[0].dataIndex]||[]):[]}
          }
        },
        scales:{
          x:{grid:{display:false},ticks:{maxTicksLimit:12}},
          y:{beginAtZero:true,title:{display:true,text:"Kilo"},ticks:{callback:value=>fmt.format(value)}}
        }
      }
    });
    $("status").hidden=true; $("dashboard").hidden=false; renderSpecies(); setupTimeline(); render();
    $("allSpecies").onclick=()=>{selected.clear();speciesOrder.forEach(name=>selected.add(name));focusedSize="";renderSpecies();render()};
    $("metrics").querySelectorAll("button").forEach(button=>button.onclick=()=>{metric=button.dataset.metric;$("metrics").querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===button));render()});
  }).catch(error=>{$("status").textContent=`Norsku tølini kundu ikki vísast: ${error.message}`;$("updated").textContent="Tøl ikki tøk"});
})();
