// 配電盤の住人：既存の巡回処理とは独立した試作モード。
let breakerPhase = 0, breakerElapsed = 0, breakerWatch = 0, breakerLast = 0;
function updateBreakerButtons() {
    const on = $('kind').value === 'breaker';
    $('step').textContent = on ? '次の状態へ' : '1地点進む';
    $('manual').textContent = on ? '電気室に出現' : '表示中のカメラに出現';
}
function renderBreaker(glitch = false) {
    if (glitch)
        flash();
    const blackout = breakerPhase === 3;
    const patch = $('patch');
    $('base').src = assets[cam].base;
    $('base').hidden = blackout;
    const image = cam === 6 && (breakerPhase === 1 || breakerPhase === 2) ? assets[6].breakerFrames[breakerPhase - 1] : null;
    patch.hidden = !image;
    if (image) {
        const { src, box: [x, y, r, b] } = image;
        patch.src = src;
        Object.assign(patch.style, { left: x / 1448 * 100 + '%', top: y / 1086 * 100 + '%', width: (r - x) / 1448 * 100 + '%', height: (b - y) / 1086 * 100 + '%' });
    }
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === cam)));
    $('title').textContent = 'CAM ' + String(cam + 1).padStart(2, '0') + ' / ' + names[cam];
    $('status').textContent = blackout ? '停電 / 映像信号なし' : manual ? '差分比較モード' : timer ? '監視中 / 電気室を確認' : '監視中';
    $('manual').setAttribute('aria-pressed', String(manual));
    $('mode').setAttribute('aria-pressed', String(!!timer));
    $('mode').textContent = timer ? '試験停止' : '試験開始';
}
function startBreaker() {
    breakerPhase = 1;
    breakerElapsed = 0;
    breakerWatch = 0;
    breakerLast = performance.now();
    timer = setInterval(() => {
        const now = performance.now(), dt = (now - breakerLast) / 1000;
        breakerLast = now;
        breakerElapsed += dt;
        if (breakerPhase === 1 || breakerPhase === 2) {
            if (cam === 6 && parent.cameraIsWatching())
                breakerWatch += dt;
            if (breakerWatch >= cameraConfig.watchSeconds) {
                breakerPhase = 0;
                stop();
                render(true);
                $('status').textContent = '監視成功 / 怪異が消失';
                return;
            }
            if (breakerElapsed >= cameraConfig.cutSeconds) {
                breakerPhase = 3;
                breakerElapsed = 0;
                render(true);
                parent.cameraPower(true);
            }
            else if (breakerElapsed >= cameraConfig.warningSeconds && breakerPhase === 1) {
                breakerPhase = 2;
                render(cam === 6);
            }
        }
        else if (breakerPhase === 3 && breakerElapsed >= cameraConfig.restoreSeconds) {
            breakerPhase = 0;
            stop();
            render(true);
            parent.cameraPower(false);
            $('status').textContent = '電力復旧';
        }
    }, 100);
    render(true);
}
