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
