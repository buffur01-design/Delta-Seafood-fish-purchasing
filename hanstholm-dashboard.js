(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const colours = ["#08752f","#2e86ab","#ca6f1e","#7650a5","#bd3349","#a17b00","#2d9b84","#5a82b8","#82bdc9","#d19aa2"];
  const number = new Intl.NumberFormat("fo-FO", {maximumFractionDigits:0});
  const dateFormat = new Intl.DateTimeFormat("fo-FO", {day:"2-digit",month:"2-digit",year:"numeric"});
  let rows = [], vessels = [], dates = [], selected = new Set(), chart;

  const rowObject = (fields, row) => Object.fromEntries(fields.map((field, index) => [field, row[index]]));
  const displayDate = value => dateFormat.format(new Date(`${value}T12:00:00Z`));
  const inRange = row => row.auction_date >= $("from-date").value && row.auction_date <= $("to-date").value;
  const mscMatch = row => $("msc").value === "all" || ($("msc").value === "msc") === Boolean(row.msc);

  function renderSpecies() {
    const totals = new Map();
    rows.filter(row => inRange(row) && mscMatch(row)).forEach(row => totals.set(row.species, (totals.get(row.species) || 0) + Number(row.quantity_kg || 0)));
    const species = [...totals].sort((a,b) => b[1]-a[1]).map(item => item[0]);
    selected = new Set([...selected].filter(value => species.includes(value)));
    if (!selected.size) species.slice(0, 6).forEach(value => selected.add(value));
    $("species").innerHTML = species.map((name,index) => `<button type="button" class="${selected.has(name)?"active":""}" data-name="${name.replaceAll('"','&quot;')}" style="--c:${colours[index%colours.length]}">${name}</button>`).join("");
    $("species").querySelectorAll("button").forEach(button => button.onclick = () => {
      selected.has(button.dataset.name) ? selected.delete(button.dataset.name) : selected.add(button.dataset.name);
      renderSpecies(); render();
    });
  }

  function render() {
    const filtered = rows.filter(row => inRange(row) && mscMatch(row));
    const metric = $("metric").value;
    const labels = dates.filter(day => day >= $("from-date").value && day <= $("to-date").value);
    const species = [...selected];
    chart.data.labels = labels.map(displayDate);
    chart.data.datasets = species.map((name,index) => ({
      label:name,
      data:labels.map(day => filtered.filter(row => row.auction_date===day && row.species===name).reduce((sum,row) => sum + Number(row[metric] || 0),0)),
      borderColor:colours[index%colours.length],backgroundColor:colours[index%colours.length]+"22",borderWidth:2,tension:.18,pointRadius:3
    }));
    chart.options.scales.y.title.text = metric === "boxes" ? "Kassar" : "Kilo";
    chart.update();
    $("total-kg").textContent = number.format(filtered.reduce((sum,row)=>sum+Number(row.quantity_kg||0),0));
    $("total-boxes").textContent = number.format(filtered.reduce((sum,row)=>sum+Number(row.boxes||0),0));
    const latest = $("to-date").value;
    const latestVessels = vessels.filter(row => row.auction_date === latest).sort((a,b)=>b.quantity_kg-a.quantity_kg);
    $("vessel-count").textContent = number.format(latestVessels.length);
    $("vessels").innerHTML = latestVessels.map(row=>`<tr><td>${row.vessel}</td><td>${number.format(row.quantity_kg)}</td></tr>`).join("") || '<tr><td colspan="2">Eingi skipatøl</td></tr>';
    $("rows").innerHTML = filtered.slice().sort((a,b)=>b.auction_date.localeCompare(a.auction_date)||b.quantity_kg-a.quantity_kg).slice(0,1000).map(row=>`<tr><td>${displayDate(row.auction_date)}</td><td>${row.species}</td><td>${row.msc?"Ja":"Nei"}</td><td>${row.grade}</td><td>${row.boxes==null?"—":number.format(row.boxes)}</td><td>${number.format(row.quantity_kg)}</td></tr>`).join("");
  }

  fetch("data/hanstholm/hanstholm.json", {cache:"no-store"}).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(payload => {
    rows = payload.rows.map(row => rowObject(payload.fields,row));
    vessels = payload.vessels.map(row => rowObject(payload.vessel_fields,row));
    dates = [...new Set(rows.map(row=>row.auction_date))].sort();
    if (!dates.length) throw new Error("Eingi tøl eru í dátusavninum");
    [$("from-date"),$("to-date")].forEach(select => select.innerHTML = dates.map(day=>`<option value="${day}">${displayDate(day)}</option>`).join(""));
    $("from-date").value = dates[0]; $("to-date").value = dates.at(-1);
    $("auction-date").textContent = displayDate(dates.at(-1));
    $("updated").textContent = `Dagført ${new Date(payload.updated_utc).toLocaleString("fo-FO")}`;
    chart = new Chart($("chart"), {type:"line",data:{labels:[],datasets:[]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{itemSort:(a,b)=>b.parsed.y-a.parsed.y}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,title:{display:true,text:"Kilo"}}}}});
    $("status").hidden = true; $("dashboard").hidden = false;
    renderSpecies(); render();
    [$("from-date"),$("to-date"),$("metric"),$("msc")].forEach(control => control.onchange = () => { if ($("from-date").value > $("to-date").value) $("from-date").value = $("to-date").value; renderSpecies(); render(); });
  }).catch(error => { $("status").textContent = `Hanstholm-tølini kundu ikki vísast: ${error.message}`; $("updated").textContent = "Tøl ikki tøk"; });
})();
