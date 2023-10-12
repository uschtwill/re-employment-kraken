import * as cheerio from "cheerio";

import { loadDatabase, writeToDatabase } from "./database.js";
import { buildHref, renderMessage } from "./utils.js";

export const process = async (htmlDocuments, strategy, query, config) => {
  const { database, debug, alreadySeenHrefs } = config;
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
              promises.push(_runNotifiers(config, messageItems));
            }
          } else {
            promises.push(_runNotifiers(config, messageItems));
          }
        }
      });

      await Promise.all(promises);
    }
  }
};

const _runNotifiers = async (config, messageItems) => {
  const { notificationStrategies, notificationOptions } = config;

  for (const strategy of notificationStrategies) {
    const options = notificationOptions[strategy.name];

    if (options.enabled) {
      await strategy.notify({ messageItems, options });
    }
  }
};
