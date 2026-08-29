# @zakotoys/notify-mcp

[![npm](https://img.shields.io/npm/v/%40zakotoys%2Fnotify-mcp?logo=npm&logoColor=white)](https://www.npmjs.com/package/@zakotoys/notify-mcp)
[![CI](https://github.com/zakotoys/notify-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/zakotoys/notify-mcp/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/zakotoys/notify-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/zakotoys/notify-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**English** | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md)

`notify-mcp` is a small [Model Context Protocol](https://modelcontextprotocol.io)
server for playing fixed built-in sounds and showing native desktop
notifications. It connects Claude Desktop, Cursor, OpenCode, Codex, or another
MCP client to the local Windows or macOS notification system through stdio.

## Features

- Four standard MCP tools for listing the audio, playing it, sending a desktop
  notification, and doing both in one call.
- One built-in audio track: `zako`.
- Native notifications through `node-notifier` (Windows notification center and
  macOS Notification Center).
- Audio is intentionally closed: callers can select a built-in id, but cannot
  provide a file path, URL, upload, or runtime-added track.
- Business logic is separated from operating-system adapters and is fully
  testable without a speaker or desktop session.

## Requirements

- Node.js 20 or newer.
- A supported MCP client such as Claude Desktop, Cursor, OpenCode, or Codex.
- Windows 10+ or macOS for the primary desktop notification experience.

Linux is also supported when `aplay` and a desktop notification backend are
available.

## Quick start

### Claude Desktop, Cursor, OpenCode, or Codex

Install the package globally:

```bash
npm install --global @zakotoys/notify-mcp
```

Then add this server to the client's MCP configuration:

```json
{
  "mcpServers": {
    "notify": {
      "command": "notify-mcp"
    }
  }
}
```

You can also run the package without a global install:

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

For Windows clients that do not resolve `npx` directly, use `cmd`:

```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@zakotoys/notify-mcp@latest"]
}
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx -y @zakotoys/notify-mcp@latest
```

Call `notify_list_audio` first, then try `notify_desktop` or `notify`.

## MCP tools

| Tool | Purpose |
| --- | --- |
| `notify_list_audio` | List the fixed built-in audio catalog. |
| `notify_play_audio` | Play one built-in audio track. |
| `notify_desktop` | Show a native desktop notification. |
| `notify` | Play optional built-in audio, then show a notification. |

### `notify_list_audio`

Takes no arguments. Each item includes an `id`, label, description, frequency,
and duration.

### `notify_play_audio`

```json
{ "audio": "zako" }
```

`audio` must be `zako`. The server ships a short voice-only WAV asset, delegates
to the native player, and never accepts external audio paths or URLs.

The clip is a short vocal extraction from the source documented in
[`assets/audio/SOURCE.md`](assets/audio/SOURCE.md). Verify redistribution rights
before publishing a package containing this asset.

### `notify_desktop`

```json
{
  "title": "Build complete",
  "message": "notify-mcp finished successfully",
  "subtitle": "Optional supplementary text"
}
```

`title` is required and limited to 200 characters. `message` is required and
limited to 2,000 characters. `subtitle` is optional and limited to 200
characters.

### `notify`

```json
{
  "audio": "zako",
  "title": "Reminder",
  "message": "The meeting starts in five minutes"
}
```

`audio` is optional. When provided, playback completes before the desktop
notification is submitted.

## Platform behavior

- **macOS:** `afplay` for sound and Notification Center through
  `node-notifier`.
- **Windows:** PowerShell `Media.SoundPlayer` for sound and Windows
  notification center through `node-notifier`.
- **Linux:** ALSA `aplay` for sound, with the notification backend selected by
  `node-notifier`.

The operating system may require permission for the terminal application to
send notifications. The server does not upload notification text or audio.

## Development

```bash
npm install
npm run typecheck  # TypeScript checks (including tests)
npm test          # Vitest + V8 coverage
npm run build     # Compile runtime files into dist/
npm run ci        # All checks, coverage, build, and package dry-run
```

The test suite uses injected fake adapters and an in-memory MCP transport, so
CI does not need a speaker, GUI, or real notification center.

## Releases

Every `vX.Y.Z` tag is published by GitHub Actions after the full CI suite and a
package-version check pass. The publish workflow uses npm Trusted Publishing
with provenance and creates a GitHub Release with generated notes.

To release a new version:

```bash
npm version patch   # or minor / major
git push --follow-tags origin main
```

Configure the npm package's Trusted Publisher for the repository
`zakotoys/notify-mcp`, workflow `publish.yml`, and the GitHub Actions provider.

## Project scope

This project intentionally provides local notification primitives only. It
does not manage notification history, remote audio, user-uploaded media, or a
background daemon. MCP clients decide when a tool should be called.

## License

MIT, see [LICENSE](LICENSE).
