const pages=[...document.querySelectorAll(".page")];
let current=0;

const STORAGE_KEY="climateMemoryEvidence.v7";
let state={
  path:"",
  observation:"",
  otherObservation:"",
  evidence:[],
  finding:"",
  verdict:""
};

const observationLabels={
  temperature:"Temperature seems different than it used to.",
  precipitation:"Rainfall or precipitation seems different than it used to.",
  dryness:"Dry periods or drought seem different than they used to.",
  winter:"Snow, frost, or winter conditions seem different than they used to.",
  "seasonal-timing":"Seasonal timing or the growing season seems different than it used to.",
  "extreme-weather":"Extreme weather seems different than it used to."
};

const evidenceLabels={
  temperature:"Temperature over time",
  precipitation:"Rainfall or precipitation",
  drought:"Drought or dry periods",
  snow:"Snow or winter conditions",
  season:"Frost or growing season",
  extremes:"Extreme events"
};

function saveLocal(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function loadLocal(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved) state={...state,...saved};
  }catch{}
}
function showPage(n,hash=true){
  current=Math.max(0,Math.min(pages.length-1,n));
  pages.forEach((p,i)=>p.classList.toggle("active",i===current));
  document.querySelector("#progressText").textContent=`${current+1} of ${pages.length}`;
  document.querySelector("#progressBar").style.width=`${((current+1)/pages.length)*100}%`;
  if(hash) history.replaceState(null,"",`#${pages[current].id}`);
  window.scrollTo({top:0,behavior:"smooth"});
  if(current===5) filterResources();
  if(current===7) updateComparisonReminder();
  if(current===8) updateReview();
  if(current===9) updateJournalHandoff();
}

document.querySelectorAll(".next").forEach(b=>b.addEventListener("click",()=>showPage(current+1)));
document.querySelectorAll(".back").forEach(b=>b.addEventListener("click",()=>showPage(current-1)));

document.querySelectorAll(".choice").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));
    btn.classList.add("selected");
    state.path=btn.dataset.path;
    saveLocal();
    document.querySelector("#pathNext").disabled=false;
  });
});
document.querySelector("#pathNext").addEventListener("click",()=>{
  configureQuestionPage();
  showPage(3);
});

function configureQuestionPage(){
  const title=document.querySelector("#questionTitle");
  const intro=document.querySelector("#questionIntro");
  const interviewBox=document.querySelector("#interviewReturn");
  const selfContinue=document.querySelector("#selfContinue");

  if(state.path==="interview"){
    title.textContent="Questions to ask your interview partner";
    intro.innerHTML="<strong>Find someone who has lived in the area for many years.</strong><p>Use these questions as conversation starters. You do not need to ask them word-for-word or record every answer.</p>";
    interviewBox.classList.remove("hidden");
    selfContinue.classList.add("hidden");
  }else{
    title.textContent="Questions for your own reflection";
    intro.innerHTML="<strong>Think back over the years you have lived here.</strong><p>Use these questions to identify one change you feel confident you have noticed.</p>";
    interviewBox.classList.add("hidden");
    selfContinue.classList.remove("hidden");
  }
}
document.querySelector("#selfContinue").addEventListener("click",()=>showPage(4));
document.querySelector("#imBack").addEventListener("click",()=>showPage(4));

document.querySelector("#copyReturn").addEventListener("click",async()=>{
  const url=location.href.split("#")[0]+"#questions";
  try{
    await navigator.clipboard.writeText(url);
    document.querySelector("#copyStatus").textContent="Return link copied.";
  }catch{
    document.querySelector("#copyStatus").textContent="Copy this page address from your browser to return later.";
  }
});

const observationSelect=document.querySelector("#observationSelect");
observationSelect.addEventListener("change",()=>{
  state.observation=observationSelect.value;
  const wrap=document.querySelector("#otherObservationWrap");
  wrap.classList.toggle("hidden",state.observation!=="other");
  saveLocal();
  validateEvidencePage();
});

document.querySelector("#otherObservation").addEventListener("input",e=>{
  state.otherObservation=e.target.value;
  saveLocal();
  validateEvidencePage();
});
document.querySelectorAll('input[name="evidence"]').forEach(cb=>{
  cb.addEventListener("change",()=>{
    state.evidence=[...document.querySelectorAll('input[name="evidence"]:checked')].map(x=>x.value);
    saveLocal();
    validateEvidencePage();
  });
});
function validateEvidencePage(){
  const observationReady=state.observation && (state.observation!=="other" || state.otherObservation.trim());
  document.querySelector("#evidenceNext").disabled=!(observationReady && state.evidence.length);
}
document.querySelector("#evidenceNext").addEventListener("click",()=>showPage(5));

function getObservationText(){
  if(state.observation==="other") return state.otherObservation.trim() || "Other observation";
  return observationLabels[state.observation] || "Your selected observation";
}

function filterResources(){
  const selected=new Set(state.evidence);
  document.querySelectorAll(".resource").forEach(card=>{
    const types=card.dataset.types.split(" ");
    card.classList.toggle("hidden-resource",!types.some(t=>selected.has(t)));
  });
  document.querySelector("#sourceSummary").innerHTML=
    `<strong>Evidence you chose:</strong> ${state.evidence.map(x=>evidenceLabels[x]).join(", ")}`;
}

document.querySelector("#finding").addEventListener("input",e=>{
  state.finding=e.target.value;
  saveLocal();
});

document.querySelectorAll(".verdict").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".verdict").forEach(x=>x.classList.remove("selected"));
    btn.classList.add("selected");
    state.verdict=btn.dataset.verdict;
    saveLocal();

    const f=document.querySelector("#compareFeedback");
    f.classList.remove("hidden");
    const messages={
      supports:"The long-term record generally lines up with the observation. In your journal, keep the evidence that made that connection convincing.",
      mixed:"A mixed result is useful. The observation may capture only one season, location, or part of a more complicated pattern.",
      unclear:"An unclear result is still a valid finding. The data you found may not measure exactly what was remembered, or you may need a different record."
    };
    f.textContent=messages[state.verdict];
    document.querySelector("#compareNext").disabled=false;
  });
});
document.querySelector("#compareNext").addEventListener("click",()=>showPage(8));

function updateComparisonReminder(){
  document.querySelector("#observationReminder").innerHTML=
    `<strong>Observation you are checking:</strong> ${observationLabels[state.observation]||"Your selected observation"}`;
}
function updateReview(){
  document.querySelector("#reviewObservation").textContent=getObservationText();
  document.querySelector("#reviewEvidence").textContent=state.evidence.map(x=>evidenceLabels[x]).join(", ");
  document.querySelector("#reviewFinding").textContent=state.finding||"No pattern entered yet.";
  const v={supports:"Mostly supports the observation",mixed:"The picture is mixed",unclear:"Not enough evidence"};
  document.querySelector("#reviewVerdict").textContent=v[state.verdict]||"Not selected yet.";
}

function encodeHandoff(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));
  let binary="";
  bytes.forEach(b=>binary+=String.fromCharCode(b));
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function updateJournalHandoff(){
  const payload={
    version:2,
    source:"climate-memory-evidence",
    observation:getObservationText(),
    finding:state.finding||"",
    verdict:state.verdict||""
  };
  document.querySelector("#journalHandoff").href=
    `https://beritdinsdale-oss.github.io/garden-observation-journal/#handoff=${encodeHandoff(payload)}`;
}

document.querySelector("#restart").addEventListener("click",()=>{
  localStorage.removeItem(STORAGE_KEY);
  state={path:"",observation:"",otherObservation:"",evidence:[],finding:"",verdict:""};
  document.querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"));
  document.querySelectorAll('input[name="evidence"]').forEach(x=>x.checked=false);
  observationSelect.value="";
  document.querySelector("#otherObservation").value="";
  document.querySelector("#otherObservationWrap").classList.add("hidden");
  document.querySelector("#finding").value="";
  document.querySelector("#pathNext").disabled=true;
  document.querySelector("#evidenceNext").disabled=true;
  document.querySelector("#compareNext").disabled=true;
  showPage(0);
});

function restoreUI(){
  if(state.path){
    const btn=document.querySelector(`.choice[data-path="${state.path}"]`);
    btn?.classList.add("selected");
    document.querySelector("#pathNext").disabled=false;
  }
  observationSelect.value=state.observation||"";
  document.querySelector("#otherObservation").value=state.otherObservation||"";
  document.querySelector("#otherObservationWrap").classList.toggle("hidden",state.observation!=="other");
  document.querySelectorAll('input[name="evidence"]').forEach(cb=>cb.checked=state.evidence.includes(cb.value));
  document.querySelector("#finding").value=state.finding||"";
  if(state.verdict){
    document.querySelector(`.verdict[data-verdict="${state.verdict}"]`)?.classList.add("selected");
    document.querySelector("#compareNext").disabled=false;
  }
  validateEvidencePage();
}

function openHash(){
  const id=location.hash.slice(1);
  const idx=pages.findIndex(p=>p.id===id);
  if(idx>=0){
    if(id==="questions") configureQuestionPage();
    showPage(idx,false);
  }else showPage(0,false);
}

loadLocal();
restoreUI();
openHash();
