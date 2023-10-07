export const renderLine = ({
  strategy,
  query,
  extractedTitle,
  extractedHref,
  baseUrl,
}) => {
  return `${strategy.name} -- ${query} --- ${extractedTitle} --- <${
    extractedHref.includes("https://") ? extractedHref : baseUrl + extractedHref
  }>\n`;
};
