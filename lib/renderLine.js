export const renderLine = ({
  strategy,
  query,
  extractedTitle,
  extractedHref,
  baseUrl,
}) => {
  return `${strategy.name} -- ${query} --- ${extractedTitle} --- <${
    baseUrl || ""
  }${extractedHref}>\n`;
};
