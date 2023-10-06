import { config } from "./config.js";
import { fetchHTML } from "./http.js";
import { processData } from "./process.js";

const init = async (config) => {
  const { mode, strategies, queries } = config;

  if (mode === "sequential") {
    for (const strategy of strategies) {
      if (strategy.enabled) {
        for (const query of queries) {
          const data = await fetchHTML(strategy, query, config);
          await processData(data, strategy, query, config);
        }
      }
    }
  } else if (mode === "parallel") {
    // TODO: implement parallel mode
  }
};

init(config);
