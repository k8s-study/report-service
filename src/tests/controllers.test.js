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
