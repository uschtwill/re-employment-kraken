import * as cheerio from "cheerio";

import { runNotifiers } from "./runNotifiers.js";
import { loadDatabase, writeToDatabase } from "./database.js";
import { renderLine } from "./renderLine.js";
import { buildHref } from "./utils.js";

export const process = async (htmlDocuments, strategy, query, config) => {
  const { database, notifications, debug, alreadySeenHrefs } = config;
  const {
    getters: { getSingleResult, getResultTitle, getResultHref },
    baseUrl,
    customDeduplication,
  } = strategy;

  const fileContent = await loadDatabase(strategy);

  for (const data of htmlDocuments) {
    const $ = cheerio.load(data);
    const results = getSingleResult($);

    if (results) {
      if (debug) {
        console.log(results);
      }

      const promises = [];

      results.each((_, result) => {
        const extractedTitle = getResultTitle($, result);
        const prelimHref = getResultHref($, result);
        const extractedHref = customDeduplication
          ? customDeduplication(prelimHref)
          : prelimHref;

        const lineItems = {
          strategy,
          query,
          extractedTitle,
          extractedHref: buildHref(extractedHref, baseUrl),
        };

        if (!alreadySeenHrefs.includes(extractedHref)) {
          alreadySeenHrefs.push(extractedHref);
          if (database.enabled) {
            // Use complete link to individual job offer as identifier
            // to avoid already ingested jobs being ingested again
            if (!fileContent.includes(extractedHref)) {
              writeToDatabase(strategy, renderLine(lineItems));
              promises.push(runNotifiers(notifications, lineItems));
            }
          } else {
            promises.push(runNotifiers(notifications, lineItems));
          }
        }
      });

      await Promise.all(promises);
    }
  }
};
