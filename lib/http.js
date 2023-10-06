import axios from "axios";
import fs from "fs";

import { errorHandler } from "./error.js";

export const fetchHTML = async (strategy, query, config) => {
  try {
    const { headers, logResponse } = config.fetchConfig;
    const { url } = strategy;

    const { data } = await axios.get(
      url.replace("$$$QUERY$$$", query),
      headers
    );

    if (logResponse) {
      fs.appendFileSync("./response.html", data);
    }

    return data;
  } catch (error) {
    errorHandler(error);
  }
};
