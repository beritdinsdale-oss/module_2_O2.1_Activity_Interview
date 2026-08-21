const pages=[...document.querySelectorAll('.page')];
let current=0;
const STORAGE_KEY='climateMemoryEvidence.v12';
let state={path:'',observation:'',patternAnswers:{},notes:'',finding:'',verdict:'',changed:'',guideStep:0};

const observationLabels={
  'summer-heat':'Summers seem hotter.',
  'winter-warmth':'Winters seem warmer.',
  precipitation:'Rainfall seems different.',
  drought:'Drought seems more common or severe.',
  'extreme-heat':'Extreme heat seems more common.',
  'growing-season':'The growing season or frost timing seems different.'
};

const resources={
  'summer-heat':{name:'NOAA Climate at a Glance',url:'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/'},
  'winter-warmth':{name:'NOAA Climate at a Glance',url:'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/'},
  precipitation:{name:'NOAA Climate at a Glance',url:'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/'},
  drought:{name:'Drought.gov Historical Drought Data & Conditions Tool',url:'https://www.drought.gov/data-maps-tools/historical-drought-data-conditions-tool'},
  'extreme-heat':{name:'Climate Toolbox — Historical Climate Tracker',url:'https://climatetoolbox.org/tool/Historical-Climate-Tracker'},
  'growing-season':{name:'Climate Toolbox — Historical Climate Tracker',url:'https://climatetoolbox.org/tool/Historical-Climate-Tracker'}
};

const q=(id,text,options)=>({id,q:text,options});
const commonTempRecent=q('recent','Compared with earlier years, what do you see in the more recent part of the record?',[['warmer','Generally warmer'],['cooler','Generally cooler'],['same','About the same'],['unclear','Too variable to see a clear difference']]);
const commonTempTrend=q('trend','What does the long-term trend show?',[['up','Temperatures trend upward'],['down','Temperatures trend downward'],['flat','The trend is relatively flat'],['unsure','I’m not sure']]);
const commonVariability=q('variability','How much do individual years vary from one another?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]);

const flows={
  'summer-heat':[
    {title:'Set up a summer temperature graph',instruction:`<ol><li>Open <strong>Climate at a Glance</strong> and choose <strong>City → City Time Series</strong>.</li><li>Choose your <strong>State</strong> and the available <strong>City</strong> closest to your observation.</li><li>Set <strong>Parameter → Average Temperature</strong>.</li><li>Set <strong>Time Scale → 3-Month</strong> and <strong>Month → August</strong>. This gives June–July–August.</li><li>Choose the earliest available <strong>Start Year</strong> and most recent <strong>End Year</strong>.</li></ol>`,question:null},
    {title:'Compare earlier and recent summers',instruction:`Look across the whole graph, then compare the earlier part of the record with the more recent part. Don’t base your answer on one unusually hot or cool summer.`,question:{...commonTempRecent,q:'Compared with earlier summers, recent summers are generally…'}},
    {title:'Check the long-term trend',instruction:`If <strong>Display Trend</strong> is available, turn it on. Focus on the direction of that trend rather than individual years.`,question:commonTempTrend},
    {title:'Notice year-to-year variation',instruction:`Now look back at the individual summer values. Notice how much they bounce above and below the longer-term pattern.`,question:{...commonVariability,q:'How much do individual summers vary from year to year?'},notes:true}
  ],
  'winter-warmth':[
    {title:'Set up a winter temperature graph',instruction:`<ol><li>Open <strong>Climate at a Glance</strong> and choose <strong>City → City Time Series</strong>.</li><li>Choose your <strong>State</strong> and nearest available <strong>City</strong>.</li><li>Set <strong>Parameter → Average Temperature</strong>.</li><li>Set <strong>Time Scale → 3-Month</strong> and <strong>Month → February</strong>. This gives December–January–February.</li><li>Choose the earliest available <strong>Start Year</strong> and most recent <strong>End Year</strong>.</li></ol>`,question:null},
    {title:'Compare earlier and recent winters',instruction:`Look across the whole record. Compare the earlier winters with the more recent winters rather than focusing on a single warm or cold year.`,question:{...commonTempRecent,q:'Compared with earlier winters, recent winters are generally…'}},
    {title:'Check the long-term trend',instruction:`If <strong>Display Trend</strong> is available, turn it on and focus on its overall direction.`,question:commonTempTrend},
    {title:'Notice year-to-year variation',instruction:`Look again at the individual winter values and notice how much they vary around the long-term pattern.`,question:{...commonVariability,q:'How much do individual winters vary from year to year?'},notes:true}
  ],
  precipitation:[
    {title:'Choose the season you want to check',instruction:`Think back to the rainfall observation you or your interview partner made. Choose the season that best matches that memory.`,question:q('rainSeason','Which season are you checking?',[['winter','Winter'],['spring','Spring'],['summer','Summer'],['fall','Fall']])},
    {title:'Set up the seasonal precipitation graph',instruction:()=>{const m={winter:['February','December–January–February'],spring:['May','March–April–May'],summer:['August','June–July–August'],fall:['November','September–October–November']};const [month,range]=m[state.patternAnswers.rainSeason]||['August','June–July–August'];return `<ol><li>Open <strong>Climate at a Glance</strong> and choose <strong>City → City Time Series</strong>.</li><li>Choose your <strong>State</strong> and nearest available <strong>City</strong>.</li><li>Set <strong>Parameter → Precipitation</strong>.</li><li>Set <strong>Time Scale → 3-Month</strong> and <strong>Month → ${month}</strong>. This gives <strong>${range}</strong>.</li><li>Choose the earliest available <strong>Start Year</strong> and most recent <strong>End Year</strong>.</li></ol><p class="guided-tip"><strong>Remember:</strong> This graph shows seasonal precipitation totals. It does not show whether rain was evenly distributed within the season.</p>`;},question:q('recent','Compared with earlier years, precipitation in the season you checked is generally…',[['higher','Higher'],['lower','Lower'],['same','About the same'],['unclear','Too variable to see a clear difference']])},
    {title:'Check the long-term trend',instruction:`If <strong>Display Trend</strong> is available, turn it on. Focus on whether the overall seasonal precipitation trend rises, falls, or stays fairly level.`,question:q('trend','What does the long-term trend show?',[['up','Precipitation trends upward'],['down','Precipitation trends downward'],['flat','The trend is relatively flat'],['unsure','I’m not sure']])},
    {title:'Notice year-to-year variation',instruction:`Look again at the individual years. Seasonal rainfall can vary a lot even when the long-term trend is small.`,question:q('variability','How much does precipitation vary from year to year?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]),notes:true}
  ],
  drought:[
    {title:'Open the long drought record',instruction:`<ol><li>Open the <strong>Historical Drought Data & Conditions Tool</strong>.</li><li>Choose the <strong>state or county</strong> that best matches your observation.</li><li>Find the <strong>Standardized Precipitation Index (SPI)</strong> panel.</li><li>Show as much of the available historical record as possible, rather than only recent years.</li></ol>`,question:q('history','Does the record show drought occurring throughout the historical period?',[['yes','Yes'],['no','No'],['unsure','I’m not sure']])},
    {title:'Compare how often drought appears',instruction:`Read from earlier to later years and compare how often notably dry periods appear in different parts of the record.`,question:q('frequency','Compared with earlier parts of the record, recent drought conditions appear…',[['more','More frequent'],['less','Less frequent'],['similar','About as frequent'],['unclear','No clear pattern / I’m not sure']])},
    {title:'Compare drought severity',instruction:`Now focus on how far the driest periods extend into the drought end of the scale. Compare recent severe dry periods with severe dry periods earlier in the record.`,question:q('severity','What do you notice about drought severity?',[['more','Recent droughts appear more severe'],['less','Recent droughts appear less severe'],['similar','Severity looks similar across the record'],['unclear','No clear pattern / I’m not sure']]),notes:true}
  ],
  'extreme-heat':[
    {title:'Set up an extreme-heat graph',instruction:`<ol><li>Under <strong>Choose Location</strong>, select <strong>Point Location</strong>. Enter a place name or move the map marker, then choose <strong>SET LOCATION</strong>.</li><li>Open <strong>Choose Data</strong> and set the month range to <strong>January through December</strong>.</li><li>Under <strong>Variable</strong>, choose a metric that counts very hot days, if one is available for your location. Keep the same threshold for the whole record.</li></ol><p class="guided-tip">The Historical Climate Tracker uses gridMET data for the contiguous United States beginning in 1979.</p>`,question:q('recent','Compared with earlier years, the number of very hot days is generally…',[['more','Higher'],['less','Lower'],['same','About the same'],['unclear','Too variable to see a clear difference']])},
    {title:'Check the long-term trend',instruction:`Under <strong>Change Graph</strong>, turn on <strong>Add Best-Fit Line</strong> if it is available. Use the line to judge the overall direction across the record.`,question:q('trend','What does the long-term trend show?',[['up','Very hot days are becoming more common'],['down','Very hot days are becoming less common'],['flat','The trend is relatively flat'],['unsure','I’m not sure']])},
    {title:'Notice year-to-year variation',instruction:`Look back at the yearly values. Extreme-heat counts can jump around from year to year even when a longer-term trend is present.`,question:q('variability','How much does the number of very hot days vary from year to year?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]),notes:true}
  ],
  'growing-season':[
    {title:'Check the last spring freeze',instruction:`<ol><li>Under <strong>Choose Location</strong>, select <strong>Point Location</strong>, choose your place, then select <strong>SET LOCATION</strong>.</li><li>Open <strong>Choose Data</strong>.</li><li>Set the month range to <strong>January through June</strong>.</li><li>Under <strong>Variable</strong>, choose <strong>Last Spring Freeze</strong>.</li><li>If available, turn on <strong>Add Best-Fit Line</strong>.</li></ol>`,question:q('spring','What has happened to the last spring freeze?',[['earlier','It is generally earlier'],['later','It is generally later'],['same','No clear change'],['unsure','I’m not sure']])},
    {title:'Check the first fall freeze',instruction:`Keep the same location. Change the month range to <strong>July through December</strong>, then choose <strong>First Fall Freeze</strong> under <strong>Variable</strong>. Keep <strong>Add Best-Fit Line</strong> on if available.`,question:q('fall','What has happened to the first fall freeze?',[['earlier','It is generally earlier'],['later','It is generally later'],['same','No clear change'],['unsure','I’m not sure']])},
    {title:'Put the two freeze dates together',instruction:`Now combine what you found. An earlier last spring freeze and/or a later first fall freeze can lengthen the frost-free growing season.`,question:q('season','Taken together, what might those frost dates mean for the frost-free growing season?',[['longer','It may be getting longer'],['shorter','It may be getting shorter'],['same','There is no clear change'],['unsure','I’m not sure']]),notes:true}
  ]
};

function answerLabel(question,value){const hit=question.options.find(o=>o[0]===value);return hit?hit[1]:value;}
function allQuestions(){return (flows[state.observation]||[]).filter(s=>s.question).map(s=>s.question);}
function getPatternSummary(){return allQuestions().map(x=>`${x.q} ${answerLabel(x,state.patternAnswers[x.id]||'Not answered')}`).join('\n');}
function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function loadLocal(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved)state={...state,...saved};}catch{}}
function getObservationText(){return observationLabels[state.observation]||'Your selected observation';}

function stepNeedsResource(step){
  if(!step) return false;
  if(state.observation==='precipitation' && step.question?.id==='rainSeason') return false;
  if(state.observation==='growing-season' && step.question?.id==='season') return false;
  return true;
}
function resourceActionHTML(resource){
  return `<div class="resource-action"><div class="resource-action-label"><span aria-hidden="true">🌐</span><div><strong>OPEN</strong><small>Open the climate resource in a new tab. This activity will stay open here.</small></div></div><a class="resource-button resource-button-large" href="${resource.url}" target="_blank" rel="noopener">Open ${resource.name} ↗</a></div>`;
}

function showPage(n,hash=true){
  current=Math.max(0,Math.min(pages.length-1,n));
  pages.forEach((p,i)=>p.classList.toggle('active',i===current));
  document.querySelector('#progressText').textContent=`${current+1} of ${pages.length}`;
  document.querySelector('#progressBar').style.width=`${((current+1)/pages.length)*100}%`;
  if(hash)history.replaceState(null,'',`#${pages[current].id}`);
  window.scrollTo({top:0,behavior:'smooth'});
  const id=pages[current]?.id;
  if(id==='sources')renderGuidedStep();
  if(id==='comparison')updateComparisonReminder();
  if(id==='review')updateReview();
  if(id==='journal')updateJournalHandoff();
}
function showPageById(id){const idx=pages.findIndex(p=>p.id===id);if(idx>=0)showPage(idx);}
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>showPageById(b.dataset.target)));
document.querySelectorAll('.back').forEach(b=>b.addEventListener('click',()=>showPage(current-1)));

document.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');state.path=btn.dataset.path;saveLocal();document.querySelector('#pathNext').disabled=false;
}));
document.querySelector('#pathNext').addEventListener('click',()=>{configureQuestionPage();showPageById('questions');});
function configureQuestionPage(){
  const title=document.querySelector('#questionTitle'),intro=document.querySelector('#questionIntro'),interviewBox=document.querySelector('#interviewReturn'),selfContinue=document.querySelector('#selfContinue');
  if(state.path==='interview'){
    title.textContent='Questions to ask your interview partner';intro.innerHTML='<strong>Find someone who has lived in the area for many years.</strong><p>Use these questions as conversation starters. You do not need to ask them word-for-word or record every answer.</p>';interviewBox.classList.remove('hidden');selfContinue.classList.add('hidden');
  }else{
    title.textContent='Questions for your own reflection';intro.innerHTML='<strong>Think back over the years you have lived here.</strong><p>Use these questions to identify one change you feel confident you have noticed.</p>';interviewBox.classList.add('hidden');selfContinue.classList.remove('hidden');
  }
}
document.querySelector('#selfContinue').addEventListener('click',()=>showPageById('observation'));
document.querySelector('#imBack').addEventListener('click',()=>showPageById('observation'));
document.querySelector('#copyReturn').addEventListener('click',async()=>{const url=location.href.split('#')[0]+'#questions';try{await navigator.clipboard.writeText(url);document.querySelector('#copyStatus').textContent='Return link copied.';}catch{document.querySelector('#copyStatus').textContent='Copy this page address from your browser to return later.';}});

const observationSelect=document.querySelector('#observationSelect');
function validateObservation(){document.querySelector('#observationNext').disabled=!state.observation;}
observationSelect.addEventListener('change',()=>{state.observation=observationSelect.value;state.patternAnswers={};state.notes='';state.guideStep=0;saveLocal();validateObservation();});
document.querySelector('#observationNext').addEventListener('click',()=>{state.guideStep=0;saveLocal();showPageById('sources');});

function renderGuidedStep(){
  const resource=resources[state.observation],steps=flows[state.observation]||[];
  if(!resource||!steps.length){showPageById('observation');return;}
  state.guideStep=Math.max(0,Math.min(state.guideStep||0,steps.length-1));
  const step=steps[state.guideStep];
  document.querySelector('#resourceName').textContent=resource.name;
  document.querySelector('#guideStepLabel').textContent=`Step ${state.guideStep+1} of ${steps.length}`;
  const instruction=typeof step.instruction==='function'?step.instruction():step.instruction;
  let html=`<h3>${step.title}</h3>`;
  if(stepNeedsResource(step)) html+=resourceActionHTML(resource);
  html+=`<div class="guided-section-label"><span aria-hidden="true">⚙️</span><strong>SET</strong></div><div class="guided-instruction">${instruction}</div>`;
  if(step.question){
    html+=`<div class="guided-question"><div class="guided-section-label answer-label"><span aria-hidden="true">✏️</span><strong>ANSWER</strong></div><fieldset><legend>${step.question.q}</legend><div class="guided-options">${step.question.options.map(o=>`<label><input type="radio" name="guided_${step.question.id}" value="${o[0]}" ${state.patternAnswers[step.question.id]===o[0]?'checked':''}> <span>${o[1]}</span></label>`).join('')}</div></fieldset></div>`;
  }
  document.querySelector('#guidedStep').innerHTML=html;
  document.querySelectorAll('#guidedStep input[type="radio"]').forEach(r=>r.addEventListener('change',e=>{const id=e.target.name.replace('guided_','');state.patternAnswers[id]=e.target.value;state.finding=getPatternSummary();saveLocal();renderGuidedNav();}));
  const notes=document.querySelector('#guidedNotes');notes.classList.toggle('hidden',!step.notes);document.querySelector('#patternNotes').value=state.notes||'';
  renderGuidedNav();
}
function renderGuidedNav(){
  const steps=flows[state.observation]||[],step=steps[state.guideStep],next=document.querySelector('#guidedNext');
  next.disabled=!!(step?.question&&!state.patternAnswers[step.question.id]);
  next.textContent=state.guideStep===steps.length-1?'See my summary →':'Next →';
}
document.querySelector('#patternNotes').addEventListener('input',e=>{state.notes=e.target.value;saveLocal();});
document.querySelector('#guidedNext').addEventListener('click',()=>{const steps=flows[state.observation]||[];if(state.guideStep<steps.length-1){state.guideStep++;saveLocal();renderGuidedStep();window.scrollTo({top:0,behavior:'smooth'});}else{state.finding=getPatternSummary();saveLocal();showPageById('review');}});
document.querySelector('#guidedBack').addEventListener('click',()=>{if(state.guideStep>0){state.guideStep--;saveLocal();renderGuidedStep();window.scrollTo({top:0,behavior:'smooth'});}else showPageById('observation');});

document.querySelectorAll('.verdict').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.verdict').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');state.verdict=btn.dataset.verdict;saveLocal();
  const f=document.querySelector('#compareFeedback');f.classList.remove('hidden');
  const messages={supports:'The long-term record generally lines up with the observation.',mixed:'A partial match is useful: the memory may capture one part of a more complicated pattern.',unclear:'A mismatch is useful too. The long-term record may tell a different story than the memory.','more-info':'Sometimes the best conclusion is that the resource did not answer the question well enough. That is a valid finding.'};
  f.textContent=messages[state.verdict];validateComparison();
}));
document.querySelectorAll('input[name="changed"]').forEach(r=>r.addEventListener('change',e=>{state.changed=e.target.value;saveLocal();validateComparison();}));
function validateComparison(){document.querySelector('#compareNext').disabled=!(state.verdict&&state.changed);}
document.querySelector('#compareNext').addEventListener('click',()=>showPageById('journal'));
function updateComparisonReminder(){
  document.querySelector('#observationReminder').innerHTML=`<strong>Observation you checked:</strong> ${getObservationText()}`;
  const container=document.querySelector('#comparisonEvidence');
  const rows=allQuestions().map(x=>`<div class="evidence-answer"><span class="evidence-q">${x.q}</span><strong>${answerLabel(x,state.patternAnswers[x.id]||'Not answered')}</strong></div>`).join('');
  container.innerHTML=rows;
  const notesWrap=document.querySelector('#comparisonNotesWrap');
  const notes=document.querySelector('#comparisonNotes');
  if(state.notes){notes.textContent=state.notes;notesWrap.classList.remove('hidden');}else{notes.textContent='';notesWrap.classList.add('hidden');}
}
function updateReview(){
  const resource=resources[state.observation];
  document.querySelector('#reviewObservation').textContent=getObservationText();
  document.querySelector('#reviewResource').textContent=resource?.name||'';
  document.querySelector('#reviewFinding').textContent=getPatternSummary();
  document.querySelector('#reviewNotes').textContent=state.notes||'No notes added.';
}
function encodeHandoff(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');}
function updateJournalHandoff(){
  const structured=allQuestions().map(x=>({question:x.q,answer:answerLabel(x,state.patternAnswers[x.id]||'Not answered')}));
  const finding=getPatternSummary()+(state.notes?`\n\nNotes: ${state.notes}`:'');
  const payload={version:3,source:'climate-memory-evidence',observation:getObservationText(),finding,patternAnswers:structured,notes:state.notes||'',verdict:state.verdict||'',changed:state.changed||''};
  document.querySelector('#journalHandoff').href=`https://beritdinsdale-oss.github.io/garden-observation-journal/#handoff=${encodeHandoff(payload)}`;
}

document.querySelector('#restart').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);state={path:'',observation:'',patternAnswers:{},notes:'',finding:'',verdict:'',changed:'',guideStep:0};document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));observationSelect.value='';document.querySelector('#patternNotes').value='';document.querySelectorAll('input[name="changed"]').forEach(x=>x.checked=false);document.querySelector('#pathNext').disabled=true;document.querySelector('#observationNext').disabled=true;document.querySelector('#compareNext').disabled=true;showPage(0);});
function restoreUI(){
  if(state.path){document.querySelector(`.choice[data-path="${state.path}"]`)?.classList.add('selected');document.querySelector('#pathNext').disabled=false;}
  if(!resources[state.observation])state.observation='';observationSelect.value=state.observation||'';
  if(state.verdict)document.querySelector(`.verdict[data-verdict="${state.verdict}"]`)?.classList.add('selected');
  if(state.changed)document.querySelector(`input[name="changed"][value="${state.changed}"]`)?.setAttribute('checked','checked');
  validateObservation();validateComparison();
}
function openHash(){const id=location.hash.slice(1),idx=pages.findIndex(p=>p.id===id);if(idx>=0){if(id==='questions')configureQuestionPage();showPage(idx,false);}else showPage(0,false);}
loadLocal();restoreUI();openHash();
