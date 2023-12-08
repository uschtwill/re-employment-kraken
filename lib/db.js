import Database from 'better-sqlite3'
import joi from 'joi'
import fs from 'fs'
import path from 'path'

// DB_IN_MEMORY can be passed to initDB to create an in-memory database without lasting persistence.
export const DB_IN_MEMORY = ":memory:"

// Due to simplicity, all schema definition steps are defined below. Depending on required future changes,
// we can think about introducing a schema migration tool and extract all steps to plain SQL files.
// Please make sure that schema changes are backwards-compatible and idempotent:
// 1. Changes should not break existing databases.
// 2. Running those steps repeatedly should not change the schema and not cause any errors or data loss.
const CREATE_SCHEMA = `
        CREATE TABLE IF NOT EXISTS job (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT to prevent reuse of deleted rows ROWID.
            strategyName TEXT,
            query TEXT,
            extractedTitle TEXT,
            extractedHref TEXT NOT NULL UNIQUE -- The extracted href allows deduplication and detection of known projects.
        );
        CREATE INDEX IF NOT EXISTS idxJobExtractedHref ON job(extractedHref);`

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
export const initDB = (dbFilePath) => {
    if (dbFilePath !== DB_IN_MEMORY) {
        const dir = path.dirname(dbFilePath)

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        // DB file will be created automatically as the target directory exists.
    }

    db = new Database(dbFilePath)
    // The documentation of better-sqlite3 recommends activating WAL mode for increased performance: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
    db.pragma('journal_mode = WAL');

    db.exec(CREATE_SCHEMA)
}

// closeDB should be called after no more interaction with the database occurs to cleanup resources (e.g. on application shutdown).
// It returns a Promise that resolves when the database has been closed successfully.
export const closeDB = () => {
    if (!db) {
        // DB never initialized. Nothing to do, not an error.
        return
    }

    db.close()
}

// insertNewJobs accepts an array of job elements and inserts jobs with unknown hrefs (urls) into the job table.
// Following fields MUST be present on each element:
// * strategyName (can be empty)
// * query (can be empty)
// * extractedTitle (can be empty)
// * extractedHref (must NOT be empty)
// It returns a Promise of newly inserted jobs for further processing, i.e. jobs whose hrefs (urls) were not present in the job table yet.
export const insertNewJobs = (jobs) => {
    if (!db) {
        throw new Error('DB is not initialized, initDB must be called first')
    }

    const { error } = schema.validate(jobs)
    if (error) {
        throw new Error(`Array of jobs to insert does not match expected schema: ${error.message}`)
    }

    const statement = `
        INSERT OR IGNORE INTO job(strategyName, query, extractedTitle, extractedHref) 
        VALUES (?, ?, ?, ?)
        RETURNING strategyName, query, extractedTitle, extractedHref;`

    const insertedJobs = []
    const insert = db.prepare(statement)

    for (const { strategyName, query, extractedTitle, extractedHref } of jobs) {
        const row = insert.get(strategyName, query, extractedTitle, extractedHref)

        // Only return jobs that were not known yet (no row will be returned if the job is already known).
        if (row) {
            insertedJobs.push(row)
        }
    }

    return insertedJobs
}
