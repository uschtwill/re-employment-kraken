export const strategy = {
  url: "https://www.freelance.de/search/project.php?__search_sort_by=2&__search_project_age=0&__search_profile_availability=0&__search_profile_update=0&__search_profile_apply_watchlist=0&__search_project_start_date=&__search_profile_ac=&__search_additional_filter=&__search=search&search_extended=0&__search_freetext=$$$QUERY$$$&__search_city=&seal=d9ee431da27158da7ea5a4f521bbf6622bc0db66&__search_city_location_id=&__search_city_country=&__search_city_country_extended=&__search_city_perimeter=0&search_id=d90e1dfa8d5b4a37b4d990f124bee389&__search_country=&__search_hour_rate_modifier=&__search_experience_modifier=&__search_additional_filter=&__search_project_age_remote=0&__search_project_start_date_remote=&__search_sort_by_remote=2",
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
}
