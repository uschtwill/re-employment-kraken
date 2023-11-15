import fs from "fs"

const _getBaseUrl = (url) => url.match(/^.+?[^/:](?=[?/]|$)/)[0]

const buildHref = (href, url) =>
  href.includes("https://") ? href : _getBaseUrl(url) + href

const renderMessage = ({
  strategyName,
  query,
  extractedTitle,
  extractedHref,
}) => {
  return `${strategyName} -- ${query} --- ${extractedTitle} --- <${extractedHref}>\n`
}

const loadStrategies = async (strategyType) => {
  const files = fs.readdirSync(`./lib/strategies/${strategyType}`)
  const loadedStrategies = []
  for (const fileName of files) {
    const strategyModule = await import(
      `./strategies/${strategyType}/${fileName}`
    )
    strategyModule.strategy.name = fileName.split(".")[0]
    loadedStrategies.push(strategyModule.strategy)
  }
  return loadedStrategies
}

export { buildHref, renderMessage, loadStrategies }
