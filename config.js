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
  strategies: [
    {
      name: "Hays",
      enabled: true,
      url: "https://www.hays.de/en/jobsearch/job-offers/j/Contracting/3/p/1?q=$$$QUERY$$$",
      baseUrl: "https://www.hays.de",
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
        getResultTitle: ($, result) =>
          $(result).find("a").text().trim().replace(" Job ansehen", ""),
        getResultHref: ($, result) => $(result).find("a").attr("href"),
        getNextPageHref: ($) => false,
      },
    },
    {
      name: "FreelancerMap",
      enabled: true,
      url: "https://www.freelancermap.de/projektboerse.html?query=$$$QUERY$$$&projectContractTypes%5B0%5D=contracting&created=20",
      baseUrl: "https://www.freelancermap.de",
      getters: {
        getSingleResult: ($) => $(".project-container.project.card.box"),
        getResultTitle: ($, result) =>
          $(result).find("h3 a.project-title").text().trim(),
        getResultHref: ($, result) =>
          $(result).find("h3 a.project-title").attr("href"),
        getNextPageHref: ($) => $("a.next").attr("href"),
      },
    },
    {
      name: "freelance-de",
      enabled: true,
      url: "https://www.freelance.de/search/project.php?__search_sort_by=2&__search_project_age=0&__search_profile_availability=0&__search_profile_update=0&__search_profile_apply_watchlist=0&__search_project_start_date=&__search_profile_ac=&__search_additional_filter=&__search=search&search_extended=0&__search_freetext=$$$QUERY$$$&__search_city=&seal=d9ee431da27158da7ea5a4f521bbf6622bc0db66&__search_city_location_id=&__search_city_country=&__search_city_country_extended=&__search_city_perimeter=0&search_id=d90e1dfa8d5b4a37b4d990f124bee389&__search_country=&__search_hour_rate_modifier=&__search_experience_modifier=&__search_additional_filter=&__search_project_age_remote=0&__search_project_start_date_remote=&__search_sort_by_remote=2",
      baseUrl: "https://www.freelance.de",
      customDeduplication: (href) => href.replace(/\/highlight=(\w|,)*$/, ""),
      getters: {
        getSingleResult: ($) =>
          $("div.project-list > div").text() ===
          "Es wurden leider keine Projekte für Ihre Suchanfrage gefunden."
            ? undefined
            : $("div.project-list > div"),
        getResultTitle: ($, result) =>
          $(result).find("h3.action-icons-overlap a").text().trim(),
        getResultHref: ($, result) =>
          $(result).find("h3.action-icons-overlap a").attr("href"),
        // Behaviour with next pages is quirky, whereas it works fine in the browser, with axios the passing of the search query doesn't work.
        // Current workaround is to just sort the search results by created_at, just crawl the first page, but crawl every hour. Like this we should still get all new jobs.
        getNextPageHref: ($) => false,
      },
    },
    {
      name: "top-itservices",
      enabled: false,
      url: "https://www.top-itservices.com/annoncen/$$$QUERY$$$/Freiberuflich/ort/umkreis/20",
      baseUrl: "https://www.top-itservices.com",
      getters: {
        getSingleResult: ($) => $("div.media > div.content.ml-3"),
        getResultTitle: ($, result) =>
          $(result)
            .find("a.forum-title.text-primary.font-weight-bold")
            .text()
            .trim(),
        getResultHref: ($, result) =>
          $(result)
            .find("a.forum-title.text-primary.font-weight-bold")
            .attr("href"),
        getNextPageHref: ($) => false, // Little amount of jobs, implementing pagination not wort the effort
      },
    },
  ],
};
