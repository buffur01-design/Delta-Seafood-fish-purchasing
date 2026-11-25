(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  const colours=["#74b5c5","#08752f","#9cb4d6","#dda879","#7650a5","#d19aa2","#b7dce5","#a17b00","#44a98c","#bd5ec8","#91ae16","#62aabd"];
  const fmt=new Intl.NumberFormat("fo-FO",{maximumFractionDigits:0});
  const dateFmt=new Intl.DateTimeFormat("fo-FO",{day:"2-digit",month:"2-digit",year:"numeric"});
  const dateTickLimit=(count,width)=>Math.max(2,Math.min(count,Math.floor(Math.max(320,width||900)/85)));
  function separateTimelineLabels(fromLabel,toLabel,fromPercent,toPercent){let a="-50%",b="-50%";if(toPercent-fromPercent<12){if(toPercent>85){a="-200%";b="-100%"}else if(fromPercent<15){a="0";b="100%"}else{a="-100%";b="0"}}fromLabel.style.transform=`translateX(${a})`;toLabel.style.transform=`translateX(${b})`}
  let rows=[],vessels=[],dates=[],speciesOrder=[],selected=new Set(),metric="quantity_kg",chart,timelineStart=0,timelineEnd=0,timelineMaximum=0;
  const objectRow=(fields,row)=>Object.fromEntries(fields.map((field,index)=>[field,row[index]]));
  const displayDate=value=>dateFmt.format(new Date(`${value}T12:00:00Z`));
  const inRange=row=>row.auction_date>=$("from-date").value&&row.auction_date<=$("to-date").value;
  const mscMatch=row=>$("msc").value==="all"||($("msc").value==="msc")===Boolean(row.msc);

  function renderSpecies(){
    const available=new Set(rows.filter(row=>inRange(row)&&mscMatch(row)).map(row=>row.species));
    selected=new Set([...selected].filter(name=>available.has(name)));if(!selected.size) speciesOrder.filter(name=>available.has(name)).slice(0,6).forEach(name=>selected.add(name));
    $("species").innerHTML=speciesOrder.filter(name=>available.has(name)).map(name=>{const index=speciesOrder.indexOf(name);return `<button type="button" class="${selected.has(name)?"active":""}" data-name="${name}" style="--c:${colours[index%colours.length]}">${name}</button>`;}).join("");
    $("species").querySelectorAll("button").forEach(button=>button.onclick=()=>{selected.has(button.dataset.name)?selected.delete(button.dataset.name):selected.add(button.dataset.name);renderSpecies();render()});
  }
  function renderVessels(){
    const search=$("vesselSearch").value.trim().toLocaleLowerCase("fo"),latest=$("to-date").value;
    const data=vessels.filter(row=>row.auction_date===latest&&(!search||row.vessel.toLocaleLowerCase("fo").includes(search))).sort((a,b)=>b.quantity_kg-a.quantity_kg);
    $("vessels").innerHTML=data.length?data.map((row,index)=>`<div class="vessel-row"><i style="--dot:${colours[index%colours.length]}"></i><b>${row.vessel}</b><strong>${fmt.format(row.quantity_kg)} kg</strong></div>`).join(""):'<span>Eingi skipatøl henda dagin.</span>';
  }
  function render(){
    const filtered=rows.filter(row=>inRange(row)&&mscMatch(row)&&selected.has(row.species)),labels=dates.filter(day=>day>=$("from-date").value&&day<=$("to-date").value);
    chart.data.labels=labels.map(displayDate);chart.data.datasets=[...selected].map(name=>{const colour=colours[speciesOrder.indexOf(name)%colours.length];return{label:name,data:labels.map(day=>filtered.filter(row=>row.auction_date===day&&row.species===name).reduce((sum,row)=>sum+Number(row[metric]||0),0)),borderColor:colour,backgroundColor:colour+"22",borderWidth:2,tension:.18,pointRadius:3};});
    chart.options.scales.x.ticks.maxTicksLimit=dateTickLimit(labels.length,chart.width);chart.options.scales.x.ticks.autoSkip=true;chart.options.scales.x.ticks.maxRotation=0;chart.options.scales.y.title.text=metric==="boxes"?"Kassar":"Kilo";chart.update();renderVessels();
    const kg=filtered.reduce((sum,row)=>sum+Number(row.quantity_kg||0),0),boxes=filtered.reduce((sum,row)=>sum+Number(row.boxes||0),0);$("summary").textContent=`${fmt.format(kg)} kg · ${fmt.format(boxes)} kassar · ${filtered.length.toLocaleString("fo-FO")} tilførslur`;
    $("rows").innerHTML=filtered.slice().sort((a,b)=>b.auction_date.localeCompare(a.auction_date)||b.quantity_kg-a.quantity_kg).slice(0,1000).map(row=>`<tr><td>${displayDate(row.auction_date)}</td><td>${row.species}</td><td>${row.msc?"Ja":"Nei"}</td><td>${row.grade}</td><td>${row.boxes==null?"—":fmt.format(row.boxes)}</td><td>${fmt.format(row.quantity_kg)}</td></tr>`).join("");
  }
  function updateTimeline(){
    const from=$("rangeFrom"),to=$("rangeTo"),maximum=Math.max(1,timelineEnd-timelineStart);if(Number(from.value)>Number(to.value))from.value=to.value;
    $("from-date").value=dates[Number(from.value)];$("to-date").value=dates[Number(to.value)];const left=(Number(from.value)-timelineStart)/maximum*100,right=100-(Number(to.value)-timelineStart)/maximum*100;
    const toPercent=(Number(to.value)-timelineStart)/maximum*100;$("timeline").style.setProperty("--from",`calc(18px + (100% - 36px) * ${left/100})`);$("timeline").style.setProperty("--to",`calc(18px + (100% - 36px) * ${right/100})`);$("fromBubble").style.left=`calc(18px + (100% - 36px) * ${left/100})`;$("toBubble").style.left=`calc(18px + (100% - 36px) * ${toPercent/100})`;$("fromBubble").textContent=displayDate($("from-date").value);$("toBubble").textContent=displayDate($("to-date").value);separateTimelineLabels($("fromBubble"),$("toBubble"),left,toPercent);
  }
  function renderTimelineMonths(){const span=Math.max(1,timelineEnd-timelineStart),seen=new Set(),ticks=[];for(let i=timelineStart;i<=timelineEnd;i++){const key=(dates[i]||"").slice(0,7);if(key&&!seen.has(key)){seen.add(key);ticks.push([i,key])}}const step=Math.max(1,Math.ceil(ticks.length/7));$("months").innerHTML=ticks.filter((_,i)=>i%step===0||i===ticks.length-1).map(([index,key])=>`<span style="left:${(index-timelineStart)/span*100}%">${new Intl.DateTimeFormat("fo-FO",{month:"short",year:ticks.length>12?"2-digit":undefined,timeZone:"UTC"}).format(new Date(`${key}-01T12:00:00Z`))}</span>`).join("")}
  function fitTimelineWindow(){const from=Number($("rangeFrom").value),to=Number($("rangeTo").value),span=Math.max(1,to-from);timelineStart=Math.max(0,from-span);timelineEnd=Math.min(timelineMaximum,to+Math.max(1,Math.round(span*.15)));[$("rangeFrom"),$("rangeTo")].forEach(input=>{input.min=timelineStart;input.max=timelineEnd});renderTimelineMonths()}
  function panTimelineAtEdge(index){const input=index===0?$("rangeFrom"):$("rangeTo"),span=Math.max(1,timelineEnd-timelineStart),edge=Math.max(3,Math.round(span*.05)),shift=Math.max(14,Math.round(span*.5));if(index===0&&Number(input.value)<=timelineStart+edge&&timelineStart>0)timelineStart=Math.max(0,timelineStart-shift);if(index===1&&Number(input.value)>=timelineEnd-edge&&timelineEnd<timelineMaximum)timelineEnd=Math.min(timelineMaximum,timelineEnd+shift);[$("rangeFrom"),$("rangeTo")].forEach(item=>{item.min=timelineStart;item.max=timelineEnd});renderTimelineMonths()}
  function setupTimeline(){
    const maximum=Math.max(0,dates.length-1);timelineMaximum=maximum;[$("rangeFrom"),$("rangeTo")].forEach(input=>{input.min=0;input.max=maximum});$("rangeFrom").value=Math.max(0,maximum-89);$("rangeTo").value=maximum;fitTimelineWindow();updateTimeline();[$("rangeFrom"),$("rangeTo")].forEach((input,index)=>{input.oninput=()=>{panTimelineAtEdge(index);updateTimeline();renderSpecies();render()};input.onchange=()=>{fitTimelineWindow();updateTimeline();renderSpecies();render()}});
  }
  fetch("data/hanstholm/hanstholm.json",{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}).then(payload=>{
    rows=payload.rows.map(row=>objectRow(payload.fields,row));vessels=payload.vessels.map(row=>objectRow(payload.vessel_fields,row));dates=[...new Set(rows.map(row=>row.auction_date))].sort();if(!dates.length)throw new Error("Eingi tøl eru í dátusavninum");
    const totals=new Map();rows.forEach(row=>totals.set(row.species,(totals.get(row.species)||0)+Number(row.quantity_kg||0)));speciesOrder=[...totals].sort((a,b)=>b[1]-a[1]).map(item=>item[0]);speciesOrder.slice(0,6).forEach(name=>selected.add(name));$("updated").textContent=`Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
    chart=new Chart($("chart"),{type:"line",data:{labels:[],datasets:[]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{itemSort:(a,b)=>b.parsed.y-a.parsed.y,filter:item=>Number(item.parsed.y)>0}},scales:{x:{grid:{display:false},ticks:{}},y:{beginAtZero:true,title:{display:true,text:"Kilo"},ticks:{callback:value=>fmt.format(value)}}}}});
    $("status").hidden=true;$("dashboard").hidden=false;setupTimeline();renderSpecies();render();
    $("allSpecies").onclick=()=>{selected=new Set(speciesOrder);renderSpecies();render()};$("msc").onchange=()=>{renderSpecies();render()};$("vesselSearch").oninput=renderVessels;$("metrics").querySelectorAll("button").forEach(button=>button.onclick=()=>{metric=button.dataset.metric;$("metrics").querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===button));render()});
  }).catch(error=>{$("status").textContent=`Hanstholm-tølini kundu ikki vísast: ${error.message}`;$("updated").textContent="Tøl ikki tøk"});
})();
