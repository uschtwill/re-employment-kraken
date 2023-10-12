const buildHref = (href, baseUrl) =>
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

export { buildHref, renderMessage };
