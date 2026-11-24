const JOBS=[['sales','売上入力','PC',24],['mail','メール仕分け','PC',16],['compare','データ照合','PC',8],['product','商品登録','PC',10],['stamp','承認・押印','書類',12],['receipt','領収書仕分け','書類',12],['invoice','請求書照合','書類',6],['folder','資料整理','書類',8]];
const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const yen=n=>n.toLocaleString('ja-JP')+'円';

// PC処理完了を表示する時間（ミリ秒）
const PC_FEEDBACK_MS=420;
