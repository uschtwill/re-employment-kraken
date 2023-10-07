import { config } from "./config.js";
import { fetchHTML } from "./lib/fetchHTML.js";
import { processData } from "./lib/processData.js";

const init = async (config) => {
  const { mode, strategies, queries } = config;

  if (mode === "sequential") {
    for (const strategy of strategies) {
      if (strategy.enabled) {
        for (const query of queries) {
          const htmlDocuments = await fetchHTML(strategy, query, config);
          await processData(htmlDocuments, strategy, query, config);
        }
      }
    }
  } else if (mode === "parallel") {
    // TODO: implement parallel mode
  }
};

init(config);
