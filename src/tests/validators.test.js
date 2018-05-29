const validators = require('../validators');

describe('Validator for pinged results', async () => {
    const next = jest.fn();
    let ctx;

    beforeEach(() => {
        ctx = {
            request: {
                body: {},
            },
        };
    });

    test('should return invalid status when required fields do not exist', async () => {
        await validators.results(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            url: 'required but not provided',
            utctime: 'required but not provided',
            status: 'required but not provided',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should return valid status when required fields do not exist', async () => {
        ctx = {
            request: {
                body: {
                    url: 'https://kubernetes.io',
                    utctime: '1985-04-12T23:20:50.52Z',
                    status: '200',
                },
            },
        };
        await validators.results(ctx, next);
        expect(ctx.validation.isValid).toBe(true);
        expect(ctx.validation.messages).toEqual({});
        expect(ctx.sanitizedBody).toEqual(ctx.request.body);
    });

    test('should return invalid status when values are not in the right format', async () => {
        ctx = {
            request: {
                body: {
                    url: 'www.kubernetes.io',
                    utctime: '1985-04-12T23:20:50',
                    status: 'success',
                },
            },
        };
        await validators.results(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            url: 'invalid URL format',
            utctime: 'invalid utc time format. must be of YYYY-MM-DDTHH:mm:ss.SSZ',
            status: 'invalid status code, must be one of ["200", "300", "400", "500"]',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should check when optional fields are provided', async () => {
        ctx = {
            request: {
                body: {
                    url: 'https://kubernetes.io',
                    utctime: '1985-04-12T23:20:50.52Z',
                    status: '200',
                    latency: 'so slow',
                },
            },
        };
        await validators.results(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            latency: 'invalid latency (ms), must be of integer lte 0',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should return a body object undefined fields are filtered in', async () => {
        ctx = {
            request: {
                body: {
                    url: 'https://kubernetes.io',
                    utctime: '1985-04-12T23:20:50.52Z',
                    status: '200',
                    latency: 17000,
                    undefinedField: 'null',
                    comment: 'good',
                },
            },
        };
        await validators.results(ctx, next);
        expect(ctx.validation.isValid).toBe(true);
        expect(ctx.validation.messages).toEqual({});
        expect(ctx.sanitizedBody).toEqual({
            url: 'https://kubernetes.io',
            utctime: '1985-04-12T23:20:50.52Z',
            status: '200',
            latency: 17000,
        });
    });
});
