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
