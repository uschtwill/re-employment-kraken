export const strategy = {
  url: "https://www.freelancermap.de/projektboerse.html?query=$$$QUERY$$$&projectContractTypes%5B0%5D=contracting&created=20",
  getters: {
    getSingleResult: ($) => $(".project-container.project.card.box"),
    getResultTitle: ($, result) =>
      $(result).find("h3 a.project-title").text().trim(),
    getResultHref: ($, result) =>
      $(result).find("h3 a.project-title").attr("href"),
    getNextPageHref: ($) => $("a.next").attr("href"),
  },
};
