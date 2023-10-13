import { renderMessage } from "../../utils.js"

export const strategy = {
  notify: async ({ messageItems }) => {
    console.log(renderMessage(messageItems))
  },
}
