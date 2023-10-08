import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

import { buildHref } from "./utils.js";

export const fetch = async (strategy, query, config) => {
  try {
    const { headers, logResponse } = config.fetchConfig;
    const {
      url,
      baseUrl,
      getters: { getNextPageHref },
    } = strategy;

    const htmlDocuments = [];
    let href = url.replace("$$$QUERY$$$", query);

    while (href) {
      const { data } = await axios.get(href, headers);

      if (logResponse) {
        fs.appendFileSync("./response.html", data);
      }

      htmlDocuments.push(data);

      const $ = cheerio.load(data);
      const nextHref = getNextPageHref($);

      if (!nextHref) {
        href = false;
      } else {
        href = buildHref(nextHref, baseUrl);
      }
    }

    return htmlDocuments;
  } catch (error) {
    _handleError(error);
  }
};

const _handleError = (error) => {
  // Shamelessly taken from: https://axios-http.com/docs/handling_errors
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }
  console.log(error.config);
};
