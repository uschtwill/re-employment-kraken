import { Client } from "@notionhq/client";

import { loadScrapingStrategies } from "./lib/utils.js";

import "dotenv/config";

const notionClient = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

const enabledScrapingStrategies =
  process.env.ENABLED_SCRAPING_STRATEGIES.split(",");
const loadedStrategies = await loadScrapingStrategies();

export const config = {
  queries: process.env.QUERIES.split(","),
  strategies: loadedStrategies.filter((strategy) =>
    enabledScrapingStrategies.includes(strategy.name)
  ),
  debug: process.env.DEBUG === "true",
  mode: "sequential",
  database: {
    enabled: process.env.DATABASE_ENABLED === "true",
  },
  alreadySeenHrefs: [],
  fetchConfig: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    },
    logResponse: process.env.LOG_HTTP_RESPONSE === "true",
  },
  notifications: {
    consoleLog: {
      enabled: process.env.CONSOLELOG_ENABLED === "true",
    },
    macOSNotifier: {
      enabled: process.env.MACOSNOTIFIER_ENABLED === "true",
      options: {
        title: "re-employment-kraken",
        subtitle: "There are new jobs!",
        sound: "Hero",
      },
    },
    slack: {
      enabled: process.env.SLACK_ENABLED === "true",
      username: process.env.SLACK_USERNAME,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      messageOptions: {
        username: "re-employment-kraken",
        icon_emoji: ":robot_face:",
      },
    },
    notion: {
      enabled: process.env.NOTION_ENABLED === "true",
      boardId: process.env.NOTION_BOARD_ID,
      notionClient,
    },
  },
};
