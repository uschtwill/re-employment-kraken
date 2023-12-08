import * as cheerio from "cheerio"

import { insertNewJobs } from "./db.js"
import { buildHref } from "./utils.js"

export const process = async (htmlDocuments, strategy, query, config) => {
  const { debug } = config
  const {
    getters: { getSingleResult, getResultTitle, getResultHref },
    customDeduplication,
    url,
    name: strategyName,
  } = strategy

  for (const data of htmlDocuments) {
    const $ = cheerio.load(data)
    const results = getSingleResult($)

    if (results) {
      if (debug) {
        console.log(results)
      }

      const jobs = []

      results.each((_, result) => {
        const extractedTitle = getResultTitle($, result)
        const prelimHref = getResultHref($, result)
        const extractedHref = customDeduplication
          ? customDeduplication(prelimHref)
          : prelimHref

        jobs.push({
          strategyName,
          query,
          extractedTitle,
          extractedHref: buildHref(extractedHref, url),
        })
      })

      if (debug) {
        console.log(`Passing ${jobs.length} jobs to database insert for deduplication:\n${JSON.stringify(jobs)}`)
      }

      // Our database insert will filter known project URLs and return only the new ones.
      try {
        const newJobs = await insertNewJobs(jobs)

        if (debug) {
          console.log(`Inserted ${newJobs.length} new jobs into the database:\n${JSON.stringify(newJobs)}`)
        }

        await _runNotifiers(config, newJobs)
      } catch (err) {
        console.error(`Error while inserting and notifying about new jobs: ${err}`)
      }
    }
  }
}

const _runNotifiers = async (config, jobs) => {
  const { notificationStrategies, notificationOptions } = config

  for (const strategy of notificationStrategies) {
    const options = notificationOptions[strategy.name]

    if (options.enabled) {
      for (const job of jobs) {
        await strategy.notify({ messageItems: job, options })
      }
    }
  }
}
