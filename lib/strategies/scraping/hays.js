export const strategy = {
  name: "hays",
  url: "https://www.hays.de/en/jobsearch/job-offers/j/Contracting/3/p/1?q=$$$QUERY$$$",
  getters: {
    getSingleResult: ($) => $(".search__result__header__a"),
    getResultTitle: ($, result) =>
      $(result).find("h3.search__result__header__title span").text().trim(),
    getResultHref: ($, result) => $(result).attr("href"),
    getNextPageHref: ($) => {
      const linkElement = $(".search__results__pagination__next");
      return linkElement && !linkElement?.attr("class")?.includes("disabled")
        ? linkElement.attr("href")
        : null;
    },
  },
};
