import { renderMessage } from "../../utils.js"

export const strategy = {
  notify: async ({ messageItems, options }) => {
    const { telegramUserId, telegramBotClient } = options

    telegramBotClient.sendMessage(telegramUserId, renderMessage(messageItems))
  },
}
