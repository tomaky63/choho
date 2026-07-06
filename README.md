# 朝報(CHOHO)— 経済と最先端技術の朝刊

毎朝、Codex の自動化がニュースを調査・編集して更新する個人向けニュースサイト。
日経新聞の代替となる情報密度で、経済・市場・最先端技術をカバーする。

**サイト**: https://tomaky63.github.io/choho/

## 仕組み

```
毎朝8:00 (Codex automation, ローカル実行)
  └─ 調査 → content/issues/YYYY-MM-DD.json を作成
     → node scripts/validate-issue.mjs で検証
     → git commit & push
        └─ GitHub Actions が検証 → ビルド → GitHub Pages へデプロイ
```

- 自動化の設定: `C:\Users\tomak\.codex\automations\automation\automation.toml`
  (プロンプトは薄く、実際の手順・品質基準はこのリポジトリの `docs/` が正本)
- PCが起動していない朝は実行されず、次にPCが起動したタイミングで実行される

## 紙面構成(1号あたり 本編約10分 + 深掘り約5分)

| コーナー | 内容 |
|---|---|
| 市況スナップショット | 日経平均・USD/JPY・長期金利など主要指標 |
| 今朝の要点 | 5〜8項目のエグゼクティブサマリー(タップで本文へ) |
| 今朝の一面 | 最重要ニュース1本 |
| 5セクション | マクロ・市場 / テクノロジー・AI / 企業・産業 / 国際・地政学 / 政策・規制 |
| 深掘り | 最先端技術・ビジネス構造の解説1本(1,500〜2,500字) |
| 今日の示唆 | 具体的な示唆+ウォッチリスト |
| 今日の用語 | 用語ミニ解説 2〜4個 |

## ドキュメント

| ファイル | 役割 |
|---|---|
| [AGENTS.md](AGENTS.md) | 自動化エージェントの入口(ルール) |
| [docs/editorial-guide.md](docs/editorial-guide.md) | 編集方針・品質基準の正本 |
| [docs/daily-workflow.md](docs/daily-workflow.md) | 毎朝の実行手順 |
| [docs/issue-format.md](docs/issue-format.md) | 号データのJSON仕様 |

## 開発(サイトの見た目を変えたいとき)

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 静的書き出し(out/)
npm run validate   # 最新号の検証
```

- スタック: Next.js (App Router, static export) + Tailwind CSS + GitHub Pages
- 主要コード: `src/lib/issues.ts`(型・読み込み)、`src/components/`(紙面)、`src/app/`(ページ)

## 品質を調整したいとき

- **内容の方針を変える** → `docs/editorial-guide.md` を編集(翌朝から反映される)
- **紙面の構成・フォーマットを変える** → `docs/issue-format.md` + `src/lib/issues.ts` +
  `scripts/validate-issue.mjs` + 該当コンポーネントをセットで変更
- **配信時刻を変える** → automation.toml の rrule を変更

## 運用履歴

- 2026-07-06: メール配信(ニュースダイジェスト)を廃止し、本サイトに移行。創刊
