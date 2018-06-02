const { DatabaseClient } = require('../db/client');

describe('database client', async () => {
    let db;
    let collection;
    let client;

    beforeEach(() => {
        db = {
            query: jest.fn(),
        };
        db.query.mockImplementation(() => []);

        collection = {
            get: jest.fn(),
            save: jest.fn(),
        };

        client = new DatabaseClient(db, collection);
    });

    test('healthcheck should check if the database collection is reachable', async () => {
        await client.healthcheck();
        expect(collection.get).toHaveBeenCalled();
    });

    test('saveResult should call save method on the collection', async () => {
        const testData = {
            test: 'test1',
            pypi: 'pypi.org',
            num: 12123212,
        };
        await client.saveResult(testData);
        expect(collection.save).toHaveBeenCalledWith(testData);
    });

    test('generateReport should call db query', async () => {
        const testQuery = {
            url: 'www.example.com',
            starttime: 'starttime',
            endtime: 'endtime',
        };
        await client.generateReport(testQuery, false);

        const dbCalls = db.query.mock.calls;

        expect(dbCalls).toHaveLength(2);

        expect(dbCalls[0][0].bindVars).toEqual({
            value0: collection,
            value1: testQuery.url,
            value2: testQuery.starttime,
            value3: testQuery.endtime,
        });
        expect(dbCalls[0][0].query.replace(/\s\s+/g, ' ').trim()).toBe(`
            FOR r IN @value0
            FILTER r.url == @value1
                AND r.utctime >= @value2
                AND r.utctime <= @value3
            COLLECT status = r.status WITH COUNT INTO count
            RETURN { status, count }`.replace(/\s\s+/g, ' ').trim());

        expect(dbCalls[1][0].bindVars).toEqual({
            value0: collection,
            value1: testQuery.url,
            value2: testQuery.starttime,
            value3: testQuery.endtime,
        });
        expect(dbCalls[1][0].query.replace(/\s\s+/g, ' ').trim()).toBe(`
            FOR r IN @value0
            FILTER r.url == @value1
                AND r.utctime >= @value2
                AND r.utctime <= @value3
            RETURN r`.replace(/\s\s+/g, ' ').trim());
    });

    test('generateReport should call db query for summary only when summary is true', async () => {
        const testQuery = {
            url: 'www.example.com',
            starttime: 'starttime',
            endtime: 'endtime',
        };
        await client.generateReport(testQuery, true);

        const dbCalls = db.query.mock.calls;

        expect(dbCalls).toHaveLength(1);

        expect(dbCalls[0][0].bindVars).toEqual({
            value0: collection,
            value1: testQuery.url,
            value2: testQuery.starttime,
            value3: testQuery.endtime,
        });
        expect(dbCalls[0][0].query.replace(/\s\s+/g, ' ').trim()).toBe(`
            FOR r IN @value0
            FILTER r.url == @value1
                AND r.utctime >= @value2
                AND r.utctime <= @value3
            COLLECT status = r.status WITH COUNT INTO count
            RETURN { status, count }`.replace(/\s\s+/g, ' ').trim());
    });
});
