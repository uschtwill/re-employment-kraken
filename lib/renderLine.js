import { buildHref } from "./utils.js";

export const renderLine = ({
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
