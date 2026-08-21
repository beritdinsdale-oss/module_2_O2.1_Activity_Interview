const pages=[...document.querySelectorAll('.page')];
let current=0;
const STORAGE_KEY='climateMemoryEvidence.v12';
let state={path:'',observation:'',patternAnswers:{},notes:'',reflectionNotes:'',finding:'',verdict:'',changed:'',changedComment:'',guideStep:0};

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
  drought:{name:'Drought.gov',url:'https://www.drought.gov/'},
  'extreme-heat':{name:'Climate Toolbox — Historical Climate Tracker',url:'https://climatetoolbox.org/tool/Historical-Climate-Tracker'},
  'growing-season':{name:'Climate Toolbox — Historical Climate Tracker',url:'https://climatetoolbox.org/tool/Historical-Climate-Tracker'}
};

const q=(id,text,options)=>({id,q:text,options});
const commonTempRecent=q('recent','Compared with earlier years, what do you see in the more recent part of the record?',[['warmer','Generally warmer'],['cooler','Generally cooler'],['same','About the same'],['unclear','Too variable to see a clear difference']]);
const commonTempTrend=q('trend','What does the long-term trend show?',[['up','Temperatures trend upward'],['down','Temperatures trend downward'],['flat','The trend is relatively flat'],['unsure','I’m not sure']]);
const commonVariability=q('variability','How much do individual years vary from one another?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]);

const flows={
  'summer-heat':[
    {title:'Make your summer temperature graph',action:'CHOOSE WHAT TO SHOW',instruction:`<ol><li>Open <strong>Climate at a Glance</strong> and choose <strong>City → City Time Series</strong>.</li><li>Choose your <strong>State</strong> and the available <strong>City</strong> closest to your observation.</li><li><strong>Parameter → Average Temperature</strong>.</li><li><strong>Time Scale → 3-Month</strong> and <strong>Month → August</strong>. This represents June–July–August.</li><li>Choose the earliest available <strong>Start Year</strong> and most recent <strong>End Year</strong>.</li><li>Turn <strong>Display Trend → ON</strong>. The trend line helps you see the long-term direction despite year-to-year variation.</li></ol><div class="accessibility-note"><strong>Accessibility option:</strong> If the graph is difficult to interpret visually, Climate at a Glance provides downloadable data (including CSV) so you can review the values without relying on the graph alone.</div>`,question:q('recent','Compared with earlier summers, recent summers are generally…',[['warmer','Warmer'],['cooler','Cooler'],['same','About the same'],['unclear','Too variable to see a clear difference']])},
    {title:'Read the long-term trend',action:'READ THE GRAPH',instruction:`Use the displayed trend line to focus on the overall direction across the record, not one unusually hot or cool summer.`,question:q('trend','What does the long-term trend show?',[['up','Summer temperatures trend upward'],['down','Summer temperatures trend downward'],['flat','The trend is relatively flat'],['unsure','I’m not sure']]),feedback:'temperature'},
    {title:'Notice the variation',action:'LOOK CLOSER',instruction:`Now compare the individual summer values with the trend line. Climate trends and year-to-year variation can exist at the same time.`,question:q('variability','How much do individual summers vary from year to year?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]),notes:true}
  ],
  'winter-warmth':[
    {title:'Make your winter temperature graph',action:'CHOOSE WHAT TO SHOW',instruction:`<ol><li>Open <strong>Climate at a Glance</strong> and choose <strong>City → City Time Series</strong>.</li><li>Choose your <strong>State</strong> and nearest available <strong>City</strong>.</li><li><strong>Parameter → Average Temperature</strong>.</li><li><strong>Time Scale → 3-Month</strong> and <strong>Month → February</strong>. This represents December–January–February.</li><li>Choose the earliest available <strong>Start Year</strong> and most recent <strong>End Year</strong>.</li><li>Turn <strong>Display Trend → ON</strong>. The trend line makes the long-term direction easier to see.</li></ol><div class="accessibility-note"><strong>Accessibility option:</strong> Climate at a Glance also provides downloadable data (including CSV) if you prefer to review values rather than interpret the graph visually.</div>`,question:q('recent','Compared with earlier winters, recent winters are generally…',[['warmer','Warmer'],['cooler','Cooler'],['same','About the same'],['unclear','Too variable to see a clear difference']])},
    {title:'Read the long-term trend',action:'READ THE GRAPH',instruction:`Follow the displayed trend line across the full record. Individual winters can still be unusually warm or cold even when the long-term average is changing.`,question:q('trend','What does the long-term trend show?',[['up','Winter temperatures trend upward'],['down','Winter temperatures trend downward'],['flat','The trend is relatively flat'],['unsure','I’m not sure']]),feedback:'temperature'},
    {title:'Notice the variation',action:'LOOK CLOSER',instruction:`Look at the individual winter values around the trend line.`,question:q('variability','How much do individual winters vary from year to year?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]),notes:true}
  ],
  precipitation:[
    {title:'Choose the season you want to check',action:'START WITH YOUR OBSERVATION',instruction:`Think back to the rainfall observation you or your interview partner made. Choose the season that best matches that memory.`,question:q('rainSeason','Which season are you checking?',[['winter','Winter'],['spring','Spring'],['summer','Summer'],['fall','Fall']])},
    {title:'Make your seasonal precipitation graph',action:'CHOOSE WHAT TO SHOW',instruction:()=>{const m={winter:['February','December–January–February'],spring:['May','March–April–May'],summer:['August','June–July–August'],fall:['November','September–October–November']};const [month,range]=m[state.patternAnswers.rainSeason]||['August','June–July–August'];return `<ol><li>Open <strong>Climate at a Glance</strong> and choose <strong>City → City Time Series</strong>.</li><li>Choose your <strong>State</strong> and nearest available <strong>City</strong>.</li><li><strong>Parameter → Precipitation</strong>.</li><li><strong>Time Scale → 3-Month</strong> and <strong>Month → ${month}</strong>. This represents <strong>${range}</strong>.</li><li>Choose the earliest available <strong>Start Year</strong> and most recent <strong>End Year</strong>.</li><li>Turn <strong>Display Trend → ON</strong>.</li></ol><p class="guided-tip"><strong>Keep in mind:</strong> This graph shows seasonal precipitation totals. It does not show when rain fell within the season or whether it came in a few heavy events.</p><div class="accessibility-note"><strong>Accessibility option:</strong> Climate at a Glance provides downloadable data (including CSV) if you prefer to review the values rather than rely on the graph.</div>`;},question:q('recent','Compared with earlier years, precipitation in the season you checked is generally…',[['higher','Higher'],['lower','Lower'],['same','About the same'],['unclear','Too variable to see a clear difference']])},
    {title:'Read the long-term trend',action:'READ THE GRAPH',instruction:`Use the trend line to judge the overall direction, then compare it with the individual years. A small or flat trend does not mean a gardener’s observation is wrong; timing and intensity of rainfall may not be captured by seasonal totals.`,question:q('trend','What does the long-term trend show?',[['up','Precipitation trends upward'],['down','Precipitation trends downward'],['flat','The trend is relatively flat'],['unsure','I’m not sure']]),feedback:'precipitation'},
    {title:'Notice the variation',action:'LOOK CLOSER',instruction:`Seasonal precipitation can vary substantially from one year to the next even when the long-term trend is small.`,question:q('variability','How much does precipitation vary from year to year?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]),notes:true}
  ],
  drought:[
    {title:'Find the historical drought record for your location',action:'FIND YOUR LOCATION',instruction:`<ol><li>Open <strong>Drought.gov</strong>.</li><li>At the top of the page, choose <strong>By Location</strong>.</li><li>Enter your <strong>ZIP code, city, or county</strong>.</li><li>On your location page, go to <strong>Historical Conditions</strong>.</li><li>Find the <strong>1895–Present</strong> graph. This is the 9-month Standardized Precipitation Index (SPI).</li></ol><div class="graph-key"><strong>How to read it:</strong><span>Red = drier than normal</span><span>Blue = wetter than normal</span><span>Darker/more intense shading = more unusual conditions</span><small>Each point summarizes precipitation over the previous nine months. This is a precipitation-based measure, so it does not capture every part of drought.</small></div><div class="accessibility-note"><strong>Accessibility option:</strong> If the colors are difficult to distinguish, use the graph’s <strong>Legend</strong> for labeled categories. Drought.gov also makes the historical data available for download, so you do not have to rely on color alone.</div>`,question:q('history','Do you see unusually dry conditions in both earlier and more recent parts of the record?',[['both','Yes, in both earlier and recent years'],['earlier','Mostly in earlier years'],['recent','Mostly in recent years'],['unsure','I’m not sure']]),feedback:'drought-history'},
    {title:'Compare the strongest dry periods',action:'LOOK CLOSER',instruction:`Look for the darkest or most persistent dry areas. Compare the earlier and later parts of the record rather than trying to interpret every line.`,question:q('severity','Where do you see the strongest or most persistent dry conditions?',[['earlier','Mostly earlier in the record'],['recent','Mostly later in the record'],['both','In both earlier and later periods'],['unclear','I don’t see a clear difference'],['unsure','I’m not sure']]),feedback:'drought-severity'},
    {title:'Describe the overall pattern',action:'PUT THE CLUES TOGETHER',instruction:`Use your first two answers together. This graph may show recurring dry periods, a recent concentration of dry conditions, or a pattern that is simply too variable to summarize confidently.`,question:q('pattern','Which statement best fits the historical record you viewed?',[['throughout','Dry periods occur throughout the record'],['recent','Recent decades appear to have more or stronger dry periods'],['earlier','Earlier decades appear to have more or stronger dry periods'],['unclear','I don’t see a clear long-term difference'],['unsure','I’m not sure']]),feedback:'drought-pattern',notes:true}
  ],
  'extreme-heat':[
    {title:'Choose a measure of hot days',action:'CHOOSE WHAT TO SHOW',instruction:`<ol><li>Under <strong>Choose Location</strong>, select <strong>Point Location</strong>. Enter a place name or move the map marker, then choose <strong>SET LOCATION</strong>.</li><li>Click <strong>Choose Data</strong> to open the data controls.</li><li>Use the month range <strong>January through December</strong>.</li><li>Under <strong>Variable</strong>, choose a hot-day measure.</li></ol><div class="metric-options"><strong>Recommended:</strong><p><strong>Days with maximum temperature &gt; 86°F</strong> — counts days that cross a fixed air-temperature threshold. This is the clearest option for asking whether hot days are becoming more common.</p><p>If available, <strong>Heat Index &gt; 90°F, 95°F, 100°F, or 105°F</strong> measures heat plus humidity and is more useful for human heat exposure. Higher thresholds represent increasingly intense conditions but may occur rarely in cooler locations.</p></div><div class="accessibility-note"><strong>Accessibility option:</strong> Historical Climate Tracker can provide the underlying data as well as the plot. Use the data/download option if a graph is difficult to interpret visually.</div>`,question:q('recent','Compared with earlier years, the number of hot days is generally…',[['more','Higher'],['less','Lower'],['same','About the same'],['unclear','Too variable to see a clear difference']])},
    {title:'Read the long-term trend',action:'READ THE GRAPH',instruction:`Under <strong>Change Graph</strong>, turn on <strong>Add Best-Fit Line</strong>. Use the line to judge the overall direction across the record rather than comparing only two individual years.`,question:q('trend','What does the long-term trend show?',[['up','Hot days are becoming more common'],['down','Hot days are becoming less common'],['flat','The trend is relatively flat'],['unsure','I’m not sure']]),feedback:'heat'},
    {title:'Notice the variation',action:'LOOK CLOSER',instruction:`The number of hot days can jump around from year to year even when a longer-term trend is present.`,question:q('variability','How much does the number of hot days vary from year to year?',[['lots','Quite a bit'],['little','Not very much'],['unsure','I’m not sure']]),notes:true}
  ],
  'growing-season':[
    {title:'Check the last spring freeze',action:'NEW DATA CHECK',instruction:`<ol><li>Under <strong>Choose Location</strong>, select <strong>Point Location</strong>, choose your place, then select <strong>SET LOCATION</strong>.</li><li><strong>Click “Choose Data.”</strong> This opens the dropdown with the data controls.</li><li>Use the month range <strong>January through June</strong>.</li><li>Under <strong>Variable</strong>, choose <strong>Last Spring Freeze</strong>.</li><li>Under <strong>Change Graph</strong>, turn on <strong>Add Best-Fit Line</strong>.</li></ol><div class="trend-help"><strong>Read the number at the bottom of the graph.</strong><p>A <strong>negative (−)</strong> number means the last spring freeze is trending <strong>earlier</strong>. A <strong>positive (+)</strong> number means it is trending <strong>later</strong>. For example, −4.2 days means the best-fit line shows a shift of about 4.2 days earlier <em>across the period shown</em>—not 4.2 days earlier every year.</p></div><div class="accessibility-note"><strong>Accessibility option:</strong> Historical Climate Tracker can provide the underlying data as well as the graph. Use the data/download option if you prefer to review values directly.</div>`,question:q('spring','What does the Last Spring Freeze trend show?',[['earlier','It is trending earlier'],['later','It is trending later'],['same','There is little or no overall change'],['unsure','I’m not sure']]),extraInput:{id:'springDays',label:'What change does the graph report?',suffix:'days',placeholder:'e.g., -4.2'}},
    {title:'Now check the first fall freeze',action:'NEW DATA CHECK',instruction:`<div class="new-check-callout"><strong>Keep the Climate Toolbox open.</strong> You do not need to open it again, but you <strong>do need to change the graph settings.</strong></div><ol><li><strong>Click “Choose Data.”</strong></li><li>Change the month range to <strong>July through December</strong>.</li><li>Under <strong>Variable</strong>, choose <strong>First Fall Freeze</strong>.</li><li>Keep <strong>Add Best-Fit Line</strong> on.</li></ol><div class="trend-help"><strong>Read the trend again.</strong><p>For First Fall Freeze, a <strong>positive (+)</strong> number means the freeze is trending <strong>later</strong>; a <strong>negative (−)</strong> number means it is trending <strong>earlier</strong>.</p></div>`,question:q('fall','What does the First Fall Freeze trend show?',[['later','It is trending later'],['earlier','It is trending earlier'],['same','There is little or no overall change'],['unsure','I’m not sure']]),extraInput:{id:'fallDays',label:'What change does the graph report?',suffix:'days',placeholder:'e.g., +2.1'}},
    {title:'What do your two freeze dates suggest?',action:'PUT THE TWO CLUES TOGETHER',instruction:()=>`<p>You’ve now looked at both ends of the frost-free season. Use your results together.</p><div class="freeze-results"><div><span>Last spring freeze</span><strong>${answerLabel(findQuestion('spring'),state.patternAnswers.spring||'Not answered')}${state.patternAnswers.springDays?` · ${state.patternAnswers.springDays} days`:''}</strong></div><div><span>First fall freeze</span><strong>${answerLabel(findQuestion('fall'),state.patternAnswers.fall||'Not answered')}${state.patternAnswers.fallDays?` · ${state.patternAnswers.fallDays} days`:''}</strong></div></div><p>An earlier last spring freeze and/or a later first fall freeze can lengthen the frost-free growing season. The two ends do not have to change in the same way.</p>`,question:q('season','Taken together, what might those frost dates mean for the frost-free growing season?',[['longer','It may be getting longer'],['shorter','It may be getting shorter'],['mixed','The two dates show different or mixed patterns'],['same','There is little or no clear overall change'],['unsure','I’m not sure']]),feedback:'freeze',notes:true}
  ]
};

function answerLabel(question,value){if(!question)return value;const hit=question.options.find(o=>o[0]===value);return hit?hit[1]:value;}
function allQuestions(){return (flows[state.observation]||[]).filter(s=>s.question).map(s=>s.question);}
function findQuestion(id){return allQuestions().find(q=>q.id===id);}
function getPatternSummary(){return allQuestions().map(x=>`${x.q}\n${answerLabel(x,state.patternAnswers[x.id]||'Not answered')}`).join('\n\n');}
function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function loadLocal(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved)state={...state,...saved};}catch{}}
function getObservationText(){return observationLabels[state.observation]||'Your selected observation';}

function stepNeedsResource(step){
  if(!step) return false;
  if(state.observation==='precipitation' && step.question?.id==='rainSeason') return false;
  if(state.observation==='growing-season' && (step.question?.id==='fall'||step.question?.id==='season')) return false;
  return true;
}
function resourceActionHTML(resource){
  return `<div class="resource-action"><div class="resource-action-label"><span aria-hidden="true">🌐</span><div><strong>OPEN THE RESOURCE</strong><small>Opens in a new tab. This activity will stay open here.</small></div></div><a class="resource-button resource-button-large" href="${resource.url}" target="_blank" rel="noopener">Open ${resource.name} ↗</a></div>`;
}
function feedbackFor(type,value){
  const f={
    temperature:{
      up:'The trend and individual years can tell different parts of the story. A warming trend does not mean every year is warmer than the one before it.',
      down:'A downward trend is useful evidence even if it differs from the original observation. Look at the full period and your location before drawing a broader conclusion.',
      flat:'A relatively flat trend does not make the observation “wrong.” A memory may reflect a shorter period, a particular place, or conditions not captured by this graph.',
      unsure:'Not being sure is a reasonable finding. Climate graphs contain variability; use the trend line as one clue rather than forcing a conclusion.'
    },
    precipitation:{
      up:'An upward seasonal total is one piece of evidence. It does not tell you whether rain is arriving at different times or in heavier events.',
      down:'A downward trend may support a drier-season observation, but seasonal totals still do not describe how rainfall is distributed within the season.',
      flat:'A flat seasonal total does not necessarily conflict with a “rainfall feels different” observation. Timing, intensity, and dry spells can change without a large change in the total.',
      unsure:'Rainfall is highly variable. It is reasonable to conclude that this graph alone does not show a clear pattern.'
    },
    'drought-history':{
      both:'That is an important clue: dry periods are not new to this location. The next step is to compare where the strongest or most persistent dry periods occur.',
      earlier:'Your graph may differ from another location or time period. Use the next question to compare severity rather than assuming one pattern applies everywhere.',
      recent:'That may support the original observation, but check the earlier record too; recent events can be especially memorable.',
      unsure:'This is a complicated graph. Rather than forcing an answer, use the next question to compare one feature at a time.'
    },
    'drought-severity':{
      earlier:'This suggests the historical record includes severe dryness well before recent decades. That context matters when comparing memory with climate data.',
      recent:'This may support a perception of worsening drought, but remember that this SPI graph measures precipitation-based dryness, not every aspect of drought.',
      both:'Severe dry periods in both parts of the record suggest a recurring climate feature. Frequency, duration, and other drought indicators may still have changed.',
      unclear:'No clear difference is a valid result. The graph does not always reduce to a simple trend.',
      unsure:'It is reasonable to be uncertain. The visualization contains a lot of information and one graph rarely tells the whole drought story.'
    },
    'drought-pattern':{
      throughout:'This suggests drought is a recurring part of the climate record. That does not rule out changes in frequency, duration, or impacts.',
      recent:'This pattern may support the original observation, but it is still one precipitation-based drought measure.',
      earlier:'This is useful evidence even if it conflicts with memory. Recent droughts may be more memorable or may differ in impacts not shown here.',
      unclear:'A complicated or variable record is itself a finding. Climate evidence does not always produce a simple yes/no answer.',
      unsure:'“I’m not sure” is appropriate when the evidence is ambiguous. Another indicator or dataset could add context.'
    },
    heat:{
      up:'A rising count supports the idea that hot days are becoming more common, even though individual years may still vary.',
      down:'A downward trend may differ from the original observation. The chosen threshold, location, and time period all affect what this graph can show.',
      flat:'A flat trend at one threshold does not mean heat has not changed in other ways. Different thresholds or nighttime heat could tell a different story.',
      unsure:'Year-to-year variability can make the pattern hard to see. The best-fit line is one aid, not a guarantee of a simple conclusion.'
    },
    freeze:{
      longer:'Earlier spring freezes and/or later fall freezes can lengthen the frost-free season. The two ends may contribute differently.',
      shorter:'A shorter frost-free season can result from later spring freezes, earlier fall freezes, or both.',
      mixed:'Mixed results are meaningful. Spring and fall freeze timing do not have to move together.',
      same:'Little overall change is a valid result for your location and selected period.',
      unsure:'The two freeze metrics can be difficult to combine. Keeping the result uncertain is better than forcing a conclusion.'
    }
  };
  return f[type]?.[value]||'';
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
    title.textContent='Questions to ask your interview partner';intro.innerHTML='<strong>Find someone who has lived in the area for many years.</strong><p>Use these questions as conversation starters. You do not need to ask them word-for-word or record every answer.</p>';interviewBox.classList.remove('hidden');selfContinue.classList.add('hidden');document.querySelector('#interviewPrintActions').classList.remove('hidden');document.querySelector('#reflectionNotesHeading').textContent='Take notes during your conversation';document.querySelector('#reflectionNotes').placeholder='Type your interview notes here…';
  }else{
    title.textContent='Questions for your own reflection';intro.innerHTML='<strong>Think back over the years you have lived here.</strong><p>Use these questions to identify one change you feel confident you have noticed.</p>';interviewBox.classList.add('hidden');selfContinue.classList.remove('hidden');document.querySelector('#interviewPrintActions').classList.add('hidden');document.querySelector('#reflectionNotesHeading').textContent='Take notes as you reflect';document.querySelector('#reflectionNotes').placeholder='Type your reflection notes here…';
  }
}
document.querySelector('#selfContinue').addEventListener('click',()=>showPageById('observation'));
document.querySelector('#imBack').addEventListener('click',()=>showPageById('observation'));
document.querySelector('#copyReturn').addEventListener('click',async()=>{const url=location.href.split('#')[0]+'#questions';try{await navigator.clipboard.writeText(url);document.querySelector('#copyStatus').textContent='Return link copied.';}catch{document.querySelector('#copyStatus').textContent='Copy this page address from your browser to return later.';}});
document.querySelector('#printInterview')?.addEventListener('click',()=>{document.body.classList.add('printing-interview');window.print();document.body.classList.remove('printing-interview');});
document.querySelector('#reflectionNotes').addEventListener('input',e=>{state.reflectionNotes=e.target.value;saveLocal();});

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
  html+=`<div class="guided-section-label"><span aria-hidden="true">${step.action==='READ THE GRAPH'?'📈':step.action==='PUT THE TWO CLUES TOGETHER'?'🧩':step.action==='NEW DATA CHECK'?'🔎':'🧭'}</span><strong>${step.action||'FOLLOW THE STEPS'}</strong></div><div class="guided-instruction">${instruction}</div>`;
  if(step.question){
    html+=`<div class="guided-question"><div class="guided-section-label answer-label"><span aria-hidden="true">✏️</span><strong>RECORD WHAT YOU FOUND</strong></div><fieldset><legend>${step.question.q}</legend><div class="guided-options">${step.question.options.map(o=>`<label><input type="radio" name="guided_${step.question.id}" value="${o[0]}" ${state.patternAnswers[step.question.id]===o[0]?'checked':''}> <span>${o[1]}</span></label>`).join('')}</div></fieldset>`;
    if(step.extraInput) html+=`<label class="trend-number" for="${step.extraInput.id}"><strong>${step.extraInput.label}</strong><span><input id="${step.extraInput.id}" type="number" step="0.1" inputmode="decimal" placeholder="${step.extraInput.placeholder}" value="${state.patternAnswers[step.extraInput.id]||''}"> ${step.extraInput.suffix}</span></label>`;
    html+=`<div id="stepFeedback" class="interpretive-feedback hidden" aria-live="polite"></div></div>`;
  }
  document.querySelector('#guidedStep').innerHTML=html;
  document.querySelectorAll('#guidedStep input[type="radio"]').forEach(r=>r.addEventListener('change',e=>{const id=e.target.name.replace('guided_','');state.patternAnswers[id]=e.target.value;state.finding=getPatternSummary();saveLocal();showStepFeedback(step,e.target.value);renderGuidedNav();}));
  if(step.extraInput){
    const input=document.querySelector(`#${step.extraInput.id}`);
    input?.addEventListener('input',e=>{state.patternAnswers[step.extraInput.id]=e.target.value;saveLocal();renderGuidedNav();});
  }
  const notes=document.querySelector('#guidedNotes');notes.classList.toggle('hidden',!step.notes);document.querySelector('#patternNotes').value=state.notes||'';
  if(step.feedback && step.question && state.patternAnswers[step.question.id]) showStepFeedback(step,state.patternAnswers[step.question.id]);
  renderGuidedNav();
}
function showStepFeedback(step,value){
  const box=document.querySelector('#stepFeedback');if(!box||!step.feedback)return;
  const msg=feedbackFor(step.feedback,value);if(msg){box.textContent=msg;box.classList.remove('hidden');}else box.classList.add('hidden');
}
function renderGuidedNav(){
  const steps=flows[state.observation]||[],step=steps[state.guideStep],next=document.querySelector('#guidedNext');
  const missingQuestion=!!(step?.question&&!state.patternAnswers[step.question.id]);
  next.disabled=missingQuestion;
  next.textContent=state.guideStep===steps.length-1?'See my summary →':'Next →';
}
document.querySelector('#patternNotes').addEventListener('input',e=>{state.notes=e.target.value;saveLocal();});
document.querySelector('#guidedNext').addEventListener('click',()=>{const steps=flows[state.observation]||[];if(state.guideStep<steps.length-1){state.guideStep++;saveLocal();renderGuidedStep();window.scrollTo({top:0,behavior:'smooth'});}else{state.finding=getPatternSummary();saveLocal();showPageById('review');}});
document.querySelector('#guidedBack').addEventListener('click',()=>{if(state.guideStep>0){state.guideStep--;saveLocal();renderGuidedStep();window.scrollTo({top:0,behavior:'smooth'});}else showPageById('observation');});

document.querySelectorAll('.verdict').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.verdict').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');state.verdict=btn.dataset.verdict;saveLocal();
  const f=document.querySelector('#compareFeedback');f.classList.remove('hidden');
  const messages={
    supports:'Your observation and the climate record point in a similar direction. That does not mean every year follows the pattern, but the long-term evidence adds support to what was noticed or remembered.',
    mixed:'Climate evidence is often like this. Part of the observation may match the long-term record while another part is influenced by year-to-year variability, season, location, or something this graph does not measure.',
    unclear:'A mismatch does not necessarily mean the observation was “wrong.” Personal experience may reflect a particular place, season, extreme event, or garden condition that is not captured by this dataset.',
    'more-info':'That is a valid conclusion. One graph rarely tells the whole story. Another variable, time period, nearby location, or dataset might provide useful additional evidence.'
  };
  f.textContent=messages[state.verdict];validateComparison();
}));
document.querySelectorAll('input[name="changed"]').forEach(r=>r.addEventListener('change',e=>{state.changed=e.target.value;saveLocal();validateComparison();}));
document.querySelector('#changedComment').addEventListener('input',e=>{state.changedComment=e.target.value;saveLocal();});
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
  document.querySelector('#reviewFinding').innerHTML=allQuestions().map(x=>`<div class="summary-qa"><span class="summary-question">${x.q}</span><strong class="summary-answer">${answerLabel(x,state.patternAnswers[x.id]||'Not answered')}</strong>${x.id==='spring'&&state.patternAnswers.springDays?`<small>${state.patternAnswers.springDays} days reported by the best-fit line</small>`:''}${x.id==='fall'&&state.patternAnswers.fallDays?`<small>${state.patternAnswers.fallDays} days reported by the best-fit line</small>`:''}</div>`).join('');
  const combinedNotes=[state.reflectionNotes?`${state.path==='interview'?'Interview notes':'Reflection notes'}: ${state.reflectionNotes}`:'',state.notes?`Climate-data notes: ${state.notes}`:''].filter(Boolean).join('\n\n');
  document.querySelector('#reviewNotes').textContent=combinedNotes||'No notes added.';
}
function encodeHandoff(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');}
function updateJournalHandoff(){
  const structured=allQuestions().map(x=>({question:x.q,answer:answerLabel(x,state.patternAnswers[x.id]||'Not answered'),detail:x.id==='spring'&&state.patternAnswers.springDays?`${state.patternAnswers.springDays} days`:x.id==='fall'&&state.patternAnswers.fallDays?`${state.patternAnswers.fallDays} days`:''}));
  const finding=getPatternSummary()+(state.notes?`\n\nClimate-data notes: ${state.notes}`:'');
  const payload={version:4,source:'climate-memory-evidence',path:state.path||'',reflectionNotes:state.reflectionNotes||'',observation:getObservationText(),finding,patternAnswers:structured,notes:state.notes||'',verdict:state.verdict||'',changed:state.changed||'',changedComment:state.changedComment||''};
  document.querySelector('#journalHandoff').href=`https://beritdinsdale-oss.github.io/garden-observation-journal/#handoff=${encodeHandoff(payload)}`;
}

document.querySelector('#restart').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);state={path:'',observation:'',patternAnswers:{},notes:'',reflectionNotes:'',finding:'',verdict:'',changed:'',changedComment:'',guideStep:0};document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));observationSelect.value='';document.querySelector('#patternNotes').value='';document.querySelector('#reflectionNotes').value='';document.querySelector('#changedComment').value='';document.querySelectorAll('input[name="changed"]').forEach(x=>x.checked=false);document.querySelector('#pathNext').disabled=true;document.querySelector('#observationNext').disabled=true;document.querySelector('#compareNext').disabled=true;showPage(0);});
function restoreUI(){
  if(state.path){document.querySelector(`.choice[data-path="${state.path}"]`)?.classList.add('selected');document.querySelector('#pathNext').disabled=false;}
  if(!resources[state.observation])state.observation='';observationSelect.value=state.observation||'';
  if(state.verdict)document.querySelector(`.verdict[data-verdict="${state.verdict}"]`)?.classList.add('selected');
  if(state.changed)document.querySelector(`input[name="changed"][value="${state.changed}"]`)?.setAttribute('checked','checked');
  document.querySelector('#reflectionNotes').value=state.reflectionNotes||'';document.querySelector('#changedComment').value=state.changedComment||'';validateObservation();validateComparison();
}
function openHash(){const id=location.hash.slice(1),idx=pages.findIndex(p=>p.id===id);if(idx>=0){if(id==='questions')configureQuestionPage();showPage(idx,false);}else showPage(0,false);}
loadLocal();restoreUI();openHash();
