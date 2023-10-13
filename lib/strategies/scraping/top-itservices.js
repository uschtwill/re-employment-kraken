export const strategy = {
  url: "https://www.top-itservices.com/annoncen/$$$QUERY$$$/Freiberuflich/ort/umkreis/20",
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
}
