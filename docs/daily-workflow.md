# 毎朝の実行手順(daily-workflow)

毎朝の自動更新タスクは、**この手順を上から順に**実行する。
本日の日付(JST)を `YYYY-MM-DD` とする。

## 0. 前提確認

```
cd C:\Users\tomak\Documents\ニュース
git pull --rebase origin main
```

- pull が失敗したら: ネットワーク/認証の問題を報告して停止する(壊れた状態で書き始めない)

## 1. 重複実行チェック

- `content/issues/YYYY-MM-DD.json` が既に存在し、かつ `git log origin/main` に含まれている場合、
  **本日号は発行済み。何もせず「発行済みのため抑止」と報告して終了する**
- ファイルは存在するが push されていない場合: 前回実行が途中で失敗している。
  内容を検証(手順4)からやり直して続行する

## 2. 文脈の把握(調査の前に必ず)

以下を読む:

1. `content/watchlist.md` — 継続テーマと「次号で確認すべきこと」
2. 直近2号の `content/issues/*.json` — 既報の内容(重複回避)と frontier テーマ(重複回避)

## 3. 調査

[editorial-guide.md](editorial-guide.md) の選定基準に従い、Webで最新ニュースを調査する。

- watchlist の「次号で確認すべきこと」を最初に潰す
- 5セクション(マクロ・市場 / テクノロジー・AI / 企業・産業 / 国際・地政学 / 政策・規制)
  それぞれについて材料を集める
- market_snapshot 用の指標値(日経平均・TOPIX・USD/JPY・10年JGB・米10年債・原油)を確認する
- 深掘り(frontier)のテーマを1つ決め、背景から調べる
- **URL は実際にアクセス確認したものだけを使う**

## 4. 本日号 JSON の作成

- `content/issues/YYYY-MM-DD.json` を [issue-format.md](issue-format.md) の仕様どおりに書く
- `edition` は前号の edition + 1
- `generated_at` は現在時刻(JST、ISO 8601)
- 内容の品質基準は [editorial-guide.md](editorial-guide.md) に従う

## 5. 検証

```
node scripts/validate-issue.mjs content/issues/YYYY-MM-DD.json
```

- **エラーが0件になるまで修正して再実行**する。警告も可能な限り解消する
- 検証を通らないままの commit は禁止

## 6. watchlist の更新

`content/watchlist.md` を更新する(editorial-guide.md §10 のルールで):

- 本日号で扱ったテーマの現状を反映
- 「次号で確認すべきこと」を書き換える(日付つき)
- 「直近の frontier テーマ」に本日のタイトルを追記
- 解決済み・陳腐化した項目を削除

## 7. commit & push

```
git add content/
git commit -m "第N号 YYYY-MM-DD"
git push origin main
```

- push が拒否されたら `git pull --rebase origin main` してから再push
- **push の成功確認まで**が本タスク(`git log origin/main -1` で本日のcommitを確認)

## 8. 完了報告

以下を簡潔に報告する:

- 発行した号(第N号・日付)と主なテーマ
- validate の結果(警告が残っていればその内容)
- push 完了の確認結果
- 失敗した手順があれば、**何が失敗し、次に何をすべきか**を具体的に

## 失敗時の対応

| 症状 | 対応 |
|---|---|
| validate エラーが解消できない | エラー内容を報告。仕様(issue-format.md)と自分のJSONの差分を明示 |
| git push が認証エラー | 認証設定の問題として報告(次アクション: gh auth status の確認) |
| Web調査が不十分(ソース不足) | 確認できた範囲だけで号を作る。埋められない項目は落とす(推測で埋めない) |
| サイトの表示崩れを発見 | 日次タスクでは `src/` を触らず、症状だけを報告 |

デプロイ(GitHub Actions)の完了確認は不要。push されれば数分で
https://tomaky63.github.io/choho/ に反映される。
