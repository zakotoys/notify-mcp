import { getBuiltInAudio } from "./catalog.js";
import type { AudioPlayer, DesktopNotifier, NotificationInput, NotifyRequest } from "./types.js";

export class NotificationService {
  constructor(private readonly audio: AudioPlayer, private readonly desktop: DesktopNotifier) {}

  listAudio() { return getBuiltInAudioList(); }

  async playAudio(id: string): Promise<NotificationInput> {
    const track = getBuiltInAudio(id);
    await this.audio.play(track);
    return { title: "Audio played", message: track.label, subtitle: track.description };
  }

  async notify(input: NotificationInput): Promise<void> {
    validateNotification(input);
    await this.desktop.notify(input);
  }

  async notifyWithAudio(input: NotifyRequest): Promise<void> {
    validateNotification(input);
    if (input.audio) await this.audio.play(getBuiltInAudio(input.audio));
    await this.desktop.notify(input);
  }
}

function getBuiltInAudioList() { return ["zako"].map(getBuiltInAudio); }

function validateNotification(input: NotificationInput): void {
  if (!input.title.trim()) throw new Error("title must not be empty");
  if (!input.message.trim()) throw new Error("message must not be empty");
  if (input.title.length > 200) throw new Error("title is too long");
  if (input.message.length > 2000) throw new Error("message is too long");
  if (input.subtitle && input.subtitle.length > 200) throw new Error("subtitle is too long");
}
