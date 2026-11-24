function notify(t) {
    $('toast').textContent = t;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').textContent = '', 2200);
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
    $('stats').textContent = `眠気 ${Math.round(sleep)}%　残務 ${remain.reduce((a, b) => a + b, 0)}件`;
}
function render() {
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
        [25, 43, 61].forEach((x, i) => item('coffee', '缶コーヒー', x, 78 + (i % 2) * 8, 11, 29, () => consume('coffee', 'c' + i), 'c' + i));
        [43, 67].forEach((x, i) => item('onigiri', 'おにぎり', x, 96 - i * 9, 18, 26, () => consume('food', 'f' + i), 'f' + i));
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
