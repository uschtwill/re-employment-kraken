import axios from "axios";
import * as nodeNotifier from "node-notifier";

const notifier = new nodeNotifier.NotificationCenter();

export const runNotifiers = async (notifications, line) => {
  const { macOSNotifier, slack, consoleLog } = notifications;

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
    return postSlackMessage(line, slack);
  }
};

const postSlackMessage = async (line, slack) => {
  const { webhookUrl, messageOptions, username } = slack;

  await axios.post(webhookUrl, {
    text: `@${username} New Job: ${line}`,
    ...messageOptions,
  });
};
