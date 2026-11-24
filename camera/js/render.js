const buttons = [];
pos.forEach(([x, y], i) => {
    let b = document.createElement('button');
    b.className = 'cam';
    b.style.left = x / 390 * 100 + '%';
    b.style.top = y / 320 * 100 + '%';
    b.textContent = '0' + (i + 1);
    b.setAttribute('aria-label', names[i]);
    b.onclick = () => {
        cam = i;
        render(true);
        $('map').classList.remove('big');
        $('expand').textContent = '拡大';
    };
    $('cams').append(b);
    buttons.push(b);
});
function flash() {
    let e = $('noise');
    e.classList.remove('on');
    void e.offsetWidth;
    e.classList.add('on');
}
function render(glitch = false) {
    if ($('kind').value === 'multi') { renderMulti(glitch); return; }
    $('manual').disabled = false; $('step').disabled = false;
    parent.cameraPower($('kind').value === 'breaker' && breakerPhase === 3);
    if ($('kind').value === 'breaker') {
        renderBreaker(glitch);
        return;
    }
    $('base').hidden = false;
    const a = assets[cam], k = $('kind').value, visible = (manual || loc === cam) && a[k];
    if (glitch)
        flash();
    $('base').src = a.base;
    const patch = $('patch');
    patch.hidden = !visible;
    if (visible) {
        const { src, box: [x, y, r, b] } = visible;
        patch.src = src;
        Object.assign(patch.style, { left: x / 1448 * 100 + '%', top: y / 1086 * 100 + '%', width: (r - x) / 1448 * 100 + '%', height: (b - y) / 1086 * 100 + '%' });
    }
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === cam)));
    $('title').textContent = 'CAM ' + String(cam + 1).padStart(2, '0') + ' / ' + names[cam];
    $('status').textContent = manual ? '差分比較モード' + (cam === 6 ? '（電気室は通常画像のみ）' : '') : loc === -1 ? '左入口へ移動（映像なし）' : loc === -2 ? '右入口へ移動（映像なし）' : timer ? '巡回中 / 映像で位置を確認' : '監視中';
    $('manual').setAttribute('aria-pressed', String(manual));
    $('mode').setAttribute('aria-pressed', String(!!timer));
    $('mode').textContent = timer ? '巡回停止' : '巡回開始';
}
