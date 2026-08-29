# @zakotoys/notify-mcp

[![npm](https://img.shields.io/npm/v/%40zakotoys%2Fnotify-mcp?logo=npm&logoColor=white)](https://www.npmjs.com/package/@zakotoys/notify-mcp)
[![CI](https://github.com/zakotoys/notify-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/zakotoys/notify-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[English](README.md) | [简体中文](README.zh-CN.md) | **日本語**

`notify-mcp` は、固定された内蔵サウンドの再生とネイティブなデスクトップ通知を提供する、標準入出力で動作する [Model Context Protocol](https://modelcontextprotocol.io) サーバーです。Claude Desktop、Cursor、OpenCode、Codex などの MCP クライアントから、ローカルの Windows または macOS 通知システムを利用できます。

## 機能

- オーディオ一覧、オーディオ再生、デスクトップ通知、両方を行う統合処理の 4 つの MCP ツール。
- 1 種類の内蔵サウンド：`zako`。
- `node-notifier` による Windows 通知センターと macOS Notification Center。
- オーディオは固定カタログのみ。ファイルパス、URL、アップロード、実行時の追加は受け付けません。
- ビジネスロジックと OS アダプターを分離し、スピーカーや GUI のない CI でもテストできます。

## 必要条件

- Node.js 20 以降。
- Claude Desktop、Cursor、OpenCode、Codex などの MCP クライアント。
- 主なデスクトップ通知環境は Windows 10 以降または macOS。

`aplay` とデスクトップ通知バックエンドがあれば Linux でも利用できます。

## クイックスタート

### Claude Desktop、Cursor、OpenCode、Codex

```bash
npm install --global @zakotoys/notify-mcp
```

クライアントの MCP 設定に追加します。

```json
{
  "mcpServers": {
    "notify": { "command": "notify-mcp" }
  }
}
```

グローバルインストールをせず `npx` で実行することもできます。

```json
{
  "mcpServers": {
    "notify": {
      "command": "npx",
      "args": ["-y", "@zakotoys/notify-mcp@latest"]
    }
  }
}
```

Windows クライアントで `npx` を直接解決できない場合は `cmd /c npx -y @zakotoys/notify-mcp@latest` を使用します。

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx -y @zakotoys/notify-mcp@latest
```

まず `notify_list_audio` を呼び出し、次に `notify_desktop` または `notify` を試してください。

## MCP ツール

| ツール | 用途 |
| --- | --- |
| `notify_list_audio` | 固定された内蔵オーディオカタログを一覧表示します。 |
| `notify_play_audio` | 内蔵サウンドを 1 つ再生します。 |
| `notify_desktop` | ネイティブなデスクトップ通知を表示します。 |
| `notify` | 任意の内蔵サウンドを再生してから通知を表示します。 |

### `notify_list_audio`

引数はありません。各項目には `id`、ラベル、説明、周波数、再生時間が含まれます。

### `notify_play_audio`

```json
{ "audio": "zako" }
```

`audio` は `zako` でなければなりません。サーバーにはボーカル分離済みの WAV が内蔵されており、外部パスや URL は受け付けません。

このクリップは [`assets/audio/SOURCE.md`](assets/audio/SOURCE.md) に記載した動画からボーカルを抽出したものです。このアセットを含むパッケージを公開する前に、再配布の権利を確認してください。

### `notify_desktop`

```json
{
  "title": "ビルド完了",
  "message": "notify-mcp のビルドが成功しました",
  "subtitle": "任意の補足テキスト"
}
```

`title` は必須で 200 文字以内、`message` は必須で 2,000 文字以内、`subtitle` は任意で 200 文字以内です。

### `notify`

```json
{
  "audio": "zako",
  "title": "リマインダー",
  "message": "会議は 5 分後に始まります"
}
```

`audio` は省略できます。指定した場合は、サウンドの再生が完了してから通知を送信します。

## プラットフォームの動作

- **macOS：** サウンドに `afplay`、通知に Notification Center を使用します。
- **Windows：** サウンドに PowerShell の `Media.SoundPlayer`、通知に Windows 通知センターを使用します。
- **Linux：** サウンドに ALSA の `aplay` を使用し、通知バックエンドは `node-notifier` が選択します。

OS の設定で、ターミナルアプリケーションからの通知を許可する必要がある場合があります。サーバーが通知本文やオーディオをアップロードすることはありません。

## 開発

```bash
npm install
npm run typecheck  # TypeScript の型チェック
npm run lint       # Biome の lint
npm test           # Vitest と V8 カバレッジ
npm run build      # dist/ にランタイムをコンパイル
npm run ci         # すべてのチェック、ビルド、パッケージ検証
```

テストは注入した fake アダプターとインメモリ MCP transport を使用するため、スピーカー、GUI、実際の通知センターは必要ありません。

## リリース

`vX.Y.Z` タグを push すると、GitHub Actions が完全な CI と package バージョンの一致を確認します。その後 npm Trusted Publishing と provenance を使用して公開し、自動生成された変更履歴付きの GitHub Release を作成します。

```bash
npm version patch   # minor または major も使用できます
git push --follow-tags origin main
```

npm の Trusted Publisher には、リポジトリ `zakotoys/notify-mcp`、workflow `publish.yml`、GitHub Actions プロバイダーを設定してください。

## プロジェクトの範囲

このプロジェクトはローカル通知の基本機能だけを提供します。通知履歴、リモートオーディオ、ユーザーが追加するメディア、バックグラウンド daemon は管理しません。ツールを呼び出すタイミングは MCP クライアントが決定します。

## ライセンス

MIT、詳しくは [LICENSE](LICENSE) を参照してください。
