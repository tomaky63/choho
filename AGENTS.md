# AGENTS.md — 朝報(CHOHO)

このリポジトリは、**毎朝自動更新される個人向けニュースサイト「朝報」**です。
経済・市場・最先端技術を扱う日本語のデイリーブリーフィングで、日経新聞の代替になる
情報密度を目指しています。公開先: https://tomaky63.github.io/choho/

## 毎朝の自動更新タスクを実行する場合

**必ずこの順に読むこと:**

1. [docs/daily-workflow.md](docs/daily-workflow.md) — 実行手順(この通りに進める)
2. [docs/editorial-guide.md](docs/editorial-guide.md) — 編集方針・品質基準(内容の正本)
3. [docs/issue-format.md](docs/issue-format.md) — 号データのJSONフォーマット仕様

### 絶対のルール

- 日次更新で触ってよいのは **`content/` 配下のみ**(号JSON と watchlist.md)。
  `src/`・設定ファイル・ドキュメントを日次タスクで変更しない
- 作成した号は **必ず `node scripts/validate-issue.mjs` で検証**し、合格してから commit する
- commit したら **`git push origin main` まで完了**させる(push しないとサイトは更新されない)
- **メールは送らない**(旧運用。2026-07-06 に廃止済み)
- ペイウォール記事の本文を複製しない。要約・出典リンクは可

## リポジトリ構成

```
content/issues/YYYY-MM-DD.json   # 1日1号のデータ(正本)。これを毎朝追加する
content/watchlist.md             # 号をまたぐ継続テーマ・申し送り。毎朝更新する
scripts/validate-issue.mjs       # 号データの検証(push前の関門)
docs/                            # 編集ガイド・手順書・フォーマット仕様
src/                             # Next.js サイト実装(日次タスクでは触らない)
.github/workflows/deploy.yml     # push → GitHub Pages 自動デプロイ
```

## 仕組み

- `main` に push すると GitHub Actions が検証→ビルド→GitHub Pages へデプロイする
- ローカルでのビルドは不要。**号JSONを書いて push するだけ**が日次タスクの全て
- サイトの見た目・機能を変えたい場合(日次タスク外): `npm run dev` で開発、
  `npm run build` で静的書き出し確認
