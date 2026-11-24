# 残業 / OVERTIME

統合試作 Ver.0.11 のファイル分割版。スマートフォン横画面向けの業務処理型サバイバルホラーです。新規ゲーム仕様は追加していません。

## 起動方法

ビルド・npm install は不要です。HTTP サーバーから `index.html` を開いてください。

```sh
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` にアクセスします。Windows では `py -m http.server 8000` でも起動できます。HTML の直接ダブルクリックでは、ブラウザの file:// 同一オリジン制限により監視カメラ連携が失敗する場合があります。

## GitHub Pages

1. リポジトリを作成し、このフォルダの**中身すべて**をルートにアップロードする（index.html がルートに来るようにする）。
2. Settings → Pages → Build and deployment → Source を Deploy from a branch に設定。
3. main ブランチの / (root) を選択し保存する。
4. 公開URLは Pages の画面に表示される。

相対パスを使用しているため、プロジェクトサイトのサブパスでの公開を想定しています。公開リポジトリでは画像も閲覧可能になるため、公開前に素材の利用条件を確認してください。ライセンスは未指定のため追加していません。

## ファイル構成

| ファイル | 担当 |
|---|---|
| index.html | デスク・PC・飲食・書類・机下・カメラの画面構造 |
| css/base.css | 基本UI・共通レイアウト・小物 |
| css/under-desk.css | 瞬き・机下・演出 |
| css/pc.css | PC・モニター・リモコン |
| css/camera-and-failure.css | カメラ枠・敗北画面 |
| js/config.js | 主な調整値・業務数・紙束の配置 |
| js/state.js | デスク側共有状態の初期化 |
| js/assets.js | デスク側画像のキーと相対パス |
| js/desk.js | 背景・小物・HUD・通知の描画 |
| js/food.js | 飲食物の消費と眠気効果 |
| js/paperwork.js | 紙業務の仮UI・残務管理 |
| js/navigation.js | 視点変更・フリック・照明・リセット |
| js/under-desk.js | 机下差分・瞬き・手動イベント |
| js/pc.js | PC業務・保存・モニター・リモコン |
| js/encounters.js | 自席への接近・防御・敗北演出 |
| js/camera-bridge.js | 停電・カメラとの連携・カメラ内フリック |
| js/main.js | 眠気更新・初期描画 |
| camera/index.html | 独立した監視カメラ画面（本体 iframe 内から使用） |
| camera/css/camera.css | カメラ・ミニマップの外観 |
| camera/js/config.js | カメラ名・座標・巡回経路・停電時間 |
| camera/js/state.js | カメラの共有状態 |
| camera/js/assets.js | カメラ画像・差分のパスと切り抜き座標 |
| camera/js/render.js | カメラ描画・マップ操作 |
| camera/js/patrol.js | 巡回AI・試験操作 |
| camera/js/breaker.js | 配電盤の住人・監視成功・停電 |
| camera/js/main.js | カメラ初期描画・リセット公開関数 |
| assets/desk/ | デスク背景と明暗差分 |
| assets/items/ | 小物・飲食・紙束・電源・リモコン |
| assets/encounters/ | 怪異の接近・襲撃素材 |
| assets/camera/cam01〜cam08/ | 各地点の通常映像・怪異差分 |

## 改修方針・注意事項

- 元の画像69点は再圧縮せず、元のバイト列をそのまま抽出。
- 既存の関数名・DOM ID・タイマー・巡回経路を基本的に維持。従来の srcdoc を同一オリジンの外部HTMLへ変更。
- JS は通常の script として読み込む。共有状態・関数の参照を維持するため、index.html に記載されたロード順を変えないこと。ES Modulesへの移行や単一AIへの統合は将来の別改修とする。
- config.js の coffee / food は元から配置数と連動していない参考値。個数の変更には desk.js の配置も変更する必要がある。全数値の設定化は未完了。
- PC・紙業務は仮UI、眠気100での敗北・時刻・クリア・スコア・複数怪異同時AIは未実装。既知の挙動や不具合の修正は今回の範囲外。
- カメラ単体ページは親ページへの連携を前提とするため、本体から開くこと。

## 確認状況

画像69点のSHA-256一致、JavaScript構文、相対ファイル参照を確認済み。実ブラウザの動作試験は作業環境のURLアクセス制限で起動できず未完了です。公開前に `docs/TESTING.md` の項目を確認してください。
