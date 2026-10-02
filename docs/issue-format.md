# 号データフォーマット仕様(content/issues/YYYY-MM-DD.json)

1日1号 = 1 JSONファイル。ファイル名は `YYYY-MM-DD.json`(JST基準の発行日)。
TypeScript の型定義の正本は [src/lib/issues.ts](../src/lib/issues.ts)、機械検証は
`node scripts/validate-issue.mjs content/issues/YYYY-MM-DD.json` で行う。

## トップレベル構造

```jsonc
{
  "date": "2026-07-06",              // ファイル名と一致必須
  "edition": 1,                       // 通し号数。前号の edition + 1
  "generated_at": "2026-07-06T08:05:00+09:00",
  "masthead_note": "任意の一言",       // 省略可。題字下に小さく表示

  "market_snapshot": { ... },         // 市況スナップショット
  "executive_summary": [ ... ],       // 今朝の要点 5〜8項目
  "top_story": { ... },               // 一面トップ(Article)
  "sections": [ ... ],                // 固定5セクション
  "frontier": { ... },                // 深掘り(毎号1本)
  "insights": { ... },                // 今日の示唆 + ウォッチリスト
  "glossary": [ ... ]                 // 用語ミニ解説 2〜4個
}
```

- `generated_at` は実在する日付・時刻の ISO 8601 日時。`Z` または `+09:00` などのタイムゾーンを必ず付ける。表示は日本時間に変換される

## market_snapshot

```jsonc
{
  "as_of": "7月6日 東京市場終値・NY市場7月3日終値",  // いつ時点の値か必ず明記
  "items": [
    {
      "label": "日経平均",
      "value": "39,810円",
      "change": "+0.4%",        // 省略可
      "direction": "up",         // "up" | "down" | "flat"
      "note": "3日続伸"          // 省略可
    }
  ]
}
```

- 4〜8件。基本セット: 日経平均・TOPIX・USD/JPY・長期金利(10年JGB)・米10年債・原油(WTIまたはBrent)
- 値が確認できない指標は**省略する**(推測で埋めない)
- direction は日本市場の慣習で表示される(上昇=赤、下落=青)

## executive_summary(今朝の要点)

```jsonc
[
  { "text": "日銀が政策金利を1.0%に引き上げ。年内追加利上げを示唆", "ref": "boj-rate-hike" }
]
```

- 5〜8項目、各90字以内
- `ref` は本文記事の `id`(タップでその記事へスクロール)。対応記事がない項目は省略可

## Article(top_story / sections 内の記事)

```jsonc
{
  "id": "boj-rate-hike",             // kebab-case 英数字。号内で一意
  "headline": "日銀、政策金利1.0%に引き上げ",  // 40字以内。体言止め・具体数字
  "dek": "17年ぶり水準。植田総裁は追加利上げに含み",  // リード文(省略可だが推奨)
  "importance": 3,                    // 3=最重要 / 2=重要 / 1=注目
  "facts": [                          // 事実のみ。2〜5件
    "6日の金融政策決定会合で政策金利を0.75%から1.0%に引き上げ",
    "賛成7・反対2。反対は緩和維持を主張"
  ],
  "why_it_matters": "なぜ重要か。市場・産業構造への意味を1〜3文で",
  "implications": "ビジネス・投資への示唆。省略可(importance 3 の記事では必須級)",
  "sources": [
    { "title": "記事タイトル", "publisher": "日経", "url": "https://..." }
  ],
  "tags": ["日銀", "金融政策"]        // 省略可。継続テーマの追跡用
}
```

## 任意: Article / frontier.diagram（図解）

文章を読み直さなくても比較・順序・関係が掴める場合だけ、記事または深掘りに `diagram` を1つ付けられる。
画像生成や外部APIは使わず、サイト側が構造化データをHTML/CSS/SVGへ変換する。省略時は過去号を含め
従来どおり表示する。不正なデータは図だけ非表示となり、検証では警告に留めて本文公開を妨げない。

### 数値比較（comparison）

```jsonc
"diagram": {
  "type": "comparison",
  "title": "大企業の業況判断DI：実績と予測",
  "unit": "％ポイント",
  "note": "2026年9月短観。6月・9月は実績、12月は企業予測。",
  "items": [
    { "label": "製造業・6月", "value": 22, "display_value": "22", "status": "actual" },
    { "label": "製造業・9月", "value": 24, "display_value": "24", "status": "actual" },
    { "label": "製造業・12月", "value": 21, "display_value": "21", "status": "forecast" }
  ]
}
```

- `items` は2〜8件。`value` はバー長計算用の数値、`display_value` は表示文字列（省略可）
- `status` は `actual`（実績）/ `forecast`（予測）/ `context`（参考）。計画・予測を実績扱いしない
- `note` に時点、単位、比較条件、実績と予測の区別を書く。数値は同じ記事の `sources` で照合する

### 時系列（timeline）

```jsonc
"diagram": {
  "type": "timeline",
  "title": "制度施行までの主要日程",
  "note": "日付は日本時間。未確定日程は予測と明記。",
  "items": [
    { "date": "10月1日", "label": "法案成立", "status": "actual" },
    { "date": "12月1日", "label": "施行予定", "detail": "政令の公布が前提", "status": "forecast" }
  ]
}
```

- `items` は2〜8件。日付・順序が記事理解の中心である場合に限る
- `date` は表示用文字列。タイムゾーンや予定／実績の別を `note` と `status` で明示する

### 関係図（relationship）

```jsonc
"diagram": {
  "type": "relationship",
  "title": "資金と計算資源の関係",
  "nodes": [
    { "id": "lender", "label": "資金提供者" },
    { "id": "customer", "label": "AI企業" },
    { "id": "supplier", "label": "計算資源供給者" }
  ],
  "links": [
    { "from": "lender", "to": "customer", "label": "融資" },
    { "from": "customer", "to": "supplier", "label": "利用料" }
  ],
  "note": "契約当事者と資金の流れだけを表示。推測を事実の線として描かない。"
}
```

- `nodes` は2〜6件、`links` は1〜8件。ノードIDは号内でなく図内だけで一意な kebab-case
- 関係の向きとラベルを原典で確認する。単なる箱と矢印の言い換えになるなら図を付けない

## sections(固定5セクション・この順)

```jsonc
[
  { "id": "macro_markets",     "articles": [ ... ] },   // マクロ・市場
  { "id": "tech_ai",           "articles": [ ... ] },   // テクノロジー・AI
  { "id": "business",          "articles": [ ... ] },   // 企業・産業
  { "id": "world_geopolitics", "articles": [ ... ] },   // 国際・地政学
  { "id": "policy_regulation", "articles": [ ... ] }    // 政策・規制
]
```

- 各セクション2〜3本(材料が薄い日でも最低1本、多い日でも4本まで)
- 本編合計(要点+トップ+全記事)は約5,000〜6,000字 = 読了10分を目安にする

## frontier(深掘り)

```jsonc
{
  "title": "HBMとは何か — AIブームの裏で起きているメモリの構造転換",
  "dek": "リード文。この記事で何がわかるか",
  "tags": ["半導体", "AIインフラ"],
  "reading_minutes": 5,               // 省略可(自動計算される)
  "body_md": "## 背景\n\nMarkdown本文...",  // 1,500〜2,500字。## 見出しで3〜5節
  "sources": [ { "title": "...", "publisher": "...", "url": "https://..." } ]
}
```

## insights(今日の示唆)

```jsonc
{
  "implications": [
    "具体的な示唆を2〜4件。事実からの推論であることがわかる書き方で"
  ],
  "watchlist": [
    {
      "item": "米6月CPI発表",
      "why": "Fed利上げ観測の再修正につながる",
      "horizon": "7月14日"            // 省略可。時期の目安
    }
  ]
}
```

## glossary(用語ミニ解説)

```jsonc
[
  { "term": "HBM", "reading": "エイチビーエム", "definition": "定義を200字以内で" }
]
```

- その号の本文で使った専門用語から2〜4個。読者が「調べたくなる」ものを選ぶ


## 任意: focus_refs（先に読む2〜3本）

トップレベルに記事 `id` の配列を指定できる。`executive_summary` に既にある要点を、
指定順に先頭へ表示するための参照である。新しい要約を増やしたり、残りの要点を削ったりしない。
省略時は従来の順序・表示を保つ。

```jsonc
"focus_refs": ["first-article-id", "second-article-id"]
```

- 2〜3件、重複不可。各idは本文記事に実在し、`executive_summary.ref` にちょうど1回存在すること
- 本数は増やさず、読者が先に読む価値の高い順に選ぶ。毎号必須ではない

## 任意: Article.follow_up（前回からの見立て）

主要な続報だけに付ける任意欄。過去記事と今回の確認済み事実を比較し、見立てを更新する。
新しい事実は `facts`、一般的な構造は `why_it_matters`、日本への示唆は `implications` を使い、
ここには**前回から判断がどう変わったか**を短く書く。省略した記事の表示は変わらない。

```jsonc
"follow_up": {
  "previous": { "date": "2026-09-30", "article_id": "samsung-hbm-capacity" },
  "assessment": "mixed",
  "reassessment": "前回の見立てと今回の材料を比較し、補強された点・未確認の点を述べる。",
  "next_check": "次にどの発表の何を確認すれば、残る論点を判別できるか。",
  "reconsider_if": "どんな観測結果なら、この見立てを弱める・変更するか。"
}
```

- 1号最大2本、`importance` 2または3の記事のみ。続報がなければ付けない
- `previous` は本号より前の実在する号・記事を参照する。リンク先の論旨を実際に読み、誇張・捏造しない
- `assessment`: `strengthened`（補強）、`weakened`（弱まる）、`mixed`（材料は混在）、`unchanged`（据え置き）、`pending`（判断保留）
- `reassessment`、`next_check`、`reconsider_if` は空にできない。合計450字以内を目安にする
- `pending` は前回の問いを判別する証拠がまだ足りない場合。`unchanged` は新材料を評価したうえで判断を維持する場合
- 関連する別企業のニュースだけで、前回の仮説が検証されたとは扱わない
- 判定は編集上の推論であり、確率・確定判定・投資の売買推奨ではない
- `reassessment` の新しい事実は同じ記事の `facts` と `sources` で裏付ける。出典欄の二重管理はしない
- `next_check` は具体的な観測項目、`reconsider_if` は判断変更条件。単なる「引き続き注視」は不可
- `insights.watchlist` は日付・予定一覧に集中させ、ここで述べた説明を繰り返さない
- 追加文量は本編の読了時間・検証の本編字数に含まれる

機械検証はリンク先の実在、形式、件数などを確認する。根拠の正しさ、前回の論旨との一致、
因果関係の妥当性までは保証しないため、執筆時に原典を照合する。
