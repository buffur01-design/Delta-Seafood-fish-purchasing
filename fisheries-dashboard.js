(function(){
  "use strict";

  const isFaroese=document.documentElement.lang==="fo";
  const locale=isFaroese?"fo-FO":"en-GB";
  const copy=isFaroese?{
    title:"Yvirlit yvir fiskalandingar í Føroyum",
    intro:"Kanna dagliga skrásetta avreiðingarnøgd og vigaðan søluprís fyri hvørt kilo eftir fiskaslagi og skipabólki.",
    updated:"Dagført",
    loadingLatest:"Nýggjastu tølini verða tikin inn…",
    shipGroup:"Skipabólkur",
    allShipGroups:"Allir skipabólkar",
    selectedShipGroups:count=>`${count} skipabólkar valdir`,
    deselectAll:"Frável øll",
    from:"Frá",
    to:"Til",
    graphMeasure:"Mát á grafi",
    quantityOption:"Avreidd nøgd (kg)",
    priceOption:"Vigaður miðalprísur (kr/kg)",
    combinedOption:"Kilo og miðalprísur",
    totalOption:"Tilsamans í tíðarskeiðnum",
    loadingData:"Fiskivinnutøl verða tikin inn…",
    quantityTitle:"Daglig avreidd nøgd eftir fiskaslagi",
    priceTitle:"Dagligur vigaður miðalprísur eftir fiskaslagi",
    combinedTitle:"Daglig kilo og miðalprísur eftir fiskaslagi",
    totalTitle:"Samlað kilo í valda tíðarskeiðnum",
    quantityDescription:"Vel fiskasløg niðanfyri. Fyrsta trýstið vísir bert tað fiskaslagið; næstu trýst leggja fiskasløg afturat ella taka tey burtur. Trýst á eina linju fyri at leggja dent á hana, og halt músina yvir fyri at síggja skip og kilo.",
    priceDescription:"Vel fiskasløg niðanfyri. Fyrsta trýstið vísir bert tað fiskaslagið; næstu trýst leggja fiskasløg afturat ella taka tey burtur. Trýst á eina linju fyri at leggja dent á hana, og halt músina yvir fyri at síggja vigaðan miðalprís hjá hvørjum skipi.",
    combinedDescription:"Grafarnir vísa bæði daglig kilo og vigaðan miðalprís fyri sama valda tíðarskeið.",
    totalDescription:"Hvør stólpi vísir samlaðu kilo fyri valdu fiskasløgini og skipabólkarnar í tíðarskeiðnum.",
    chooseSpecies:"Vel fiskasløg",
    splitGroups:"Skipabólkar",
    splitVessels:"Vís hvørt skip sum egna linju",
    groupDialogTitle:"Vel skipabólkar",
    groupDialogDescription:"Vel skipabólkarnar, sum skulu hava hvør sína linju.",
    groupDialogCancel:"Angra",
    groupDialogApply:"Vís valdu skipabólkarnar",
    vesselPickerTitle:"Vel skip",
    vesselPickerDescription:"Leita eftir og legg skip á grafin. Hvør litur samsvarar við linjuna hjá skipinum.",
    vesselSearch:"Leita eftir skipum",
    noMatchingVessels:"Eingi skip samsvara við leitingina",
    selectAllVessels:"Vel øll",
    deselectAllVessels:"Frável øll",
    timeline:"Tíðarskeið á grafi",
    timelineStart:"Byrjunardagur",
    timelineEnd:"Endadagur",
    toggleQuantity:"Kilo",
    togglePrice:"Miðalprísur",
    toggleCombined:"Kilo + miðalprísur",
    toggleTotal:"Tilsamans",
    dateAxis:"Dagur",
    quantityAxis:"Avreidd nøgd (kg)",
    priceAxis:"Vigaður miðalprísur (kr/kg)",
    quantityUnit:"kg",
    priceUnit:"kr/kg",
    vessels:"Skip:",
    loadingVessels:"Skipatøl verða tikin inn…",
    noVessels:"Eingi skipatøl eru fyri henda dagin",
    moreVessels:count=>`+ ${count} skip afturat`,
    vesselUnavailable:message=>`Skipatøl eru ikki tøk: ${message}`,
    requestFailed:status=>`Tølini kundu ikki takast inn (${status})`,
    emptyData:"Eingi tøl eru í dátusavninum",
    dashboardError:message=>`Tølini kundu ikki vísast: ${message}`,
    dataUnavailable:"Tøl ikki tøk",
  }:{
    title:"Fisheries landings dashboard in the Faroe Islands",
    intro:"Explore daily reported landing volume and weighted sales value per kilogram by species and ship group.",
    updated:"Updated",
    loadingLatest:"Loading latest data…",
    shipGroup:"Ship group",
    allShipGroups:"All ship groups",
    selectedShipGroups:count=>`${count} ship groups selected`,
    deselectAll:"Deselect all",
    from:"From",
    to:"To",
    graphMeasure:"Graph measure",
    quantityOption:"Amount landed (kg)",
    priceOption:"Weighted average price (DKK/kg)",
    combinedOption:"Kilos and average price",
    totalOption:"Period total",
    loadingData:"Loading fisheries data…",
    quantityTitle:"Daily amount landed by species",
    priceTitle:"Daily weighted average price by species",
    combinedTitle:"Daily kilos and average price by species",
    totalTitle:"Total kilos in selected period",
    quantityDescription:"Choose species below. Your first click shows only that species; later clicks add or remove species. Click a line to focus it, then hover to see contributing vessels and kilos.",
    priceDescription:"Choose species below. Your first click shows only that species; later clicks add or remove species. Click a line to focus it, then hover to see each vessel’s weighted DKK/kg.",
    combinedDescription:"The two graphs show daily kilos and weighted average price for the same selected period.",
    totalDescription:"Each bar shows the total kilos for the selected species and ship groups during the period.",
    chooseSpecies:"Choose species",
    splitGroups:"Ship groups",
    splitVessels:"Show each vessel as its own line",
    groupDialogTitle:"Choose ship groups",
    groupDialogDescription:"Select the ship groups that should have their own lines.",
    groupDialogCancel:"Cancel",
    groupDialogApply:"Show selected groups",
    vesselPickerTitle:"Choose vessels",
    vesselPickerDescription:"Search and add vessels to the graph. Each colour matches its line.",
    vesselSearch:"Search vessels",
    noMatchingVessels:"No vessels match your search",
    selectAllVessels:"Select all",
    deselectAllVessels:"Deselect all",
    timeline:"Graph date range",
    timelineStart:"Start date",
    timelineEnd:"End date",
    toggleQuantity:"Kilos",
    togglePrice:"Average price",
    toggleCombined:"Kilos + average price",
    toggleTotal:"Period total",
    dateAxis:"Date",
    quantityAxis:"Amount landed (kg)",
    priceAxis:"Weighted average price (DKK/kg)",
    quantityUnit:"kg",
    priceUnit:"DKK/kg",
    vessels:"Vessels:",
    loadingVessels:"Loading vessel breakdown…",
    noVessels:"No vessel observations for this date",
    moreVessels:count=>`+ ${count} more vessels`,
    vesselUnavailable:message=>`Vessel details unavailable: ${message}`,
    requestFailed:status=>`Data request failed (${status})`,
    emptyData:"The dashboard dataset is empty",
    dashboardError:message=>`Dashboard data could not be loaded: ${message}`,
    dataUnavailable:"Data unavailable",
  };

  const elements = {
    status:document.getElementById("status"),
    dashboard:document.getElementById("dashboard"),
    updated:document.getElementById("updated"),
    speciesSelector:document.getElementById("species-selector"),
    groupOptions:document.getElementById("ship-group-options"),
    groupSummary:document.getElementById("ship-group-summary"),
    from:document.getElementById("date-from"),
    to:document.getElementById("date-to"),
    metric:document.getElementById("graph-metric"),
    graphTitle:document.getElementById("graph-title"),
    graphDescription:document.getElementById("graph-description"),
    eyebrow:document.getElementById("dashboard-eyebrow"),
    title:document.getElementById("dashboard-title"),
    intro:document.getElementById("dashboard-intro"),
    shipGroupLabel:document.getElementById("ship-group-label"),
    deselectAll:document.getElementById("ship-group-deselect"),
    metricLabel:document.getElementById("graph-metric-label"),
    quantityOption:document.getElementById("quantity-option"),
    priceOption:document.getElementById("price-option"),
    combinedOption:document.getElementById("combined-option"),
    totalOption:document.getElementById("total-option"),
    source:document.getElementById("dashboard-source"),
    splitGroups:document.getElementById("split-groups"),
    splitVessels:document.getElementById("split-vessels"),
    splitGroupsLabel:document.getElementById("split-groups-label"),
    splitVesselsLabel:document.getElementById("split-vessels-label"),
    groupDialog:document.getElementById("group-line-dialog"),
    groupDialogTitle:document.getElementById("group-dialog-title"),
    groupDialogDescription:document.getElementById("group-dialog-description"),
    groupDialogOptions:document.getElementById("group-line-options"),
    groupDialogCancel:document.getElementById("group-dialog-cancel"),
    groupDialogApply:document.getElementById("group-dialog-apply"),
    groupDialogSelectAll:document.getElementById("group-dialog-select-all"),
    groupDialogDeselectAll:document.getElementById("group-dialog-deselect-all"),
    chartStage:document.getElementById("chart-stage"),
    vesselPicker:document.getElementById("vessel-picker"),
    vesselPickerTitle:document.getElementById("vessel-picker-title"),
    vesselPickerDescription:document.getElementById("vessel-picker-description"),
    vesselSearch:document.getElementById("vessel-search"),
    vesselOptions:document.getElementById("vessel-options"),
    vesselSelectAll:document.getElementById("vessel-select-all"),
    vesselDeselectAll:document.getElementById("vessel-deselect-all"),
    timeline:document.getElementById("dashboard-timeline"),
    timelineFrom:document.getElementById("timeline-from"),
    timelineTo:document.getElementById("timeline-to"),
    timelineSelection:document.getElementById("timeline-selection"),
    timelineFromLabel:document.getElementById("timeline-from-label"),
    timelineToLabel:document.getElementById("timeline-to-label"),
    timelineMonths:document.getElementById("timeline-months"),
    metricToggle:document.getElementById("metric-toggle"),
    metricQuantity:document.getElementById("metric-quantity"),
    metricPrice:document.getElementById("metric-price"),
    metricCombined:document.getElementById("metric-combined"),
    metricTotal:document.getElementById("metric-total"),
    combinedPriceChart:document.getElementById("combined-price-chart"),
    combinedPriceTitle:document.getElementById("combined-price-title")
  };
  const defaultSpecies = ["Toskur","Upsi","Hýsa","Svartkalvi","Longa","Brosma"];
  const defaultSpeciesSet = new Set(defaultSpecies);
  const excludedSpecies = new Set([
    "Steinbítur",
    "Stinglaksur",
    "Krabbi",
    "Brislingur",
    "Skeggbrosma / lítlabrosma",
    "Langasporl",
    "Hummari",
    "Prikkafiskur",
    "Tunga",
    "Búrfiskur",
    "Annað",
    "Hemari",
    "Skeljar",
    "Skøta",
    "Liri (Spotted wolffish)",
    "Steinbítur (Wolffishes/Catfish",
    "Heystgýtandi sild",
    "Svartkjaftur",
    "Lodna",
    "Rækjur",
    "Sild",
    "Rossamakrelur",
    "Makrelur",
    "Norðurhavssild",
    "Gulllaksur"
  ]);
  const seriesColours = ["#16384c","#08752f","#4e6799","#c66a2b","#7b4f9d","#bd3349","#2f8f9d","#9a7b16"];
  const number = new Intl.NumberFormat(locale, {maximumFractionDigits:0});
  const price = new Intl.NumberFormat(locale, {minimumFractionDigits:2,maximumFractionDigits:2});
  const speciesEnglish = {
    "Annað":"Other",
    "Blálonga":"Blue ling",
    "Brislingur":"European sprat",
    "Brosma":"Tusk",
    "Búrfiskur":"Orange roughy",
    "Gulllaksur":"Silver smelt",
    "Havtaska":"Monkfish",
    "Hemari":"Porbeagle",
    "Heystgýtandi sild":"Autumn-spawning herring",
    "Hummari":"Langoustine",
    "Hvítingur":"Whiting",
    "Hýsa":"Haddock",
    "Kalvi":"Atlantic halibut",
    "Kongafiskur":"Redfish",
    "Krabbi":"Crab",
    "Langasporl":"Grenadier",
    "Liri (Spotted wolffish)":"Spotted wolffish",
    "Lodna":"Capelin",
    "Longa":"Ling",
    "Makrelur":"Mackerel",
    "Norðurhavssild":"Norwegian spring-spawning herring",
    "Prikkafiskur":"Lanternfish",
    "Reyðsprøka":"European plaice",
    "Rossamakrelur":"Horse mackerel",
    "Rækjur":"Cold-water shrimp",
    "Sild":"Herring",
    "Skeggbrosma / lítlabrosma":"Forkbeard / lesser forkbeard",
    "Skeljar":"Shellfish",
    "Skøta":"Skate",
    "Steinbítur":"Atlantic wolffish",
    "Steinbítur (Wolffishes/Catfish":"Wolffish / catfish",
    "Stinglaksur":"Black scabbardfish",
    "Svartkalvi":"Greenland halibut",
    "Svartkjaftur":"Blue whiting",
    "Toskur":"Cod",
    "Tunga":"Lemon sole",
    "Upsi":"Saithe"
  };
  const groupEnglish = {
    "Flakatrolarar":"Factory trawlers",
    "Garnaskip":"Gillnet vessels",
    "Hummarabátar":"Langoustine vessels",
    "Nóta- og ídnaðarskip":"Purse seiners and industrial vessels",
    "Rækjuskip":"Shrimp vessels",
    "Skjeljabátar":"Shellfish vessels"
  };
  let rows=[];
  let quantityChart;
  let priceChart;
  let speciesSelectionStarted=false;
  const vesselRowsByYear=new Map();
  const vesselYearsLoading=new Map();
  const selectedVessels=new Set();
  let vesselSelectionInitialized=false;
  let vesselLoadError="";
  const millisecondsPerDay=86400000;
  let timelineFirstDay=0;
  let timelineLastDay=0;
  let timelineWindowStart=0;
  let timelineWindowEnd=0;
  let timelineRenderFrame=0;

  function applyTranslations(){
    elements.eyebrow.textContent=copy.eyebrow;
    elements.title.textContent=copy.title;
    elements.intro.textContent=copy.intro;
    elements.updated.textContent=copy.loadingLatest;
    elements.shipGroupLabel.textContent=copy.shipGroup;
    elements.groupSummary.textContent=copy.allShipGroups;
    elements.deselectAll.textContent=copy.deselectAll;
    elements.metricLabel.textContent=copy.graphMeasure;
    elements.quantityOption.textContent=copy.quantityOption;
    elements.priceOption.textContent=copy.priceOption;
    elements.combinedOption.textContent=copy.combinedOption;
    elements.totalOption.textContent=copy.totalOption;
    elements.status.textContent=copy.loadingData;
    elements.graphTitle.textContent=copy.quantityTitle;
    elements.graphDescription.textContent=copy.quantityDescription;
    elements.speciesSelector.setAttribute("aria-label",copy.chooseSpecies);
    elements.splitGroupsLabel.textContent=copy.splitGroups;
    elements.splitVesselsLabel.textContent=copy.splitVessels;
    elements.groupDialogTitle.textContent=copy.groupDialogTitle;
    elements.groupDialogDescription.textContent=copy.groupDialogDescription;
    elements.groupDialogCancel.textContent=copy.groupDialogCancel;
    elements.groupDialogApply.textContent=copy.groupDialogApply;
    elements.groupDialogSelectAll.textContent=copy.selectAllVessels;
    elements.groupDialogDeselectAll.textContent=copy.deselectAllVessels;
    elements.vesselPickerTitle.textContent=copy.vesselPickerTitle;
    elements.vesselPickerDescription.textContent=copy.vesselPickerDescription;
    elements.vesselSearch.placeholder=copy.vesselSearch;
    elements.vesselSelectAll.textContent=copy.selectAllVessels;
    elements.vesselDeselectAll.textContent=copy.deselectAllVessels;
    elements.timeline.setAttribute("aria-label",copy.timeline);
    elements.timelineFrom.setAttribute("aria-label",copy.timelineStart);
    elements.timelineTo.setAttribute("aria-label",copy.timelineEnd);
    elements.timelineFromLabel.setAttribute("aria-label",copy.timelineStart);
    elements.timelineToLabel.setAttribute("aria-label",copy.timelineEnd);
    elements.metricToggle.setAttribute("aria-label",copy.graphMeasure);
    elements.metricQuantity.textContent=copy.toggleQuantity;
    elements.metricPrice.textContent=copy.togglePrice;
    elements.metricCombined.textContent=copy.toggleCombined;
    elements.metricTotal.textContent=copy.toggleTotal;
    elements.combinedPriceTitle.textContent=copy.togglePrice;
    updateMetricToggle();
    elements.source.textContent=copy.source;
  }

  function speciesLabel(value){
    return isFaroese?value:(speciesEnglish[value]||value);
  }

  function groupLabel(value){
    return isFaroese?value:(groupEnglish[value]||value);
  }

  function checkbox(value,label,checked){
    const wrapper=document.createElement("label");
    const input=document.createElement("input");
    const text=document.createElement("span");
    input.type="checkbox";
    input.value=value;
    input.checked=checked;
    text.textContent=label||value;
    wrapper.append(input,text);
    return wrapper;
  }

  function selected(container){
    return new Set([...container.querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value));
  }

  function openGroupDialog(){
    elements.groupDialogOptions.replaceChildren();
    elements.groupOptions.querySelectorAll('label').forEach(sourceLabel=>{
      const sourceInput=sourceLabel.querySelector('input[type="checkbox"]');
      const label=sourceLabel.querySelector("span").textContent;
      elements.groupDialogOptions.appendChild(checkbox(sourceInput.value,label,sourceInput.checked));
    });
    const updateApplyState=()=>{
      elements.groupDialogApply.disabled=!elements.groupDialogOptions.querySelector('input[type="checkbox"]:checked');
    };
    elements.groupDialogOptions.onchange=updateApplyState;
    updateApplyState();
    elements.groupDialog.returnValue="";
    elements.groupDialog.showModal();
  }

  function selectedSpecies(){
    return new Set([...elements.speciesSelector.querySelectorAll(".dashboard-species-button.is-selected")].map(button=>button.dataset.value));
  }

  function updateSummaries(groups){
    const groupCount=elements.groupOptions.querySelectorAll('input[type="checkbox"]').length;
    elements.groupSummary.textContent=groups.size===groupCount?copy.allShipGroups:copy.selectedShipGroups(groups.size);
  }

  function updateMetricToggle(){
    elements.metricToggle.querySelectorAll("button[data-metric]").forEach(button=>{
      const active=button.dataset.metric===elements.metric.value;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }

  function splitGroupsActive(){
    return elements.splitGroups.classList.contains("is-active");
  }

  function setSplitGroupsActive(active){
    elements.splitGroups.classList.toggle("is-active",active);
    elements.splitGroups.setAttribute("aria-pressed",String(active));
  }

  function speciesColour(index){
    return seriesColours[index]||`hsl(${(index*137.508)%360} 58% 42%)`;
  }

  function vesselColour(value){
    let hash=0;
    for(const character of value) hash=((hash<<5)-hash+character.charCodeAt(0))|0;
    return `hsl(${Math.abs(hash)%360} 68% 42%)`;
  }

  function filterVesselOptions(){
    const query=elements.vesselSearch.value.trim().toLocaleLowerCase(locale);
    let visible=0;
    elements.vesselOptions.querySelectorAll(".dashboard-vessel-option").forEach(option=>{
      const matches=!query||option.dataset.search.includes(query);
      option.hidden=!matches;
      if(matches) visible+=1;
    });
    const empty=elements.vesselOptions.querySelector(".dashboard-vessel-empty");
    if(empty) empty.remove();
    if(!visible){
      const message=document.createElement("p");
      message.className="dashboard-vessel-empty";
      message.textContent=copy.noMatchingVessels;
      elements.vesselOptions.appendChild(message);
    }
  }

  function updateVesselPicker(vessels){
    const available=[...vessels];
    if(!vesselSelectionInitialized){
      available.forEach(value=>selectedVessels.add(value));
      vesselSelectionInitialized=true;
    }
    for(const value of [...selectedVessels]) if(!vessels.has(value)) selectedVessels.delete(value);
    available.sort((a,b)=>
      Number(selectedVessels.has(b))-Number(selectedVessels.has(a)) || a.localeCompare(b,locale)
    );
    elements.vesselOptions.replaceChildren();
    available.forEach(value=>{
      const label=document.createElement("label");
      const input=document.createElement("input");
      const colour=document.createElement("span");
      const name=document.createElement("span");
      label.className="dashboard-vessel-option";
      label.dataset.search=value.toLocaleLowerCase(locale);
      input.type="checkbox";
      input.value=value;
      input.checked=selectedVessels.has(value);
      colour.className="dashboard-vessel-colour";
      colour.style.setProperty("--vessel-colour",vesselColour(value));
      name.className="dashboard-vessel-name";
      name.textContent=value;
      input.addEventListener("change",()=>{
        if(input.checked) selectedVessels.add(value);
        else selectedVessels.delete(value);
        render();
      });
      label.append(input,colour,name);
      elements.vesselOptions.appendChild(label);
    });
    filterVesselOptions();
  }

  function speciesButton(value,label,index){
    const button=document.createElement("button");
    button.type="button";
    button.className="dashboard-species-button";
    button.dataset.value=value;
    button.dataset.colour=speciesColour(index);
    button.style.setProperty("--species-colour",button.dataset.colour);
    button.textContent=label;
    const initial=defaultSpeciesSet.has(value);
    button.classList.toggle("is-selected",initial);
    button.setAttribute("aria-pressed",String(initial));
    button.addEventListener("click",()=>{
      if(!speciesSelectionStarted){
        elements.speciesSelector.querySelectorAll(".dashboard-species-button").forEach(item=>{
          item.classList.remove("is-selected");
          item.setAttribute("aria-pressed","false");
        });
        speciesSelectionStarted=true;
      }
      const isSelected=button.classList.contains("is-selected");
      const selectedCount=elements.speciesSelector.querySelectorAll(".dashboard-species-button.is-selected").length;
      if(!isSelected || selectedCount>1){
        button.classList.toggle("is-selected",!isSelected);
        button.setAttribute("aria-pressed",String(!isSelected));
      }
      render();
    });
    return button;
  }

  function dateToDay(value){
    return Math.floor(Date.parse(`${value}T00:00:00Z`)/millisecondsPerDay);
  }

  function dayToDate(value){
    return new Date(value*millisecondsPerDay).toISOString().slice(0,10);
  }

  function typedDateToDay(value){
    const input=value.trim();
    const parsed=/^\d{4}-\d{2}-\d{2}$/.test(input)
      ? Date.parse(`${input}T00:00:00Z`)
      : Date.parse(input);
    return Number.isFinite(parsed)?Math.floor(parsed/millisecondsPerDay):NaN;
  }

  function timelinePercent(value){
    return 100*(value-timelineWindowStart)/Math.max(1,timelineWindowEnd-timelineWindowStart);
  }

  function renderTimelineMonths(){
    elements.timelineMonths.replaceChildren();
    const span=timelineWindowEnd-timelineWindowStart;
    const monthStep=span>1460?12:(span>730?6:(span>500?3:1));
    const firstDate=new Date(timelineWindowStart*millisecondsPerDay);
    let cursor=new Date(Date.UTC(firstDate.getUTCFullYear(),firstDate.getUTCMonth(),1));
    if(cursor.getTime()/millisecondsPerDay<timelineWindowStart) cursor.setUTCMonth(cursor.getUTCMonth()+1);
    const formatter=new Intl.DateTimeFormat(locale,{month:"short",year:monthStep>=6?"2-digit":undefined,timeZone:"UTC"});
    while(cursor.getTime()/millisecondsPerDay<=timelineWindowEnd){
      const month=cursor.getUTCMonth();
      if(month%monthStep===0){
        const label=document.createElement("span");
        label.className="dashboard-timeline-month";
        label.style.left=`${timelinePercent(cursor.getTime()/millisecondsPerDay)}%`;
        label.textContent=formatter.format(cursor);
        elements.timelineMonths.appendChild(label);
      }
      cursor.setUTCMonth(cursor.getUTCMonth()+1);
    }
  }

  function updateTimeline(){
    const from=dateToDay(elements.from.value);
    const to=dateToDay(elements.to.value);
    [elements.timelineFrom,elements.timelineTo].forEach(input=>{
      input.min=timelineWindowStart;
      input.max=timelineWindowEnd;
      input.step=1;
    });
    elements.timelineFrom.value=from;
    elements.timelineTo.value=to;
    const fromPosition=timelinePercent(from);
    const toPosition=timelinePercent(to);
    elements.timelineSelection.style.left=`${fromPosition}%`;
    elements.timelineSelection.style.width=`${Math.max(0,toPosition-fromPosition)}%`;
    elements.timelineFromLabel.style.left=`${fromPosition}%`;
    elements.timelineToLabel.style.left=`${toPosition}%`;
    const formatter=new Intl.DateTimeFormat(locale,{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
    elements.timelineFromLabel.value=formatter.format(new Date(from*millisecondsPerDay));
    elements.timelineToLabel.value=formatter.format(new Date(to*millisecondsPerDay));
    elements.timelineFrom.style.zIndex=fromPosition>96?5:3;
    renderTimelineMonths();
  }

  function commitTimelineDate(input,target,isStart){
    let day=typedDateToDay(input.value);
    if(!Number.isFinite(day)){
      updateTimeline();
      return;
    }
    day=Math.max(timelineFirstDay,Math.min(timelineLastDay,day));
    const otherDay=dateToDay(isStart?elements.to.value:elements.from.value);
    day=isStart?Math.min(day,otherDay):Math.max(day,otherDay);
    target.value=dayToDate(day);
    target.dispatchEvent(new Event("change"));
  }

  function ensureTimelineDateVisible(day){
    if(day<timelineWindowStart) timelineWindowStart=Math.max(timelineFirstDay,day-30);
    if(day>timelineWindowEnd) timelineWindowEnd=Math.min(timelineLastDay,day+30);
  }

  function queueTimelineRender(){
    cancelAnimationFrame(timelineRenderFrame);
    timelineRenderFrame=requestAnimationFrame(render);
  }

  function moveTimelineHandle(handle){
    let from=Number(elements.timelineFrom.value);
    let to=Number(elements.timelineTo.value);
    if(handle==="from") from=Math.min(from,to-1);
    else to=Math.max(to,from+1);
    if(handle==="from"&&from<=timelineWindowStart+3&&timelineWindowStart>timelineFirstDay){
      timelineWindowStart=Math.max(timelineFirstDay,timelineWindowStart-180);
    }
    if(handle==="to"&&to>=timelineWindowEnd-3&&timelineWindowEnd<timelineLastDay){
      timelineWindowEnd=Math.min(timelineLastDay,timelineWindowEnd+180);
    }
    elements.from.value=dayToDate(from);
    elements.to.value=dayToDate(to);
    updateTimeline();
    queueTimelineRender();
  }

  function initializeTimeline(first,last){
    timelineFirstDay=dateToDay(first);
    timelineLastDay=dateToDay(last);
    timelineWindowEnd=timelineLastDay;
    timelineWindowStart=Math.max(timelineFirstDay,timelineWindowEnd-365);
    ensureTimelineDateVisible(dateToDay(elements.from.value));
    updateTimeline();
  }

  function yearsInRange(from,to){
    const first=Number((from||rows[0][0]).slice(0,4));
    const last=Number((to||rows[rows.length-1][0]).slice(0,4));
    return Array.from({length:last-first+1},(_,index)=>String(first+index));
  }

  function loadVesselYears(from,to,chartInstance){
    vesselLoadError="";
    const requests=yearsInRange(from,to).map(year=>{
      if(vesselRowsByYear.has(year)) return Promise.resolve();
      if(vesselYearsLoading.has(year)) return vesselYearsLoading.get(year);
      const request=fetch(`data/vessels/${year}.json`,{cache:"no-store"})
        .then(response=>{if(!response.ok) throw new Error(copy.requestFailed(response.status));return response.json();})
        .then(data=>{vesselRowsByYear.set(year,data.rows||[]);})
        .finally(()=>vesselYearsLoading.delete(year));
      vesselYearsLoading.set(year,request);
      return request;
    });
    return Promise.all(requests)
      .catch(error=>{vesselLoadError=error.message;})
      .finally(()=>chartInstance.update("none"));
  }

  function vesselTooltipLines(items){
    if(!items.length) return [];
    const chartInstance=items[0].chart;
    const focused=chartInstance.$highlightedDataset;
    if(focused===null || focused===undefined) return [];
    if(vesselLoadError) return ["",copy.vesselUnavailable(vesselLoadError)];
    if(vesselYearsLoading.size) return ["",copy.loadingVessels];
    const day=items[0].label;
    const dataset=chartInstance.data.datasets[focused];
    if(dataset.vesselKey) return [];
    const species=dataset.speciesKey;
    const groups=selected(elements.groupOptions);
    const observations=vesselRowsByYear.get(day.slice(0,4))||[];
    const vessels=new Map();
    for(const [rowDay,rowSpecies,rowGroup,vessel,identity,kg,dkk] of observations){
      if(rowDay!==day || rowSpecies!==species || !groups.has(rowGroup)) continue;
      if(dataset.groupKey && rowGroup!==dataset.groupKey) continue;
      const label=identity?`${vessel} (${identity})`:vessel;
      const current=vessels.get(label)||[0,0];
      current[0]+=kg;
      current[1]+=dkk;
      vessels.set(label,current);
    }
    const metric=chartInstance.$metric||"quantity";
    const vesselValue=([kg,dkk])=>metric==="price"?(kg>0?dkk/kg:0):kg;
    const ranked=[...vessels]
      .filter(([,totals])=>vesselValue(totals)>0)
      .sort((a,b)=>vesselValue(b[1])-vesselValue(a[1]));
    if(!ranked.length) return ["",copy.noVessels];
    const shown=ranked.slice(0,15).map(([vessel,[kg,dkk]])=>metric==="price"
      ? `${vessel}: ${kg>0?price.format(dkk/kg):"—"} ${copy.priceUnit}`
      : `${vessel}: ${number.format(kg)} ${copy.quantityUnit}`);
    if(ranked.length>shown.length) shown.push(copy.moreVessels(ranked.length-shown.length));
    return ["",copy.vessels,...shown];
  }

  function highlightDataset(chartInstance,index){
    const next=chartInstance.$highlightedDataset===index?null:index;
    chartInstance.$highlightedDataset=next;
    chartInstance.data.datasets.forEach((dataset,datasetIndex)=>{
      const focused=next===null || datasetIndex===next;
      dataset.borderColor=focused?dataset.baseColor:dataset.baseColor+"26";
      dataset.backgroundColor=focused?dataset.baseColor:dataset.baseColor+"26";
      dataset.borderWidth=next===null?2:(datasetIndex===next?4:1.25);
      dataset.pointHoverRadius=focused?5:0;
    });
    if(next!==null) loadVesselYears(elements.from.value,elements.to.value,chartInstance);
    chartInstance.update("none");
  }

  function clearChartHover(chartInstance){
    if(!chartInstance) return;
    chartInstance.setActiveElements([]);
    chartInstance.tooltip.setActiveElements([], {x:0,y:0});
  }

  function showChartHover(chartInstance,index){
    const active=chartInstance.data.datasets.flatMap((dataset,datasetIndex)=>{
      const value=dataset.data[index];
      return value===null || value===undefined ? [] : [{datasetIndex,index}];
    });
    if(!active.length){
      clearChartHover(chartInstance);
      chartInstance.update("none");
      return;
    }
    const point=chartInstance.getDatasetMeta(active[0].datasetIndex).data[index];
    const position=point?.getCenterPoint()||{x:chartInstance.width/2,y:chartInstance.height/2};
    chartInstance.setActiveElements(active);
    chartInstance.tooltip.setActiveElements(active,position);
    chartInstance.update("none");
  }

  function syncCombinedHover(sourceChart,index){
    if(elements.metric.value!=="combined" || !quantityChart || !priceChart) return;
    const linkedChart=sourceChart===quantityChart?priceChart:quantityChart;
    if(index===null){
      clearChartHover(linkedChart);
      linkedChart.update("none");
      return;
    }
    showChartHover(linkedChart,index);
  }

  function chart(canvas){
    const instance=new Chart(canvas,{
      type:"line",
      data:{labels:[],datasets:[]},
      options:{
        responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:"index",intersect:false},
        onHover:(event,hovered,chartInstance)=>{
          const target=event.native&&event.native.target;
          if(target) target.style.cursor=hovered.length?"pointer":"default";
          syncCombinedHover(chartInstance,hovered.length?hovered[0].index:null);
        },
        onClick:(event,elements,chartInstance)=>{
          if(chartInstance.$metric==="total") return;
          const nearest=chartInstance.getElementsAtEventForMode(event,"nearest",{intersect:false},true);
          if(nearest.length) highlightDataset(chartInstance,nearest[0].datasetIndex);
        },
        plugins:{
          legend:{display:false},
          tooltip:{
            filter:item=>item.parsed.y>0 && (item.chart.$highlightedDataset===null || item.chart.$highlightedDataset===undefined || item.datasetIndex===item.chart.$highlightedDataset),
            itemSort:(a,b)=>(b.parsed.y??Number.NEGATIVE_INFINITY)-(a.parsed.y??Number.NEGATIVE_INFINITY),
            callbacks:{
              label:context=>context.chart.$metric==="total"
                ? `${context.label}: ${number.format(context.parsed.y)} ${copy.quantityUnit}`
                : (context.chart.$metric==="price"
                  ? `${context.dataset.label}: ${price.format(context.parsed.y)} ${copy.priceUnit}`
                  : `${context.dataset.label}: ${number.format(context.parsed.y)} ${copy.quantityUnit}`),
              afterBody:items=>items[0]?.chart.$metric==="total"?[]:vesselTooltipLines(items)
            }
          }
        },
        scales:{
          x:{grid:{display:false},title:{display:true,text:copy.dateAxis},ticks:{maxTicksLimit:12,maxRotation:0}},
          y:{beginAtZero:true,grid:{color:"#e5eff3"},title:{display:true,text:copy.quantityAxis},ticks:{callback:value=>number.format(value)}}
        }
      }
    });
    instance.$highlightedDataset=null;
    instance.$metric="quantity";
    return instance;
  }

  function lineDatasets(series,days,targetMetric,splitGroups,splitVessels){
    return [...series.values()].map((line,index)=>{
      const button=elements.speciesSelector.querySelector(`.dashboard-species-button[data-value="${CSS.escape(line.speciesKey)}"]`);
      const colour=splitVessels?vesselColour(line.vesselKey):(splitGroups?speciesColour(index):button.dataset.colour);
      const label=[speciesLabel(line.speciesKey),line.groupKey&&groupLabel(line.groupKey),line.vesselKey].filter(Boolean).join(" — ");
      return {
        type:"line",
        label,
        speciesKey:line.speciesKey,
        groupKey:line.groupKey,
        vesselKey:line.vesselKey,
        data:days.map(day=>{
          const totals=line.daily.get(day);
          if(!totals) return splitVessels||targetMetric==="price"?null:0;
          return targetMetric==="price"?(totals[0]>0?totals[1]/totals[0]:null):totals[0];
        }),
        baseColor:colour,
        borderColor:colour,
        backgroundColor:colour,
        borderWidth:2,
        pointRadius:0,
        pointHoverRadius:4,
        tension:.12,
        spanGaps:true,
        fill:false
      };
    });
  }

  function renderChart(chartInstance,targetMetric,series,days,splitGroups,splitVessels){
    chartInstance.$highlightedDataset=null;
    chartInstance.$metric=targetMetric;
    chartInstance.options.scales.x.title.display=targetMetric!=="total";
    chartInstance.options.scales.x.ticks.maxRotation=targetMetric==="total"?45:0;
    chartInstance.options.scales.x.ticks.minRotation=targetMetric==="total"?45:0;
    chartInstance.options.scales.y.title.text=targetMetric==="price"?copy.priceAxis:copy.quantityAxis;
    chartInstance.options.scales.y.beginAtZero=targetMetric!=="price";
    chartInstance.options.scales.y.ticks.callback=value=>targetMetric==="price"?price.format(value):number.format(value);
    if(targetMetric==="total"){
      const entries=[...series.values()].map((line,index)=>{
        const button=elements.speciesSelector.querySelector(`.dashboard-species-button[data-value="${CSS.escape(line.speciesKey)}"]`);
        const colour=splitVessels?vesselColour(line.vesselKey):(splitGroups?speciesColour(index):button.dataset.colour);
        const label=[speciesLabel(line.speciesKey),line.groupKey&&groupLabel(line.groupKey),line.vesselKey].filter(Boolean).join(" — ");
        const total=[...line.daily.values()].reduce((sum,values)=>sum+values[0],0);
        return {label,colour,total};
      }).sort((a,b)=>b.total-a.total);
      chartInstance.data.labels=entries.map(entry=>entry.label);
      chartInstance.data.datasets=[{
        type:"bar",
        label:copy.toggleTotal,
        data:entries.map(entry=>entry.total),
        baseColor:"#08752f",
        borderColor:entries.map(entry=>entry.colour),
        backgroundColor:entries.map(entry=>entry.colour+"cc"),
        borderWidth:1.5
      }];
    }else{
      chartInstance.data.labels=days;
      chartInstance.data.datasets=lineDatasets(series,days,targetMetric,splitGroups,splitVessels);
    }
    chartInstance.update();
  }

  function render(){
    const species=selectedSpecies();
    const groups=selected(elements.groupOptions);
    const from=elements.from.value;
    const to=elements.to.value;
    const metric=elements.metric.value;
    const splitGroups=splitGroupsActive();
    const splitVessels=elements.splitVessels.checked;
    elements.vesselPicker.hidden=!splitVessels;
    elements.chartStage.classList.toggle("has-vessel-picker",splitVessels);
    const series=new Map();
    const activeDates=new Set();
    const addObservation=(key,details,day,kg,value)=>{
      if(!series.has(key)) series.set(key,{...details,daily:new Map()});
      const daily=series.get(key).daily;
      const current=daily.get(day)||[0,0];
      current[0]+=kg;
      current[1]+=value;
      daily.set(day,current);
      activeDates.add(day);
    };
    if(splitVessels){
      const needsInitialVesselSelection=!vesselSelectionInitialized;
      const availableVessels=new Set();
      for(const year of yearsInRange(from,to)){
        for(const [day,rowSpecies,rowGroup,vessel,identity,kg,value] of vesselRowsByYear.get(year)||[]){
          if(!species.has(rowSpecies) || !groups.has(rowGroup)) continue;
          if(from&&day<from || to&&day>to) continue;
          const vesselName=identity?`${vessel} (${identity})`:vessel;
          if(kg>0) availableVessels.add(vesselName);
          if(!selectedVessels.has(vesselName)) continue;
          const key=JSON.stringify([rowSpecies,rowGroup,vesselName]);
          addObservation(key,{speciesKey:rowSpecies,groupKey:rowGroup,vesselKey:vesselName},day,kg,value);
        }
      }
      updateVesselPicker(availableVessels);
      if(needsInitialVesselSelection) return render();
    }else{
      for(const [day,rowSpecies,rowGroup,kg,value] of rows){
        if(!species.has(rowSpecies) || !groups.has(rowGroup)) continue;
        if(from&&day<from || to&&day>to) continue;
        const key=splitGroups?JSON.stringify([rowSpecies,rowGroup]):rowSpecies;
        addObservation(key,{speciesKey:rowSpecies,groupKey:splitGroups?rowGroup:null,vesselKey:null},day,kg,value);
      }
    }
    const days=[...activeDates].sort();
    updateSummaries(groups);
    const primaryMetric=metric==="combined"?"quantity":metric;
    elements.graphTitle.textContent=metric==="price"?copy.priceTitle:(metric==="combined"?copy.combinedTitle:(metric==="total"?copy.totalTitle:copy.quantityTitle));
    elements.graphDescription.textContent=metric==="price"?copy.priceDescription:(metric==="combined"?copy.combinedDescription:(metric==="total"?copy.totalDescription:copy.quantityDescription));
    if(metric!=="combined"){
      clearChartHover(quantityChart);
      clearChartHover(priceChart);
    }
    elements.combinedPriceChart.hidden=metric!=="combined";
    renderChart(quantityChart,primaryMetric,series,days,splitGroups,splitVessels);
    if(metric==="combined"){
      priceChart.resize();
      renderChart(priceChart,"price",series,days,splitGroups,splitVessels);
    }
  }

  applyTranslations();

  fetch("data/fisheries-dashboard.json",{cache:"no-store"})
    .then(response=>{if(!response.ok) throw new Error(copy.requestFailed(response.status));return response.json();})
    .then(data=>{
      rows=data.rows||[];
      if(!rows.length) throw new Error(copy.emptyData);
      [...new Set(rows.map(row=>row[1]))]
        .filter(value=>!excludedSpecies.has(value))
        .sort((a,b)=>speciesLabel(a).localeCompare(speciesLabel(b),locale))
        .forEach((value,index)=>elements.speciesSelector.appendChild(speciesButton(value,speciesLabel(value),index)));
      [...new Set(rows.map(row=>row[2]))]
        .sort((a,b)=>groupLabel(a).localeCompare(groupLabel(b),locale))
        .forEach(value=>elements.groupOptions.appendChild(checkbox(value,groupLabel(value),true)));
      const first=rows[0][0],last=rows[rows.length-1][0];
      elements.to.value=last;
      const start=new Date(last+"T00:00:00Z"); start.setUTCDate(start.getUTCDate()-89);
      elements.from.value=start.toISOString().slice(0,10)<first?first:start.toISOString().slice(0,10);
      elements.from.min=elements.to.min=first; elements.from.max=elements.to.max=last;
      initializeTimeline(first,last);
      elements.updated.textContent=`${copy.updated} ${new Date(data.updated_utc).toLocaleString(locale)}`;
      quantityChart=chart(document.getElementById("quantity-chart"));
      priceChart=chart(document.getElementById("price-chart"));
      elements.groupOptions.addEventListener("change",render);
      elements.metric.addEventListener("change",()=>{
        updateMetricToggle();
        render();
      });
      elements.metricToggle.querySelectorAll("button[data-metric]").forEach(button=>{
        button.addEventListener("click",()=>{
          elements.metric.value=button.dataset.metric;
          updateMetricToggle();
          render();
        });
      });
      [elements.from,elements.to].forEach(node=>node.addEventListener("change",()=>{
        if(elements.from.value>elements.to.value){
          if(node===elements.from) elements.to.value=elements.from.value;
          else elements.from.value=elements.to.value;
        }
        ensureTimelineDateVisible(dateToDay(elements.from.value));
        ensureTimelineDateVisible(dateToDay(elements.to.value));
        updateTimeline();
        if(!elements.splitVessels.checked){
          render();
          return;
        }
        loadVesselYears(elements.from.value,elements.to.value,quantityChart).finally(render);
      }));
      [
        [elements.timelineFromLabel,elements.from,true],
        [elements.timelineToLabel,elements.to,false]
      ].forEach(([input,target,isStart])=>{
        input.addEventListener("change",()=>commitTimelineDate(input,target,isStart));
        input.addEventListener("keydown",event=>{
          if(event.key!=="Enter") return;
          event.preventDefault();
          commitTimelineDate(input,target,isStart);
          input.blur();
        });
      });
      elements.timelineFrom.addEventListener("input",()=>moveTimelineHandle("from"));
      elements.timelineTo.addEventListener("input",()=>moveTimelineHandle("to"));
      [elements.timelineFrom,elements.timelineTo].forEach(input=>input.addEventListener("change",()=>{
        if(elements.splitVessels.checked) loadVesselYears(elements.from.value,elements.to.value,quantityChart).finally(render);
        else render();
      }));
      elements.splitGroups.addEventListener("click",()=>{
        if(!splitGroupsActive()){
          openGroupDialog();
          return;
        }
        setSplitGroupsActive(false);
        elements.groupOptions.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.checked=true;});
        if(elements.splitVessels.checked){
          selectedVessels.clear();
          vesselSelectionInitialized=false;
        }
        render();
      });
      elements.groupDialogSelectAll.addEventListener("click",()=>{
        elements.groupDialogOptions.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.checked=true;});
        elements.groupDialogOptions.dispatchEvent(new Event("change",{bubbles:true}));
      });
      elements.groupDialogDeselectAll.addEventListener("click",()=>{
        elements.groupDialogOptions.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.checked=false;});
        elements.groupDialogOptions.dispatchEvent(new Event("change",{bubbles:true}));
      });
      elements.groupDialogApply.addEventListener("click",()=>{
        const chosen=selected(elements.groupDialogOptions);
        elements.groupOptions.querySelectorAll('input[type="checkbox"]').forEach(input=>{
          input.checked=chosen.has(input.value);
        });
        setSplitGroupsActive(true);
        elements.groupDialog.close("apply");
        render();
      });
      elements.groupDialog.addEventListener("close",()=>{
        if(elements.groupDialog.returnValue==="apply") return;
        setSplitGroupsActive(false);
      });
      elements.splitVessels.addEventListener("change",()=>{
        selectedVessels.clear();
        vesselSelectionInitialized=false;
        elements.vesselSearch.value="";
        if(!elements.splitVessels.checked){
          render();
          return;
        }
        loadVesselYears(elements.from.value,elements.to.value,quantityChart).finally(()=>{
          render();
        });
      });
      elements.vesselSearch.addEventListener("input",filterVesselOptions);
      elements.vesselSelectAll.addEventListener("click",()=>{
        elements.vesselOptions.querySelectorAll('.dashboard-vessel-option input[type="checkbox"]').forEach(input=>selectedVessels.add(input.value));
        vesselSelectionInitialized=true;
        render();
      });
      elements.vesselDeselectAll.addEventListener("click",()=>{
        selectedVessels.clear();
        vesselSelectionInitialized=true;
        render();
      });
      document.querySelectorAll(".dashboard-deselect-all").forEach(button=>{
        button.addEventListener("click",()=>{
          button.parentElement.querySelectorAll('input[type="checkbox"]').forEach(input=>{input.checked=false;});
          render();
        });
      });
      elements.status.hidden=true; elements.dashboard.hidden=false; render();
    })
    .catch(error=>{
      elements.status.classList.add("error");
      elements.status.textContent=copy.dashboardError(error.message);
      elements.updated.textContent=copy.dataUnavailable;
    });
})();
