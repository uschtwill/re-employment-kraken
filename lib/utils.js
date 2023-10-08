const buildHref = (href, baseUrl) =>
  href.includes("https://") ? href : baseUrl + href;

export { buildHref };
