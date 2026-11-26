(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const colours = ["#74b5c5", "#08752f", "#9cb4d6", "#dda879", "#7650a5", "#d19aa2", "#82bdc9", "#a17b00", "#44a98c", "#a62dae", "#91ae16"];
  const excludedSpecies = new Set([
    "Haválur", "Lálla", "Lýrur", "Skrubba", "Skøturavar", "Steinbítur", "Stinglaksur",
    "Krabbi", "Brislingur", "Skeggbrosma", "Skeggbrosma / lítlabrosma", "Langasporl", "Hummari",
    "Prikkafiskur", "Tunga", "Búrfiskur", "Annað", "Hemari", "Skeljar", "Skøta",
    "Liri (Spotted wolffish)", "Steinbítur (Wolffishes/Catfish", "Heystgýtandi sild",
    "Svartkjaftur", "Lodna", "Rækjur", "Sild", "Rossamakrelur", "Makrelur",
    "Norðurhavssild", "Gulllaksur"
  ]);
  const normalizeSpecies = name => String(name || "").replace(/\s*-\s*Stikkað?$/iu, "").replace(/\s*\(sek\.\)$/iu, "").trim();
  const el = { species: $("species"), sizes: $("sizes"), vessels: $("vessels"), sizeTitle: $("sizeTitle"), vesselTitle: $("vesselTitle"), split: $("splitVessels"), from: $("from"), to: $("to"), fromB: $("fromBubble"), toB: $("toBubble"), months: $("months"), timeline: $("timeline"), summary: $("summary"), body: $("rows"), graphVessels: $("graphVessels"), graphSizes: $("graphSizes"), vesselSearch: $("vesselSearch"), selectAllVessels: $("selectAllVessels"), deselectAllVessels: $("deselectAllVessels"), status: $("status"), content: $("content"), updated: $("updated") };
  let rows = [], dates = [], chart, metric = "quantity", focusedSpecies = "", focusedSize = "", focusedProductGroup = "", timelineStart = 0, timelineEnd = 0, timelineMaximum = 0;
  let selected = new Set(), selectedVessels = new Set(), selectedGroups = new Set(), selectedConditions = new Set();
  const fmt = value => Number(value).toLocaleString("fo", { maximumFractionDigits: 2 });
  const dateTickLimit = (count, width) => Math.max(2, Math.min(count, Math.floor(Math.max(320, width || 900) / 85)));
  function separateTimelineLabels(fromLabel, toLabel, fromPercent, toPercent) {
    let fromShift = "-50%", toShift = "-50%";
    if (toPercent - fromPercent < 12) {
      if (toPercent > 85) { fromShift = "-200%"; toShift = "-100%"; }
      else if (fromPercent < 15) { fromShift = "0"; toShift = "100%"; }
      else { fromShift = "-100%"; toShift = "0"; }
    }
    fromLabel.style.transform = `translateX(${fromShift})`; toLabel.style.transform = `translateX(${toShift})`;
  }

  function dateRows() {
    const low = dates[+el.from.value], high = dates[+el.to.value];
    return rows.filter(row => row.sale_date >= low && row.sale_date <= high);
  }
  function baseFiltered() {
    return dateRows().filter(row => selected.has(row.species) && selectedGroups.has(row.ship_group || "Ikki upplýst") && selectedConditions.has(row.condition || "Ikki upplýst") && (!focusedSize || (row.size_group || "Onnur stødd") === focusedSize) && (!focusedProductGroup || row.product_group === focusedProductGroup));
  }
  function vesselKey(row) { return `${row.vessel}|${row.registration || ""}`; }
  function filtered() {
    const data = baseFiltered();
    return data.filter(row => selectedVessels.has(vesselKey(row)));
  }
  function renderSpecies() {
    const species = [...new Set(rows.map(row => row.species))].sort((a, b) => a.localeCompare(b, "fo"));
    el.species.innerHTML = species.map((name, index) => `<button class="species ${selected.has(name) ? "active" : ""}" style="--c:${colours[index % colours.length]}" data-name="${name.replaceAll('"', '&quot;')}">${name}</button>`).join("");
    el.species.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      focusedSpecies = button.dataset.name; focusedSize = ""; focusedProductGroup = ""; selected = new Set([focusedSpecies]);
      renderSpecies(); renderSizes(); renderVessels(); render();
    }));
  }
  function renderGroups() {
    const source = dateRows().filter(row => selected.has(row.species) && (!focusedSize || (row.size_group || "Onnur stødd") === focusedSize) && (!focusedProductGroup || row.product_group === focusedProductGroup));
    const totals = new Map();
    source.forEach(row => { const group = row.ship_group || "Ikki upplýst"; totals.set(group, (totals.get(group) || 0) + Number(row.quantity_kg || 0)); });
    const groups = [...totals].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fo"));
    $("groupSection").hidden = !$("splitGroups").checked;
    $("groupOptions").innerHTML = groups.length ? groups.map(([group, kg], index) => `<label class="info-row ${selectedGroups.has(group) ? "is-selected" : ""}"><input class="info-check" type="checkbox" value="${group.replaceAll('"','&quot;')}" ${selectedGroups.has(group) ? "checked" : ""}><i class="info-dot" style="--dot:${colours[index % colours.length]}"></i><span class="info-name">${group}</span><span class="info-value">${fmt(kg)} kg</span></label>`).join("") : '<span class="info-empty">Eingir skipabólkar.</span>';
    $("groupOptions").querySelectorAll("input").forEach(input => input.onchange = () => { input.checked ? selectedGroups.add(input.value) : selectedGroups.delete(input.value); render(); });
  }
  function renderConditions() {
    const source = dateRows().filter(row => selected.has(row.species) && selectedGroups.has(row.ship_group || "Ikki upplýst") && (!focusedSize || (row.size_group || "Onnur stødd") === focusedSize) && (!focusedProductGroup || row.product_group === focusedProductGroup));
    const totals = new Map();
    source.forEach(row => { const condition = row.condition || "Ikki upplýst"; totals.set(condition, (totals.get(condition) || 0) + Number(row.quantity_kg || 0)); });
    const conditions = [...totals].sort((a, b) => b[1] - a[1]);
    $("conditionSection").hidden = !$("conditionMaster").checked;
    $("conditionOptions").innerHTML = conditions.map(([condition, kg], index) => `<label class="info-row ${selectedConditions.has(condition) ? "is-selected" : ""}"><input class="info-check" type="checkbox" value="${condition}" ${selectedConditions.has(condition) ? "checked" : ""}><i class="info-dot" style="--dot:${colours[(index + 8) % colours.length]}"></i><span class="info-name">${condition}</span><span class="info-value">${fmt(kg)} kg</span></label>`).join("") || '<span class="info-empty">Eingir upplýsingar.</span>';
    $("conditionOptions").querySelectorAll("input").forEach(input => input.onchange = () => { input.checked ? selectedConditions.add(input.value) : selectedConditions.delete(input.value); render(); });
  }
  function renderSizes() {
    if (!focusedSpecies) { el.sizeTitle.textContent = "Støddarbólkar"; el.sizes.innerHTML = '<span class="empty">Vel eitt fiskaslag.</span>'; return; }
    const matching = dateRows().filter(row => row.species === focusedSpecies);
    const groups = [...new Set(matching.map(row => row.size_group || "Onnur stødd"))].sort((a, b) => a.localeCompare(b, "fo"));
    el.sizeTitle.textContent = `Støddarbólkar · ${focusedSpecies}`;
    el.sizes.innerHTML = groups.map(size => { const kg = matching.filter(row => (row.size_group || "Onnur stødd") === size).reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0); return `<button class="size-button ${focusedSize === size ? "active" : ""}" data-size="${size}">${size} · ${fmt(kg)} kg</button>`; }).join("") || '<span class="empty">Eingir støddarbólkar.</span>';
    el.sizes.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { focusedSize = button.dataset.size; renderSizes(); renderVessels(); render(); }));
  }
  function renderVessels() {
    if (!focusedSpecies || !focusedSize) { el.vesselTitle.textContent = "Skip"; el.vessels.innerHTML = '<span class="empty">Vel ein støddarbólk.</span>'; return; }
    const matching = dateRows().filter(row => row.species === focusedSpecies && (row.size_group || "Onnur stødd") === focusedSize);
    const totals = new Map();
    matching.forEach(row => { const key = `${row.vessel}|${row.registration}`; const item = totals.get(key) || { vessel: row.vessel, registration: row.registration, kg: 0, prices: [] }; item.kg += Number(row.quantity_kg || 0); if (row.minimum_price_dkk_kg !== null && row.minimum_price_dkk_kg !== "") item.prices.push(Number(row.minimum_price_dkk_kg)); totals.set(key, item); });
    const vessels = [...totals.values()].sort((a, b) => b.kg - a.kg);
    el.vesselTitle.textContent = `Skip · ${focusedSpecies} ${focusedSize}`;
    el.vessels.innerHTML = vessels.map(item => { const price = item.prices.length ? item.prices.reduce((a, b) => a + b, 0) / item.prices.length : null; return `<article class="vessel-card"><strong>${item.vessel}</strong><span>${item.registration || ""}</span><span>${fmt(item.kg)} kg${price === null ? "" : ` · ${fmt(price)} DKK/kg`}</span></article>`; }).join("") || '<span class="empty">Eingi skip funnin.</span>';
  }
  function updateTimeline() {
    const max = Math.max(1, timelineEnd - timelineStart); el.from.min = el.to.min = timelineStart; el.from.max = el.to.max = timelineEnd;
    let from = +el.from.value, to = +el.to.value;
    if (from > to) { if (document.activeElement === el.from) el.to.value = from; else el.from.value = to; from = +el.from.value; to = +el.to.value; }
    const p1 = (from - timelineStart) / max * 100, p2 = (to - timelineStart) / max * 100;
    const fromPos = `calc(${p1}% + ${16 - p1 * .32}px)`, toPos = `calc(${p2}% + ${16 - p2 * .32}px)`;
    el.timeline.style.setProperty("--from", fromPos); el.timeline.style.setProperty("--to", `calc(${100 - p2}% + ${p2 * .32}px)`);
    el.fromB.textContent = dates[from] || ""; el.toB.textContent = dates[to] || ""; el.fromB.style.left = fromPos; el.toB.style.left = toPos; separateTimelineLabels(el.fromB, el.toB, p1, p2);
  }
  function renderTimelineMonths() { const span=Math.max(1,timelineEnd-timelineStart),seen=new Set(),ticks=[];for(let i=timelineStart;i<=timelineEnd;i++){const key=(dates[i]||"").slice(0,7);if(key&&!seen.has(key)){seen.add(key);ticks.push([i,key])}}const step=Math.max(1,Math.ceil(ticks.length/7));el.months.innerHTML=ticks.filter((_,i)=>i%step===0||i===ticks.length-1).map(([index,key])=>`<span style="left:${(index-timelineStart)/span*100}%">${new Intl.DateTimeFormat("fo-FO",{month:"short",year:ticks.length>12?"2-digit":undefined,timeZone:"UTC"}).format(new Date(`${key}-01T12:00:00Z`))}</span>`).join(""); }
  function fitTimelineWindow() { const from=Number(el.from.value),to=Number(el.to.value),span=Math.max(1,to-from);timelineStart=Math.max(0,from-span);timelineEnd=Math.min(timelineMaximum,to+Math.max(1,Math.round(span*.15)));el.from.min=el.to.min=timelineStart;el.from.max=el.to.max=timelineEnd;renderTimelineMonths(); }
  function panTimelineAtEdge(index) { const input=index===0?el.from:el.to,span=Math.max(1,timelineEnd-timelineStart),edge=Math.max(3,Math.round(span*.05)),shift=Math.max(14,Math.round(span*.5));if(index===0&&Number(input.value)<=timelineStart+edge&&timelineStart>0)timelineStart=Math.max(0,timelineStart-shift);if(index===1&&Number(input.value)>=timelineEnd-edge&&timelineEnd<timelineMaximum)timelineEnd=Math.min(timelineMaximum,timelineEnd+shift);el.from.min=el.to.min=timelineStart;el.from.max=el.to.max=timelineEnd;renderTimelineMonths(); }
  function renderGraphInfo(data, selectedData, chartNames, lineName) {
    $("vesselSection").hidden = !el.split.checked;
    const vesselTotals = new Map();
    const sizeTotals = new Map();
    data.forEach(row => {
      const key = vesselKey(row);
      const item = vesselTotals.get(key) || { key, vessel: row.vessel, registration: row.registration || "", kg: 0 };
      item.kg += Number(row.quantity_kg || 0);
      vesselTotals.set(key, item);
    });
    selectedData.forEach(row => sizeTotals.set(row.product_group, (sizeTotals.get(row.product_group) || 0) + Number(row.quantity_kg || 0)));
    const query = el.vesselSearch.value.trim().toLocaleLowerCase("fo");
    const vessels = [...vesselTotals.values()].filter(item => `${item.vessel} ${item.registration}`.toLocaleLowerCase("fo").includes(query)).sort((a, b) => Number(selectedVessels.has(b.key)) - Number(selectedVessels.has(a.key)) || b.kg - a.kg || a.vessel.localeCompare(b.vessel, "fo"));
    const sizes = [...sizeTotals].sort((a, b) => b[1] - a[1]);
    el.graphVessels.innerHTML = vessels.length ? vessels.map(item => {
      const chartIndex = chartNames.indexOf(item.vessel);
      const colour = chartIndex >= 0 && lineName({ vessel: item.vessel, species: "", product_group: "" }) === item.vessel ? colours[chartIndex % colours.length] : "#9bbdca";
      const checked = selectedVessels.has(item.key);
      return `<label class="info-row ${checked ? "is-selected" : ""}"><input class="info-check" type="checkbox" data-key="${item.key.replaceAll('"', '&quot;')}" ${checked ? "checked" : ""}><i class="info-dot" style="--dot:${colour}"></i><span class="info-name">${item.vessel}${item.registration ? ` · ${item.registration}` : ""}</span><span class="info-value">${fmt(item.kg)} kg</span></label>`;
    }).join("") : '<span class="info-empty">Eingi skip í valda tíðarskeiðinum.</span>';
    el.graphVessels.querySelectorAll(".info-check").forEach(input => input.addEventListener("change", () => { input.checked ? selectedVessels.add(input.dataset.key) : selectedVessels.delete(input.dataset.key); el.split.checked = selectedVessels.size > 0; render(); }));
    el.graphSizes.innerHTML = sizes.length ? sizes.map(([name, kg], index) => `<div class="info-row size-row"><i class="info-dot" style="--dot:${colours[index % colours.length]}"></i><span class="info-name">${name}</span><span class="info-value">${fmt(kg)} kg</span></div>`).join("") : '<span class="info-empty">Eingir støddarbólkar.</span>';
  }
  function render() {
    updateTimeline(); renderGroups(); renderConditions(); const baseData = baseFiltered(); const data = filtered(); const labels = dates.slice(+el.from.value, +el.to.value + 1);
    const singleVessel = selectedVessels.size === 1;
    const splitGroups = $("splitGroups").checked;
    const lineName = row => { const base = metric === "size" && !focusedProductGroup ? row.product_group : (splitGroups ? `${row.species} · ${row.ship_group || "Ikki upplýst"}` : (el.split.checked && !singleVessel ? row.vessel : row.species)); return $("conditionMaster").checked ? `${base} · ${row.condition || "Ikki upplýst"}` : base; };
    const totalKg = name => data.filter(row => lineName(row) === name).reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0);
    const names = [...new Set(data.map(lineName))].sort((a, b) => totalKg(b) - totalKg(a) || a.localeCompare(b, "fo")).slice(0, 30);
    renderGraphInfo(baseData, data, names, lineName);
    chart.config.type = metric === "total" ? "bar" : "line";
    chart.options.scales.x.ticks.maxTicksLimit = metric === "total" ? 12 : dateTickLimit(labels.length, chart.width);
    chart.options.scales.x.ticks.autoSkip = true;
    chart.options.scales.x.ticks.maxRotation = metric === "total" ? 45 : 0;
    chart.options.scales.x.ticks.minRotation = metric === "total" ? 45 : 0;
    if (metric === "total") chart.data = { labels: names, datasets: [{ label: "Kilo tilsamans", data: names.map(name => data.filter(row => lineName(row) === name).reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0)), backgroundColor: names.map((_, i) => colours[i % colours.length]) }] };
    else chart.data = { labels, datasets: names.map((name, index) => ({ label: name, data: labels.map(day => { const matches = data.filter(row => row.sale_date === day && lineName(row) === name); if (metric === "price") { const priced = matches.filter(row => row.minimum_price_dkk_kg !== null && row.minimum_price_dkk_kg !== ""); return priced.length ? priced.reduce((sum, row) => sum + Number(row.minimum_price_dkk_kg), 0) / priced.length : null; } return matches.reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0); }), borderColor: colours[index % colours.length], backgroundColor: colours[index % colours.length] + "22", borderWidth: 2, tension: .18, pointRadius: 2 })) };
    chart.options.scales.y.title.text = metric === "price" ? "DKK/kg" : "Nøgd (kg)"; chart.update();
    const kg = data.reduce((sum, row) => sum + Number(row.quantity_kg || 0), 0); el.summary.textContent = `${data.length.toLocaleString("fo")} skrásetingar · ${fmt(kg)} kg`;
    el.body.innerHTML = data.slice().sort((a, b) => Number(b.quantity_kg || 0) - Number(a.quantity_kg || 0) || a.vessel.localeCompare(b.vessel, "fo")).slice(0, 800).map(row => `<tr><td>${row.sale_date}</td><td><strong>${row.vessel}</strong> ${row.registration}</td><td>${row.species}</td><td>${row.size_group || "—"}</td><td>${row.condition || "Ikki upplýst"}</td><td>${row.sample_percentage == null || row.sample_percentage === "" ? "—" : `${fmt(row.sample_percentage)}%`}</td><td>${fmt(row.quantity_kg)}</td><td>${row.minimum_price_dkk_kg == null ? "—" : fmt(row.minimum_price_dkk_kg)}</td><td>${row.fishing_area_method || "—"}</td></tr>`).join("");
  }

  function drillChartToVessels(elements) {
    if (!elements.length) return;
    const hit = elements[0];
    const clickedLabel = metric === "total"
      ? chart.data.labels[hit.index]
      : chart.data.datasets[hit.datasetIndex]?.label;
    if (metric === "size" && focusedProductGroup && el.split.checked) {
      const clickedDate = chart.data.labels[hit.index];
      const vesselMatches = baseFiltered().filter(row => row.vessel === clickedLabel && row.sale_date === clickedDate);
      if (!vesselMatches.length) return;
      selectedVessels = new Set(vesselMatches.map(vesselKey));
      focusedProductGroup = "";
      focusedSize = "";
      renderSizes();
      renderVessels();
      render();
      return;
    }
    if (el.split.checked && !(metric === "size" && !focusedProductGroup)) return;
    if (metric === "size" && !focusedProductGroup) {
      const match = rows.find(row => row.product_group === clickedLabel);
      if (!match) return;
      focusedProductGroup = match.product_group;
      focusedSpecies = match.species;
      focusedSize = match.size_group || "Onnur stødd";
      selected = new Set([match.species]);
      el.split.checked = true;
      renderSpecies();
      render();
      return;
    }
    const species = clickedLabel;
    if (!species || !rows.some(row => row.species === species)) return;
    focusedSpecies = species;
    focusedSize = "";
    selected = new Set([species]);
    el.split.checked = true;
    renderSpecies();
    render();
  }

  fetch("data/fmf/fmf_auctions.json", { cache: "no-store" }).then(response => { if (!response.ok) throw Error(`HTTP ${response.status}`); return response.json(); }).then(payload => {
    rows = payload.rows.map(row => ({...row, species: normalizeSpecies(row.species), ship_group: row.ship_group || "Ikki upplýst", condition: row.condition || "Ikki upplýst"})).filter(row => !excludedSpecies.has(row.species)); dates = [...new Set(rows.map(row => row.sale_date))].sort(); selected = new Set(["Toskur"]); selectedVessels = new Set(rows.map(vesselKey)); selectedGroups = new Set(rows.map(row => row.ship_group)); selectedConditions = new Set(rows.map(row => row.condition)); el.split.checked = true;
    timelineMaximum = Math.max(0, dates.length - 1); [el.from,el.to].forEach(input=>{input.min=0;input.max=timelineMaximum}); el.from.value = Math.max(0, timelineMaximum - 89); el.to.value = timelineMaximum; fitTimelineWindow(); el.updated.textContent = `Dagført ${new Date(payload.updated_utc).toLocaleString("fo")}`;
    chart = new Chart($("chart"), { type: "line", data: { labels: [], datasets: [] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, onClick: (_event, elements) => drillChartToVessels(elements), onHover: (event, elements) => { const canDrill = !el.split.checked || metric === "size"; event.native.target.style.cursor = elements.length && canDrill ? "pointer" : "default"; }, plugins: { legend: { display: false }, tooltip: { itemSort: (a, b) => Number(b.parsed.y || 0) - Number(a.parsed.y || 0), filter: item => Number(item.parsed.y || 0) > 0 } }, scales: { x: { title: { display: true, text: "Dagur" }, grid: { display: false }, ticks: {} }, y: { beginAtZero: true, title: { display: true, text: "Nøgd (kg)" } } } } });
    el.status.hidden = true; el.content.hidden = false; renderSpecies(); renderGroups(); renderSizes(); renderVessels(); render();
    [el.from,el.to].forEach((input,index)=>{input.oninput=()=>{panTimelineAtEdge(index);renderSizes();renderVessels();render()};input.onchange=()=>{fitTimelineWindow();renderSizes();renderVessels();render()}}); el.split.onchange = () => { if(el.split.checked) $("splitGroups").checked = false; render(); }; el.vesselSearch.addEventListener("input", render);
    $("splitGroups").onchange = () => { if($("splitGroups").checked) el.split.checked = false; render(); };
    $("sizeMaster").onchange = () => { metric = $("sizeMaster").checked ? "size" : "quantity"; $("metrics").querySelectorAll("button").forEach(item => item.classList.toggle("active", item.dataset.metric === metric)); focusedProductGroup = ""; focusedSize = ""; render(); };
    $("conditionMaster").onchange = render;
    el.selectAllVessels.onclick = () => { baseFiltered().forEach(row => selectedVessels.add(vesselKey(row))); el.split.checked = true; render(); };
    el.deselectAllVessels.onclick = () => { selectedVessels.clear(); el.split.checked = false; render(); };
    $("allSpecies").onclick = () => { focusedSpecies = focusedSize = focusedProductGroup = ""; selected = new Set(rows.map(row => row.species)); selectedVessels = new Set(rows.map(vesselKey)); el.split.checked = true; renderSpecies(); renderSizes(); renderVessels(); render(); };
    $("metrics").querySelectorAll("button").forEach(button => button.onclick = () => { $("metrics").querySelectorAll("button").forEach(item => item.classList.remove("active")); button.classList.add("active"); metric = button.dataset.metric; $("sizeMaster").checked = false; focusedProductGroup = ""; focusedSize = ""; el.split.checked = false; render(); });
  }).catch(error => { el.status.textContent = `FMF dátur kundu ikki lesast: ${error.message}`; el.status.style.color = "#a22"; });
})();
