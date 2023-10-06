import * as cheerio from "cheerio";

import { runNotifiers } from "./notifications.js";
import { loadDatabase, writeToDatabase } from "./database.js";

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

    const line = `${strategy.name} -- ${query} --- ${extractedTitle} --- <${
      baseUrl || ""
    }${extractedHref}>\n`;

    if (database.enabled) {
      // Use complete link to individual job offer as identifie
      // to avoid already ingested jobs being ingested again
      if (!fileContent.includes(extractedHref)) {
        writeToDatabase(strategy, line);
        promises.push(runNotifiers(notifications, line));
      }
    } else {
      promises.push(runNotifiers(notifications, line));
    }
  });

  await Promise.all(promises);
};
