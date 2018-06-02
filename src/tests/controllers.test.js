const controllers = require('../controllers');

describe('healthcheck controller', async () => {
    const next = jest.fn();
    let ctx;

    beforeEach(() => {
        ctx = {
            database: {
                client: {
                    healthcheck: jest.fn(),
                },
            },
        };
    });

    test('should check database connection status', async () => {
        await controllers.healthcheck(ctx, next);
        expect(ctx.database.client.healthcheck).toHaveBeenCalled();
        expect(ctx.body).toEqual({ message: 'ok' });
    });

    test('should throw an exeption when the database connection fails', async () => {
        ctx.database.client.healthcheck.mockImplementation(() => {
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
            database: {
                client: {
                    saveResult: jest.fn(),
                },
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
        expect(ctx.database.client.saveResult).not.toHaveBeenCalled();
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
        expect(ctx.database.client.saveResult).toHaveBeenCalledWith(ctx.sanitizedBody);
        expect(ctx.status).toEqual(201);
    });
});

describe('report query controller', async () => {
    const next = jest.fn();
    let ctx;

    beforeEach(() => {
        ctx = {
            database: {
                client: {
                    generateReport: jest.fn(),
                },
            },
        };
        ctx.database.client.generateReport.mockImplementation(() => ({
            summary: {},
            results: [],
        }));
    });

    test('should not query docs and return 400 when input is not valid', async () => {
        ctx.validation = {
            isValid: false,
            messages: {
                test: 'message',
            },
        };
        await controllers.reports(ctx, next);
        expect(ctx.database.client.generateReport).not.toHaveBeenCalled();
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
        expect(ctx.database.client.generateReport).toHaveBeenCalledWith(ctx.sanitizedBody, false);
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
        expect(ctx.database.client.generateReport).toHaveBeenCalledWith(ctx.sanitizedBody, true);
        expect(ctx.status).toEqual(200);
        expect(ctx.body).toEqual({
            summary: {},
        });
    });
});
