export const strategy = {
  name: "darwin-recruitment",
  url: "https://www.darwinrecruitment.de/search-jobs/?_location=contract&_keywords=$$$QUERY$$$",
  getters: {
    getSingleResult: ($) => $(".darwin_job_search_page_row"),
    getResultTitle: ($, result) =>
      $(result).find(".darwin_job_search_page_job_title").text().trim(),
    getResultHref: ($, result) => $(result).parent().attr("href"),
    getNextPageHref: ($) => false, // no html link, but JS click handler, not crawlable atm 🙄
  },
};
