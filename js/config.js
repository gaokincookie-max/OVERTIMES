// Prototype settings (unchanged from v0.11).
const config = {
    // 飲食・眠気（coffee/food は現行の固定配置数の参考値）
    coffee: 3,
    food: 2,
    coffeeEffect: 30,
    foodEffect: 0.45,
    foodDuration: 60,
    initialSleep: 55,
    sleepPerSecond: 0.22,
    // 業務
    counts: [12, 12, 9, 9],
    pcCounts: [24, 16, 10],
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
const pcNames = ['売上データ入力', 'メール確認', 'データ照合'];
