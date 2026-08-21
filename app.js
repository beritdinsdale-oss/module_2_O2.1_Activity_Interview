const pages=[...document.querySelectorAll(".page")];
let current=0;
const STORAGE_KEY="climateMemoryEvidence.v8";
let state={path:"",observation:"",otherObservation:"",finding:"",verdict:"",changed:""};

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
    title:"Summers seem hotter",
    icon:"🌡️", focus:"Across many years, are recent summers generally warmer than earlier summers, or is there no clear long-term change?",
    intro:"A hot summer or two does not necessarily tell us whether climate has changed. A long-term temperature record lets us compare many summers and look for a pattern.",
    name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:["From the Climate at a Glance home page, choose <strong>City</strong>, then <strong>City Time Series</strong>.","Choose your <strong>State</strong> and the nearest available <strong>City</strong>.","Set <strong>Parameter → Average Temperature</strong>, <strong>Time Scale → 3-Month</strong>, and <strong>Month → August</strong>.","Set <strong>Start Year</strong> to the earliest available year and <strong>End Year</strong> to the most recent available year."],
    look:"Look across the whole record rather than focusing on one unusually hot or cool summer. Is the overall pattern moving upward, downward, or staying fairly level? How much do individual summers bounce around that pattern?",
    question:"How large is the long-term change compared with the year-to-year variation you see?"
  },
  "winter-warmth":{
    title:"Winters seem warmer",
    icon:"❄️", focus:"Across many years, are recent winters generally warmer than earlier winters, or is there no clear long-term change?",
    intro:"Winter weather can swing dramatically from year to year. Looking across decades helps us see whether average winter temperature has changed underneath those ups and downs.",
    name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:["From the Climate at a Glance home page, choose <strong>City</strong>, then <strong>City Time Series</strong>.","Choose your <strong>State</strong> and the nearest available <strong>City</strong>.","Set <strong>Parameter → Average Temperature</strong>, <strong>Time Scale → 3-Month</strong>, and <strong>Month → February</strong>.","Set <strong>Start Year</strong> to the earliest available year and <strong>End Year</strong> to the most recent available year."],
    look:"Are recent winters generally warmer than earlier winters? Notice both the long-term direction and the large year-to-year swings that can still occur.",
    question:"Does the long-term winter pattern stand out even though individual winters vary?"
  },
  precipitation:{
    title:"Rainfall seems different",
    icon:"🌧️", focus:"For the season connected to the observation, has precipitation changed across many years, or does it mostly vary from year to year?",
    intro:"Rainfall can change in more than one way. We’ll start by looking at whether seasonal precipitation totals have changed over time.",
    name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:["From the Climate at a Glance home page, choose <strong>City</strong>, then <strong>City Time Series</strong>.","Choose your <strong>State</strong> and nearest available <strong>City</strong>. Set <strong>Parameter → Precipitation</strong>.","Match the season: <strong>Winter → 3-Month + February</strong>; <strong>Spring → 3-Month + May</strong>; <strong>Summer → 3-Month + August</strong>; <strong>Fall → 3-Month + November</strong>.","Set <strong>Start Year</strong> to the earliest available year and <strong>End Year</strong> to the most recent available year."],
    look:"Does seasonal precipitation show a long-term direction, or mostly large swings from year to year? Compare recent decades with earlier parts of the record.",
    clue:"<strong>🌧️ A useful clue</strong><span>A garden can feel “drier” even when total precipitation has not changed very much. When rain falls—and how it is distributed through the season—also matters.</span>",
    question:"Does the total amount appear to be changing, or is year-to-year variability the stronger feature?"
  },
  drought:{
    title:"Drought seems more common or severe",
    icon:"☀️", focus:"Across the historical record, do droughts appear to be becoming more frequent or severe, or has drought recurred throughout the record?",
    intro:"Drought is more complicated than simply receiving less rain. This historical tool lets you compare dry periods across time for a state or county.",
    name:"Drought.gov Historical Drought Data & Conditions Tool",
    url:"https://www.drought.gov/data-maps-tools/historical-drought-data-conditions-tool",
    steps:["Choose your state or county as the area you want to examine.","Start with a historical time series rather than only the current drought map.","Use the Standardized Precipitation Index (SPI) if you want the longest instrumental precipitation-based record; it extends back to 1895.","Look across the graph for repeated dry periods and compare more recent periods with earlier ones."],
    look:"Are severe dry periods concentrated in particular decades? Do recent dry periods look unusual compared with earlier parts of the record, or has drought appeared repeatedly throughout the record?",
    question:"Does the record suggest a change in drought frequency or severity, or a long history of recurring drought?"
  },
  "extreme-heat":{
    title:"Extreme heat seems more common",
    icon:"🔥", focus:"Across many years, are very hot days becoming more common at this location?",
    intro:"Average summer temperature and extreme heat are related, but they are not the same question. EPA’s climate indicators let you look specifically at unusually hot conditions and heat waves.",
    name:"Climate Toolbox — Historical Climate Tracker",
    url:"https://climatetoolbox.org/tool/Historical-Climate-Tracker",
    steps:["Open the Historical Climate Tracker and set the map to your location.","Choose an annual heat metric, such as days with heat index above 90°F, 95°F, 100°F, or 105°F. Pick a threshold that makes sense for your location.","Display the historical graph and trend line.","Look from 1979 to the present and compare recent years with the earlier part of the record."],
    look:"Are high-heat days becoming more common at your location? Notice the long-term direction, but also the large differences that can occur from one year to the next.",
    question:"What does the local record suggest about how often very hot conditions occur over time?"
  },
  "growing-season":{
    title:"The growing season or frost timing seems different",
    icon:"🌱", focus:"Across many years, is the last spring freeze shifting earlier and/or the first fall freeze shifting later?",
    intro:"For this climate indicator, the frost-free growing season is the time between the last spring frost and the first fall frost. That gives us a consistent way to compare seasons over time.",
    name:"Climate Toolbox — Historical Climate Tracker",
    url:"https://climatetoolbox.org/tool/Historical-Climate-Tracker",
    steps:["Open the <strong>Historical Climate Tracker</strong> and select your location on the map.","Choose <strong>Last Spring Freeze</strong>. Look across the graph: is the date generally shifting earlier, later, or showing no clear pattern?","Next choose <strong>First Fall Freeze</strong>. Is that date generally shifting earlier, later, or showing no clear pattern?","Put the two clues together: an earlier last spring freeze and/or a later first fall freeze can lengthen the frost-free growing season."],
    look:"Is the frost-free season getting longer, shorter, or staying about the same? If it is changing, does the record point to an earlier last spring freeze, a later first fall freeze, or both?",
    question:"If the growing season is changing, what part of the frost-free season seems to be contributing to that change?"
  },
  other:{
    title:"Your observation",
    icon:"✏️", focus:"Across many years, does the climate measure that best matches your observation show a clear long-term pattern?",
    intro:"Your observation does not fit neatly into one of our pathways, so start with a broad climate-data tool and choose the measure that most closely matches what you noticed.",
    name:"NOAA Climate at a Glance",
    url:"https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/",
    steps:["Choose the local area closest to the place in your observation.","Choose the climate measure that most closely matches what you noticed.","Choose a season or time period that matches the observation.","Use a long historical record and look for the overall pattern rather than one unusual year."],
    look:"Ask whether the resource actually measures the thing you remembered. If it only answers part of your question, that is a useful finding too.",
    question:"How well does the measure you found match the observation you wanted to investigate?"
  }
};

function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function loadLocal(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved)state={...state,...saved};}catch{}}
function getObservationText(){return state.observation==="other"?(state.otherObservation.trim()||"Other observation"):(observationLabels[state.observation]||"Your selected observation");}
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
document.querySelectorAll(".next").forEach(b=>b.addEventListener("click",()=>showPage(current+1)));
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
document.querySelector("#selfContinue").addEventListener("click",()=>showPage(4));
document.querySelector("#imBack").addEventListener("click",()=>showPage(4));
document.querySelector("#copyReturn").addEventListener("click",async()=>{const url=location.href.split("#")[0]+"#questions";try{await navigator.clipboard.writeText(url);document.querySelector("#copyStatus").textContent="Return link copied.";}catch{document.querySelector("#copyStatus").textContent="Copy this page address from your browser to return later.";}});

const observationSelect=document.querySelector("#observationSelect");
function validateObservation(){const ready=state.observation&&(state.observation!=="other"||state.otherObservation.trim());document.querySelector("#observationNext").disabled=!ready;}
observationSelect.addEventListener("change",()=>{state.observation=observationSelect.value;document.querySelector("#otherObservationWrap").classList.toggle("hidden",state.observation!=="other");saveLocal();validateObservation();});
document.querySelector("#otherObservation").addEventListener("input",e=>{state.otherObservation=e.target.value;saveLocal();validateObservation();});
document.querySelector("#observationNext").addEventListener("click",()=>showPage(5));
function renderFocusPage(){const g=resourceGuides[state.observation]||resourceGuides.other;document.querySelector("#focusIcon").textContent=g.icon||"🔎";document.querySelector("#focusObservation").textContent=getObservationText();document.querySelector("#focusQuestion").textContent=g.focus;}

function renderResourceGuide(){
  const g=resourceGuides[state.observation]||resourceGuides.other;
  document.querySelector("#resourceTitle").textContent="Use this resource to check your observation";
  document.querySelector("#resourceName").textContent=g.name;document.querySelector("#resourceLink").href=g.url;
  document.querySelector("#resourceSteps").innerHTML=g.steps.map((x,i)=>`<li><span>${i+1}</span><p>${x}</p></li>`).join("");
  document.querySelector("#resourceQuestion").textContent=g.focus;
  document.querySelector("#resourceLookFor").textContent=g.look;
  const clue=document.querySelector("#resourceClue");clue.classList.toggle("hidden",!g.clue);clue.innerHTML=g.clue||"";
}
function renderPathwayQuestion(){const g=resourceGuides[state.observation]||resourceGuides.other;document.querySelector("#pathwayQuestionLabel").textContent="One more thing to notice";document.querySelector("#pathwayQuestion").textContent=g.question;}
document.querySelector("#finding").addEventListener("input",e=>{state.finding=e.target.value;saveLocal();});

document.querySelectorAll(".verdict").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".verdict").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");state.verdict=btn.dataset.verdict;saveLocal();
  const f=document.querySelector("#compareFeedback");f.classList.remove("hidden");
  const messages={supports:"The long-term record generally lines up with the observation.",mixed:"A partial match is useful: the memory may capture one part of a more complicated pattern.",unclear:"A mismatch is useful too. The long-term record may tell a different story than the memory.","more-info":"Sometimes the best conclusion is that the resource did not answer the question well enough. That is a valid finding."};
  f.textContent=messages[state.verdict];validateComparison();
}));
document.querySelectorAll('input[name="changed"]').forEach(r=>r.addEventListener("change",e=>{state.changed=e.target.value;saveLocal();validateComparison();}));
function validateComparison(){document.querySelector("#compareNext").disabled=!(state.verdict&&state.changed);}
document.querySelector("#compareNext").addEventListener("click",()=>showPage(9));
function updateComparisonReminder(){document.querySelector("#observationReminder").innerHTML=`<strong>Observation you are checking:</strong> ${getObservationText()}`;}
function updateReview(){
  const g=resourceGuides[state.observation]||resourceGuides.other;
  document.querySelector("#reviewObservation").textContent=getObservationText();document.querySelector("#reviewResource").textContent=g.name;document.querySelector("#reviewFinding").textContent=state.finding||"No pattern entered yet.";
  const v={supports:"The climate record generally supports the observation",mixed:"The climate record partly supports it, but the story is more complicated",unclear:"The climate record does not clearly support the observation","more-info":"I need more information to tell"};
  const c={yes:"Yes","a-little":"A little",no:"No","not-sure":"I’m not sure yet"};document.querySelector("#reviewVerdict").textContent=v[state.verdict]||"Not selected yet.";document.querySelector("#reviewChanged").textContent=c[state.changed]||"Not selected yet.";
}
function encodeHandoff(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary="";bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
function updateJournalHandoff(){const payload={version:2,source:"climate-memory-evidence",observation:getObservationText(),finding:state.finding||"",verdict:state.verdict||""};document.querySelector("#journalHandoff").href=`https://beritdinsdale-oss.github.io/garden-observation-journal/#handoff=${encodeHandoff(payload)}`;}

document.querySelector("#restart").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);state={path:"",observation:"",otherObservation:"",finding:"",verdict:"",changed:""};document.querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"));observationSelect.value="";document.querySelector("#otherObservation").value="";document.querySelector("#otherObservationWrap").classList.add("hidden");document.querySelector("#finding").value="";document.querySelectorAll('input[name="changed"]').forEach(x=>x.checked=false);document.querySelector("#pathNext").disabled=true;document.querySelector("#observationNext").disabled=true;document.querySelector("#compareNext").disabled=true;showPage(0);});
function restoreUI(){
  if(state.path){document.querySelector(`.choice[data-path="${state.path}"]`)?.classList.add("selected");document.querySelector("#pathNext").disabled=false;}
  observationSelect.value=state.observation||"";document.querySelector("#otherObservation").value=state.otherObservation||"";document.querySelector("#otherObservationWrap").classList.toggle("hidden",state.observation!=="other");document.querySelector("#finding").value=state.finding||"";
  if(state.verdict)document.querySelector(`.verdict[data-verdict="${state.verdict}"]`)?.classList.add("selected");if(state.changed)document.querySelector(`input[name="changed"][value="${state.changed}"]`)?.setAttribute("checked","checked");validateObservation();validateComparison();
}
function openHash(){const id=location.hash.slice(1),idx=pages.findIndex(p=>p.id===id);if(idx>=0){if(id==="questions")configureQuestionPage();showPage(idx,false);}else showPage(0,false);}
loadLocal();restoreUI();openHash();
