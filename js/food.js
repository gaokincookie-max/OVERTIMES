function consume(k, id) {
    if (dark) {
        notify('暗くて手元が見えない');
        return;
    }
    used.add(id);
    if (k === 'coffee') {
        sleep = Math.max(0, sleep - config.coffeeEffect);
        notify('コーヒーを飲んだ');
    }
    else {
        foodUntil = Date.now() + config.foodDuration * 1000;
        notify('食事をした：眠気の増加を抑制');
    }
    render();
}
