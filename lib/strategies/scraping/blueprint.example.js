export const strategy = {
  name: "BLUEPRINT_DO_NOT_LOAD", // name of the strategy, important for loading, see .exmaple.env; required
  url: "https://www.example.com/search?q=$$$QUERY$$$", // set $$$QUERY$$$ instead of the actual query; required
  customDeduplication: (href) => {
    // return a cleaned up url string; optional
  },
  zeroResultsYields404: false, // set to true, if site retuns 404 on zero results; optional
  getters: {
    getSingleResult: ($) => {
      // return a cheerio element for a single search result; required
    },
    getResultTitle: ($, result) => {
      // return a title string; required
    },
    getResultHref: ($, result) => {
      // return a url string; required
    },
    getNextPageHref: ($) => {
      // return a url string to the next page of paginated results; optional
    },
  },
};
