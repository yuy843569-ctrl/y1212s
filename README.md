# UMEDA DEVELOPMENT 公式サイト

画像の構成を参考にした、配布可能な静的サイトです。HTML、CSS、JavaScriptで動作します。トップページは「ナビゲーション → 大きなヒーロー → 最新情報と写真 → 5つの案内カード → フッター」の順に並びます。ABOUT、RAILWAY、DOWNLOAD、GALLERY、NEWS、DISCORDはそれぞれ独立したページです。

## ファイル構成

- index.html — HOME
- about.html — プロジェクト紹介
- railway.html — 鉄道・駅情報
- download.html — Java版・統合版ワールド配布
- gallery.html — 建築写真
- news.html — お知らせ
- discord.html — 公式コミュニティとSNS
- admin.html — 管理者のお知らせ投稿ページ（公開後に /admin で利用）
- api/news.js — お知らせの読み書きを行うVercel Function
- news-feed.js — ホームとNEWSページへの投稿表示
- admin.js — 管理ページからの投稿処理
- package.json — Vercel FunctionとBlob SDKの設定
- styles.css — 全ページ共通のレスポンシブデザイン
- site-config.js — 公式URLとワールド配布URLの設定
- site.js — モバイルメニュー、現在ページの表示、年表示、配布リンク
- assets/ — ご提供のMinecraftスクリーンショット、ロゴ、鉄道イメージ図
- vercel.json — Vercel用の静的サイト設定
- robots.txt、sitemap.xml — 検索エンジン向けファイル

## 画像を差し替える

assets/city-*.png はご提供いただいたMinecraftワールドの画像です。トップの背景にはcity-panorama.png、写真カードにはcity-block.pngなどを使用しています。

1. 新しい画像をassets/へ追加します。
2. 各HTMLページ内の画像ファイル名を変更します。
3. 画像の説明文（alt属性）も実際の内容に合わせます。
4. ブラウザーで表示を確認し、更新版を再デプロイします。

scene-railway.svgは鉄道を表すサイト用のイメージ図です。実際のワールド画面として紹介する場合は、ゲーム内で撮影した画像に差し替えてください。

## ワールド配布URLを追加する

配布を始めるとき、site-config.jsのdownloadsを編集してください。

downloads: { java: "配布ファイルのURL", bedrock: "配布ファイルのURL" }

配布しない側はnullのままにします。URLを設定すると、該当するCOMING SOONボタンがリンクになります。

公式Discord、YouTube、XのURLはsite-config.jsとHTMLページのリンクに設定しています。リンク先を変更する場合は両方を更新してください。

## ドメインについて

umeda-development.jpは提案中の正規ドメイン名です。このドメインが登録済み、所有確認済み、または接続済みであることは確認されていません。使用前にドメイン管理会社で空き状況を確認して登録してください。

ドメインを変更する場合は、各HTMLページのcanonicalとOpen Graph情報、site-config.jsのcanonicalUrl、robots.txt、sitemap.xmlのURLを更新してください。

登録後、Vercel Dashboardのプロジェクト設定でSettings → Domainsを開き、ドメインを追加します。Vercelが表示するDNSレコードをドメイン管理会社のDNS設定に登録し、Vercelで検証完了を確認してください。

## Vercelダッシュボードから公開する

1. ZIPを展開します。
2. プロジェクト一式をGitHub、GitLab、またはBitbucketのリポジトリへ登録します。
3. Vercel DashboardでAdd New → Projectを選び、GitリポジトリをImportします。
4. Framework PresetはOther、Build Commandは空欄、Output Directoryはプロジェクトのルート（.）にします。
5. Deployを選び、発行されたvercel.app URLで各ページを確認します。
6. 独自ドメインを使う場合は、Settings → Domainsで追加します。

Gitリポジトリを接続すると、変更をpushしたときにVercelが自動で再デプロイします。

## 最新のお知らせを投稿する

お知らせの投稿機能はVercel上で動作します。ローカルの `file://` で開いた場合は投稿APIがないため、管理ページは利用できません。

1. Vercel DashboardでこのプロジェクトにBlobストアを作成・接続します。お知らせの本文は公開情報として保存されます。
2. Project Settings → Environment Variablesで `NEWS_ADMIN_PIN` を追加し、管理者用の秘密のPINを設定します。PINはソースコード、GitHub、ZIPには入れません。推測されにくい長い値を推奨します。
3. 環境変数を追加した後に再デプロイします。
4. `https://umeda-development.jp/admin`（または発行されたVercel URLの `/admin`）を開き、PIN、カテゴリ、タイトル、本文を入力して投稿します。

投稿内容はVercel Blobに保存され、ホームとNEWSページがAPIから最新情報を読み込みます。管理者ページへのログイン状態は保存されず、投稿のたびにPINを入力します。APIでは同じ接続元からの連続したPIN誤入力を一時的に制限します。関数の実行環境が複数に分かれる場合、この簡易制限が共有されないため、7桁PINのまま長期間運用する場合は特に長い秘密値への変更を推奨します。

`.env.example` は環境変数名の見本です。実際のPINは記入せず、Vercel Dashboardに直接設定してください。

## ローカルで確認する

index.htmlをブラウザーで開くとホームを確認できます。他ページへ移動できること、モバイルメニュー、画像、外部リンク、配布URLを公開前に確認してください。
