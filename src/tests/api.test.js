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
