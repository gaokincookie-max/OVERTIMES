function isUnder() {
    return view === 'look' || view === 'hide';
}
function underFrame() {
    if (riseFrame)
        return riseFrame;
    let suffix = dark ? 'dark' : 'normal';
    if (view !== 'hide' || phase === 'none')
        return view + '_' + suffix;
    let key = eventType + '_' + phase + '_' + suffix;
    return A[key] ? key : 'hide_' + suffix;
}
function blink(fn) {
    clearTimeout(blinkTimer);
    $('blink').classList.add('closed');
    blinkTimer = setTimeout(() => {
        fn();
        $('blink').classList.remove('closed');
    }, config.blinkMs);
}
function cancelEvent() {
    clearTimeout(eventTimer);
    eventTimer = null;
    phase = 'none';
    eventType = null;
}
function transitionPhase(next) {
    blink(() => {
        phase = next;
        render();
    });
    if (next === 'none')
        eventType = null;
}
function startEvent() {
    if (encounter || view !== 'hide')
        return;
    cancelEvent();
    eventType = $('eventKind').value;
    let type = eventType;
    if (type === 'patrol') {
        transitionPhase('pass');
        eventTimer = setTimeout(() => {
            transitionPhase('stop');
            eventTimer = setTimeout(() => transitionPhase('none'), config.stopMs);
        }, config.passMs);
    }
    else if (dark && !monitorOn) {
        transitionPhase('pass');
        eventTimer = setTimeout(() => transitionPhase('none'), config.passMs);
    }
    else {
        transitionPhase('stop');
        eventTimer = setTimeout(() => {
            if (dark && !monitorOn) {
                cancelEvent();
                render();
                return;
            }
            transitionPhase('peek');
            eventTimer = setTimeout(() => {
                cancelEvent();
                blink(render);
                notify('襲撃演出終了（試作）');
            }, config.peekMs);
        }, config.stopMs);
    }
}
$('under').onclick = () => {
    if (!isUnder())
        lastDesk = view;
    change('look');
};
$('underAction').onclick = () => change(view === 'look' ? 'hide' : 'look');
$('testEvent').onclick = startEvent;
$('clearEvent').onclick = () => {
    clearEncounter();
    cancelEvent();
    blink(render);
};
