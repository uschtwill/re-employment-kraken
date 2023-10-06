import { Client } from "@notionhq/client";

import "dotenv/config";

const notionClient = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

export const config = {
  queries: ["javascript", "devops"],
  debug: false,
  mode: "sequential",
  database: {
    enabled: true,
  },
  fetchConfig: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    },
    logResponse: false,
  },
  notifications: {
    consoleLog: {
      enabled: true,
    },
    macOSNotifier: {
      enabled: true,
      options: {
        title: "re-employment-kraken",
        subtitle: "There are new jobs!",
        sound: "Hero",
      },
    },
    slack: {
      enabled: false,
      username: process.env.SLACK_USERNAME,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      messageOptions: {
        username: "re-employment-kraken",
        icon_emoji: ":robot_face:",
      },
    },
    notion: {
      enabled: true,
      boardId: process.env.NOTION_BOARD_ID,
      // authToken: process.env.NOTION_AUTH_TOKEN,
      notionClient,
    },
  },
  strategies: [
    {
      name: "Hays",
      enabled: true,
      url: "https://www.hays.de/en/jobsearch/job-offers/j/Contracting/3/p/1?q=$$$QUERY$$$&e=false&pt=false",
      getters: {
        getSingleResult: ($) => $(".search__result__header__a"),
        getTitle: ($, result) =>
          $(result).find("h3.search__result__header__title span").text().trim(),
        getHref: ($, result) => $(result).attr("href"),
      },
    },
    {
      name: "DarwinRecruitment",
      enabled: true,
      url: "https://www.darwinrecruitment.de/search-jobs/?_location=contract&_keywords=$$$QUERY$$$",
      getters: {
        getSingleResult: ($) => $(".darwin_job_search_page_row"),
        getTitle: ($, result) =>
          $(result).find(".darwin_job_search_page_job_title").text().trim(),
        getHref: ($, result) => $(result).parent().attr("href"),
      },
    },
    {
      name: "AustinFraser",
      enabled: true,
      url: "https://www.austinfraser.com/de/jobangebote/contract?query=$$$QUERY$$$&selected_locations=&sort_type=relevance",
      getters: {
        getSingleResult: ($) => $(".job-result-item"),
        getTitle: ($, result) => $(result).find(".job-title").text().trim(),
        getHref: ($, result) => $(result).find(".job-title a").attr("href"),
      },
      baseUrl: "https://www.austinfraser.com",
    },
  ],
};
