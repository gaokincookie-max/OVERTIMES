const assets = [
    {
        "base": "../assets/camera/cam01/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam01/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam01/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    },
    {
        "base": "../assets/camera/cam02/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam02/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam02/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    },
    {
        "base": "../assets/camera/cam03/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam03/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam03/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    },
    {
        "base": "../assets/camera/cam04/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam04/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam04/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    },
    {
        "base": "../assets/camera/cam05/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam05/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam05/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    },
    {
        "base": "../assets/camera/cam06/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam06/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam06/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    },
    {
        "base": "../assets/camera/cam07/base.jpg",
        "breakerFrames": [
            {
                "src": "../assets/camera/cam07/breaker_1.webp",
                "box": [
                    576,
                    293,
                    751,
                    833
                ]
            },
            {
                "src": "../assets/camera/cam07/breaker_2.webp",
                "box": [
                    458,
                    350,
                    843,
                    936
                ]
            }
        ]
    },
    {
        "base": "../assets/camera/cam08/base.jpg",
        "patrol": {
            "src": "../assets/camera/cam08/patrol.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        },
        "light": {
            "src": "../assets/camera/cam08/light.jpg",
            "box": [
                0,
                0,
                1448,
                1086
            ]
        }
    }
];


const cameraConfig = { moveMs: 6500, watchSeconds: 3, warningSeconds: 12, cutSeconds: 20, restoreSeconds: 18 };
const names = ['休憩室', '会議室・左通路', '複合機', '中央通路', '給湯室', '書庫・右通路', '電気室', '倉庫'];
const pos = [[66, 57], [66, 151], [66, 239], [193, 183], [193, 57], [322, 151], [322, 57], [322, 239]];
const routes = { patrol: [0, 1, 3, 2, -1, 0, 1, 3, 5, 7, -2, 7, 5, 3], light: [4, 3, 5, 7, -2, 7, 5, 3, 1, 2, -1, 2, 3] };
// 統合モードの暫定値。地点番号は0始まり、-1/-2は入口。
const nightAI = {lightAfterPatrol:[2,3],first:{patrol:[67,117],light:[200,260],breaker:[233,333]}, patrolMove:[[25,40],[22,35],[20,30],[17,27],[15,24],[12,20]], lightMove:[[25,35],[25,35],[22,32],[18,28],[15,25],[12,22]], patrolRest:[[45,65],[40,55],[30,45],[25,40],[20,30],[15,25]], lightRest:[[55,75],[45,65],[35,55],[30,45],[25,40],[20,35]], breakerRest:[[75,100],[75,100],[65,90],[55,80],[45,65],[35,55]], breakerWarning:[25,25,23,22,20,20], deskChance:[.45,.55,.65,.75,.85,.95], grace:[10,10,7,7,4,4]};
const multiConfig = {
    tickMs: 100, retryMs: 2000, blockedRetryLimit: 4,
    deskGraceMs: 4000, initialLightDelayMs: 3500,
    breakerFirstDelayMs: 8000, breakerCooldownMs: 25000,
    // 見取り図に存在する接続のみ。電気室は専用素材のみのため除外。
    neighbors: {0:[1],1:[0,2,3],2:[1,3,-1],3:[1,2,4,5,7],4:[3],5:[3,7],7:[3,5,-2]},
};


let cam = 3, idx = 0, loc = null, timer = null, manual = false;
const $ = id => document.getElementById(id);


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
    multi.running = false;
}
window.pausePatrol = () => {
    stop();
    render();
};
$('mode').onclick = () => {
    if ($('kind').value === 'multi') {
        if (timer) { stop(); parent.cancelCameraEncounter(); resetMulti(); render(true); }
        else startMulti();
        return;
    }
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
    resetMulti();
    parent.cancelCameraEncounter();
    manual = false;
    loc = null;
    idx = 0;
    breakerPhase = 0;
    render(true);
};
$('kind').onchange = () => {
    stop();
    resetMulti();
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


// 1地点につき1体。移動判定と確保を同じ同期処理で行う。
class Occupancy {
    constructor() { this.rooms = new Map(); }
    move(kind, destination) {
        const owner = this.rooms.get(destination);
        if (owner && owner !== kind) return false;
        this.release(kind);
        this.rooms.set(destination, kind);
        return true;
    }
    release(kind) {
        for (const [room, owner] of this.rooms) if (owner === kind) this.rooms.delete(room);
    }
    owner(room) { return this.rooms.get(room); }
}


// 独立した巡回時刻と配電盤の状態を管理。画面の表示有無に依存しない。
const multi = {
    active: false, running: false, story:false, pending:[], patrolPasses:0, lightGate:2, rooms: new Occupancy(), agents: [],
    deskOwner: null, deskReady: 0, breakerPhase: 0, breakerElapsed: 0,
    breakerWatch: 0, breakerNext: 0, last: 0, now: 0,
};
function resetMulti() {
    multi.active = false; multi.running = false; multi.story=false; multi.pending=[]; multi.patrolPasses=0; multi.lightGate=nightAI.lightAfterPatrol[0]+Math.floor(Math.random()*(nightAI.lightAfterPatrol[1]-nightAI.lightAfterPatrol[0]+1));
    multi.rooms = new Occupancy(); multi.agents = [];
    multi.deskOwner = null; multi.deskReady = 0;
    multi.breakerPhase = 0; multi.breakerElapsed = 0; multi.breakerWatch = 0;
    multi.now = 0; multi.breakerNext = multiConfig.breakerFirstDelayMs;
    parent.cameraPower(false);
}
function hour(){return Math.min(5,Math.floor(multi.now/200000));}
function rangeMs(r){return (r[0]+Math.random()*(r[1]-r[0]))*1000;}
function moveDelay(a){return multi.story?rangeMs(nightAI[a.kind+"Move"][hour()]):cameraConfig.moveMs;}
function startMulti(story=false) {
    if (!multi.active) {
        resetMulti(); multi.active = true;
        multi.agents = [
            {kind:'patrol', room:0, next:cameraConfig.moveMs, idx:1, blocked:0},
            {kind:'light', room:4, next:cameraConfig.moveMs + multiConfig.initialLightDelayMs, idx:1, blocked:0},
        ];
        multi.story=story;
        if(story){multi.pending=multi.agents.map(a=>({...a,spawn:rangeMs(nightAI.first[a.kind])}));multi.agents=[];multi.breakerNext=rangeMs(nightAI.first.breaker);}
        else for (const a of multi.agents) multi.rooms.move(a.kind,a.room);
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
    if(multi.story && preferred<0 && neighbors.includes(preferred) && Math.random()>nightAI.deskChance[hour()]) target=neighbors.filter(d=>d>=0&&canEnter(d))[0]??preferred;
    if (!canEnter(target)) {
        a.blocked++;
        // 入口が混雑している場合はその場で待つ。通常の混雑は迂回可能。
        if (target < 0 && neighbors.includes(target) && a.blocked < multiConfig.blockedRetryLimit) {
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
    a.blocked = 0; a.next = multi.now + moveDelay(a);
    render(parent.cameraIsWatching());
}
function tickMulti() {
    if (!multi.running) return;
    const now = performance.now(), dt = Math.max(0,now-multi.last);
    multi.last = now; multi.now += dt;
    for(const a of [...multi.pending]) if(multi.now>=a.spawn && (a.kind!=='light'||multi.patrolPasses>=multi.lightGate) && multi.rooms.move(a.kind,a.room)){a.next=multi.now+moveDelay(a);multi.agents.push(a);multi.pending=multi.pending.filter(x=>x!==a);render(parent.cameraIsWatching());}
    if (multi.deskOwner && !parent.encounterBusy()) {
        const a = multi.agents.find(a=>a.kind===multi.deskOwner);
        a.next = multi.now + (multi.story?rangeMs(nightAI[a.kind+"Rest"][hour()]):cameraConfig.moveMs);
        if(a.kind==='patrol') multi.patrolPasses++;
        multi.deskOwner = null; multi.deskReady = multi.now + (multi.story?nightAI.grace[hour()]*1000:multiConfig.deskGraceMs);
        render(parent.cameraIsWatching());
    }
    for (const a of multi.agents) advanceAgent(a);
    tickMultiBreaker(dt/1000);
}
function tickMultiBreaker(dt) {
    if (!multi.breakerPhase) {
        if (multi.now < multi.breakerNext) return;
        if (!multi.rooms.move('breaker',6)) return;
        multi.cutSeconds=nightAI.breakerWarning[hour()]; multi.breakerPhase = 1; multi.breakerElapsed = 0; multi.breakerWatch = 0; render(parent.cameraIsWatching()); return;
    }
    multi.breakerElapsed += dt;
    if (multi.breakerPhase === 3) {
        if (multi.breakerElapsed >= cameraConfig.restoreSeconds) finishMultiBreaker();
        return;
    }
    if (cam===6 && parent.cameraIsWatching()) multi.breakerWatch += dt;
    if (multi.breakerWatch >= cameraConfig.watchSeconds) { finishMultiBreaker(); return; }
    if (multi.breakerElapsed >= (multi.story?multi.cutSeconds:cameraConfig.cutSeconds)) {
        multi.breakerPhase = 3; multi.breakerElapsed = 0; render(true);
    } else if (multi.breakerElapsed >= cameraConfig.warningSeconds && multi.breakerPhase===1) {
        multi.breakerPhase = 2; render(cam===6);
    }
}
function finishMultiBreaker() {
    multi.rooms.release('breaker'); multi.breakerPhase = 0;
    multi.breakerNext = multi.now + (multi.story?rangeMs(nightAI.breakerRest[hour()]):multiConfig.breakerCooldownMs); render(parent.cameraIsWatching());
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
    $('status').textContent=multi.story?'監視中':blackout?'停電 / 映像信号なし':multi.running?'統合巡回中 / 映像で位置を確認':'統合巡回停止中';
    $('mode').textContent=multi.running?'統合巡回停止':'統合巡回開始';
    $('mode').setAttribute('aria-pressed',String(multi.running));
    $('manual').disabled=true; $('step').disabled=true;
}


window.resetCamera = () => $("reset").click();
render();

window.startNight=()=>{stop();resetMulti();$('kind').value='multi';document.body.classList.add('story');startMulti(true);};
