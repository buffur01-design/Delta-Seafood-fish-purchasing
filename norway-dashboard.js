(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const speciesOrder = ["Blálonga","Brosma","Havtaska","Hvítingur","Hýsa","Kalvi","Kongafiskur","Longa","Reyðsprøka","Svartkalvi","Toskur","Upsi"];
  const colours = ["#74b5c5","#08752f","#9cb4d6","#dda879","#7650a5","#d19aa2","#b7dce5","#a17b00","#44a98c","#bd5ec8","#91ae16","#62aabd"];
  const number = new Intl.NumberFormat("fo-FO", {maximumFractionDigits:0});
  const dateFormat = new Intl.DateTimeFormat("fo-FO", {day:"2-digit",month:"2-digit",year:"numeric"});
  let rows=[], minDate="", maxDate="", latestStart="", fullLoaded=false, selected=new Set(speciesOrder.slice(0,6)), chart;
  const objectRow = (fields,row) => Object.fromEntries(fields.map((field,index)=>[field,row[index]]));
  const formatDate = value => dateFormat.format(new Date(`${value}T12:00:00Z`));
  const filtered = () => rows.filter(row => row.date >= $("from-date").value && row.date <= $("to-date").value && selected.has(row.species));
  const monthKey = day => day.slice(0,7);

  function renderSpecies(){
    $("species").innerHTML=speciesOrder.map((name,index)=>`<button type="button" class="${selected.has(name)?"active":""}" data-name="${name}" style="--c:${colours[index]}">${name}</button>`).join("");
    $("species").querySelectorAll("button").forEach(button=>button.onclick=()=>{selected.has(button.dataset.name)?selected.delete(button.dataset.name):selected.add(button.dataset.name);renderSpecies();render();});
  }
  function render(){
    const data=filtered(), monthly=$("resolution").value==="monthly", divisor=$("unit").value==="tonnes"?1000:1;
    const keys=[...new Set(data.map(row=>monthly?monthKey(row.date):row.date))].sort();
    chart.data.labels=keys.map(key=>monthly?key:formatDate(key));
    chart.data.datasets=[...selected].map(name=>{const index=speciesOrder.indexOf(name);return{label:name,data:keys.map(key=>data.filter(row=>row.species===name&&(monthly?monthKey(row.date)===key:row.date===key)).reduce((sum,row)=>sum+row.quantity_kg/divisor,0)),borderColor:colours[index],backgroundColor:colours[index]+"22",borderWidth:2,tension:.16,pointRadius:monthly?2:1};});
    chart.options.scales.y.title.text=$("unit").value==="tonnes"?"Tons":"Kilo";chart.update();
    const total=data.reduce((sum,row)=>sum+row.quantity_kg,0), days=new Set(data.map(row=>row.date)).size;
    $("total-kg").textContent=number.format(total);$("average-kg").textContent=number.format(days?total/days:0);$("active-days").textContent=number.format(days);
    const daily=new Map();data.forEach(row=>{const key=`${row.date}\u0000${row.species}`;daily.set(key,(daily.get(key)||0)+row.quantity_kg);});
    $("rows").innerHTML=[...daily].map(([key,kg])=>{const [date,species]=key.split("\u0000");return{date,species,kg};}).sort((a,b)=>b.date.localeCompare(a.date)||b.kg-a.kg).slice(0,1200).map(row=>`<tr><td>${formatDate(row.date)}</td><td>${row.species}</td><td>${number.format(row.kg)}</td></tr>`).join("");
  }
  async function ensureFullHistory(){
    if(fullLoaded || $("from-date").value>=latestStart)return;
    $("updated").textContent="Lesur eldri norsk landingartøl…";
    const response=await fetch("data/norway/norway-landings.json",{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();rows=payload.rows.map(row=>objectRow(payload.fields,row));fullLoaded=true;$("updated").textContent=`Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
  }
  async function setPeriod(value){
    $("to-date").value=maxDate;
    if(value==="all") $("from-date").value=minDate; else {const date=new Date(`${maxDate}T12:00:00Z`);date.setUTCDate(date.getUTCDate()-Number(value)+1);$("from-date").value=date.toISOString().slice(0,10)<minDate?minDate:date.toISOString().slice(0,10);}
    document.querySelectorAll(".period").forEach(button=>button.classList.toggle("active",button.dataset.days===String(value)));await ensureFullHistory();render();
  }
  fetch("data/norway/norway-latest.json",{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}).then(payload=>{
    rows=payload.rows.map(row=>objectRow(payload.fields,row));minDate=payload.min_date;maxDate=payload.max_date;latestStart=payload.latest_start;
    $("from-date").min=minDate;$("from-date").max=maxDate;$("to-date").min=minDate;$("to-date").max=maxDate;$("latest-date").textContent=formatDate(maxDate);$("updated").textContent=`Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
    chart=new Chart($("chart"),{
      type:"line",
      data:{labels:[],datasets:[]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        interaction:{mode:"index",intersect:false},
        plugins:{legend:{display:false},tooltip:{itemSort:(a,b)=>b.parsed.y-a.parsed.y}},
        scales:{
          x:{grid:{display:false},ticks:{maxTicksLimit:12}},
          y:{beginAtZero:true,title:{display:true,text:"Kilo"},ticks:{callback:value=>number.format(value)}}
        }
      }
    });
    $("status").hidden=true;$("dashboard").hidden=false;renderSpecies();setPeriod(90);
    [$("from-date"),$("to-date")].forEach(control=>control.onchange=async()=>{document.querySelectorAll(".period").forEach(button=>button.classList.remove("active"));await ensureFullHistory();render();});[$("unit"),$("resolution")].forEach(control=>control.onchange=render);document.querySelectorAll(".period").forEach(button=>button.onclick=()=>setPeriod(button.dataset.days));
  }).catch(error=>{$("status").textContent=`Norsku tølini kundu ikki vísast: ${error.message}`;$("updated").textContent="Tøl ikki tøk";});
})();
