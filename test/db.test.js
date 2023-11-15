import { initDB, closeDB, insertNewJobs } from "../lib/db.js"
import assert from 'assert'

describe('database', () => {
    it('closeDB without previous initDB shall succeed', async () => {
        await closeDB()
    })

    it('insert jobs without previous initDB shall fail', async () => {
        assert.rejects(async () => {
            await insertNewJobs([])
        }, Error)
    })

    it('initDB with errors shall fail', async () => {
        assert.rejects(async () => {
            // Pass a directory path that does not exist to provoke an error.
            await initDB("/4d27f755-662e-4b67-9ac0-560b91eb00a2/test.db")
        }, Error)
    })

    it('initDB without errors shall succeed', async () => {
        const result = await initDB(":memory:")
        assert.strictEqual(result, null)
    })

    it('insert jobs with invalid schema shall fail', async () => {
        // Not an array:
        assert.rejects(async () => {
            await insertNewJobs({ strategyName: "strat", query: "query", extractedTitle: "title", extractedHref: "url" })
        }, Error)

        // Missing fields:
        assert.rejects(async () => {
            await insertNewJobs([{ query: "query", extractedTitle: "title", extractedHref: "url" }])
        }, Error)
        assert.rejects(async () => {
            await insertNewJobs([{ strategyName: "strat", extractedTitle: "title", extractedHref: "url" }])
        }, Error)
        assert.rejects(async () => {
            await insertNewJobs([{ strategyName: "strat", query: "query", extractedHref: "url" }])
        }, Error)
        assert.rejects(async () => {
            await insertNewJobs([{ strategyName: "strat", query: "query", extractedTitle: "title" }])
        }, Error)

        // Empty href (url):
        assert.rejects(async () => {
            await insertNewJobs([{ strategyName: "strat", query: "query", extractedTitle: "title", extractedHref: "" }])
        }, Error)
    })

    it('insert jobs with optional field values empty shall succeed', async () => {
        // All fields must be present, but only the href (url) must be non-empty.
        const newJobs = await insertNewJobs([{ strategyName: "", query: "", extractedTitle: "", extractedHref: "url" }])
        assert.strictEqual(newJobs.length, 1)
    })

    it('insert jobs with empty array shall succeed', async () => {
        const newJobs = await insertNewJobs([])
        assert.strictEqual(newJobs.length, 0)
    })

    it('insert jobs with duplicate url shall insert new jobs but skip duplicates', async () => {
        const jobs = [
            { strategyName: "strat01", query: "query01", extractedTitle: "title01", extractedHref: "abc" },
            { strategyName: "strat02", query: "query01", extractedTitle: "title02", extractedHref: "def" },
            { strategyName: "strat02", query: "query02", extractedTitle: "title03", extractedHref: "ghi" },
            { strategyName: "strat01", query: "query01", extractedTitle: "title04", extractedHref: "abc" }, // Duplicate href.
            { strategyName: "strat03", query: "query02", extractedTitle: "title01", extractedHref: "klm" },
        ]

        const newJobs = await insertNewJobs(jobs)

        assert.strictEqual(newJobs.length, 4)
        assert.deepEqual(newJobs[0], jobs[0])
        assert.deepEqual(newJobs[1], jobs[1])
        assert.deepEqual(newJobs[2], jobs[2])
        // Duplicate shall be skipped.
        assert.deepEqual(newJobs[3], jobs[4])
    })

    it('insert jobs with previously inserted urls shall insert new jobs but skip existing ones', async () => {
        const jobs = [
            { strategyName: "strat01", query: "query01", extractedTitle: "title01", extractedHref: "abc" }, // Already inserted before.
            { strategyName: "strat02", query: "query01", extractedTitle: "title02", extractedHref: "xyz" },
            { strategyName: "strat04", query: "query03", extractedTitle: "title03", extractedHref: "klm" }, // Already inserted before
            { strategyName: "strat02", query: "query01", extractedTitle: "title02", extractedHref: "stu" },
        ]

        const newJobs = await insertNewJobs(jobs)

        assert.strictEqual(newJobs.length, 2)
        // Jobs with previously inserted urls shall be skipped.
        assert.deepEqual(newJobs[0], jobs[1])
        assert.deepEqual(newJobs[1], jobs[3])
    })

    it('closeDB shall complete without errors', async () => {
        const result = await closeDB()
        assert.strictEqual(result, null)
    })
})
