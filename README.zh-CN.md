# @zakotoys/notify-mcp

[![npm](https://img.shields.io/npm/v/%40zakotoys%2Fnotify-mcp?logo=npm&logoColor=white)](https://www.npmjs.com/package/@zakotoys/notify-mcp)
[![CI](https://github.com/zakotoys/notify-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/zakotoys/notify-mcp/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/zakotoys/notify-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/zakotoys/notify-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[English](README.md) | **简体中文** | [日本語](README.ja-JP.md)

`notify-mcp` 是一个通过标准输入输出运行的 [Model Context Protocol](https://modelcontextprotocol.io/) 服务，为 MCP 客户端提供固定内置音效和原生桌面通知。支持 Claude Desktop、Cursor、OpenCode、Codex 及其他 MCP 客户端。

## 功能

- 四个 MCP tools：列出音效、播放音效、发送通知，以及两者组合调用。
- 一个固定内置音效：`zako`。
- Windows 通知中心和 macOS 通知中心均通过 `node-notifier` 调用。
- 音频不接受文件路径、URL、上传或运行时新增，只能选择内置 id。
- 业务流程与操作系统适配器分离，可在没有扬声器或桌面会话的 CI 中测试。

## 环境要求

- Node.js 20 或更高版本。
- Claude Desktop、Cursor、OpenCode、Codex 等 MCP 客户端。
- Windows 10+ 或 macOS。

Linux 在安装 `aplay` 和桌面通知后端时也可使用。

## 快速开始

### Claude Desktop、Cursor、OpenCode 或 Codex

```bash
npm install --global @zakotoys/notify-mcp
```

在客户端 MCP 配置中加入：

```json
{
  "mcpServers": {
    "notify": { "command": "notify-mcp" }
  }
}
```

也可以使用 `npx`：

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

Windows 客户端如无法直接解析 `npx`，请使用 `cmd /c npx -y @zakotoys/notify-mcp@latest`。

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx -y @zakotoys/notify-mcp@latest
```

先调用 `notify_list_audio`，再尝试 `notify_desktop` 或 `notify`。

## MCP tools

| Tool | 用途 |
| --- | --- |
| `notify_list_audio` | 列出固定内置音效。 |
| `notify_play_audio` | 播放一条内置音效。 |
| `notify_desktop` | 显示原生桌面通知。 |
| `notify` | 播放可选音效后显示通知。 |

### `notify_play_audio`

```json
{ "audio": "zako" }
```

`audio` 只能是 `zako`。服务内置经过人声分离的 WAV 资源，调用系统播放器，不接受外部路径或 URL。

该片段来自 [assets/audio/SOURCE.md](assets/audio/SOURCE.md) 中记录的视频并经过人声分离。发布包含此资源的软件包前，请确认具有再分发权限。

### `notify_desktop`

```json
{
  "title": "构建完成",
  "message": "notify-mcp 已成功构建",
  "subtitle": "可选补充文本"
}
```

标题必填且最多 200 个字符，正文必填且最多 2000 个字符，副标题最多 200 个字符。

### `notify`

```json
{
  "audio": "zako",
  "title": "提醒",
  "message": "会议将在五分钟后开始"
}
```

`audio` 可省略；提供时保证先播放音效，再提交桌面通知。

## 平台行为

- **macOS：** 使用 `afplay` 和 Notification Center。
- **Windows：** 使用 PowerShell `Media.SoundPlayer` 和 Windows 通知中心。
- **Linux：** 使用 ALSA `aplay`，通知后端由 `node-notifier` 选择。

操作系统可能需要允许终端应用发送通知。服务不会上传通知正文或音频。

## 开发

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run ci
```

测试使用注入的 fake 适配器和内存 MCP transport，不需要真实扬声器或 GUI。

## 发布版本

推送 `vX.Y.Z` 标签后，GitHub Actions 会运行完整检查，校验标签与 package 版本一致，使用 npm Trusted Publishing 和 provenance 发布，并创建带自动生成变更说明的 GitHub Release。

```bash
npm version patch   # 或 minor / major
git push --follow-tags origin main
```

## 项目范围

本项目只提供本地通知基础能力，不管理通知历史、远程音频、用户媒体或后台 daemon。

## 许可证

MIT，详见 [LICENSE](LICENSE)。
