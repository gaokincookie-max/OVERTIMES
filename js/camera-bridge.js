$('retry').onclick = () => $('reset').click();
window.cameraPower = function (out) {
    if (out === powerOut)
        return;
    powerOut = out;
    if (out) {
        prePower = { dark, monitorOn };
        clearTimeout(saveTimer);
        saveTimer = null;
        pcRemain = [...pcSaved];
        rollbackJobs();
        dark = true;
        monitorOn = false;
        closePC();
        closeJob();
        drawPC();
        notify('停電：未保存のPC作業を消失');
    }
    else if (prePower) {
        dark = prePower.dark;
        monitorOn = prePower.monitorOn;
        prePower = null;
        notify('電力復旧');
    }
    render();
};
$('camera').onclick = () => change('camera');
$('cameraBack').onclick = () => change('pc');
$('cameraFrame').addEventListener('load', () => {
    const d = $('cameraFrame').contentDocument;
    if (!d)
        return;
    const screen = d.querySelector('.screen');
    if (!screen)
        return;
    let start = null;
    const finish = (x, y) => {
        if (!start)
            return;
        const dx = x - start.x, dy = y - start.y;
        start = null;
        if (view === 'camera' && dy <= -35 && -dy > Math.abs(dx) * 1.2)
            change('pc');
    };
    const eligible = e => !e.target.closest('button,select,.map');
    if ('PointerEvent' in d.defaultView) {
        screen.addEventListener('pointerdown', e => {
            start = null;
            if (!e.isPrimary || !eligible(e))
                return;
            start = { x: e.clientX, y: e.clientY, id: e.pointerId };
            try {
                screen.setPointerCapture(e.pointerId);
            }
            catch (_) {
            }
        });
        screen.addEventListener('pointerup', e => {
            if (start && start.id === e.pointerId)
                finish(e.clientX, e.clientY);
        });
        screen.addEventListener('pointercancel', () => {
            start = null;
        });
        screen.addEventListener('lostpointercapture', () => {
            start = null;
        });
    }
    else {
        screen.addEventListener('touchstart', e => {
            start = null;
            if (e.touches.length !== 1 || !eligible(e))
                return;
            const t = e.touches[0];
            start = { x: t.clientX, y: t.clientY };
        }, { passive: true });
        screen.addEventListener('touchend', e => {
            const t = e.changedTouches[0];
            if (t)
                finish(t.clientX, t.clientY);
        });
        screen.addEventListener('touchcancel', () => {
            start = null;
        });
    }
});
$('cameraFrame').src = 'camera/index.html';
