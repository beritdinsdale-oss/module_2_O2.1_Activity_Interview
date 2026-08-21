const pages=[...document.querySelectorAll(".page")];
let current=0;
const STORAGE_KEY="climateMemoryEvidence.v11";
let state={path:"",observation:"",patternAnswers:{},notes:"",finding:"",verdict:"",changed:""};

const observationLabels={
  "summer-heat":"Summers seem hotter.",
  "winter-warmth":"Winters seem warmer.",
  precipitation:"Rainfall seems different.",
  drought:"Drought seems more common or severe.",
  "extreme-heat":"Extreme heat seems more common.",
  "growing-season":"The growing season or frost timing seems different."
};

const resourceGuides={
  "summer-heat":{
    title:"Summers seem hotter", icon:"🌡️", name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:[
      "On the Climate at a Glance home page, choose <strong>City</strong>, then choose <strong>City Time Series</strong>.",
      "For <strong>State</strong>, choose your state. For <strong>City</strong>, choose the available city closest to the place in your observation.",
      "For <strong>Parameter</strong>, choose <strong>Average Temperature</strong>.",
      "For <strong>Time Scale</strong>, choose <strong>3-Month</strong>. For <strong>Month</strong>, choose <strong>August</strong>. Together, these settings show June–July–August.",
      "For <strong>Start Year</strong>, choose the earliest year available. For <strong>End Year</strong>, choose the most recent year available.",
      "If <strong>Display Trend</strong> is available, turn it on. Then use the graph to answer the questions on the next page."
    ]
  },
  "winter-warmth":{
    title:"Winters seem warmer", icon:"❄️", name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:[
      "On the Climate at a Glance home page, choose <strong>City</strong>, then choose <strong>City Time Series</strong>.",
      "Choose your <strong>State</strong> and the available <strong>City</strong> closest to the place in your observation.",
      "For <strong>Parameter</strong>, choose <strong>Average Temperature</strong>.",
      "For <strong>Time Scale</strong>, choose <strong>3-Month</strong>. For <strong>Month</strong>, choose <strong>February</strong>. This gives the winter period ending in February (December–January–February).",
      "Choose the earliest available <strong>Start Year</strong> and the most recent available <strong>End Year</strong>.",
      "If <strong>Display Trend</strong> is available, turn it on. Then answer the winter-pattern questions on the next page."
    ]
  },
  precipitation:{
    title:"Rainfall seems different", icon:"🌧️", name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:[
      "On the Climate at a Glance home page, choose <strong>City</strong>, then choose <strong>City Time Series</strong>.",
      "Choose your <strong>State</strong> and the available <strong>City</strong> closest to the place in your observation.",
      "For <strong>Parameter</strong>, choose <strong>Precipitation</strong>.",
      "Choose the season that best matches the memory: <strong>Winter = 3-Month + February</strong>; <strong>Spring = 3-Month + May</strong>; <strong>Summer = 3-Month + August</strong>; <strong>Fall = 3-Month + November</strong>.",
      "Choose the earliest available <strong>Start Year</strong> and the most recent available <strong>End Year</strong>.",
      "If <strong>Display Trend</strong> is available, turn it on. Remember: this graph shows seasonal precipitation totals, not how evenly rain was distributed within the season."
    ]
  },
  drought:{
    title:"Drought seems more common or severe", icon:"☀️", name:"Drought.gov Historical Drought Data & Conditions Tool",
    url:"https://www.drought.gov/data-maps-tools/historical-drought-data-conditions-tool",
    steps:[
      "Open the Historical Drought Data & Conditions Tool and choose the <strong>state or county</strong> that best matches the place in your observation.",
      "Use the <strong>Standardized Precipitation Index (SPI)</strong> panel for the longest instrumental precipitation-based drought record. SPI extends back to 1895.",
      "Set the graph to show as much of the available historical record as possible rather than only recent years.",
      "Read across the time series from earlier to later years. Use the questions on the next page to compare how often dry periods occur and how severe they appear."
    ]
  },
  "extreme-heat":{
    title:"Extreme heat seems more common", icon:"🔥", name:"Climate Toolbox — Historical Climate Tracker",
    url:"https://climatetoolbox.org/tool/Historical-Climate-Tracker",
    steps:[
      "Under <strong>Choose Location</strong>, select <strong>Point Location</strong>. Enter a place name or click/drag the map marker, then choose <strong>SET LOCATION</strong>.",
      "Open <strong>Choose Data</strong>. Set <strong>Calendar Time Period</strong> to an annual summary so each point or bar represents one year.",
      "In <strong>Variable</strong>, choose a heat metric that counts very hot days if one is available for your location. Use the same threshold for the whole record.",
      "Under <strong>Change Graph</strong>, turn on <strong>Add Best-Fit Line</strong> if available.",
      "Use the graph from 1979 to the present. On the next page, answer the questions about whether high-heat days are becoming more common and how much they vary from year to year."
    ],
    clue:"<strong>Why 1979?</strong><span>The Historical Climate Tracker uses gridMET data for the contiguous United States beginning in 1979.</span>"
  },
  "growing-season":{
    title:"The growing season or frost timing seems different", icon:"🌱", name:"Climate Toolbox — Historical Climate Tracker",
    url:"https://climatetoolbox.org/tool/Historical-Climate-Tracker",
    steps:[
      "Under <strong>Choose Location</strong>, select <strong>Point Location</strong>. Enter a place name or click/drag the map marker, then choose <strong>SET LOCATION</strong>.",
      "Open <strong>Choose Data</strong> and use an <strong>annual summary</strong> time period.",
      "In <strong>Variable</strong>, choose <strong>Last Spring Freeze</strong>. View the graph and note whether the date tends to be earlier, later, or shows no clear change.",
      "Return to <strong>Variable</strong> and choose <strong>First Fall Freeze</strong>. Again, note whether the date tends to be earlier, later, or shows no clear change.",
      "If available, turn on <strong>Add Best-Fit Line</strong>. Then answer the frost-timing questions on the next page."
    ],
    clue:"<strong>Put the two dates together.</strong><span>An earlier last spring freeze and/or a later first fall freeze can lengthen the frost-free growing season.</span>"
  },
};

const patternQuestions={
  "summer-heat":[
    {id:"recent",q:"Compared with earlier summers, recent summers are generally…",options:[["warmer","Warmer"],["cooler","Cooler"],["same","About the same"],["unclear","Too variable to see a clear difference"]]},
    {id:"trend",q:"What does the long-term trend show?",options:[["up","Temperatures trend upward"],["down","Temperatures trend downward"],["flat","The trend is relatively flat"],["unsure","I’m not sure"]]},
    {id:"variability",q:"How much do individual summers vary from year to year?",options:[["lots","Quite a bit"],["little","Not very much"],["unsure","I’m not sure"]]}
  ],
  "winter-warmth":[
    {id:"recent",q:"Compared with earlier winters, recent winters are generally…",options:[["warmer","Warmer"],["cooler","Cooler"],["same","About the same"],["unclear","Too variable to see a clear difference"]]},
    {id:"trend",q:"What does the long-term trend show?",options:[["up","Temperatures trend upward"],["down","Temperatures trend downward"],["flat","The trend is relatively flat"],["unsure","I’m not sure"]]},
    {id:"variability",q:"How much do individual winters vary from year to year?",options:[["lots","Quite a bit"],["little","Not very much"],["unsure","I’m not sure"]]}
  ],
  precipitation:[
    {id:"recent",q:"Compared with earlier years, precipitation in the season you checked is generally…",options:[["higher","Higher"],["lower","Lower"],["same","About the same"],["unclear","Too variable to see a clear difference"]]},
    {id:"trend",q:"What does the long-term trend show?",options:[["up","Precipitation trends upward"],["down","Precipitation trends downward"],["flat","The trend is relatively flat"],["unsure","I’m not sure"]]},
    {id:"variability",q:"How much does precipitation vary from year to year?",options:[["lots","Quite a bit"],["little","Not very much"],["unsure","I’m not sure"]]}
  ],
  drought:[
    {id:"frequency",q:"Compared with earlier parts of the record, recent drought conditions appear…",options:[["more","More frequent"],["less","Less frequent"],["similar","About as frequent"],["unclear","No clear pattern / I’m not sure"]]},
    {id:"severity",q:"What do you notice about drought severity?",options:[["more","Recent droughts appear more severe"],["less","Recent droughts appear less severe"],["similar","Severity looks similar across the record"],["unclear","No clear pattern / I’m not sure"]]},
    {id:"history",q:"Does the record show drought occurring throughout the historical period?",options:[["yes","Yes"],["no","No"],["unsure","I’m not sure"]]}
  ],
  "extreme-heat":[
    {id:"recent",q:"Compared with earlier years, the number of very hot days is generally…",options:[["more","Higher"],["less","Lower"],["same","About the same"],["unclear","Too variable to see a clear difference"]]},
    {id:"trend",q:"What does the long-term trend show?",options:[["up","Very hot days are becoming more common"],["down","Very hot days are becoming less common"],["flat","The trend is relatively flat"],["unsure","I’m not sure"]]},
    {id:"variability",q:"How much does the number of very hot days vary from year to year?",options:[["lots","Quite a bit"],["little","Not very much"],["unsure","I’m not sure"]]}
  ],
  "growing-season":[
    {id:"spring",q:"What has happened to the last spring freeze?",options:[["earlier","It is generally earlier"],["later","It is generally later"],["same","No clear change"],["unsure","I’m not sure"]]},
    {id:"fall",q:"What has happened to the first fall freeze?",options:[["earlier","It is generally earlier"],["later","It is generally later"],["same","No clear change"],["unsure","I’m not sure"]]},
    {id:"season",q:"Taken together, what might those frost dates mean for the frost-free growing season?",options:[["longer","It may be getting longer"],["shorter","It may be getting shorter"],["same","There is no clear change"],["unsure","I’m not sure"]]}
  ]
};
function answerLabel(question,value){const hit=question.options.find(o=>o[0]===value);return hit?hit[1]:value;}
function getPatternSummary(){const qs=patternQuestions[state.observation]||[];return qs.map(q=>`${q.q} ${answerLabel(q,state.patternAnswers[q.id]||"Not answered")}`).join("\n");}
function patternComplete(){const qs=patternQuestions[state.observation]||[];return qs.every(q=>state.patternAnswers[q.id]);}
function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function loadLocal(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved)state={...state,...saved};}catch{}}
function getObservationText(){return observationLabels[state.observation]||"Your selected observation";}
function showPage(n,hash=true){
  current=Math.max(0,Math.min(pages.length-1,n));
  pages.forEach((p,i)=>p.classList.toggle("active",i===current));
  document.querySelector("#progressText").textContent=`${current+1} of ${pages.length}`;
  document.querySelector("#progressBar").style.width=`${((current+1)/pages.length)*100}%`;
  if(hash)history.replaceState(null,"",`#${pages[current].id}`);
  window.scrollTo({top:0,behavior:"smooth"});
  if(current===5)renderFocusPage();
  if(current===6)renderResourceGuide();
  if(current===7)renderPathwayQuestion();
  if(current===8)updateComparisonReminder();
  if(current===9)updateReview();
  if(current===10)updateJournalHandoff();
}
function showPageById(id){
  const idx=pages.findIndex(p=>p.id===id);
  if(idx>=0)showPage(idx);
}
document.querySelectorAll("[data-target]").forEach(b=>b.addEventListener("click",()=>showPageById(b.dataset.target)));
document.querySelectorAll(".back").forEach(b=>b.addEventListener("click",()=>showPage(current-1)));

document.querySelectorAll(".choice").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");state.path=btn.dataset.path;saveLocal();document.querySelector("#pathNext").disabled=false;
}));
document.querySelector("#pathNext").addEventListener("click",()=>{configureQuestionPage();showPage(3);});
function configureQuestionPage(){
  const title=document.querySelector("#questionTitle"),intro=document.querySelector("#questionIntro"),interviewBox=document.querySelector("#interviewReturn"),selfContinue=document.querySelector("#selfContinue");
  if(state.path==="interview"){
    title.textContent="Questions to ask your interview partner";intro.innerHTML="<strong>Find someone who has lived in the area for many years.</strong><p>Use these questions as conversation starters. You do not need to ask them word-for-word or record every answer.</p>";interviewBox.classList.remove("hidden");selfContinue.classList.add("hidden");
  }else{
    title.textContent="Questions for your own reflection";intro.innerHTML="<strong>Think back over the years you have lived here.</strong><p>Use these questions to identify one change you feel confident you have noticed.</p>";interviewBox.classList.add("hidden");selfContinue.classList.remove("hidden");
  }
}
document.querySelector("#selfContinue").addEventListener("click",()=>showPageById("observation"));
document.querySelector("#imBack").addEventListener("click",()=>showPageById("observation"));
document.querySelector("#copyReturn").addEventListener("click",async()=>{const url=location.href.split("#")[0]+"#questions";try{await navigator.clipboard.writeText(url);document.querySelector("#copyStatus").textContent="Return link copied.";}catch{document.querySelector("#copyStatus").textContent="Copy this page address from your browser to return later.";}});

const observationSelect=document.querySelector("#observationSelect");
function validateObservation(){document.querySelector("#observationNext").disabled=!state.observation;}
observationSelect.addEventListener("change",()=>{state.observation=observationSelect.value;state.patternAnswers={};saveLocal();validateObservation();});
document.querySelector("#observationNext").addEventListener("click",()=>showPageById("focus"));
function renderFocusPage(){const g=resourceGuides[state.observation];document.querySelector("#focusIcon").textContent=g.icon||"🔎";document.querySelector("#focusObservation").textContent=getObservationText();}

function renderResourceGuide(){
  const g=resourceGuides[state.observation];
  document.querySelector("#resourceTitle").textContent="Use this resource to check your observation";
  document.querySelector("#resourceName").textContent=g.name;document.querySelector("#resourceLink").href=g.url;
  document.querySelector("#resourceSteps").innerHTML=g.steps.map((x,i)=>`<li><span>${i+1}</span><p>${x}</p></li>`).join("");
  const clue=document.querySelector("#resourceClue");clue.classList.toggle("hidden",!g.clue);clue.innerHTML=g.clue||"";
}
function renderPathwayQuestion(){
  const qs=patternQuestions[state.observation]||[];
  const wrap=document.querySelector("#patternQuestions");
  wrap.innerHTML=qs.map((q,qi)=>`<fieldset class="pattern-question"><legend>${qi+1}. ${q.q}</legend><div class="pattern-options">${q.options.map(o=>`<label><input type="radio" name="pattern_${q.id}" value="${o[0]}" ${state.patternAnswers[q.id]===o[0]?"checked":""}> <span>${o[1]}</span></label>`).join("")}</div></fieldset>`).join("");
  wrap.querySelectorAll('input[type="radio"]').forEach(r=>r.addEventListener("change",e=>{const id=e.target.name.replace("pattern_","");state.patternAnswers[id]=e.target.value;state.finding=getPatternSummary();saveLocal();validatePattern();}));
  document.querySelector("#patternNotes").value=state.notes||"";
  validatePattern();
}
document.querySelector("#patternNotes").addEventListener("input",e=>{state.notes=e.target.value;saveLocal();});
function validatePattern(){document.querySelector("#patternNext").disabled=!patternComplete();}

document.querySelectorAll(".verdict").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".verdict").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");state.verdict=btn.dataset.verdict;saveLocal();
  const f=document.querySelector("#compareFeedback");f.classList.remove("hidden");
  const messages={supports:"The long-term record generally lines up with the observation.",mixed:"A partial match is useful: the memory may capture one part of a more complicated pattern.",unclear:"A mismatch is useful too. The long-term record may tell a different story than the memory.","more-info":"Sometimes the best conclusion is that the resource did not answer the question well enough. That is a valid finding."};
  f.textContent=messages[state.verdict];validateComparison();
}));
document.querySelectorAll('input[name="changed"]').forEach(r=>r.addEventListener("change",e=>{state.changed=e.target.value;saveLocal();validateComparison();}));
function validateComparison(){document.querySelector("#compareNext").disabled=!(state.verdict&&state.changed);}
document.querySelector("#compareNext").addEventListener("click",()=>showPageById("review"));
function updateComparisonReminder(){document.querySelector("#observationReminder").innerHTML=`<strong>Observation you are checking:</strong> ${getObservationText()}`;}
function updateReview(){
  const g=resourceGuides[state.observation];
  document.querySelector("#reviewObservation").textContent=getObservationText();document.querySelector("#reviewResource").textContent=g.name;document.querySelector("#reviewFinding").textContent=getPatternSummary();document.querySelector("#reviewNotes").textContent=state.notes||"No notes added.";
  const v={supports:"The climate record generally supports the observation",mixed:"The climate record partly supports it, but the story is more complicated",unclear:"The climate record does not clearly support the observation","more-info":"I need more information to tell"};
  const c={yes:"Yes","a-little":"A little",no:"No","not-sure":"I’m not sure yet"};document.querySelector("#reviewVerdict").textContent=v[state.verdict]||"Not selected yet.";document.querySelector("#reviewChanged").textContent=c[state.changed]||"Not selected yet.";
}
function encodeHandoff(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary="";bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
function updateJournalHandoff(){const qs=patternQuestions[state.observation]||[];const structured=qs.map(q=>({question:q.q,answer:answerLabel(q,state.patternAnswers[q.id]||"Not answered")}));const finding=getPatternSummary()+(state.notes?`\n\nNotes: ${state.notes}`:"");const payload={version:3,source:"climate-memory-evidence",observation:getObservationText(),finding,patternAnswers:structured,notes:state.notes||"",verdict:state.verdict||"",changed:state.changed||""};document.querySelector("#journalHandoff").href=`https://beritdinsdale-oss.github.io/garden-observation-journal/#handoff=${encodeHandoff(payload)}`;}

document.querySelector("#restart").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);state={path:"",observation:"",patternAnswers:{},notes:"",finding:"",verdict:"",changed:""};document.querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"));observationSelect.value="";document.querySelector("#patternNotes").value="";document.querySelectorAll('input[name="changed"]').forEach(x=>x.checked=false);document.querySelector("#pathNext").disabled=true;document.querySelector("#observationNext").disabled=true;document.querySelector("#compareNext").disabled=true;showPage(0);});
function restoreUI(){
  if(state.path){document.querySelector(`.choice[data-path="${state.path}"]`)?.classList.add("selected");document.querySelector("#pathNext").disabled=false;}
  if(!resourceGuides[state.observation]) state.observation=""; observationSelect.value=state.observation||"";
  if(state.verdict)document.querySelector(`.verdict[data-verdict="${state.verdict}"]`)?.classList.add("selected");if(state.changed)document.querySelector(`input[name="changed"][value="${state.changed}"]`)?.setAttribute("checked","checked");validateObservation();validateComparison();
}
function openHash(){const id=location.hash.slice(1),idx=pages.findIndex(p=>p.id===id);if(idx>=0){if(id==="questions")configureQuestionPage();showPage(idx,false);}else showPage(0,false);}
loadLocal();restoreUI();openHash();
