import * as cheerio from "cheerio";

import { runNotifiers } from "./notifications.js";
import { loadDatabase, writeToDatabase } from "./database.js";
import { renderLine } from "./renderLine.js";

export const processData = async (data, strategy, query, config) => {
  const { database, notifications, debug } = config;
  const {
    getters: { getSingleResult, getTitle, getHref },
    baseUrl,
  } = strategy;

  const fileContent = await loadDatabase(strategy);

  const $ = cheerio.load(data);
  const results = getSingleResult($);

  if (debug) {
    console.log(results);
  }

  const promises = [];

  results.each((_, result) => {
    const extractedTitle = getTitle($, result);
    const extractedHref = getHref($, result);

    const lineItems = {
      strategy,
      query,
      extractedTitle,
      extractedHref: baseUrl ? baseUrl + extractedHref : extractedHref,
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
};
