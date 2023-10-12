import axios from "axios";
import { renderMessage } from "../../utils.js";

export const strategy = {
  notify: async ({ messageItems, options }) => {
    const { webhookUrl, messageOptions, username } = options;

    await axios.post(webhookUrl, {
      text: `@${username} New Job: ${renderMessage(messageItems)}`,
      ...messageOptions,
    });
  },
};
