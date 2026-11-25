const JOBS=[['sales','売上入力','PC',24],['mail','メール仕分け','PC',16],['compare','データ照合','PC',8],['product','商品登録','PC',10],['stamp','承認・押印','書類',12],['receipt','領収書仕分け','書類',12],['invoice','請求書照合','書類',6],['folder','資料整理','書類',8]];
const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const yen=n=>n.toLocaleString('ja-JP')+'円';

// PC処理完了を表示する時間（ミリ秒）
const PC_FEEDBACK_MS=420;


function generate(id){
 const departments=['営業部','総務部','人事部'];
 switch(id){
 case 'sales':return {number:String(rand(1000,999999)),input:''};
 case 'mail':{let a=rand(0,2);return {a,subject:pick([['勤務予定の共有','会議資料の送付','社内連絡'],['至急：返信依頼','本日中の確認依頼','承認をお願いします'],['限定セールのお知らせ','広告配信','特別キャンペーン']][a])};}
 case 'compare':{let rows=Array.from({length:5},()=>[rand(10,99),rand(1000,9999)]);let copy=rows.map(r=>[...r]);let keys=Array.from({length:10},(_,i)=>i);let bad=[];for(let n=rand(1,3);n--;){let k=keys.splice(rand(0,keys.length-1),1)[0];bad.push(k);copy[k>>1][k%2]+=rand(1,9);}return {rows,copy,bad,marked:[]};}
 case 'product':{let a=rand(0,2),b=rand(0,2);return {a,b,name:pick([['コピー用紙','ボールペン','ファイル'],['モニター','マウス','キーボード'],['お茶','クッキー','コーヒー']][a]),department:departments[b],answers:[-1,-1]};}
 case 'stamp':{let price=rand(1,15)*1000,signed=Math.random()>.25;return {price,signed,name:pick(['佐藤','田中','鈴木','高橋']),a:price<=10000&&signed?0:1};}
 case 'receipt':{let a=rand(0,2);return {a,item:pick([['乗車券','タクシー代'],['コピー用紙','付箋'],['昼食代','弁当代']][a]),price:rand(3,40)*100};}
 case 'invoice':{let quantity=rand(2,30),price=rand(10,99)*100,other=quantity; if(Math.random()<.5)other+=1;return {quantity,other,price,a:quantity===other?0:1};}
 case 'folder':return {cards:Array.from({length:4},(_,i)=>({i,a:rand(0,2),name:pick(['会議資料','報告書','連絡票'])}))};
 }
}


let jobAudio;
function playJobSound(kind){if(!$('sound').checked)return;try{jobAudio??=new (window.AudioContext||window.webkitAudioContext)();const c=jobAudio;c.resume().catch(()=>{});const n=Math.floor(c.sampleRate*(kind==='stamp'?.11:.14)),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);let prev=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;prev=.75*prev+.25*w;a[i]=(kind==='stamp'?.65*prev+.35*Math.sin(i/c.sampleRate*2*Math.PI*95):w-prev)*Math.exp(-i/n*6);}const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=kind==='stamp'?650:1900+Math.random()*700;g.gain.value=kind==='stamp'?.17:.055;s.buffer=b;s.connect(f).connect(g).connect(c.destination);s.start();}catch(e){/* audio is optional */}}


// Pointer capture, preserved grab offset, filtered targets and cancellable animation.
let cancelDrag=()=>{};
function wireDrag(el,accept,allowed=null){
 el.addEventListener('pointerdown',e=>{
 if(e.button!==0||!e.isPrimary||locked)return;e.preventDefault();cancelDrag();
 const r=el.getBoundingClientRect(),ghost=el.cloneNode(true),id=e.pointerId;
 ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));ghost.classList.add('ghost','lifted');
 Object.assign(ghost.style,{width:r.width+'px',height:r.height+'px',left:r.left+'px',top:r.top+'px',margin:'0'});
 document.body.append(ghost);el.classList.add('held');el.setPointerCapture(id);playJobSound('lift');
 const dx=e.clientX-r.left,dy=e.clientY-r.top;let zone=null,lastX=e.clientX,animation=null,closed=false;
 const targets=[...document.querySelectorAll('#task [data-drop]')].filter(z=>!allowed||allowed.includes(z.dataset.drop));
 function move(v){if(v.pointerId!==id)return;ghost.style.left=v.clientX-dx+'px';ghost.style.top=v.clientY-dy+'px';ghost.style.setProperty('--tilt',Math.max(-8,Math.min(8,(v.clientX-lastX)*.3))+'deg');lastX=v.clientX;let best=null,dist=Infinity;for(const z of targets){const b=z.getBoundingClientRect(),x=v.clientX,y=v.clientY;if(x>=b.left-12&&x<=b.right+12&&y>=b.top-12&&y<=b.bottom+12){let d=Math.hypot(x-(b.left+b.right)/2,y-(b.top+b.bottom)/2);if(d<dist){best=z;dist=d;}}}if(zone!==best){zone?.classList.remove('over');zone=best;zone?.classList.add('over');}}
 function detach(){el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',clean);el.removeEventListener('lostpointercapture',clean);if(el.hasPointerCapture(id))el.releasePointerCapture(id);}
 function clean(){if(closed)return;closed=true;detach();animation?.cancel();ghost.remove();el.classList.remove('held');zone?.classList.remove('over');cancelDrag=()=>{};}
 function up(v){if(v.pointerId!==id)return;move(v);const target=zone,code=target?.dataset.drop;detach();const b=target?.getBoundingClientRect()||r;const stamping=el.classList.contains('stamp')&&target;const endX=target?b.left+b.width/2-r.width/2:r.left,endY=target?b.top+b.height/2-r.height/2:r.top;const startX=parseFloat(ghost.style.left),startY=parseFloat(ghost.style.top);animation=ghost.animate([{transform:'translate(0,0) rotate(var(--tilt,0deg)) scale(1.04)',opacity:1},{transform:`translate(${endX-startX}px,${endY-startY}px) scale(${target?(stamping?.82:.38):1})`,opacity:target&&!stamping?0:1}],{duration:target?170:200,easing:'cubic-bezier(.2,.75,.3,1)',fill:'forwards'});animation.onfinish=()=>{clean();if(target&&!locked&&mode&&parent.jobCanCommit(mode)){playJobSound(stamping?'stamp':'drop');accept(code);}else playJobSound('drop');};}
 cancelDrag=clean;el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',clean);el.addEventListener('lostpointercapture',clean);
 });
}


function pcTask(id,q){let t=$('task');const btn=(label,fn)=>{let b=document.createElement('button');b.textContent=label;b.onclick=fn;return b};
 if(id==='sales'){t.innerHTML=`<div class="twocol"><div class="sheet"><small>伝票金額</small><h1>${Number(q.number).toLocaleString()} 円</h1><div class="entry" id="entry">${q.input||'—'}</div><button id="register">登録</button></div><div class="keypad" id="keys"></div></div>`;for(let k of ['7','8','9','4','5','6','1','2','3','C','0','⌫'])$('keys').append(btn(k,()=>{q.input=k==='C'?'':k==='⌫'?q.input.slice(0,-1):(q.input+k).slice(0,6);$('entry').textContent=q.input||'—';}));$('register').onclick=()=>{if(q.input)finish(q.input===q.number)};}
 if(id==='mail'){t.innerHTML=`<div class="sheet"><small>受信メール</small><h2>${q.subject}</h2><p>通常連絡は保管・返信依頼は要対応・広告は削除</p></div><div class="choices" id="choices"></div>`;['保管','要対応','削除'].forEach((v,i)=>$('choices').append(btn(v,()=>finish(i===q.a))));}
 if(id==='compare'){t.innerHTML='<p>登録側の異なる数字をすべて選択してください。</p><table><thead><tr><th colspan="2">原本</th><th colspan="2">登録データ</th></tr></thead><tbody id="rows"></tbody></table><button id="submit">照合完了</button>';q.rows.forEach((r,i)=>{let tr=document.createElement('tr');r.forEach(v=>{let td=tr.insertCell();td.textContent=v});q.copy[i].forEach((v,j)=>{let td=tr.insertCell(),k=i*2+j,b=btn(v,()=>{q.marked=q.marked.includes(k)?q.marked.filter(x=>x!==k):[...q.marked,k];b.classList.toggle('selected',q.marked.includes(k))});b.classList.toggle('selected',q.marked.includes(k));td.append(b)});$('rows').append(tr)});$('submit').onclick=()=>finish(q.marked.length===q.bad.length&&q.bad.every(k=>q.marked.includes(k)));}
 if(id==='product'){
  t.innerHTML=`<div class="sheet product-info"><small>商品情報</small><h2>${q.name}</h2><p>担当：${q.department}</p></div><div id="fields"></div><button id="productSubmit" type="button">登録</button><small id="productHint" class="product-hint" aria-live="polite"></small>`;
  const submit=$('productSubmit');
  const update=()=>{const ready=q.answers.every(x=>x>=0);submit.disabled=!ready;$('productHint').textContent=ready?'入力完了 — 登録できます':q.answers[0]<0?'商品分類を選択してください':'担当部署を選択してください';};
  [['事務用品','電子機器','食品'],['営業部','総務部','人事部']].forEach((opts,j)=>{
   let label=document.createElement('small');label.textContent=['商品分類','担当部署'][j];$('fields').append(label);
   let row=document.createElement('div');row.className='choices';opts.forEach((v,i)=>{let b=btn(v,()=>{if(locked)return;q.answers[j]=i;[...row.children].forEach((x,k)=>{x.classList.toggle('selected',k===i);x.setAttribute('aria-pressed',String(k===i))});update()});b.type='button';b.classList.toggle('selected',q.answers[j]===i);b.setAttribute('aria-pressed',String(q.answers[j]===i));row.append(b)});$('fields').append(row);
  });
  submit.onclick=()=>{if(!locked&&q.answers.every(x=>x>=0))finish(q.answers[0]===q.a&&q.answers[1]===q.b)};update();
 }
}


function paperTask(id,q){const t=$('task'),s=state[id];const zones=(labels,offset=0)=>`<div class="zones">${labels.map((v,i)=>`<div class="folder tray-${i}" data-drop="${i+offset}"><span class="stored" style="--stack:${Math.min(5,(s.bins?.[i+offset]||0))}"></span><span class="folder-label">${v}</span><small>${s.bins?.[i+offset]||0} 枚</small></div>`).join('')}</div>`;
 const commit=(v,ok,delay=100,keep=false)=>{s.bins??=[0,0,0];s.bins[Number(v)]++;finish(ok,delay,keep)};
 const stack=`<div class="paperstack"><div class="stack-sheets" style="--remaining:${Math.min(8,s.count-s.done)}"></div><small>未処理 ${s.count-s.done}</small></div>`;
 if(id==='stamp'){t.innerHTML=`<p class="rule">承認条件：1万円以下・本人署名あり</p><div class="stampdesk">${stack}<div class="sheet draggable formpaper" id="paper"><small>経理部 / FORM 01</small><h2>経費精算申請書</h2><dl><dt>申請者</dt><dd>${q.name}</dd><dt>申請金額</dt><dd>${yen(q.price)}</dd><dt>本人署名</dt><dd class="signature">${q.signed?q.name:'＿＿＿'}</dd></dl><div class="stamparea" data-drop="0">押印欄</div></div><div class="tools"><div class="inkpad" aria-hidden="true"></div><div class="stamp draggable" id="stamp" aria-label="承認印"><span>承認</span></div>${zones(['差し戻し'],1)}</div></div>`;wireDrag($('stamp'),v=>{$('paper').querySelector('.stamparea').innerHTML='<b class="imprint">承認<br>済</b>';finish(q.a===0,260)},['0']);wireDrag($('paper'),v=>commit(v,q.a===1),['1']);}
 if(id==='receipt'){t.innerHTML=`<p class="rule">費目別のファイルへ収納</p><div class="receiptstage">${stack}<div class="receipt sheet draggable" id="paper"><small>お客様控え</small><h2>領 収 書</h2><div class="receiptline"><span>${q.item}</span><b>${yen(q.price)}</b></div><strong>${yen(q.price)}</strong><hr><small>上記正に領収いたしました</small><div class="barcode"></div></div></div>${zones(['交通費','消耗品費','食費'])}`;wireDrag($('paper'),v=>commit(v,Number(v)===q.a));}
 if(id==='invoice'){t.innerHTML=`<p class="rule">数量・単価を比較し、書類一式を振り分ける</p><div class="invoicepair draggable" id="paper">${[['請求書',q.quantity],['納品書',q.other]].map(([n,k])=>`<div class="sheet formpaper"><small>取引先控え / No. 00429</small><h2>${n}</h2><dl><dt>品目</dt><dd>事務用品</dd><dt>数量</dt><dd>${k}</dd><dt>単価</dt><dd>${yen(q.price)}</dd><dt>合計</dt><dd>${yen(k*q.price)}</dd></dl><small>東都事務用品株式会社</small></div>`).join('')}</div>${zones(['確認済み','要修正'])}`;wireDrag($('paper'),v=>commit(v,Number(v)===q.a));}
 if(id==='folder'){t.innerHTML=`<p class="rule">資料を記載の部署のファイルへ収納</p><div class="papers" id="papers"></div>${zones(['営業部','総務部','人事部'])}`;q.cards.forEach(c=>{const el=document.createElement('div');el.className='sheet draggable filepaper';el.style.setProperty('--angle',[-6,3,-3,6][c.i]+'deg');el.innerHTML=`<small>社内資料 / ${c.i+101}</small><h3>${c.name}</h3><div class="department">${['営業部','総務部','人事部'][c.a]}</div><div class="printlines"></div>`;$('papers').append(el);wireDrag(el,v=>{q.cards=q.cards.filter(x=>x!==c);commit(v,Number(v)===c.a,90,q.cards.length>0);});});}
}


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
