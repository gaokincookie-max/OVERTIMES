function dirtyPC() {
    return pcRemain.some((n, i) => n !== pcSaved[i]);
}
function syncPC() {
    const isPC = view === 'pc';
    $('pc').classList.toggle('active', isPC);
    $('pcLayer').hidden = !isPC || !!riseFrame;
    $('screenTap').hidden = !monitorOn;
    $('monitorKey').classList.toggle('off', !monitorOn);
    $('pcZoom').hidden = !isPC || !pcZoomed || !monitorOn;
    $('screenStatus').textContent = (dirtyPC() ? '未保存の変更あり' : '保存済み') + ' / 残務 ' + pcRemain.reduce((a, b) => a + b, 0) + '件';
    $('remoteState').textContent = '部屋の照明：' + (dark ? 'OFF' : 'ON');
    $('remoteOn').disabled = !dark;
    $('remoteOff').disabled = dark;
}
function drawPC() {
    $('pcRows').replaceChildren();
    pcNames.forEach((n, i) => {
        const row = document.createElement('div');
        row.className = 'pcrow';
        const t = document.createElement('span');
        t.textContent = n;
        const count = document.createElement('span');
        count.textContent = pcRemain[i] + '件';
        const b = document.createElement('button');
        b.textContent = '1件処理';
        b.disabled = pcRemain[i] === 0;
        b.onclick = () => {
            pcRemain[i]--;
            syncPC();
            drawPC();
        };
        row.append(t, count, b);
        $('pcRows').append(row);
    });
    $('pcStatus').textContent = saveTimer ? '保存中…' : dirtyPC() ? '未保存の変更があります' : '保存済み';
    $('pcSave').disabled = !!saveTimer || !dirtyPC();
}
function closePC() {
    pcZoomed = false;
    $('remoteUI').hidden = true;
    syncPC();
}
function resetPC() {
    clearTimeout(saveTimer);
    saveTimer = null;
    monitorOn = true;
    pcRemain = [...config.pcCounts];
    pcSaved = [...config.pcCounts];
    closePC();
    drawPC();
}
function switchMonitor(on) {
    if (powerOut) {
        notify('停電中');
        return;
    }
    monitorOn = on;
    if (!on)
        pcZoomed = false;
    if (!encounter && eventType === 'light' && phase === 'stop' && safeFrom('light')) {
        cancelEvent();
        eventType = 'light';
        phase = 'pass';
        eventTimer = setTimeout(() => transitionPhase('none'), config.passMs);
    }
    syncPC();
    drawPC();
    notify(on ? 'モニター点灯' : 'モニター消灯（作業データ維持）');
}
$('powerImg').src = A.monitor_button;
$('remoteImg').src = A.remote;
$('screenTap').onclick = () => {
    pcZoomed = true;
    syncPC();
    drawPC();
};
$('pcBack').onclick = () => {
    pcZoomed = false;
    syncPC();
};
$('monitorKey').onclick = () => switchMonitor(!monitorOn);
$('pcSave').onclick = () => {
    const snapshot = [...pcRemain];
    saveTimer = setTimeout(() => {
        pcSaved = snapshot;
        saveTimer = null;
        syncPC();
        drawPC();
        notify('保存完了');
    }, config.saveMs);
    drawPC();
};
function openRemote() {
    $('remoteUI').hidden = false;
    syncPC();
}
$('remoteKey').onclick = openRemote;
$('remoteClose').onclick = () => {
    $('remoteUI').hidden = true;
};
$('remoteOn').onclick = () => {
    setLight(true);
    $('remoteUI').hidden = true;
};
$('remoteOff').onclick = () => {
    setLight(false);
    $('remoteUI').hidden = true;
};
