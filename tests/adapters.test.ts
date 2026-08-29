import { beforeEach, describe, expect, it, vi } from "vitest";

const { notify } = vi.hoisted(() => ({
  notify: vi.fn((_options: unknown, callback: (error?: Error) => void) => callback())
}));
vi.mock("node-notifier", () => ({ default: { notify } }));

import { SystemAudioPlayer } from "../src/audio.js";
import { SystemDesktopNotifier } from "../src/notifier.js";
import { getBuiltInAudio } from "../src/catalog.js";

const generatedTrack = { id: "zako", label: "Generated", description: "test", frequencyHz: 440, durationMs: 100 } as const;

describe("SystemAudioPlayer", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["darwin", "afplay"],
    ["win32", "powershell"],
    ["linux", "aplay"]
  ] as const)("uses the native player on %s", async (platform, command) => {
    const run = vi.fn(async (_command: string, _args: string[]) => {});
    await new SystemAudioPlayer(platform, run).play(generatedTrack);
    expect(run.mock.calls[0]?.[0]).toBe(command);
  });

  it("passes a fixed asset path without rewriting the asset", async () => {
    const run = vi.fn(async (_command: string, _args: string[]) => {});
    await new SystemAudioPlayer("darwin", run).play({
      ...getBuiltInAudio("zako")
    });
    expect(run.mock.calls[0]?.[1]?.[0]).toContain("assets/audio/zako.wav");
  });

  it("cleans up and reports unsupported platforms", async () => {
    await expect(new SystemAudioPlayer("freebsd").play(generatedTrack)).rejects.toThrow("unsupported");
  });
});

describe("SystemDesktopNotifier", () => {
  it("passes native notification fields to node-notifier", async () => {
    await new SystemDesktopNotifier().notify({ title: "Title", message: "Message", subtitle: "Sub" });
    expect(notify).toHaveBeenCalledWith({ title: "Title", message: "Message", subtitle: "Sub" }, expect.any(Function));
  });

  it("propagates notifier errors", async () => {
    notify.mockImplementationOnce((_options, callback) => callback(new Error("unavailable")));
    await expect(new SystemDesktopNotifier().notify({ title: "T", message: "M" })).rejects.toThrow("unavailable");
  });
});
