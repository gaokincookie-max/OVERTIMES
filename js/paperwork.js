function openJob(i) {
    if (dark) {
        notify('暗くて書類が読めない');
        return;
    }
    if (!remain[i]) {
        notify('この業務は完了済み');
        return;
    }
    selected = i;
    $('veil').hidden = false;
    showJob();
}
function showJob() {
    let i = selected, n = remain[i], total = config.counts[i];
    $('jobtitle').textContent = jobs[i][1];
    $('content').innerHTML = `<p>未処理 ${n} / ${total} 件</p><div class="progress"><i style="width:${(1 - n / total) * 100}%"></i></div><p>業務UIの仮画面です。処理ボタンで書類の減少を確認できます。</p><div class="actions"><button id="one">1件処理</button><button id="three">3件処理</button><button id="all">すべて処理</button></div>`;
    for (let [id, num] of [['one', 1], ['three', 3], ['all', n]])
        $(id).onclick = () => {
            remain[i] = Math.max(0, remain[i] - num);
            render();
            if (!remain[i]) {
                closeJob();
                notify('業務完了');
            }
            else
                showJob();
        };
}
function closeJob() {
    $('veil').hidden = true;
    selected = -1;
}
