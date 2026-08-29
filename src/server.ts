import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { NotificationService } from "./service.js";

const packageInfo = createRequire(import.meta.url)("../package.json") as { version: string };

const audioId = z.enum(["zako"]);
const title = z.string().trim().min(1).max(200);
const message = z.string().trim().min(1).max(2000);
const subtitle = z.string().max(200).optional();

function toolInput<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).meta({ additionalProperties: false });
}

export function createMcpServer(service: NotificationService): McpServer {
  const server = new McpServer({ name: "notify-mcp", version: packageInfo.version });

  server.registerTool("notify_list_audio", {
    title: "List built-in audio",
    description: "List the fixed audio tracks available to notify-mcp.",
    inputSchema: toolInput({})
  }, async () => ({ content: [{ type: "text", text: JSON.stringify(service.listAudio()) }] }));

  server.registerTool("notify_play_audio", {
    title: "Play built-in audio",
    description: "Play one fixed, built-in audio track on this computer.",
    inputSchema: toolInput({ audio: audioId })
  }, async ({ audio }) => {
    const result = await service.playAudio(audio);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  });

  server.registerTool("notify_desktop", {
    title: "Show desktop notification",
    description: "Show a native Windows or macOS desktop notification.",
    inputSchema: toolInput({ title, message, subtitle })
  }, async (input) => {
    await service.notify(input);
    return { content: [{ type: "text", text: "Desktop notification sent" }] };
  });

  server.registerTool("notify", {
    title: "Notify with optional audio",
    description: "Play an optional built-in audio track and show a desktop notification.",
    inputSchema: toolInput({ title, message, subtitle, audio: audioId.optional() })
  }, async (input) => {
    await service.notifyWithAudio(input);
    return { content: [{ type: "text", text: "Notification sent" }] };
  });

  return server;
}
