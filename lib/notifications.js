import axios from "axios";
import * as nodeNotifier from "node-notifier";

import { createNotionEntry } from "./notion.js";
import { renderLine } from "./renderLine.js";

const notifier = new nodeNotifier.NotificationCenter();

export const runNotifiers = async (notifications, lineItems) => {
  const { macOSNotifier, slack, consoleLog, notion } = notifications;
  const line = renderLine(lineItems);

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
    await postSlackMessage(line, slack);
  }

  if (notion.enabled) {
    await createNotionEntry(lineItems, notion);
  }
};

const postSlackMessage = async (line, slack) => {
  const { webhookUrl, messageOptions, username } = slack;

  await axios.post(webhookUrl, {
    text: `@${username} New Job: ${line}`,
    ...messageOptions,
  });
};
