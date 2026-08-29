export type AudioId = "zako";

export interface AudioTrack {
  readonly id: AudioId;
  readonly label: string;
  readonly description: string;
  readonly frequencyHz: number;
  readonly durationMs: number;
  readonly assetFile?: string;
}

export interface AudioPlayer {
  play(track: AudioTrack): Promise<void>;
}

export interface DesktopNotifier {
  notify(input: NotificationInput): Promise<void>;
}

export interface NotificationInput {
  title: string;
  message: string;
  subtitle?: string;
}

export interface NotifyRequest extends NotificationInput {
  audio?: AudioId;
}
