function cameraAvailable() {
    return monitorOn && !powerOut;
}
window.cameraIsWatching = () => view === "camera" && cameraAvailable() && !defeated;
function cameraUnavailableNotice() {
    notify(powerOut ? "停電中：監視カメラを使用できません" : "モニター消灯中：電源を入れてください");
}
function change(v) {
    if (defeated)
        return;
    if (v === "camera" && !cameraAvailable()) {
        cameraUnavailableNotice();
        return;
    }
    closeJob();
    closePC();
    if (v === view)
        return;
    if (!isUnder() && view !== 'camera')
        lastDesk = view;
    if (!encounter)
        cancelEvent();
    blink(() => {
        if (v === "camera" && !cameraAvailable()) {
            cameraUnavailableNotice();
            return;
        }
        view = v;
        render();
    });
}
$('pc').onclick = () => change('pc');
$('left').onclick = () => change('left');
$('right').onclick = () => change('right');
$('close').onclick = closeJob;
function setLight(on) {
    if (defeated || phase === 'peek' || powerOut)
        return;
    dark = !on;
    closeJob();
    if (!encounter && eventType === 'light' && phase === 'stop' && safeFrom('light')) {
        cancelEvent();
        eventType = 'light';
        phase = 'pass';
        eventTimer = setTimeout(() => transitionPhase('none'), config.passMs);
    }
    render();
}
$('light').onclick = () => setLight(dark);
$('labels').onclick = () => {
    labels = !labels;
    render();
};
$('reset').onclick = () => {
    try {
        $('cameraFrame').contentWindow.resetCamera();
    }
    catch (e) {
    }
    ;
    clearEncounter();
    cancelEvent();
    used.clear();
    remain = [...config.counts];
    sleep = config.initialSleep;
    foodUntil = 0;
    dark = false;
    powerOut = false; prePower = null; view = 'pc'; lastDesk = 'pc';
    resetJobs();
    resetPC();
    closeJob();
    render();
};
$('stage').addEventListener('pointerdown', e => {
    if (e.target.closest('#pcZoom,#remoteUI'))
        return;
    gesture = [e.clientX, e.clientY];
});
$('stage').addEventListener('pointerup', e => {
    if (!gesture)
        return;
    let dx = e.clientX - gesture[0], dy = e.clientY - gesture[1];
    gesture = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.4)
        change(dx < 0 ? (view === 'left' ? 'pc' : 'right') : (view === 'right' ? 'pc' : 'left'));
    else if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        if (dy < 0)
            change(view === 'look' ? 'hide' : view === 'hide' ? 'hide' : 'look');
        else if (isUnder())
            change(view === 'hide' ? 'look' : lastDesk);
        else
            change('camera');
    }
});
