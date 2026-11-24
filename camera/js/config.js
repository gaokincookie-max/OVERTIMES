const cameraConfig = { moveMs: 6500, watchSeconds: 3, warningSeconds: 12, cutSeconds: 20, restoreSeconds: 18 };
const names = ['休憩室', '会議室・左通路', '複合機', '中央通路', '給湯室', '書庫・右通路', '電気室', '倉庫'];
const pos = [[66, 57], [66, 151], [66, 239], [193, 183], [193, 57], [322, 151], [322, 57], [322, 239]];
const routes = { patrol: [0, 1, 3, 2, -1, 0, 1, 3, 5, 7, -2, 7, 5, 3], light: [4, 3, 5, 7, -2, 7, 5, 3, 1, 2, -1, 2, 3] };
// 統合モードの暫定値。地点番号は0始まり、-1/-2は入口。
const multiConfig = {
    tickMs: 100, retryMs: 2000, blockedRetryLimit: 4,
    deskGraceMs: 4000, initialLightDelayMs: 3500,
    breakerFirstDelayMs: 8000, breakerCooldownMs: 25000,
    // 見取り図に存在する接続のみ。電気室は専用素材のみのため除外。
    neighbors: {0:[1],1:[0,2,3],2:[1,3,-1],3:[1,2,4,5,7],4:[3],5:[3,7],7:[3,5,-2]},
};
