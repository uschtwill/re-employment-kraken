import axios from "axios";
import fs from "fs";

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
