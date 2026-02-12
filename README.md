# 契約更新リマインダー (Contract Renewal Reminder)

契約の更新日を管理し、リマインダー通知を受け取るためのReact Native Expoアプリです。

## 機能

1. **契約を登録** - 名前、開始日、更新日、金額を入力して契約を追加
2. **リマインダー通知** - 更新日の1ヶ月前、1週間前に通知
3. **契約一覧** - 更新日順に契約を表示
4. **年間費用集計** - カテゴリ別に年間の契約費用を集計
5. **カテゴリ分け** - 保険、サブスク、携帯、賃貸、光熱費などで分類

## 技術スタック

- Expo SDK 52
- Expo Router 4
- TypeScript
- AsyncStorage (データ永続化)
- expo-notifications (プッシュ通知)
- Jest + React Native Testing Library (テスト)

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start

# iOSシミュレーターで起動
npm run ios

# Androidエミュレーターで起動
npm run android
```

## テスト

```bash
# テストの実行
npm test

# カバレッジ付きテスト
npm run test:coverage
```

## プロジェクト構造

```
contract-reminder/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── index.tsx      # 契約一覧画面
│   │   └── summary.tsx    # 年間費用画面
│   ├── add.tsx            # 契約追加画面
│   ├── edit/[id].tsx      # 契約編集画面
│   └── _layout.tsx        # ルートレイアウト
├── src/
│   ├── components/        # UIコンポーネント
│   ├── hooks/             # カスタムフック
│   ├── services/          # ストレージ・通知サービス
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ユーティリティ関数
│   └── __tests__/         # テストファイル
└── assets/                # 画像アセット
```

## カテゴリ

| カテゴリ | 絵文字 |
|---------|--------|
| 保険 | 🛡️ |
| サブスク | 📺 |
| 携帯 | 📱 |
| 賃貸 | 🏠 |
| 光熱費 | 💡 |
| その他 | 📋 |

## ライセンス

MIT
