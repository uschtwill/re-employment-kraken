import fs from "fs";

const _getBaseUrl = (url) => url.match(/^.+?[^\/:](?=[?\/]|$)/)[0];

const buildHref = (href, url) =>
  href.includes("https://") ? href : _getBaseUrl(url) + href;

const renderMessage = ({
  strategy,
  query,
  extractedTitle,
  extractedHref,
  url,
}) => {
  return `${strategy.name} -- ${query} --- ${extractedTitle} --- <${buildHref(
    extractedHref,
    url
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
