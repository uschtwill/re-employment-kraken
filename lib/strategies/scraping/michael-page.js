export const strategy = {
  name: "michael-page",
  url: "https://www.michaelpage.de/jobs/$$$QUERY$$$?contract=temp",
  zeroResultsYields404: true,
  getters: {
    getSingleResult: ($) => $(".views-row"),
    getResultTitle: ($, result) =>
      $(result).find("a").text().trim().replace(" Job ansehen", ""),
    getResultHref: ($, result) => $(result).find("a").attr("href"),
    getNextPageHref: ($) => false,
  },
};
