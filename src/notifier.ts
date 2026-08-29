import notifier from "node-notifier";
import type { DesktopNotifier, NotificationInput } from "./types.js";

export class SystemDesktopNotifier implements DesktopNotifier {
  async notify(input: NotificationInput): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      notifier.notify(
        { title: input.title, message: input.message, subtitle: input.subtitle },
        (error) => error ? reject(error) : resolve()
      );
    });
  }
}
