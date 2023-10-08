import { Client } from "@notionhq/client";

import "dotenv/config";

const notionClient = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

export const config = {
  queries: process.env.QUERIES.split(","),
  debug: process.env.DEBUG === "true",
  mode: "sequential",
  database: {
    enabled: process.env.DATABASE_ENABLED === "true",
  },
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
  strategies: [
    {
      name: "Hays",
      enabled: true,
      url: "https://www.hays.de/en/jobsearch/job-offers/j/Contracting/3/p/1?q=$$$QUERY$$$",
      baseUrl: "https://www.hays.de",
      zeroResultsYields404: false,
      getters: {
        getSingleResult: ($) => $(".search__result__header__a"),
        getResultTitle: ($, result) =>
          $(result).find("h3.search__result__header__title span").text().trim(),
        getResultHref: ($, result) => $(result).attr("href"),
        getNextPageHref: ($) => {
          const linkElement = $(".search__results__pagination__next");
          return linkElement &&
            !linkElement?.attr("class")?.includes("disabled")
            ? linkElement.attr("href")
            : null;
        },
      },
    },
    {
      name: "DarwinRecruitment",
      enabled: true,
      url: "https://www.darwinrecruitment.de/search-jobs/?_location=contract&_keywords=$$$QUERY$$$",
      baseUrl: "https://www.darwinrecruitment.de",
      zeroResultsYields404: false,
      getters: {
        getSingleResult: ($) => $(".darwin_job_search_page_row"),
        getResultTitle: ($, result) =>
          $(result).find(".darwin_job_search_page_job_title").text().trim(),
        getResultHref: ($, result) => $(result).parent().attr("href"),
        getNextPageHref: ($) => false, // no html link, but JS click handler, not crawlable atm 🙄
      },
    },
    {
      name: "AustinFraser",
      enabled: true,
      url: "https://www.austinfraser.com/de/jobangebote/contract?query=$$$QUERY$$$",
      baseUrl: "https://www.austinfraser.com",
      zeroResultsYields404: false,
      getters: {
        getSingleResult: ($) => $(".job-result-item"),
        getResultTitle: ($, result) =>
          $(result).find(".job-title").text().trim(),
        getResultHref: ($, result) =>
          $(result).find(".job-title a").attr("href"),
        getNextPageHref: ($) => $("span.next").find("a").attr("href"),
      },
    },
    {
      name: "MichaelPage",
      enabled: true,
      url: "https://www.michaelpage.de/jobs/$$$QUERY$$$?contract=temp",
      baseUrl: "https://www.michaelpage.de",
      zeroResultsYields404: true,
      getters: {
        getSingleResult: ($) => $(".views-row"),
        getResultTitle: ($, result) => $(result).find("a").text().trim(),
        getResultHref: ($, result) => $(result).find("a").attr("href"),
        getNextPageHref: ($) => false,
      },
    },
  ],
};
