import * as nodeNotifier from "node-notifier";
import { renderMessage } from "../../utils.js";

const notifier = new nodeNotifier.NotificationCenter();

export const strategy = {
  notify: async ({ messageItems, options }) => {
    const { title, subtitle, sound } = options;

    notifier.notify({
      message: renderMessage(messageItems),
      title,
      subtitle,
      sound,
    });
  },
};
