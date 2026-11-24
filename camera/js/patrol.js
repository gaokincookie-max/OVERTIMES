function step() {
    if (parent.encounterBusy())
        return;
    manual = false;
    const prev = loc;
    let r = routes[$('kind').value];
    loc = r[idx++ % r.length];
    render(prev === cam || loc === cam);
    if (loc < 0)
        parent.cameraArrival($('kind').value, loc);
}
function stop() {
    if (timer)
        clearInterval(timer);
    timer = null;
}
window.pausePatrol = () => {
    stop();
    render();
};
$('mode').onclick = () => {
    if ($('kind').value === 'breaker') {
        if (timer) {
            stop();
            render();
        }
        else {
            manual = false;
            startBreaker();
        }
        return;
    }
    if (timer) {
        stop();
        parent.cancelCameraEncounter();
        render();
    }
    else {
        manual = false;
        step();
        timer = setInterval(step, cameraConfig.moveMs);
        render();
    }
};
$('step').onclick = () => {
    stop();
    if ($('kind').value === 'breaker') {
        manual = true;
        breakerPhase = (breakerPhase + 1) % 4;
        render(true);
        return;
    }
    step();
};
$('manual').onclick = () => {
    stop();
    parent.cancelCameraEncounter();
    loc = null;
    if ($('kind').value === 'breaker') {
        manual = true;
        breakerPhase = 1;
        cam = 6;
        render(true);
        return;
    }
    manual = !manual;
    render(true);
};
$('reset').onclick = () => {
    stop();
    parent.cancelCameraEncounter();
    manual = false;
    loc = null;
    idx = 0;
    breakerPhase = 0;
    render(true);
};
$('kind').onchange = () => {
    stop();
    parent.cancelCameraEncounter();
    manual = false;
    loc = null;
    idx = 0;
    breakerPhase = 0;
    updateBreakerButtons();
    render(true);
};
$('expand').onclick = () => {
    $('map').classList.toggle('big');
    $('expand').textContent = $('map').classList.contains('big') ? '縮小' : '拡大';
};
$('toggleMap').onclick = () => {
    $('map').classList.toggle('hide');
    $('toggleMap').textContent = $('map').classList.contains('hide') ? '地図 表示' : '地図 非表示';
};
