import { config } from "./config.js"
import { fetch } from "./lib/fetch.js"
import { process as processStrategy } from "./lib/process.js"
import { initDB, closeDB, DB_IN_MEMORY } from "./lib/db.js"

const scrape = async (config) => {
  const { mode, scrapingStrategies, queries } = config
  if (mode === "sequential") {
    for (const strategy of scrapingStrategies) {
      for (const query of queries) {
        const htmlDocuments = await fetch(strategy, query, config)
        await processStrategy(htmlDocuments, strategy, query, config)
      }
    }
  } else if (mode === "parallel") {
    // TODO: implement parallel mode
  }
}

// This generic unhandled promise rejection handler is intended for debugging purposes. As an example, we have occasionally seen
// 'too many requests' errors that need to be investigated.
process.on('unhandledRejection', (reason) => {
  console.error('An unhandled Promise rejection occurred:', reason)
})

try {
  // In case the database flag is turned off, we fall back to an in-memory DB for temporary deduplication.
  initDB(config.database.enabled ? config.database.filePath : DB_IN_MEMORY)
  await scrape(config)
} catch (err) {
  console.error(`An unexpected error occurred: ${err.message}`)
} finally {
  closeDB()
}
