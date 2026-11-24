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
