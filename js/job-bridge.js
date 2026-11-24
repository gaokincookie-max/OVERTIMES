// UI bridge: iframe isolates mini-game CSS and pointer gestures from desk navigation.
const pcJobIds=['sales','mail','compare','product'];
const paperJobIds=['stamp','receipt','invoice','folder'];
let jobReady=false, jobMode=null, jobKey=null, savedJobs=null, pcTab='sales';
let pcCorrect=[0,0,0,0], paperCorrect=[0,0,0,0], savedCorrect=[0,0,0,0];
function jobApi(){return jobReady ? $('jobFrame').contentWindow.jobAPI : null;}
function resetJobs(){jobMode=null;jobKey=null;pcTab='sales';savedJobs=null;pcCorrect=config.pcCounts.map(()=>0);savedCorrect=[...pcCorrect];paperCorrect=config.counts.map(()=>0);const api=jobApi();if(api){api.configure(config.pcCounts,config.counts);savedJobs=api.snapshot();api.setSaving(false);}}
function syncJobPane(){const mode=!defeated&&!powerOut&&view==='pc'&&pcZoomed&&monitorOn?'PC':!defeated&&!dark&&!powerOut&&view==='right'&&selected>=0?'書類':null;const key=mode==='書類'?paperJobIds[selected]:null;const api=jobApi();$('jobPane').hidden=!mode;$('jobPane').dataset.mode=mode||'';$('pcBack').hidden=mode!=='PC';$('close').hidden=mode!=='書類';$('pcSave').hidden=mode!=='PC';$('pcStatus').hidden=mode!=='PC';$('jobtitle').textContent=mode==='PC'?'社内業務管理システム':mode==='書類'?jobs[selected][1]:'';if(mode!==jobMode||key!==jobKey){if(api){if(mode)api.show(mode,key||(mode==='PC'?pcTab:null));else api.suspend();}jobMode=mode;jobKey=key;}if(api)api.setSound($('jobSound').checked);}
window.jobCanCommit=mode=>jobReady&&!defeated&&!powerOut&&(mode==='PC'?view==='pc'&&pcZoomed&&monitorOn&&!saveTimer:mode==='書類'&&view==='right'&&selected>=0&&!dark);
window.jobTabChanged=id=>{if(pcJobIds.includes(id))pcTab=id;};
window.jobCommitted=(id,done,correct)=>{const i=pcJobIds.indexOf(id),j=paperJobIds.indexOf(id);if(i>=0&&window.jobCanCommit('PC')){pcTab=id;pcRemain[i]=config.pcCounts[i]-done;pcCorrect[i]=correct;drawPC();syncPC();}else if(j===selected&&j>=0&&window.jobCanCommit('書類')){remain[j]=config.counts[j]-done;paperCorrect[j]=correct;render();}stats();};
$('jobFrame').addEventListener('load',()=>{jobReady=!!$('jobFrame').contentWindow.jobAPI;if(!jobReady)return;resetJobs();syncJobPane();});
$('jobSound').onchange=()=>jobApi()?.setSound($('jobSound').checked);
function rollbackJobs(){jobApi()?.restore(savedJobs);pcCorrect=[...savedCorrect];jobMode=null;jobKey=null;jobApi()?.setSaving(false);}

window.addEventListener('DOMContentLoaded',()=>{$('jobFrame').src='jobs/index.html';});
