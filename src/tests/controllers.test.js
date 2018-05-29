const controllers = require('../controllers');

describe('healthcheck controller', async () => {
    const next = jest.fn();
    test('should check database connection status', async () => {
        const ctx = {
            reports: {
                get: jest.fn(),
            },
        };
        await controllers.healthcheck(ctx, next);
        expect(ctx.reports.get).toHaveBeenCalled();
        expect(ctx.body).toEqual({ message: 'ok' });
    });

    test('should throw an exeption when the database connection fails', async () => {
        const ctx = {
            reports: {
                get: jest.fn(),
            },
        };
        ctx.reports.get.mockImplementation(() => {
            throw new Error('DB connection failed');
        });
        expect(controllers.healthcheck(ctx, next)).rejects.toThrowError();
    });
});


describe('pingend results controller', async () => {
    const next = jest.fn();
    let ctx;

    beforeEach(() => {
        ctx = {
            reports: {
                save: jest.fn(),
            },
        };
    });

    test('should not save doc and return 400 when input is not valid', async () => {
        ctx.validation = {
            isValid: false,
            messages: {
                test: 'message',
            },
        };
        await controllers.results(ctx, next);
        expect(ctx.reports.save).not.toHaveBeenCalled();
        expect(ctx.status).toEqual(400);
        expect(ctx.body).toEqual(ctx.validation.messages);
    });

    test('should save doc and return 201 when input is valid', async () => {
        ctx.validation = {
            isValid: true,
        };
        ctx.sanitizedBody = {
            url: 'www.example.com',
            status: 'good',
        };
        await controllers.results(ctx, next);
        expect(ctx.reports.save).toHaveBeenCalledWith(ctx.sanitizedBody);
        expect(ctx.status).toEqual(201);
    });
});

describe('report query controller', async () => {
    const next = jest.fn();
    let ctx;

    beforeEach(() => {
        ctx = {
            reports: 'reports',
            db: {
                query: jest.fn(),
            },
        };
        ctx.db.query.mockImplementation(() => []);
    });

    test('should not query docs and return 400 when input is not valid', async () => {
        ctx.validation = {
            isValid: false,
            messages: {
                test: 'message',
            },
        };
        await controllers.reports(ctx, next);
        expect(ctx.db.query).not.toHaveBeenCalled();
        expect(ctx.status).toEqual(400);
        expect(ctx.body).toEqual(ctx.validation.messages);
    });

    test('should fetch docs based on the given query and return a result when input is valid', async () => {
        ctx.validation = {
            isValid: true,
        };
        ctx.sanitizedBody = {
            url: 'www.example.com',
            starttime: 'starttime',
            endtime: 'endtime',
        };
        await controllers.reports(ctx, next);
        const dbCalls = ctx.db.query.mock.calls;
        expect(dbCalls.length).toBe(2);
        expect(dbCalls[0][0].bindVars).toEqual({
            value0: ctx.reports,
            value1: ctx.sanitizedBody.url,
            value2: ctx.sanitizedBody.starttime,
            value3: ctx.sanitizedBody.endtime,
        });
        expect(dbCalls[0][0].query.replace(/\s\s+/g, ' ').trim()).toBe(`
            FOR r IN @value0
            FILTER r.url == @value1
                AND r.utctime >= @value2
                AND r.utctime <= @value3
            COLLECT status = r.status WITH COUNT INTO count
            RETURN { status, count }`.replace(/\s\s+/g, ' ').trim());

        expect(dbCalls[1][0].bindVars).toEqual({
            value0: ctx.reports,
            value1: ctx.sanitizedBody.url,
            value2: ctx.sanitizedBody.starttime,
            value3: ctx.sanitizedBody.endtime,
        });
        expect(dbCalls[1][0].query.replace(/\s\s+/g, ' ').trim()).toBe(`
            FOR r IN @value0
            FILTER r.url == @value1
                AND r.utctime >= @value2
                AND r.utctime <= @value3
            RETURN r`.replace(/\s\s+/g, ' ').trim());
        expect(ctx.status).toEqual(200);
        expect(ctx.body).toEqual({
            summary: {},
            results: [],
        });
    });

    test('should fetch summary only when summary is true', async () => {
        ctx.validation = {
            isValid: true,
        };
        ctx.sanitizedBody = {
            url: 'www.example.com',
            starttime: 'starttime',
            endtime: 'endtime',
            summary: 'true',
        };
        await controllers.reports(ctx, next);
        const dbCalls = ctx.db.query.mock.calls;
        expect(dbCalls.length).toBe(1);
        expect(dbCalls[0][0].bindVars).toEqual({
            value0: ctx.reports,
            value1: ctx.sanitizedBody.url,
            value2: ctx.sanitizedBody.starttime,
            value3: ctx.sanitizedBody.endtime,
        });
        expect(dbCalls[0][0].query.replace(/\s\s+/g, ' ').trim()).toBe(`
            FOR r IN @value0
            FILTER r.url == @value1
                AND r.utctime >= @value2
                AND r.utctime <= @value3
            COLLECT status = r.status WITH COUNT INTO count
            RETURN { status, count }`.replace(/\s\s+/g, ' ').trim());
        expect(ctx.status).toEqual(200);
        expect(ctx.body).toEqual({
            summary: {},
        });
    });
});
