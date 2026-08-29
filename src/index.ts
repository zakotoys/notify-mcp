#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SystemAudioPlayer } from "./audio.js";
import { SystemDesktopNotifier } from "./notifier.js";
import { NotificationService } from "./service.js";
import { createMcpServer } from "./server.js";

const service = new NotificationService(new SystemAudioPlayer(), new SystemDesktopNotifier());
const server = createMcpServer(service);
await server.connect(new StdioServerTransport());
