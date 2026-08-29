import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { getBuiltInAudio, listBuiltInAudio } from "../src/catalog.js";
import { NotificationService } from "../src/service.js";
import { createMcpServer } from "../src/server.js";
import type { AudioPlayer, DesktopNotifier, AudioTrack, NotificationInput } from "../src/types.js";

const packageInfo = createRequire(import.meta.url)("../package.json") as { version: string };

class FakeAudio implements AudioPlayer {
  played: AudioTrack[] = [];
  async play(track: AudioTrack) { this.played.push(track); }
}
class FakeDesktop implements DesktopNotifier {
  sent: NotificationInput[] = [];
  async notify(input: NotificationInput) { this.sent.push(input); }
}

describe("built-in catalog", () => {
  it("contains only the supported fixed tracks", () => {
    expect(listBuiltInAudio().map((x) => x.id)).toEqual(["zako"]);
    expect(getBuiltInAudio("zako").assetFile).toBe("zako.wav");
  });
  it("rejects external or unknown ids", () => {
    expect(() => getBuiltInAudio("../../outside")).toThrow("Unknown built-in audio");
  });
});

describe("NotificationService", () => {
  it("plays audio and returns track details", async () => {
    const audio = new FakeAudio(); const desktop = new FakeDesktop();
    const result = await new NotificationService(audio, desktop).playAudio("zako");
    expect(audio.played.map((x) => x.id)).toEqual(["zako"]);
    expect(result.title).toBe("Audio played");
  });
  it("supports the built-in zako asset", async () => {
    const audio = new FakeAudio();
    await new NotificationService(audio, new FakeDesktop()).playAudio("zako");
    expect(audio.played[0]?.assetFile).toBe("zako.wav");
  });
  it("validates notification fields", async () => {
    const service = new NotificationService(new FakeAudio(), new FakeDesktop());
    await expect(service.notify({ title: " ", message: "body" })).rejects.toThrow("title must not be empty");
    await expect(service.notify({ title: "title", message: " " })).rejects.toThrow("message must not be empty");
    await expect(service.notify({ title: "x".repeat(201), message: "body" })).rejects.toThrow("title is too long");
    await expect(service.notify({ title: "title", message: "x".repeat(2001) })).rejects.toThrow("message is too long");
    await expect(service.notify({ title: "title", message: "body", subtitle: "x".repeat(201) })).rejects.toThrow("subtitle is too long");
  });
  it("sends a notification without audio", async () => {
    const audio = new FakeAudio(); const desktop = new FakeDesktop();
    await new NotificationService(audio, desktop).notifyWithAudio({ title: "T", message: "M" });
    expect(audio.played).toHaveLength(0); expect(desktop.sent).toEqual([{ title: "T", message: "M" }]);
  });
  it("plays audio before sending a combined notification", async () => {
    const events: string[] = [];
    const audio: AudioPlayer = { play: vi.fn(async () => { events.push("audio"); }) };
    const desktop: DesktopNotifier = { notify: vi.fn(async () => { events.push("desktop"); }) };
    await new NotificationService(audio, desktop).notifyWithAudio({ title: "T", message: "M", audio: "zako" });
    expect(events).toEqual(["audio", "desktop"]);
  });
});

describe("MCP registration", () => {
  it("registers and executes all public tools", async () => {
    const audio = new FakeAudio(); const desktop = new FakeDesktop();
    const service = new NotificationService(audio, desktop);
    type ToolEntry = { handler: (input?: unknown) => Promise<{ content: Array<{ text: string }> }> };
    const server = createMcpServer(service) as unknown as { _registeredTools: Record<string, ToolEntry>; server: object };
    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
    expect(Object.keys(server._registeredTools)).toEqual(["notify_list_audio", "notify_play_audio", "notify_desktop", "notify"]);
    const list = await server._registeredTools.notify_list_audio.handler();
    expect(JSON.parse(list.content[0].text)).toHaveLength(1);
    const played = await server._registeredTools.notify_play_audio.handler({ audio: "zako" });
    expect(JSON.parse(played.content[0].text).title).toBe("Audio played");
    const sent = await server._registeredTools.notify_desktop.handler({ title: "T", message: "M" });
    expect(sent.content[0].text).toContain("sent");
    await server._registeredTools.notify.handler({ title: "T", message: "M", audio: "zako" });
    expect(audio.played.map((track: AudioTrack) => track.id)).toEqual(["zako", "zako"]);
  });

  it("serves tools over the MCP transport", async () => {
    const service = new NotificationService(new FakeAudio(), new FakeDesktop());
    const server = createMcpServer(service);
    const client = new Client({ name: "test-client", version: "1" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual(["notify_list_audio", "notify_play_audio", "notify_desktop", "notify"]);
    expect(client.getServerVersion()?.version).toBe(packageInfo.version);
    const result = await client.callTool({ name: "notify_list_audio", arguments: {} });
    expect(result.isError).not.toBe(true);
    const invalid = await client.callTool({ name: "notify_play_audio", arguments: { audio: "external.wav" } });
    expect(invalid.isError).toBe(true);
    await client.close(); await server.close();
  });
});
