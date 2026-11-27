const JOBS=[['sales','売上入力','PC',20],['mail','メール仕分け','PC',12],['compare','データ照合','PC',8],['product','商品登録','PC',8],['stamp','承認・押印','書類',14],['receipt','領収書仕分け','書類',14],['invoice','請求書照合','書類',8],['folder','資料整理','書類',12]];
const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const yen=n=>n.toLocaleString('ja-JP')+'円';

// PC処理完了を表示する時間（ミリ秒）
const PC_FEEDBACK_MS=420;

;
// Rare work is extra, never part of the quota or accuracy. Edit these pools freely.
const NOTES={sales:'伝票金額をテンキーで入力 → 登録。Cで全消去、⌫で1桁戻る。',mail:'通常連絡 → 保管 ／ 確認・返信依頼 → 要対応 ／ 広告 → 削除',compare:'原本と登録データを比較。登録側の異なる数字をすべて選択 → 照合完了。',product:'商品分類と担当部署をそれぞれ選択 → 登録。',stamp:'1万円以下・本人署名あり → ハンコを押印欄へ。それ以外 → 書類を差し戻しへ。',receipt:'領収書を交通費・消耗品費・食費の該当ファイルへドラッグ。',invoice:'数量・単価を比較。一致 → 確認済み、不一致 → 要修正へ書類一式をドラッグ。',folder:'資料を記載された部署のファイルへ1枚ずつドラッグ。'};
const MAILS=[
[['勤務予定の共有','人事部','来月の勤務予定を共有します。'],['会議資料の送付','総務部','定例会議の資料を送付します。'],['社内連絡','総務部','事務室の利用時間をお知らせします。'],['設備点検のお知らせ','設備管理部','明日、定期点検を行います。'],['業務マニュアル更新','業務管理部','最新版を共有します。'],['議事録の共有','営業部','本日の議事録を送付します。'],['休業日のお知らせ','人事部','来月の休業日をお知らせします。'],['社内報の配布','総務部','今月号を配布します。'],['組織変更のお知らせ','人事部','新しい組織図を共有します。'],['入館証更新のお知らせ','総務部','更新日程をお知らせします。']],
[['至急：返信依頼','営業部','本日中にご返信ください。'],['本日中の確認依頼','経理部','記載内容をご確認ください。'],['承認をお願いします','総務部','申請内容の承認をお願いします。'],['見積書の確認依頼','営業部','見積書をご確認ください。'],['提出書類の修正依頼','人事部','記載漏れを修正してください。'],['経費精算の承認依頼','経理部','精算申請の承認をお願いします。'],['在庫数の回答依頼','営業部','現在の在庫数をご回答ください。'],['日程の返信依頼','総務部','候補日をご返信ください。'],['発注内容の確認依頼','営業部','数量の確認をお願いします。'],['請求書の再提出依頼','経理部','修正版をご提出ください。']],
[['限定セールのお知らせ','外部広告','期間限定の割引をご案内します。'],['広告配信','外部広告','新サービスのご紹介です。'],['特別キャンペーン','外部広告','今だけお得なキャンペーンです。'],['無料セミナーの広告','外部広告','無料講座への参加をご案内します。'],['新商品の広告','外部広告','新商品を発売しました。'],['クーポン配信','外部広告','限定クーポンをお届けします。'],['会員登録キャンペーン','外部広告','登録特典をご用意しました。'],['特価商品のご紹介','外部広告','数量限定で販売中です。'],['広告：オフィス用品','外部広告','法人向け特価のご案内です。'],['期間限定ポイント還元','外部広告','お得な購入特典をご案内します。']]];
const RARE={
 sales:[['前任社員','中古品・現状渡し','800'],['夜間勤務者','引渡予定 06:00','3600'],['社員証（使用者含む）','分離不可','1980'],['','取引先：あなた','0'],['残存寿命','買取処理','420'],['人間','数量：1　返品不可','100']],
 mail:[['消耗品費の処理について','経理部','社員の購入費用については、従来どおり消耗品費として処理してください。\n購入対象者への通知は不要です。','23:48'],['本日の夜間勤務について','総務部','本日の夜間勤務者は1名です。\n他の社員を確認した場合も、勤務人数に含めないでください。','23:55'],['Re: Re: Re: Re:','','まだそこにいますか','--:--'],['付箋について','前任者','仕事のやり方は付箋に書いておきました。\n私からメールが来ても読まないでください。','23:59'],['退勤処理完了のお知らせ','勤怠管理システム','退勤処理が正常に完了しました。\n退勤者数：0名','06:00'],['送信失敗','Mail Delivery System','宛先：現在の使用者\n理由：存在しません。','00:00'],['人員補充のお知らせ','人事部','明日から新しい社員が配属されます。\n座席の変更はありません。','23:31'],['お疲れ様です','現在の使用者','まだ終わっていません。','06:01']],
 compare:[{labels:['心拍数','体温（×10）','在席人数','生存者数','死亡記録'],rows:[[72,72],[365,365],[1,1],[1,1],[0,0]],copy:[[72,0],[365,214],[1,2],[1,0],[0,1]]},{labels:['出勤回数','退勤回数','勤務日数','社員数','再配置回数'],rows:[[1,1],[0,0],[1,1],[1,1],[0,0]],copy:[[1,1],[0,0],[1,3286],[1,1],[0,3286]]},{labels:['社員番号','顔の数','腕の数','眼球数','一致率'],rows:[[418,418],[1,1],[2,2],[2,2],[100,100]],copy:[[418,418],[1,2],[2,4],[2,0],[100,100]]}],
 product:[['夜間勤務用社員','人事部'],['交換用の顔','人事部'],['人間の声（未使用）','営業部'],['回収済み社員','総務部'],['社員証・中身付き','人事部'],['あなた','人事部'],['生体反応','総務部'],['廃棄予定の記憶','人事部']],
 stamp:[['社員廃棄申請書','夜間勤務者',800,true,'実施時刻：06:00'],['勤務継続同意書','あなた',0,true,'終了予定：なし'],['記憶消去申請書','本日の勤務者',3000,true,'消去範囲：本日分'],['社員交換申請書','現在の勤務者',1200,false,'交換理由：品質低下'],['死亡届','夜間勤務者',0,true,'発生時刻：06:00'],['存在許可申請書','不明',500,false,'有効期限：本日限り']],
 receipt:[['社員（1名）',480],['人間の顔',1200],['前任社員回収費',300],['睡眠時間（8時間）',800],['社員の記憶',120],['退勤許可',980],['明日',0],['██████',100],['あなた',1],['社員交換費用',3800]],
 invoice:[['夜間勤務用社員','夜間勤務用社員',1,2,3000,'株式会社 人材供給センター','株式会社 人材供給センター'],['後任社員','現在の勤務者',1,1,800,'納品予定：06:00','納品済み'],['社員','社員',1,0,100,'人材管理部','人材管理部'],['社員回収費','社員回収費',1,1,0,'回収予定：06:00','回収先：現在の座席'],['████','████',1,1,4000,'東都事務用品株式会社','受取人：あなた']],
 folder:[['夜間勤務に関する規定',1,'他の勤務者を確認した場合も、夜間勤務者は1名として記録すること。'],['社員品質報告書',2,'外見：正常　言語：正常　自我：残存'],['欠員発生予定表',2,'06:00　1名　対象：夜間勤務者'],['商品取扱上の注意',0,'納品後に発生した自我は保証対象外。'],['机の使用について',1,'机の下に社員がいる場合があります。確認不要。'],['社員識別規定',2,'同一社員を同時に退勤させないこと。'],['みつけた',-1,''],['夜間監視記録',1,'異常なし。異常なし。異常なし。']]
};
const RARE_SPECIAL={sales:"auto-digit",stamp:"pre-stamped",compare:"revert",mail:"repeat-mail",receipt:"quantity-change"};
const RARE_COUNTS=[25,45,25,5];
let rarePlan={},rareSeen=new Set();
function resetRare(){rareSeen=new Set();rarePlan={};let n=0,r=Math.random()*100;while(n<3&&r>=RARE_COUNTS[n])r-=RARE_COUNTS[n++];let pool=JOBS.map(j=>j[0]);if(new URLSearchParams(location.search).get('rare')==='1')n=8;for(let i=0;i<n;i++){let id=pool.splice(rand(0,pool.length-1),1)[0];rarePlan[id]={at:id==='folder'?pick([4,8]):rand(2,Math.max(2,state[id].count-1)),index:rand(0,RARE[id].length-1),effect:RARE_SPECIAL[id]&&Math.random()<.08?RARE_SPECIAL[id]:null};}}
function rareQuestion(id,index){let a=RARE[id][index],q={rare:true};switch(id){case 'sales':return {...q,item:a[0],note:a[1],number:a[2],input:''};case 'mail':return {...q,subject:a[0],from:a[1],body:a[2],time:a[3]};case 'compare':return {...q,...JSON.parse(JSON.stringify(a)),bad:[],marked:[]};case 'product':return {...q,name:a[0],department:a[1],answers:[-1,-1]};case 'stamp':return {...q,title:a[0],name:a[1],price:a[2],signed:a[3],note:a[4]};case 'receipt':return {...q,item:a[0],price:a[1]};case 'invoice':return {...q,items:a.slice(0,2),quantity:a[2],other:a[3],price:a[4],notes:a.slice(5)};case 'folder':return {...q,cards:[{i:0,name:a[0],a:a[1],body:a[2]}]};}}
function nextQuestion(id){const p=rarePlan[id];if(p&&!rareSeen.has(id)&&state[id].done>=p.at){rareSeen.add(id);const q=rareQuestion(id,p.index);if(p.effect){q.effect=p.effect;if(p.effect==='auto-digit'){q.number='41800';q.input='';}if(p.effect==='repeat-mail'){Object.assign(q,{subject:'まだそこにいますか',from:'',body:'',time:'--:--'});}if(p.effect==='quantity-change'){q.item='社員（1名）';q.price=0;}}return q;}return generate(id);}

;
function generate(id){
 const departments=['営業部','総務部','人事部'];
 switch(id){
 case 'sales':return {number:String(rand(1000,999999)),input:''};
 case 'mail':{let a=rand(0,2),m=pick(MAILS[a]);return {a,subject:m[0],from:m[1],body:'お疲れ様です。\n'+m[2],time:'23:'+String(rand(0,59)).padStart(2,'0')};}
 case 'compare':{let rows=Array.from({length:5},()=>[rand(10,99),rand(1000,9999)]);let copy=rows.map(r=>[...r]);let keys=Array.from({length:10},(_,i)=>i);let bad=[];for(let n=rand(1,3);n--;){let k=keys.splice(rand(0,keys.length-1),1)[0];bad.push(k);copy[k>>1][k%2]+=rand(1,9);}return {rows,copy,bad,marked:[]};}
 case 'product':{let a=rand(0,2),b=rand(0,2);return {a,b,name:pick([['コピー用紙','ボールペン','ファイル'],['モニター','マウス','キーボード'],['お茶','クッキー','コーヒー']][a]),department:departments[b],answers:[-1,-1]};}
 case 'stamp':{let price=rand(1,15)*1000,signed=Math.random()>.25;return {price,signed,name:pick(['佐藤','田中','鈴木','高橋']),a:price<=10000&&signed?0:1};}
 case 'receipt':{let a=rand(0,2);return {a,item:pick([['乗車券','タクシー代'],['コピー用紙','付箋'],['昼食代','弁当代']][a]),price:rand(3,40)*100};}
 case 'invoice':{let quantity=rand(2,30),price=rand(10,99)*100,other=quantity; if(Math.random()<.5)other+=1;return {quantity,other,price,a:quantity===other?0:1};}
 case 'folder':return {cards:Array.from({length:4},(_,i)=>({i,a:rand(0,2),name:pick(['会議資料','報告書','連絡票'])}))};
 }
}

;
let jobAudio;
function playJobSound(kind){if(!$('sound').checked)return;try{jobAudio??=new (window.AudioContext||window.webkitAudioContext)();const c=jobAudio;c.resume().catch(()=>{});const n=Math.floor(c.sampleRate*(kind==='stamp'?.11:.14)),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);let prev=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;prev=.75*prev+.25*w;a[i]=(kind==='stamp'?.65*prev+.35*Math.sin(i/c.sampleRate*2*Math.PI*95):w-prev)*Math.exp(-i/n*6);}const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=kind==='stamp'?650:1900+Math.random()*700;g.gain.value=kind==='stamp'?.17:.055;s.buffer=b;s.connect(f).connect(g).connect(c.destination);s.start();}catch(e){/* audio is optional */}}

;
// Pointer capture, preserved grab offset, filtered targets and cancellable animation.
let cancelDrag=()=>{};
function wireDrag(el,accept,allowed=null){
 el.dataset.draggable='true';
 el.addEventListener('pointerdown',e=>{
 if(e.button!==0||!e.isPrimary||locked)return;e.preventDefault();cancelDrag();
 const r=el.getBoundingClientRect(),ghost=el.cloneNode(true),id=e.pointerId;
 ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));ghost.classList.add('ghost','lifted');
 Object.assign(ghost.style,{width:r.width+'px',height:r.height+'px',left:r.left+'px',top:r.top+'px',margin:'0'});
 document.body.append(ghost);if(state?.[active]?.q?.effect==='quantity-change'&&el.id==='paper'){state[active].q.item='社員（2名）';for(const node of [el,ghost]){const item=node.querySelector('.receiptline span');if(item)item.textContent='社員（2名）';}}el.classList.add('held');el.setPointerCapture(id);playJobSound('lift');
 const dx=e.clientX-r.left,dy=e.clientY-r.top;let zone=null,lastX=e.clientX,animation=null,closed=false;
 const targets=[...document.querySelectorAll('#task [data-drop]')].filter(z=>!allowed||allowed.includes(z.dataset.drop));
 function move(v){if(v.pointerId!==id)return;ghost.style.left=v.clientX-dx+'px';ghost.style.top=v.clientY-dy+'px';ghost.style.setProperty('--tilt',Math.max(-8,Math.min(8,(v.clientX-lastX)*.3))+'deg');lastX=v.clientX;let best=null,dist=Infinity;for(const z of targets){const b=z.getBoundingClientRect(),x=v.clientX,y=v.clientY;if(x>=b.left-12&&x<=b.right+12&&y>=b.top-12&&y<=b.bottom+12){let d=Math.hypot(x-(b.left+b.right)/2,y-(b.top+b.bottom)/2);if(d<dist){best=z;dist=d;}}}if(zone!==best){zone?.classList.remove('over');zone=best;zone?.classList.add('over');}}
 function detach(){el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',clean);el.removeEventListener('lostpointercapture',clean);if(el.hasPointerCapture(id))el.releasePointerCapture(id);}
 function clean(){if(closed)return;closed=true;detach();animation?.cancel();ghost.remove();el.classList.remove('held');zone?.classList.remove('over');cancelDrag=()=>{};}
 function up(v){if(v.pointerId!==id)return;move(v);const target=zone,code=target?.dataset.drop;detach();const b=target?.getBoundingClientRect()||r;const stamping=el.classList.contains('stamp')&&target;const endX=target?b.left+b.width/2-r.width/2:r.left,endY=target?b.top+b.height/2-r.height/2:r.top;const startX=parseFloat(ghost.style.left),startY=parseFloat(ghost.style.top);animation=ghost.animate([{transform:'translate(0,0) rotate(var(--tilt,0deg)) scale(1.04)',opacity:1},{transform:`translate(${endX-startX}px,${endY-startY}px) scale(${target?(stamping?.82:.38):1})`,opacity:target&&!stamping?0:1}],{duration:target?170:200,easing:'cubic-bezier(.2,.75,.3,1)',fill:'forwards'});animation.onfinish=()=>{clean();if(target&&!locked&&mode&&parent.jobCanCommit(mode)){playJobSound(stamping?'stamp':'drop');accept(code);}else playJobSound('drop');};}
 cancelDrag=clean;el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',clean);el.addEventListener('lostpointercapture',clean);
 });
}

;
function pcTask(id,q){let t=$('task');const btn=(label,fn)=>{let b=document.createElement('button');b.textContent=label;b.onclick=fn;return b};
 if(id==='sales'){t.innerHTML=`<div class="twocol"><div class="sheet"><small>伝票金額</small>${q.rare?`<div>${q.item}</div><small>${q.note}</small>`:""}<h1>${Number(q.number).toLocaleString()} 円</h1><div class="entry" id="entry">${q.input||'—'}</div><button id="register">登録</button></div><div class="keypad" id="keys"></div></div>`;for(let k of ['7','8','9','4','5','6','1','2','3','C','0','⌫'])$('keys').append(btn(k,()=>{q.input=k==='C'?'':k==='⌫'?q.input.slice(0,-1):(q.input+k).slice(0,6);if(q.effect==='auto-digit'&&q.input.length===4&&!q.auto){q.auto=true;q.input+='1';}$('entry').textContent=q.input||'—';}));$('register').onclick=()=>{if(q.input)finish(q.input===q.number)};}
 if(id==='mail'){t.innerHTML=`<div class="sheet"><small>受信メール</small><h2>${q.subject}</h2><div class="mail-meta">差出人：${q.from??""}　宛先：業務管理部　受信：${q.time??""}</div><div class="mail-body">${q.body??""}</div></div><div class="choices" id="choices"></div>`;['保管','要対応','削除'].forEach((v,i)=>$('choices').append(btn(v,()=>finish(i===q.a))));}
 if(id==='compare'){t.innerHTML='<table><thead><tr><th colspan="2">原本</th><th colspan="2">登録データ</th></tr></thead><tbody id="rows"></tbody></table><button id="submit">照合完了</button>';if(q.labels){let th=document.createElement('th');th.textContent='項目';t.querySelector('thead tr').prepend(th);}q.rows.forEach((r,i)=>{let tr=document.createElement('tr');if(q.labels){let td=tr.insertCell();td.textContent=q.labels[i];}r.forEach(v=>{let td=tr.insertCell();td.textContent=v});q.copy[i].forEach((v,j)=>{let td=tr.insertCell(),k=i*2+j,b=btn(v,()=>{q.marked=q.marked.includes(k)?q.marked.filter(x=>x!==k):[...q.marked,k];b.classList.toggle('selected',q.marked.includes(k))});b.classList.toggle('selected',q.marked.includes(k));td.append(b)});$('rows').append(tr)});$('submit').onclick=()=>{if(q.effect==='revert'){if(locked||!parent.jobCanCommit(mode))return;const token=epoch;locked=true;const buttons=[...t.querySelectorAll('td button')];buttons.forEach((b,k)=>{if(q.marked.includes(k))b.textContent=q.rows[k>>1][k%2];b.classList.remove('selected');});setTimeout(()=>{if(token!==epoch||!mode)return;buttons.forEach((b,k)=>b.textContent=q.copy[k>>1][k%2]);q.marked=[];},180);setTimeout(()=>{if(token!==epoch||!mode)return;locked=false;finish(true)},550);}else finish(q.marked.length===q.bad.length&&q.bad.every(k=>q.marked.includes(k)));};}
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

;
function paperTask(id,q){const t=$('task'),s=state[id];const zones=(labels,offset=0)=>`<div class="zones">${labels.map((v,i)=>`<div class="folder tray-${i}" data-drop="${i+offset}"><span class="stored" style="--stack:${Math.min(5,(s.bins?.[i+offset]||0))}"></span><span class="folder-label">${v}</span><small>${s.bins?.[i+offset]||0} 枚</small></div>`).join('')}</div>`;
 const commit=(v,ok,delay=100,keep=false)=>{s.bins??=[0,0,0];if(!q.rare)s.bins[Number(v)]++;finish(ok,delay,keep)};
 const stack=`<div class="paperstack"><div class="stack-sheets" style="--remaining:${Math.min(8,s.count-s.done)}"></div><small>未処理 ${s.count-s.done}</small></div>`;
 if(id==='stamp'){t.innerHTML=`<div class="stampdesk">${stack}<div class="sheet draggable formpaper" id="paper"><small>経理部 / FORM 01</small><h2>${q.title||"経費精算申請書"}</h2><dl><dt>申請者</dt><dd>${q.name}</dd><dt>申請金額</dt><dd>${yen(q.price)}</dd><dt>本人署名</dt><dd class="signature">${q.signed?q.name:'＿＿＿'}</dd></dl>${q.note?`<small>${q.note}</small>`:""}<div class="stamparea" data-drop="0">${q.effect==='pre-stamped'?'<b class="imprint">承認<br>済</b>':'押印欄'}</div></div><div class="tools"><div class="inkpad" aria-hidden="true"></div><div class="stamp draggable" id="stamp" aria-label="承認印"><span>承認</span></div>${zones(['差し戻し'],1)}</div></div>`;wireDrag($('stamp'),v=>{$('paper').querySelector('.stamparea').innerHTML='<b class="imprint">承認<br>済</b>';finish(q.a===0,260)},['0']);wireDrag($('paper'),v=>commit(v,q.a===1),['1']);}
 if(id==='receipt'){t.innerHTML=`<div class="receiptstage">${stack}<div class="receipt sheet draggable" id="paper"><small>お客様控え</small><h2>領 収 書</h2><div class="receiptline"><span>${q.item}</span><b>${yen(q.price)}</b></div><strong>${yen(q.price)}</strong><hr><small>上記正に領収いたしました</small><div class="barcode"></div></div></div>${zones(['交通費','消耗品費','食費'])}`;wireDrag($('paper'),v=>commit(v,Number(v)===q.a));}
 if(id==='invoice'){t.innerHTML=`<div class="invoicepair draggable" id="paper">${[['請求書',q.quantity],['納品書',q.other]].map(([n,k],i)=>`<div class="sheet formpaper"><small>取引先控え / No. 00429</small><h2>${n}</h2><dl><dt>品目</dt><dd>${q.items?.[i]||"事務用品"}</dd><dt>数量</dt><dd>${k}</dd><dt>単価</dt><dd>${yen(q.price)}</dd><dt>合計</dt><dd>${yen(k*q.price)}</dd></dl><small>${q.notes?.[i]||"東都事務用品株式会社"}</small></div>`).join('')}</div>${zones(['確認済み','要修正'])}`;wireDrag($('paper'),v=>commit(v,Number(v)===q.a));}
 if(id==='folder'){t.innerHTML=`<div class="papers" id="papers"></div>${zones(['営業部','総務部','人事部'])}`;q.cards.forEach(c=>{const el=document.createElement('div');el.className='sheet draggable filepaper';el.style.setProperty('--angle',[-6,3,-3,6][c.i]+'deg');el.innerHTML=`<small>社内資料 / ${c.i+101}</small><h3>${c.name}</h3><div class="department">${['営業部','総務部','人事部'][c.a]||''}</div>${c.body!==undefined?`<div class="rare-document">${c.body}</div>`:`<div class="printlines"></div>`}`;$('papers').append(el);wireDrag(el,v=>{q.cards=q.cards.filter(x=>x!==c);commit(v,Number(v)===c.a,90,q.cards.length>0);});});}
}

;
// Embedded job controller. One persistent instance; parent owns game lifecycle.
let state,active='sales',started=0,locked=false,epoch=0,mode=null;
const ids=type=>JOBS.filter(j=>j[2]===type).map(j=>j[0]);
const copy=v=>JSON.parse(JSON.stringify(v));
function fresh(id,count){return {count,done:0,correct:0,ms:0,q:null};}
function accrue(){if(state&&started){state[active].ms+=performance.now()-started;started=0;}}
function suspend(){accrue();epoch++;cancelDrag();locked=false;mode=null;}
function configure(pc,paper){suspend();state={};for(const [type,counts] of [['PC',pc],['書類',paper]])ids(type).forEach((id,i)=>state[id]=fresh(id,counts[i]));active='sales';resetRare();}
function select(id){if(!mode||!ids(mode).includes(id)||locked)return;accrue();cancelDrag();active=id;if(mode==='PC')parent.jobTabChanged(id);started=performance.now();draw();}
let saving=false;
function applySaving(){const blocked=mode==='PC'&&saving;$('task').inert=blocked;$('menu').inert=blocked;if(blocked)locked=true;}
function show(type,id){if(mode===type&&(!id||active===id))return;suspend();mode=type;active=id|| (ids(type).includes(active)?active:ids(type)[0]);started=performance.now();draw();applySaving();}
function snapshot(){return Object.fromEntries(ids('PC').map(id=>[id,copy({...state[id],q:state[id].q?.rare?null:state[id].q})]));}
function restore(saved){suspend();for(const id of ids('PC'))state[id]=saved?copy(saved[id]):fresh(id,state[id].count);}
function finish(ok,delay=0,keep=false){if(locked||!mode||!parent.jobCanCommit(mode))return;let s=state[active];if(s.done>=s.count)return;locked=true;accrue();let token=epoch;const rare=!!s.q?.rare;if(!rare){s.done++;s.correct+=Number(ok);parent.jobCommitted(active,s.done,s.correct);}if(rare&&s.q.effect==='repeat-mail'&&!s.q.repeated){s.q.repeated=true;}else if(!keep||rare)s.q=null;$('status').textContent='処理済み';const next=()=>{if(token!==epoch||!mode)return;locked=false;started=performance.now();draw();};if(mode==='PC'){
 const task=$('task');task.classList.add('pc-processed');task.querySelectorAll('button').forEach(b=>b.disabled=true);const notice=document.createElement('div');notice.className='pc-confirm';notice.setAttribute('role','status');notice.textContent=`✓ 処理完了　${s.done} / ${s.count} 件`;task.append(notice);$('bar').textContent=`${JOBS.find(j=>j[0]===active)[1]}　残り ${s.count-s.done} 件`;$('status').textContent='処理済み — 次の業務へ';setTimeout(next,PC_FEEDBACK_MS);
 }else if(delay)setTimeout(next,delay);else next();}
function draw(){if(!mode)return;let s=state[active],job=JOBS.find(j=>j[0]===active);$('menu').innerHTML='';$('menu').hidden=mode!=='PC';if(mode==='PC')JOBS.filter(j=>j[2]===mode).forEach(([id,name])=>{let b=document.createElement('button');b.className=id===active?'selected':'';b.textContent=`${name} ${state[id].done}/${state[id].count}`;b.onclick=()=>select(id);$('menu').append(b)});document.body.classList.toggle('pc-gesture',mode==='PC');$('workspace').className=mode==='PC'?'pc':'paper';$('bar').textContent=`${job[1]}　残り ${s.count-s.done} 件`;$('status').textContent='';$('task').classList.remove('pc-processed');$('task').innerHTML='';if(s.done>=s.count){$('task').innerHTML='<div class="complete"><h2>業務完了</h2><p>別の業務を選択してください。</p></div>';started=0;}else{if(!s.q)s.q=nextQuestion(active);if(active==='folder'&&s.q.cards.length>s.count-s.done)s.q.cards=s.q.cards.slice(0,s.count-s.done);(mode==='PC'?pcTask:paperTask)(active,s.q);const note=document.createElement('aside');note.className='job-note';note.textContent=NOTES[active];$('task').prepend(note);}}
window.jobAPI={configure,show,suspend,snapshot,restore,setSound:on=>$('sound').checked=on,setSaving:on=>{saving=on;if(mode==='PC'){if(on){accrue();epoch++;cancelDrag();locked=true;}else{locked=false;started=performance.now();draw();}}applySaving();}};
window.addEventListener('blur',()=>cancelDrag());

// PCタップとフリックを区別。書類ドラッグには一切介入しない。
let flickStart=null, suppressFlickClick=false;
document.addEventListener('pointerdown',e=>{suppressFlickClick=false;flickStart=(mode==='PC'||(mode==='書類'&&!e.target.closest('[data-draggable],button,input,select,textarea')))&&e.isPrimary&&e.button===0?{id:e.pointerId,x:e.clientX,y:e.clientY}:null;},true);
document.addEventListener('pointerup',e=>{const s=flickStart;flickStart=null;if(!s||s.id!==e.pointerId||!mode)return;if(parent.jobFlick(e.clientX-s.x,e.clientY-s.y)){suppressFlickClick=true;e.preventDefault();}},true);
document.addEventListener('pointercancel',()=>{flickStart=null;},true);
document.addEventListener('click',e=>{if(suppressFlickClick){suppressFlickClick=false;e.preventDefault();e.stopImmediatePropagation();}},true);
