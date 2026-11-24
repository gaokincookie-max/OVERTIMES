// 独立した巡回時刻と配電盤の状態を管理。画面の表示有無に依存しない。
const multi = {
    active: false, running: false, rooms: new Occupancy(), agents: [],
    deskOwner: null, deskReady: 0, breakerPhase: 0, breakerElapsed: 0,
    breakerWatch: 0, breakerNext: 0, last: 0, now: 0,
};
function resetMulti() {
    multi.active = false; multi.running = false;
    multi.rooms = new Occupancy(); multi.agents = [];
    multi.deskOwner = null; multi.deskReady = 0;
    multi.breakerPhase = 0; multi.breakerElapsed = 0; multi.breakerWatch = 0;
    multi.now = 0; multi.breakerNext = multiConfig.breakerFirstDelayMs;
    parent.cameraPower(false);
}
function startMulti() {
    if (!multi.active) {
        resetMulti(); multi.active = true;
        multi.agents = [
            {kind:'patrol', room:0, next:cameraConfig.moveMs, idx:1, blocked:0},
            {kind:'light', room:4, next:cameraConfig.moveMs + multiConfig.initialLightDelayMs, idx:1, blocked:0},
        ];
        for (const a of multi.agents) multi.rooms.move(a.kind,a.room);
    }
    multi.running = true; multi.last = performance.now();
    timer = setInterval(tickMulti,multiConfig.tickMs); render(true);
}
function advanceAgent(a) {
    if (multi.deskOwner === a.kind || multi.now < a.next) return;
    const route = routes[a.kind];
    const preferred = route[a.idx % route.length];
    const neighbors = multiConfig.neighbors[a.room] || [];
    const canEnter = d => neighbors.includes(d) && (d < 0
        ? !multi.deskOwner && multi.now >= multi.deskReady && !parent.encounterBusy()
        : !!assets[d]?.[a.kind] && !multi.rooms.owner(d));
    let target = preferred;
    if (!canEnter(target)) {
        a.blocked++;
        // 入口が混雑している場合はその場で待つ。通常の混雑は迂回可能。
        if (preferred < 0 && neighbors.includes(preferred) && a.blocked < multiConfig.blockedRetryLimit) {
            a.next = multi.now + multiConfig.retryMs; return;
        }
        const alternatives = neighbors.filter(d => d >= 0 && canEnter(d));
        if (!alternatives.length) { a.next = multi.now + multiConfig.retryMs; return; }
        target = alternatives[Math.floor(Math.random()*alternatives.length)];
    }
    if (target < 0) {
        // 自席を先に確保。退去先の部屋も予約したままにして衝突を防ぐ。
        multi.deskOwner = a.kind;
        if (!parent.cameraArrival(a.kind,target)) {
            multi.deskOwner = null; a.next = multi.now + multiConfig.retryMs; return;
        }
        a.idx = (a.idx+1)%route.length;
    } else {
        if (!multi.rooms.move(a.kind,target)) return;
        a.room = target;
        const match = route.findIndex((r,i) => r === target && i >= a.idx%route.length);
        a.idx = (target === preferred ? a.idx+1 : (match >= 0 ? match+1 : route.indexOf(target)+1)) % route.length;
    }
    a.blocked = 0; a.next = multi.now + cameraConfig.moveMs;
    render(true);
}
function tickMulti() {
    if (!multi.running) return;
    const now = performance.now(), dt = Math.max(0,now-multi.last);
    multi.last = now; multi.now += dt;
    if (multi.deskOwner && !parent.encounterBusy()) {
        const a = multi.agents.find(a=>a.kind===multi.deskOwner);
        a.next = multi.now + cameraConfig.moveMs;
        multi.deskOwner = null; multi.deskReady = multi.now + multiConfig.deskGraceMs;
        render(true);
    }
    for (const a of multi.agents) advanceAgent(a);
    tickMultiBreaker(dt/1000);
}
function tickMultiBreaker(dt) {
    if (!multi.breakerPhase) {
        if (multi.now < multi.breakerNext) return;
        if (!multi.rooms.move('breaker',6)) return;
        multi.breakerPhase = 1; multi.breakerElapsed = 0; multi.breakerWatch = 0; render(cam===6); return;
    }
    multi.breakerElapsed += dt;
    if (multi.breakerPhase === 3) {
        if (multi.breakerElapsed >= cameraConfig.restoreSeconds) finishMultiBreaker();
        return;
    }
    if (cam===6 && parent.cameraIsWatching()) multi.breakerWatch += dt;
    if (multi.breakerWatch >= cameraConfig.watchSeconds) { finishMultiBreaker(); return; }
    if (multi.breakerElapsed >= cameraConfig.cutSeconds) {
        multi.breakerPhase = 3; multi.breakerElapsed = 0; render(true);
    } else if (multi.breakerElapsed >= cameraConfig.warningSeconds && multi.breakerPhase===1) {
        multi.breakerPhase = 2; render(cam===6);
    }
}
function finishMultiBreaker() {
    multi.rooms.release('breaker'); multi.breakerPhase = 0;
    multi.breakerNext = multi.now + multiConfig.breakerCooldownMs; render(true);
}
function renderMulti(glitch=false) {
    const blackout = multi.breakerPhase===3;
    parent.cameraPower(blackout);
    if (glitch) flash();
    $('base').src=assets[cam].base; $('base').hidden=blackout;
    const owner=multi.rooms.owner(cam);
    const frame=blackout || owner===multi.deskOwner ? null : owner==='breaker'
        ? assets[cam].breakerFrames?.[multi.breakerPhase-1] : assets[cam][owner];
    const patch=$('patch'); patch.hidden=!frame;
    if(frame){const {src,box:[x,y,r,b]}=frame;patch.src=src;Object.assign(patch.style,{left:x/1448*100+'%',top:y/1086*100+'%',width:(r-x)/1448*100+'%',height:(b-y)/1086*100+'%'});}
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===cam)));
    $('title').textContent='CAM '+String(cam+1).padStart(2,'0')+' / '+names[cam];
    $('status').textContent=blackout?'停電 / 映像信号なし':multi.running?'統合巡回中 / 映像で位置を確認':'統合巡回停止中';
    $('mode').textContent=multi.running?'統合巡回停止':'統合巡回開始';
    $('mode').setAttribute('aria-pressed',String(multi.running));
    $('manual').disabled=true; $('step').disabled=true;
}
