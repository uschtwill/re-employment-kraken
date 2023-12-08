import { initDB, closeDB, insertNewJobs } from "../lib/db.js"
import assert from 'assert'

describe('database', () => {
    it('closeDB without previous initDB shall succeed', () => {
        closeDB()
    })

    it('insert jobs without previous initDB shall fail', () => {
        assert.throws(() => {
            insertNewJobs([])
        }, Error)
    })

    it('initDB with errors shall fail', () => {
        assert.throws(() => {
            // Pass a directory path that does not exist to provoke an error.
            initDB("/4d27f755-662e-4b67-9ac0-560b91eb00a2/test.db")
        }, Error)
    })

    it('initDB without errors shall succeed', () => {
        initDB(":memory:")
    })

    it('insert jobs with invalid schema shall fail', async () => {
        // Not an array:
        assert.throws(() => {
            insertNewJobs({ strategyName: "strat", query: "query", extractedTitle: "title", extractedHref: "url" })
        }, Error)

        // Missing fields:
        assert.throws(() => {
            insertNewJobs([{ query: "query", extractedTitle: "title", extractedHref: "url" }])
        }, Error)
        assert.throws(() => {
            insertNewJobs([{ strategyName: "strat", extractedTitle: "title", extractedHref: "url" }])
        }, Error)
        assert.throws(() => {
            insertNewJobs([{ strategyName: "strat", query: "query", extractedHref: "url" }])
        }, Error)
        assert.throws(() => {
            insertNewJobs([{ strategyName: "strat", query: "query", extractedTitle: "title" }])
        }, Error)

        // Empty href (url):
        assert.throws(() => {
            insertNewJobs([{ strategyName: "strat", query: "query", extractedTitle: "title", extractedHref: "" }])
        }, Error)
    })

    it('insert jobs with optional field values empty shall succeed', () => {
        // All fields must be present, but only the href (url) must be non-empty.
        const newJobs = insertNewJobs([{ strategyName: "", query: "", extractedTitle: "", extractedHref: "url" }])
        assert.strictEqual(newJobs.length, 1)
    })

    it('insert jobs with empty array shall succeed', () => {
        const newJobs = insertNewJobs([])
        assert.strictEqual(newJobs.length, 0)
    })

    it('insert jobs with duplicate url shall insert new jobs but skip duplicates', () => {
        const jobs = [
            { strategyName: "strat01", query: "query01", extractedTitle: "title01", extractedHref: "abc" },
            { strategyName: "strat02", query: "query01", extractedTitle: "title02", extractedHref: "def" },
            { strategyName: "strat02", query: "query02", extractedTitle: "title03", extractedHref: "ghi" },
            { strategyName: "strat01", query: "query01", extractedTitle: "title04", extractedHref: "abc" }, // Duplicate href.
            { strategyName: "strat03", query: "query02", extractedTitle: "title01", extractedHref: "klm" },
        ]

        const newJobs = insertNewJobs(jobs)

        assert.strictEqual(newJobs.length, 4)
        assert.deepEqual(newJobs[0], jobs[0])
        assert.deepEqual(newJobs[1], jobs[1])
        assert.deepEqual(newJobs[2], jobs[2])
        // Duplicate shall be skipped.
        assert.deepEqual(newJobs[3], jobs[4])
    })

    it('insert jobs with previously inserted urls shall insert new jobs but skip existing ones', () => {
        const jobs = [
            { strategyName: "strat01", query: "query01", extractedTitle: "title01", extractedHref: "abc" }, // Already inserted before.
            { strategyName: "strat02", query: "query01", extractedTitle: "title02", extractedHref: "xyz" },
            { strategyName: "strat04", query: "query03", extractedTitle: "title03", extractedHref: "klm" }, // Already inserted before
            { strategyName: "strat02", query: "query01", extractedTitle: "title02", extractedHref: "stu" },
        ]

        const newJobs = insertNewJobs(jobs)

        assert.strictEqual(newJobs.length, 2)
        // Jobs with previously inserted urls shall be skipped.
        assert.deepEqual(newJobs[0], jobs[1])
        assert.deepEqual(newJobs[1], jobs[3])
    })

    it('closeDB shall complete without errors', () => {
        closeDB()
    })
})
