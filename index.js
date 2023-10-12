import { config } from "./config.js";
import { fetch } from "./lib/fetch.js";
import { process } from "./lib/process.js";

const init = async (config) => {
  const { mode, strategies, queries } = config;
  if (mode === "sequential") {
    for (const strategy of strategies) {
      for (const query of queries) {
        const htmlDocuments = await fetch(strategy, query, config);
        await process(htmlDocuments, strategy, query, config);
      }
    }
  } else if (mode === "parallel") {
    // TODO: implement parallel mode
  }
};

init(config);
