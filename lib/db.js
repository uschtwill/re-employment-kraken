import sqlite3 from 'sqlite3'
import joi from 'joi'

// The constants below can be passed to initDB to create a persistent or in-memory database.
export const DB_PERSISTENT = "re-employment-kraken.db"
export const DB_IN_MEMORY = ":memory:"

// Due to simplicity, all schema definition steps are defined below. Depending on required future changes,
// we can think about introducing a schema migration tool and extract all steps to plain SQL files.
// Please make sure that schema changes are backwards-compatible and idempotent:
// 1. Changes should not break existing databases.
// 2. Running those steps repeatedly should not change the schema and not cause any errors or data loss.
const CREATE_SCHEMA = `
        CREATE TABLE IF NOT EXISTS job (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT to prevent reuse of deleted rows ROWID.
            strategy_name TEXT,
            query TEXT,
            title TEXT,
            url TEXT NOT NULL UNIQUE -- The url key allows deduplication and detection of known projects.
        );
        CREATE INDEX IF NOT EXISTS idx_job_url ON job(url);`

// We validate that all required fields are present for keeping our database clean and consistent.
// Fields can be empty except for the href (url) since this is our unique key used for deduplication.
const schema = joi.array().items(joi.object({
    strategyName: joi.string().required().allow(""),
    query: joi.string().required().allow(""),
    extractedTitle: joi.string().required().allow(""),
    extractedHref: joi.string().required(),
}).unknown()) // Allow additional fields that we do not use.


// Will be initilized when initDB is called. closeDB should be called upon shutdown.
let db = null

// initDB MUST be called once before any interaction with the database occurs (e.g. on application startup).
// It returns a Promise that resolves when the database has been prepared successfully.
export const initDB = async (dbConnectionString) => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbConnectionString, (err) => {
            if (err) {
                reject(new Error(`Error on creating database connection: ${err.message}`))
                return
            }

            db.exec(CREATE_SCHEMA, (_, err) => {
                if (err) {
                    reject(new Error(`Error on creating database schema: ${err.message}`))
                    return
                }

                resolve(null)
            })
        })
    })
}

// closeDB should be called after no more interaction with the database occurs to cleanup resources (e.g. on application shutdown).
// It returns a Promise that resolves when the database has been closed successfully.
export const closeDB = async () => {
    if (!db) {
        // DB never initialized. Nothing to do, not an error.
        return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(new Error(`Error on closing database connection: ${err.message}`))
                return
            }

            resolve(null)
        })
    })
}


// insertNewJobs accepts an array of job elements and inserts jobs with unknown hrefs (urls) into the job table.
// Following fields MUST be present on each element:
// * strategyName (can be empty)
// * query (can be empty)
// * extractedTitle (can be empty)
// * extractedHref (must NOT be empty)
// It returns a Promise of newly inserted jobs for further processing, i.e. jobs whose hrefs (urls) were not present in the job table yet.
export const insertNewJobs = async (jobs) => {
    if (!db) {
        return Promise.reject(new Error('DB is not initialized, initDB must be called first'))
    }

    const { error } = schema.validate(jobs)
    if (error) {
        return Promise.reject(new Error(`Array of jobs to insert does not match expected schema: ${error.message}`))
    }

    const statement = `
        INSERT OR IGNORE INTO job(strategy_name, query, title, url) 
        VALUES (?, ?, ?, ?)
        RETURNING strategy_name AS strategyName, query, title AS extractedTitle, url AS extractedHref;`

    return new Promise((resolve, reject) => {
        const insertedJobs = []

        const insert = db.prepare(statement, (err) => {
            if (err) {
                reject(new Error(`Error on preparing job insert statement: ${err.message}`))
                return
            }

            db.serialize(() => {
                for (const { strategyName, query, extractedTitle, extractedHref } of jobs) {
                    insert.get(strategyName, query, extractedTitle, extractedHref, (err, row) => {
                        if (err) {
                            reject(new Error(`Error on inserting job row: ${err.message}`))
                            return
                        }
                        // Only return jobs that were not known yet (no row will be returned if the job is already known).
                        if (row) {
                            insertedJobs.push(row)
                        }
                    })
                }

                insert.finalize((err) => {
                    if (err) {
                        reject(new Error(`Error on finalizing job row inserts: ${err.message}`))
                        return
                    }

                    resolve(insertedJobs)
                })
            })
        })
    })
}
