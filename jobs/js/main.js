// Embedded job controller. One persistent instance; parent owns game lifecycle.
let state,active='sales',started=0,locked=false,epoch=0,mode=null;
const ids=type=>JOBS.filter(j=>j[2]===type).map(j=>j[0]);
const copy=v=>JSON.parse(JSON.stringify(v));
function fresh(id,count){return {count,done:0,correct:0,ms:0,q:null};}
function accrue(){if(state&&started){state[active].ms+=performance.now()-started;started=0;}}
function suspend(){accrue();epoch++;cancelDrag();locked=false;mode=null;}
function configure(pc,paper){suspend();state={};for(const [type,counts] of [['PC',pc],['書類',paper]])ids(type).forEach((id,i)=>state[id]=fresh(id,counts[i]));active='sales';}
function select(id){if(!mode||!ids(mode).includes(id)||locked)return;accrue();cancelDrag();active=id;if(mode==='PC')parent.jobTabChanged(id);started=performance.now();draw();}
let saving=false;
function applySaving(){const blocked=mode==='PC'&&saving;$('task').inert=blocked;$('menu').inert=blocked;if(blocked)locked=true;}
function show(type,id){if(mode===type&&(!id||active===id))return;suspend();mode=type;active=id|| (ids(type).includes(active)?active:ids(type)[0]);started=performance.now();draw();applySaving();}
function snapshot(){return Object.fromEntries(ids('PC').map(id=>[id,copy(state[id])]));}
function restore(saved){suspend();for(const id of ids('PC'))state[id]=saved?copy(saved[id]):fresh(id,state[id].count);}
function finish(ok,delay=0,keep=false){if(locked||!mode||!parent.jobCanCommit(mode))return;let s=state[active];if(s.done>=s.count)return;locked=true;accrue();let token=epoch;s.done++;s.correct+=Number(ok);if(!keep)s.q=null;parent.jobCommitted(active,s.done,s.correct);$('status').textContent='処理済み';const next=()=>{if(token!==epoch||!mode)return;locked=false;started=performance.now();draw();};if(mode==='PC'){
 const task=$('task');task.classList.add('pc-processed');task.querySelectorAll('button').forEach(b=>b.disabled=true);const notice=document.createElement('div');notice.className='pc-confirm';notice.setAttribute('role','status');notice.textContent=`✓ 処理完了　${s.done} / ${s.count} 件`;task.append(notice);$('bar').textContent=`${JOBS.find(j=>j[0]===active)[1]}　残り ${s.count-s.done} 件`;$('status').textContent='処理済み — 次の業務へ';setTimeout(next,PC_FEEDBACK_MS);
 }else if(delay)setTimeout(next,delay);else next();}
function draw(){if(!mode)return;let s=state[active],job=JOBS.find(j=>j[0]===active);$('menu').innerHTML='';$('menu').hidden=mode!=='PC';if(mode==='PC')JOBS.filter(j=>j[2]===mode).forEach(([id,name])=>{let b=document.createElement('button');b.className=id===active?'selected':'';b.textContent=`${name} ${state[id].done}/${state[id].count}`;b.onclick=()=>select(id);$('menu').append(b)});$('workspace').className=mode==='PC'?'pc':'paper';$('bar').textContent=`${job[1]}　残り ${s.count-s.done} 件`;$('status').textContent='';$('task').classList.remove('pc-processed');$('task').innerHTML='';if(s.done>=s.count){$('task').innerHTML='<div class="complete"><h2>業務完了</h2><p>別の業務を選択してください。</p></div>';started=0;}else{if(!s.q)s.q=generate(active);if(active==='folder'&&s.q.cards.length>s.count-s.done)s.q.cards=s.q.cards.slice(0,s.count-s.done);(mode==='PC'?pcTask:paperTask)(active,s.q);}}
window.jobAPI={configure,show,suspend,snapshot,restore,setSound:on=>$('sound').checked=on,setSaving:on=>{saving=on;if(mode==='PC'){if(on){accrue();epoch++;cancelDrag();locked=true;}else{locked=false;started=performance.now();draw();}}applySaving();}};
window.addEventListener('blur',()=>cancelDrag());
