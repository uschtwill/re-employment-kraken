export const strategy = {
  name: "austin-fraser",
  url: "https://www.austinfraser.com/de/jobangebote/contract?query=$$$QUERY$$$",
  getters: {
    getSingleResult: ($) => $(".job-result-item"),
    getResultTitle: ($, result) => $(result).find(".job-title").text().trim(),
    getResultHref: ($, result) => $(result).find(".job-title a").attr("href"),
    getNextPageHref: ($) => $("span.next").find("a").attr("href"),
  },
};
