// Shared encounter state: independent of the currently visible screen.
const risePreload = Object.keys(A).filter(k => k.startsWith('light_rise_') || k.startsWith('patrol_attack_')).map(k => {
    const img = new Image();
    img.src = A[k];
    return img;
});
const safeFrom = t => t === 'patrol' ? view === 'hide' : dark && !monitorOn;
function encounterPhase(p) {
    phase = p;
    if (view === 'hide')
        blink(render);
    else
        render();
}
function clearEncounter() {
    clearTimeout(encounterTimer);
    encounterTimer = null;
    encounter = null;
    defeated = false;
    riseFrame = null;
    clearTimeout(blinkTimer);
    $('blink').classList.remove('closed');
    phase = 'none';
    eventType = null;
    $('failure').hidden = true;
}
window.encounterBusy = () => !!encounter || defeated;
window.cancelCameraEncounter = () => {
    if (defeated)
        return;
    if (encounter) {
        clearEncounter();
        render();
    }
};
window.cameraArrival = function (type, side) {
    if (encounter || defeated)
        return;
    cancelEvent();
    encounter = { type, side, stage: 'approach' };
    eventType = type;
    notify((side === -1 ? '左' : '右') + '入口から足音がする…');
    encounterTimer = setTimeout(resolveArrival, config.arrivalMs);
};
function resolveArrival() {
    if (!encounter)
        return;
    const t = encounter.type;
    encounter.stage = 'present';
    if (t === 'patrol' && !safeFrom(t)) {
        loseEncounter(t);
        return;
    }
    if (t === 'light' && !safeFrom(t)) {
        encounterPhase('stop');
        encounterTimer = setTimeout(() => {
            if (safeFrom(t))
                beginPass();
            else
                loseEncounter(t);
        }, config.encounterHoldMs);
        return;
    }
    beginPass();
}
function beginPass() {
    if (!encounter)
        return;
    encounter.stage = 'pass';
    encounterPhase('pass');
    encounterTimer = setTimeout(() => {
        if (!encounter)
            return;
        if (!safeFrom(encounter.type)) {
            loseEncounter(encounter.type);
            return;
        }
        if (encounter.type === 'patrol') {
            encounter.stage = 'hold';
            encounterPhase('stop');
            encounterTimer = setTimeout(endPass, config.encounterHoldMs);
        }
        else
            endPass();
    }, config.encounterPassMs);
}
function endPass() {
    if (!encounter)
        return;
    if (!safeFrom(encounter.type)) {
        loseEncounter(encounter.type);
        return;
    }
    clearEncounter();
    if (view === 'hide')
        blink(render);
    else
        render();
    notify('怪異が通り過ぎた');
}
function loseEncounter(t) {
    if (defeated)
        return;
    clearTimeout(encounterTimer);
    defeated = true;
    encounter.stage = 'failed';
    try {
        $('cameraFrame').contentWindow.pausePatrol();
    }
    catch (_) {
    }
    closePC();
    closeJob();
    clearTimeout(blinkTimer);
    $('blink').classList.remove('closed');
    const finish = () => {
        $('failureReason').textContent = t === 'patrol' ? '巡回社員に発見された' : '光反応型に発見された';
        $('failure').hidden = false;
    };
    if (t === 'patrol') {
        const suffix = dark ? 'dark' : 'normal';
        // Instantly force the slightly raised monitor view, even if the player is at CCTV, eating or doing paperwork.
        $('blink').classList.add('closed');
        encounterTimer = setTimeout(() => {
            view = 'pc';
            phase = 'none';
            riseFrame = 'patrol_attack_pre_' + suffix;
            render();
            $('blink').classList.remove('closed');
            encounterTimer = setTimeout(() => {
                $('blink').classList.add('closed');
                encounterTimer = setTimeout(() => {
                    riseFrame = 'patrol_attack_hit_' + suffix;
                    render();
                    $('blink').classList.remove('closed');
                    encounterTimer = setTimeout(finish, config.patrolHitMs);
                }, config.blinkMs);
            }, config.patrolPreMs);
        }, config.blinkMs);
    }
    else if (view === 'hide') {
        phase = 'peek';
        render();
        encounterTimer = setTimeout(finish, config.peekMs);
    }
    else if (t === 'light') {
        const suffix = dark ? 'dark' : 'normal';
        view = 'look';
        phase = 'peek';
        riseFrame = 'light_rise_pre_' + suffix;
        render();
        encounterTimer = setTimeout(() => {
            riseFrame = 'light_rise_hit_' + suffix;
            render();
            encounterTimer = setTimeout(finish, config.riseHitMs);
        }, config.risePreMs);
    }
    else
        finish();
}
setInterval(() => {
    if (!encounter || defeated)
        return;
    if ((encounter.stage === 'pass' || encounter.stage === 'hold') && !safeFrom(encounter.type))
        loseEncounter(encounter.type);
    else if (encounter.stage === 'present' && encounter.type === 'light' && safeFrom('light')) {
        clearTimeout(encounterTimer);
        beginPass();
    }
}, 100);
