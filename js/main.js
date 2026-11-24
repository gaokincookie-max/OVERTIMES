setInterval(() => {
    sleep = Math.min(100, sleep + (Date.now() < foodUntil ? config.foodEffect : 1) * config.sleepPerSecond);
    stats();
}, 1000);
render();
