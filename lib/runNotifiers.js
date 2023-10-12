import axios from "axios";
import * as nodeNotifier from "node-notifier";

import { createNotionEntry } from "./createNotionEntry.js";
import { renderMessage } from "./utils.js";

const notifier = new nodeNotifier.NotificationCenter();

export const runNotifiers = async (notifications, messageItems) => {
  const { macOSNotifier, slack, consoleLog, notion } = notifications;
  const line = renderMessage(messageItems);

  if (consoleLog.enabled) {
    console.log(line);
  }

  if (macOSNotifier.enabled) {
    notifier.notify({
      message: line,
      ...macOSNotifier.options,
    });
  }

  if (slack.enabled) {
    await _postSlackMessage(line, slack);
  }

  if (notion.enabled) {
    await createNotionEntry(messageItems, notion);
  }
};

const _postSlackMessage = async (line, slack) => {
  const { webhookUrl, messageOptions, username } = slack;

  await axios.post(webhookUrl, {
    text: `@${username} New Job: ${line}`,
    ...messageOptions,
  });
};
