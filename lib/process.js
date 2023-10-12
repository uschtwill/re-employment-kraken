import * as cheerio from "cheerio";

import { runNotifiers } from "./runNotifiers.js";
import { loadDatabase, writeToDatabase } from "./database.js";
import { buildHref, renderMessage } from "./utils.js";

export const process = async (htmlDocuments, strategy, query, config) => {
  const { database, notifications, debug, alreadySeenHrefs } = config;
  const {
    getters: { getSingleResult, getResultTitle, getResultHref },
    customDeduplication,
    url,
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

        const messageItems = {
          strategy,
          query,
          extractedTitle,
          extractedHref: buildHref(extractedHref, url),
        };

        if (!alreadySeenHrefs.includes(extractedHref)) {
          alreadySeenHrefs.push(extractedHref);
          if (database.enabled) {
            // Use complete link to individual job offer as identifier
            // to avoid already ingested jobs being ingested again
            if (!fileContent.includes(extractedHref)) {
              writeToDatabase(strategy, renderMessage(messageItems));
              promises.push(runNotifiers(notifications, messageItems));
            }
          } else {
            promises.push(runNotifiers(notifications, messageItems));
          }
        }
      });

      await Promise.all(promises);
    }
  }
};
