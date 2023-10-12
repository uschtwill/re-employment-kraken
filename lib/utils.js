import fs from "fs";
  href.includes("https://") ? href : baseUrl + href;

const renderMessage = ({
  strategy,
  query,
  extractedTitle,
  extractedHref,
  baseUrl,
}) => {
  return `${strategy.name} -- ${query} --- ${extractedTitle} --- <${buildHref(
    extractedHref,
    baseUrl
  )}>\n`;
};

const loadScrapingStrategies = async () => {
  const files = fs.readdirSync("./lib/strategies/scraping");
  const loadedStrategies = [];
  for (const file of files) {
    const strategyModule = await import(`./strategies/scraping/${file}`);
    loadedStrategies.push(strategyModule.strategy);
  }
  return loadedStrategies;
};

export { buildHref, renderMessage, loadScrapingStrategies };
