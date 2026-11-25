// Original image keys; paths relative to index.html.
const A = {
    "left_normal": "assets/desk/left_normal.webp",
    "left_dark": "assets/desk/left_dark.webp",
    "right_normal": "assets/desk/right_normal.webp",
    "right_dark": "assets/desk/right_dark.webp",
    "coffee": "assets/items/coffee.webp",
    "onigiri": "assets/items/onigiri.webp",
    "tray": "assets/items/tray.webp",
    "matching_medium": "assets/items/matching_medium.webp",
    "receipt_low": "assets/items/receipt_low.webp",
    "approval_low": "assets/items/approval_low.webp",
    "stamp": "assets/items/stamp.webp",
    "filing_low": "assets/items/filing_low.webp",
    "approval_medium": "assets/items/approval_medium.webp",
    "filing_medium": "assets/items/filing_medium.webp",
    "receipt_high": "assets/items/receipt_high.webp",
    "matching_low": "assets/items/matching_low.webp",
    "approval_high": "assets/items/approval_high.webp",
    "filing_high": "assets/items/filing_high.webp",
    "receipt_medium": "assets/items/receipt_medium.webp",
    "matching_high": "assets/items/matching_high.webp",
    "look_normal": "assets/desk/look_normal.jpg",
    "look_dark": "assets/desk/look_dark.jpg",
    "hide_normal": "assets/desk/hide_normal.jpg",
    "hide_dark": "assets/desk/hide_dark.jpg",
    "patrol_pass_normal": "assets/encounters/patrol_pass_normal.jpg",
    "patrol_stop_normal": "assets/encounters/patrol_stop_normal.jpg",
    "patrol_pass_dark": "assets/encounters/patrol_pass_dark.jpg",
    "patrol_stop_dark": "assets/encounters/patrol_stop_dark.jpg",
    "light_pass_dark": "assets/encounters/light_pass_dark.jpg",
    "light_stop_normal": "assets/encounters/light_stop_normal.jpg",
    "light_peek_normal": "assets/encounters/light_peek_normal.jpg",
    "light_stop_dark": "assets/encounters/light_stop_dark.jpg",
    "light_peek_dark": "assets/encounters/light_peek_dark.jpg",
    "pc_normal": "assets/desk/pc_normal.jpg",
    "pc_dark": "assets/desk/pc_dark.jpg",
    "remote": "assets/items/remote.webp",
    "monitor_button": "assets/items/monitor_button.webp",
    "light_rise_pre_normal": "assets/encounters/light_rise_pre_normal.jpg",
    "light_rise_hit_normal": "assets/encounters/light_rise_hit_normal.jpg",
    "light_rise_pre_dark": "assets/encounters/light_rise_pre_dark.jpg",
    "light_rise_hit_dark": "assets/encounters/light_rise_hit_dark.jpg",
    "patrol_attack_pre_normal": "assets/encounters/patrol_attack_pre_normal.jpg",
    "patrol_attack_hit_normal": "assets/encounters/patrol_attack_hit_normal.jpg",
    "patrol_attack_pre_dark": "assets/encounters/patrol_attack_pre_dark.jpg",
    "patrol_attack_hit_dark": "assets/encounters/patrol_attack_hit_dark.jpg"
};


// Prototype settings (unchanged from v0.11).
const config = {
    // 飲食・眠気（coffee/food は現行の固定配置数の参考値）
    coffee: 3,
    food: 2,
    coffeeEffect: 30,
    foodEffect: 0.35,
    foodDuration: 120,
    initialSleep: 25,
    sleepPerSecond: 0.16,
    nightMs: 1200000, coffeeMs:3000, foodMs:6000, coffeeCost:180, foodCost:250, checkoutMs:2500,
    basePay:8000, speedPay:6000, qualityPay:3000, errorCostPerPercent:100,
    // 業務
    counts: [12, 12, 6, 8],
    pcCounts: [24, 16, 8, 10],
    saveMs: 1200,
    // 視点切り替え・手動テスト
    blinkMs: 100,
    passMs: 650,
    stopMs: 2200,
    peekMs: 1400,
    // 実際の接近・襲撃
    arrivalMs: 6500,
    encounterPassMs: 1100,
    encounterHoldMs: 2200,
    risePreMs: 450,
    riseHitMs: 1400,
    patrolPreMs: 750,
    patrolHitMs: 1400,
};
const jobs = [['approval', '承認・押印', 37, 70, 23, 35], ['receipt', '領収書仕分け', 25, 94, 22, 29], ['matching', '請求書・納品書照合', 59, 95, 25, 34], ['filing', '資料整理', 77, 76, 24, 34]];
const pcNames = ['売上データ入力', 'メール確認', 'データ照合', '商品登録'];


const $ = s => document.getElementById(s);
let view = 'pc', dark = false, labels = false, used = new Set(), remain = [...config.counts], sleep = config.initialSleep, foodUntil = 0, selected = -1, toastTimer, gesture = null;

// under-desk
let phase = 'none', eventType = null, eventTimer = null, blinkTimer = null, lastDesk = 'pc';

// pc
let monitorOn = true, pcZoomed = false, pcRemain = [...config.pcCounts], pcSaved = [...config.pcCounts], saveTimer = null;

// encounters
let powerOut = false, prePower = null;
let encounter = null, encounterTimer = null, defeated = false, riseFrame = null;


function notify(t) {
    $('toast').textContent = t;
    $('jobAlert').textContent = t;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('toast').textContent = ''; $('jobAlert').textContent = ''; }, 2200);
}
function item(key, label, x, y, w, h, fn, id) {
    let b = document.createElement('button');
    b.className = 'item';
    b.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
    b.dataset.label = label;
    b.setAttribute('aria-label', label);
    let im = new Image();
    im.src = A[key];
    im.alt = '';
    b.append(im);
    b.onclick = fn;
    b.hidden = used.has(id);
    $('items').append(b);
}
function stats() {
    $('stats').textContent = `${clockText()}　眠気 ${Math.round(sleep)}%　残務 ${remaining()}件`;
    updateCheckout();
}
function render() {
    // Keep the iframe alive: only the player-facing view is closed.
    $("cameraBlack").hidden = cameraAvailable();
    $("cameraPane").hidden = view !== "camera";
    $("camera").classList.toggle("active", view === "camera");
    $("stage").style.visibility = view === "camera" ? "hidden" : "visible";
    syncPC();
    if (view === "camera") {
        $("underTools").hidden = true;
        $("light").hidden = true;
        $("under").classList.remove("active");
        $("left").classList.remove("active");
        $("right").classList.remove("active");
        stats();
        return;
    }
    $('bg').src = A[underFrame()];
    $('under').classList.toggle('active', isUnder());
    $('underTools').hidden = view !== 'hide';
    $('underAction').hidden = !isUnder() || phase === 'peek';
    $('underAction').textContent = view === 'look' ? '机の下に潜る' : '机から出る';
    $('stage').classList.toggle('scare', !!riseFrame || phase === 'peek' && view === 'hide');
    $('stage').classList.toggle('dark', dark);
    $('stage').classList.toggle('labels', labels);
    $('left').classList.toggle('active', view === 'left');
    $('right').classList.toggle('active', view === 'right');
    $('light').hidden = view === 'pc';
    $('light').textContent = dark ? '点灯' : '消灯';
    $('labels').textContent = labels ? 'ラベル非表示' : 'ラベル表示';
    $('hud').textContent = view === 'pc' ? 'PC業務スペース' : view === 'left' ? '飲食スペース' : view === 'right' ? '書類作業スペース' : view === 'look' ? '足元を見る' : '机の下に隠れている';
    $('items').replaceChildren();
    if (view === 'left') {
        item('coffee', `コーヒー ¥${config.coffeeCost}`, 35, 82, 15, 35, () => consume('coffee'), 'coffee');
        item('onigiri', `おにぎり ¥${config.foodCost}`, 67, 87, 22, 32, () => consume('food'), 'food');
    }
    else if (view === 'right') {
        jobs.forEach(([k, n, x, y, w, h], i) => {
            if (!remain[i])
                return;
            let r = remain[i] / config.counts[i], level = r > 2 / 3 ? 'high' : r > 1 / 3 ? 'medium' : 'low';
            item(k + '_' + level, n + ' ' + remain[i] + '件', x, y, w, h * (level === 'high' ? 1 : level === 'medium' ? .82 : .62), () => openJob(i));
        });
        item('stamp', '印鑑・朱肉', 48, 72, 9, 12, () => openJob(0));
    }
    stats();
}


let eating=null, coffeeUsed=0, foodUsed=0;
function consume(k) {
    if (!gameActive() || eating || checkoutTimer || defeated || view!=='left') return;
    if (dark || powerOut) { notify('暗くて手元が見えない'); return; }
    if(k==='coffee') coffeeUsed++; else foodUsed++;
    eating={kind:k,start:performance.now(),duration:k==='coffee'?config.coffeeMs:config.foodMs};
    $('eatPanel').hidden=false; $('eatText').textContent=k==='coffee'?'コーヒーを飲んでいます…':'おにぎりを食べています…';
    updateEating(performance.now());
}
function updateEating(now){if(!eating)return; const p=Math.min(1,(now-eating.start)/eating.duration);$('eatProgress').value=p; if(p<1)return;const k=eating.kind;cancelEating();if(k==='coffee')sleep=Math.max(0,sleep-config.coffeeEffect);else foodUntil=Date.now()+config.foodDuration*1000;notify(k==='coffee'?'コーヒーを飲んだ':'食事完了：眠気の増加を抑制');render();}
function cancelEating(){eating=null;$('eatPanel').hidden=true;}


// UI bridge: iframe isolates mini-game CSS and pointer gestures from desk navigation.
const pcJobIds=['sales','mail','compare','product'];
const paperJobIds=['stamp','receipt','invoice','folder'];
let jobReady=false, jobMode=null, jobKey=null, savedJobs=null, pcTab='sales';
let pcCorrect=[0,0,0,0], paperCorrect=[0,0,0,0], savedCorrect=[0,0,0,0];
function jobApi(){return jobReady ? $('jobFrame').contentWindow.jobAPI : null;}
function resetJobs(){jobMode=null;jobKey=null;pcTab='sales';savedJobs=null;pcCorrect=config.pcCounts.map(()=>0);savedCorrect=[...pcCorrect];paperCorrect=config.counts.map(()=>0);const api=jobApi();if(api){api.configure(config.pcCounts,config.counts);savedJobs=api.snapshot();api.setSaving(false);}}
function syncJobPane(){const mode=!defeated&&!powerOut&&view==='pc'&&pcZoomed&&monitorOn?'PC':!defeated&&!dark&&!powerOut&&view==='right'&&selected>=0?'書類':null;const key=mode==='書類'?paperJobIds[selected]:null;const api=jobApi();$('jobPane').hidden=!mode;$('jobPane').dataset.mode=mode||'';$('pcBack').hidden=mode!=='PC';$('close').hidden=mode!=='書類';$('pcSave').hidden=mode!=='PC';$('pcStatus').hidden=mode!=='PC';$('jobtitle').textContent=mode==='PC'?'社内業務管理システム':mode==='書類'?jobs[selected][1]:'';if(mode!==jobMode||key!==jobKey){if(api){if(mode)api.show(mode,key||(mode==='PC'?pcTab:null));else api.suspend();}jobMode=mode;jobKey=key;}if(api)api.setSound($('jobSound').checked);}
window.jobCanCommit=mode=>gameActive()&&jobReady&&!defeated&&!powerOut&&!checkoutTimer&&(mode==='PC'?view==='pc'&&pcZoomed&&monitorOn&&!saveTimer:mode==='書類'&&view==='right'&&selected>=0&&!dark);
window.jobTabChanged=id=>{if(pcJobIds.includes(id))pcTab=id;};
window.jobCommitted=(id,done,correct)=>{const i=pcJobIds.indexOf(id),j=paperJobIds.indexOf(id);if(i>=0&&window.jobCanCommit('PC')){pcTab=id;pcRemain[i]=config.pcCounts[i]-done;pcCorrect[i]=correct;drawPC();syncPC();}else if(j===selected&&j>=0&&window.jobCanCommit('書類')){remain[j]=config.counts[j]-done;paperCorrect[j]=correct;render();}stats();};
$('jobFrame').addEventListener('load',()=>{jobReady=!!$('jobFrame').contentWindow.jobAPI;if(!jobReady)return;resetJobs();syncJobPane();});
$('jobSound').onchange=()=>jobApi()?.setSound($('jobSound').checked);
function rollbackJobs(){jobApi()?.restore(savedJobs);pcCorrect=[...savedCorrect];jobMode=null;jobKey=null;jobApi()?.setSaving(false);}

window.addEventListener('DOMContentLoaded',()=>{$('jobFrame').src='jobs/index.html';});


function openJob(i) {
    if (!gameActive() || eating || dark || powerOut || defeated) {notify('暗くて書類が読めない');return;}
    if (!remain[i]) {notify('この業務は完了済み');return;}
    if (!jobReady) {notify('業務システムを読み込み中');return;}
    selected=i; syncJobPane();
}
function closeJob(){selected=-1;syncJobPane();}


function cameraAvailable() {
    return monitorOn && !powerOut;
}
window.cameraIsWatching = () => gameActive() && view === "camera" && cameraAvailable() && !defeated;
function cameraUnavailableNotice() {
    notify(powerOut ? "停電中：監視カメラを使用できません" : "モニター消灯中：電源を入れてください");
}
function change(v) {
    if (defeated || !gameActive() || eating || checkoutTimer) return;
    closeJob();
    closePC();
    if (v === view)
        return;
    if (!isUnder() && view !== 'camera')
        lastDesk = view;
    if (!encounter)
        cancelEvent();
    blink(() => {
        if (!gameActive() || defeated) return;
        view = v;
        render();
    });
}
$('pc').onclick = () => change('pc');
$('left').onclick = () => change('left');
$('right').onclick = () => change('right');
$('close').onclick = closeJob;
function setLight(on) {
    if (!gameActive() || eating || checkoutTimer || defeated || phase === 'peek' || powerOut)
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


function dirtyPC() {
    return pcRemain.some((n, i) => n !== pcSaved[i]);
}
function syncPC() {
    const isPC = view === 'pc';
    $('pc').classList.toggle('active', isPC);
    $('pcLayer').hidden = !isPC || !!riseFrame;
    $('screenTap').hidden = !monitorOn;
    $('monitorKey').classList.toggle('off', !monitorOn);
    syncJobPane();
    $('screenStatus').textContent = (dirtyPC() ? '未保存の変更あり' : '保存済み') + ' / 残務 ' + pcRemain.reduce((a, b) => a + b, 0) + '件';
    $('remoteState').textContent = '部屋の照明：' + (dark ? 'OFF' : 'ON');
    $('remoteOn').disabled = !dark;
    $('remoteOff').disabled = dark;
}
function drawPC() {
    $('pcStatus').textContent = saveTimer ? '保存中…' : dirtyPC() ? '未保存の変更あり' : '保存済み';
    $('pcSave').disabled = !!saveTimer || !dirtyPC() || !jobReady;
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
    if (!gameActive() || eating || checkoutTimer || defeated) return;
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
    if (!on && view === 'camera') render();
    notify(on ? 'モニター点灯' : 'モニター消灯（作業データ維持）');
}
$('powerImg').src = A.monitor_button;
$('remoteImg').src = A.remote;
$('screenTap').onclick = () => {
    if (!gameActive() || !jobReady || !monitorOn || powerOut || defeated || eating) return;
    pcZoomed = true;
    syncPC();
    drawPC();
};
$('pcBack').onclick = () => {
    closePC();
};
$('monitorKey').onclick = () => switchMonitor(!monitorOn);
$('pcSave').onclick = () => {
    if (!window.jobCanCommit('PC') || !dirtyPC()) return;
    const snapshot = [...pcRemain];
    const jobSnapshot = jobApi().snapshot();
    const correctSnapshot = [...pcCorrect];
    jobApi().setSaving(true);
    saveTimer = setTimeout(() => {
        pcSaved = snapshot;
        savedJobs = jobSnapshot;
        savedCorrect = correctSnapshot;
        jobApi()?.setSaving(false);
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
    if (encounter || defeated || !gameActive())
        return;
    cancelEvent();
    encountersSeen++;
    encounter = { type, side, stage: 'approach' };
    eventType = type;
    notify((side === -1 ? '左' : '右') + '入口から足音がする…');
    encounterTimer = setTimeout(resolveArrival, config.arrivalMs);
    return true;
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
    encountersAvoided++;
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
    freezeNight();
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
        showResult(t);
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


$('retry').onclick = () => $('reset').click();
window.cameraPower = function (out) {
    if (out === powerOut)
        return;
    powerOut = out;
    if (out) {
        outages++; lostWork += pcSaved.reduce((s,n,i)=>s+Math.max(0,n-pcRemain[i]),0);
        cancelCheckout();
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


// Game lifecycle: real elapsed time, independent of camera and job views.
let nightState='title', elapsed=0, lastTick=0, checkoutTimer=null, outages=0,lostWork=0,encountersSeen=0,encountersAvoided=0;
const gameActive=()=>nightState==='playing';
const remaining=()=>[...remain,...pcRemain].reduce((a,b)=>a+b,0);
const totalJobs=()=>[...config.counts,...config.pcCounts].reduce((a,b)=>a+b,0);
function clockText(){const m=Math.min(360,Math.floor(elapsed/config.nightMs*360));return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function cancelCheckout(){clearTimeout(checkoutTimer);checkoutTimer=null;jobApi()?.setSaving(false);updateCheckout();}
function updateCheckout(){const b=$('checkout');b.hidden=remaining()!==0||!gameActive();b.disabled=!!checkoutTimer||!!saveTimer||dirtyPC()||!monitorOn||powerOut;b.textContent=checkoutTimer?'送信中…':dirtyPC()?'保存後に退勤申請':'退勤申請';}
function freezeNight(){nightState='ending';cancelEating();cancelCheckout();clearTimeout(saveTimer);saveTimer=null;clearTimeout(blinkTimer);clearTimeout(eventTimer);try{$('cameraFrame').contentWindow.pausePatrol();}catch(_){};closePC();closeJob();$('app').inert=true;}
function endNight(reason){if(!gameActive())return;defeated=true;clearTimeout(encounterTimer);freezeNight();showResult(reason);}
function showResult(reason){nightState='result';$('resultScreen').hidden=false;$('titleScreen').hidden=true;const success=reason==='clear';const done=totalJobs()-remaining(),correct=[...pcCorrect,...paperCorrect].reduce((a,b)=>a+b,0),accuracy=done?100*correct/done:0;const speed=Math.round(config.speedPay*(1-elapsed/config.nightMs)),quality=Math.round(config.qualityPay*accuracy/100),mistakes=Math.round((100-accuracy)*config.errorCostPerPercent),drink=coffeeUsed*config.coffeeCost,meal=foodUsed*config.foodCost,pay=Math.max(0,config.basePay+speed+quality-mistakes-drink-meal);const yen=n=>'¥'+n.toLocaleString('ja-JP');const row=(a,b)=>`<div class="record"><span>${a}</span><b>${b}</b></div>`;const details=row('勤務終了',clockText())+row('業務処理',`${done} / ${totalJobs()}件`)+row('正確率',accuracy.toFixed(1)+'%')+row('停電 / 消失業務',`${outages}回 / ${lostWork}件`)+row('怪異遭遇 / 回避',`${encountersSeen} / ${encountersAvoided}回`);$('resultBody').innerHTML=success?`<article class="payslip"><small>人事労務管理部　社員番号 000184</small><h2>時間外勤務給与明細</h2><div class="stampMark">退勤許可</div><h3>支給</h3>${row('業務完了報酬',yen(config.basePay))}${row('早期退勤手当',yen(speed))}${row('業務精度手当',yen(quality))}<h3>控除</h3>${row('誤処理控除','−'+yen(mistakes))}${row('社内飲料費 '+coffeeUsed+'点','−'+yen(drink))}${row('社内食事費 '+foodUsed+'点','−'+yen(meal))}<h3>差引支給額</h3><div class="payTotal">${yen(pay)} <small>評価 ${pay>=14000?'S':pay>=12000?'A':pay>=10000?'B':pay>=8000?'C':'D'}</small></div>${details}<p>本日もお疲れ様でした。明日も通常どおり出勤してください。</p></article>`:`<article class="deathReport"><div class="employeeCard"><header>社員証　 EMPLOYEE ID</header><div class="idContent"><div class="photo"><svg viewBox="0 0 100 120" aria-label="顔写真は塗りつぶされています"><rect width="100" height="120" fill="#737d76"/>${reason==='timeout'?'<rect x="8" y="8" width="84" height="104" fill="#555e59"/><text x="50" y="60" text-anchor="middle" fill="#ddd" font-size="10">非表示</text>':'<g stroke="#211e1c" stroke-linecap="round" fill="none"><path d="M5 5L30 41L64 79L95 115M96 5L71 38L33 80L4 115" stroke-width="17"/><path d="M4 17L93 104M13 2L98 91M91 16L2 103M99 26L12 116M20 33L82 81L16 79L85 29L31 96L78 101L8 52L91 65" stroke-width="10"/></g>'}</svg></div><div>社員番号<br><strong>000184</strong><hr>所属　業務管理部<hr>勤務資格　${reason==='timeout'?'保留':'無効'}<div class="stampMark">${reason==='timeout'?'退勤拒否':'登録抹消'}</div></div></div></div><h2>${reason==='timeout'?'規定業務未達成':'勤務継続不能'}</h2>${row('処理区分',({patrol:'所在確認不能',light:'勤務継続不能',sleep:'勤務中の意識消失',timeout:'退勤拒否'})[reason]||reason)}${details}<p>${reason==='timeout'?'退勤は認められません。':'欠員が発生しました。後任社員の手配を開始します。'}</p></article>`;}
function startNight(){if(!jobReady||!$('cameraFrame').contentWindow.startNight){$('startStatus').textContent='業務システムを読み込み中です。';return;}$('app').inert=false;$('resultScreen').hidden=true;$('reset').click();elapsed=0;outages=lostWork=encountersSeen=encountersAvoided=coffeeUsed=foodUsed=0;cancelEating();nightState='playing';lastTick=performance.now();$('titleScreen').hidden=true;$('cameraFrame').contentWindow.startNight();render();}
$('startNight').onclick=startNight;$('rejoin').onclick=startNight;$('returnTitle').onclick=()=>{$('resultScreen').hidden=true;$('titleScreen').hidden=false;nightState='title';};
$('checkout').onclick=()=>{if(!gameActive()||remaining()||dirtyPC()||saveTimer||powerOut||!monitorOn||checkoutTimer)return;jobApi()?.setSaving(true);checkoutTimer=setTimeout(()=>{checkoutTimer=null;if(gameActive()&&!remaining()&&!dirtyPC()&&!powerOut)endNight('clear');},config.checkoutMs);updateCheckout();};
setInterval(()=>{if(!gameActive())return;const now=performance.now(),dt=Math.max(0,now-lastTick);lastTick=now;elapsed=Math.min(config.nightMs,elapsed+dt);sleep=Math.min(100,sleep+dt/1000*config.sleepPerSecond*(Date.now()<foodUntil?config.foodEffect:1));if(sleep>=100){endNight('sleep');return;}if(elapsed>=config.nightMs){endNight('timeout');return;}updateEating(now);stats();},100);
$('cameraBlack').addEventListener('pointerdown',e=>gesture=[e.clientX,e.clientY]);$('cameraBlack').addEventListener('pointerup',e=>{if(gesture&&gesture[1]-e.clientY>35)change('pc');gesture=null;});


render();
