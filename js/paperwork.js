function openJob(i) {
    if (dark || powerOut || defeated) {notify('暗くて書類が読めない');return;}
    if (!remain[i]) {notify('この業務は完了済み');return;}
    if (!jobReady) {notify('業務システムを読み込み中');return;}
    selected=i; syncJobPane();
}
function closeJob(){selected=-1;syncJobPane();}
