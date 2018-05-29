const request = require('supertest');
const app = require('../../app');
const db = require('../db');
const { API_VER } = require('../config');

describe('healthcheck endpoint', async () => {
    test('should return 200 OK', async () => {
        const response = await request(app.callback()).get(`/${API_VER}/health`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'ok' });
    });
});

describe('result endpoint', async () => {
    beforeAll(async () => {
        try {
            await db.collection.create();
        } catch (error) {
            if (!error.errorNum === 1207) {
                throw error;
            }
        }
    });

    test('should return 400 for an invalid request', async () => {
        const response = await request(app.callback()).post(`/${API_VER}/results`, {});
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            status: 'required but not provided',
            url: 'required but not provided',
            utctime: 'required but not provided',
        });
    });

    test('should save a result in the database and return 201 for a valid request', async () => {
        const testObject = {
            url: 'https://kubernetes.io',
            utctime: '1985-04-12T23:20:50.52Z',
            status: '200',
            latency: 17000,
        };

        const response = await request(app.callback())
            .post('/v1/results')
            .send(testObject)
            .set('Content-Type', 'application/json');
        expect(response.status).toEqual(201);

        const docs = await db.collection.all();
        expect(docs.count).toBe(1);

        const doc = await docs.next();
        expect(doc).toEqual(expect.objectContaining(testObject));
        expect(response.status).toEqual(201);
    });

    afterEach(async () => {
        // delete all docs in the collection after each test
        await db.collection.truncate();
    });

    afterAll(async () => {
        // drop the collection after all tests
        await db.collection.drop();
    });
});

describe('report endpoint', async () => {
    beforeAll(async () => {
        try {
            await db.collection.create();
        } catch (error) {
            if (!error.errorNum === 1207) {
                throw error;
            }
        }
    });

    beforeEach(async () => {
        await db.collection.import([
            { url: 'https://kubernetes.io', utctime: '2018-04-28T07:20:50.52Z', status: '200' },
            { url: 'https://kubernetes.io', utctime: '2018-05-04T07:20:50.52Z', status: '200' },
            { url: 'https://kubernetes.io', utctime: '2018-05-05T07:20:50.52Z', status: '200' },
            { url: 'https://kubernetes.io', utctime: '2018-05-27T07:20:50.52Z', status: '400' },
            { url: 'https://kubernetes.io', utctime: '2018-05-28T07:20:50.52Z', status: '500' },
            { url: 'https://kubernetes.io/docs', utctime: '2018-05-29T07:20:50.52Z', status: '500' },
        ]);
    });

    test('should return 400 for an invalid request', async () => {
        const response = await request(app.callback())
            .get(`/${API_VER}/reports`)
            .query({});
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
            url: 'required but not provided',
            starttime: 'required but not provided',
            endtime: 'required but not provided',
        });
    });

    test('should return summary and results based on the given query', async () => {
        const testQuery = {
            url: 'https://kubernetes.io',
            starttime: '2018-05-01T01:20:50.52Z',
            endtime: '2018-05-31T01:20:50.52Z',
        };

        const response = await request(app.callback())
            .get(`/${API_VER}/reports`)
            .query(testQuery);
        expect(response.status).toEqual(200);
        expect(response.body.summary).toEqual({
            200: 2, 400: 1, 500: 1,
        });
        expect(response.body.results).toHaveLength(4);
    });

    test('should return summary only when summary=true is provided', async () => {
        const testQuery = {
            url: 'https://kubernetes.io',
            starttime: '2018-04-01T01:20:50.52Z', // include April
            endtime: '2018-05-31T01:20:50.52Z',
            summary: 'true',
        };

        const response = await request(app.callback())
            .get(`/${API_VER}/reports`)
            .query(testQuery);
        expect(response.status).toEqual(200);
        expect(response.body.summary).toEqual({
            200: 3, 400: 1, 500: 1,
        });
        expect(response.body.results).not.toBeDefined();
    });

    afterEach(async () => {
        // delete all docs in the collection after each test
        await db.collection.truncate();
    });

    afterAll(async () => {
        // drop the collection after all tests
        await db.collection.drop();
    });
});
