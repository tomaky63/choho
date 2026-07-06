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
