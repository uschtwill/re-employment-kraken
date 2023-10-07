import * as cheerio from "cheerio";

import { runNotifiers } from "./runNotifiers.js";
import { loadDatabase, writeToDatabase } from "./database.js";
import { renderLine } from "./renderLine.js";

export const processData = async (htmlDocuments, strategy, query, config) => {
  const { database, notifications, debug } = config;
  const {
    getters: { getSingleResult, getResultTitle, getResultHref },
    baseUrl,
  } = strategy;

  const fileContent = await loadDatabase(strategy);

  for (const data of htmlDocuments) {
    const $ = cheerio.load(data);
    const results = getSingleResult($);

    if (debug) {
      console.log(results);
    }

    const promises = [];

    results.each((_, result) => {
      const extractedTitle = getResultTitle($, result);
      const extractedHref = getResultHref($, result);

      const lineItems = {
        strategy,
        query,
        extractedTitle,
        extractedHref: extractedHref.includes("https://")
          ? extractedHref
          : baseUrl + extractedHref,
      };

      if (database.enabled) {
        // Use complete link to individual job offer as identifie
        // to avoid already ingested jobs being ingested again
        if (!fileContent.includes(extractedHref)) {
          writeToDatabase(strategy, renderLine(lineItems));
          promises.push(runNotifiers(notifications, lineItems));
        }
      } else {
        promises.push(runNotifiers(notifications, lineItems));
      }
    });

    await Promise.all(promises);
  }
};
