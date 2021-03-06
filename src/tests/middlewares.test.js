const validators = require('../validators');
const {
    buildValidateMiddleware,
} = require('../middlewares');

describe('ValidateMiddleware for pinged results', async () => {
    const next = jest.fn();
    const middleware = buildValidateMiddleware(validators.resultValidators, 'request.body');
    let ctx;

    beforeEach(() => {
        ctx = {
            request: {
                body: {},
            },
        };
    });

    test('should return invalid status when required fields do not exist', async () => {
        await middleware(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            url: 'required but not provided',
            utctime: 'required but not provided',
            status: 'required but not provided',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should return valid status when required fields are in the right formats', async () => {
        ctx = {
            request: {
                body: {
                    url: 'https://kubernetes.io',
                    utctime: '1985-04-12T23:20:50.52Z',
                    status: '200',
                },
            },
        };
        await middleware(ctx, next);
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
        await middleware(ctx, next);
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
        await middleware(ctx, next);
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
        await middleware(ctx, next);
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


describe('Validator for report report query', async () => {
    const next = jest.fn();
    const middleware = buildValidateMiddleware(validators.reportValidators, 'query');
    let ctx;

    beforeEach(() => {
        ctx = {
            query: {},
        };
    });

    test('should return invalid status when required fields do not exist', async () => {
        await middleware(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            url: 'required but not provided',
            starttime: 'required but not provided',
            endtime: 'required but not provided',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should return valid status when required fields are in the right formats', async () => {
        ctx = {
            query: {
                url: 'https://kubernetes.io',
                starttime: '2018-05-01T07:20:50.52Z',
                endtime: '2018-05-31T23:20:50.52Z',
            },
        };
        await middleware(ctx, next);
        expect(ctx.validation.isValid).toBe(true);
        expect(ctx.validation.messages).toEqual({});
        expect(ctx.sanitizedBody).toEqual(ctx.query);
    });

    test('should return invalid status when values are not in the right format', async () => {
        ctx = {
            query: {
                url: 'www.kubernetes.io',
                starttime: '2018-04-01T07:20:50.52Z',
                endtime: '2018-04-31T23:20:50.52Z', // there is not the day 31 in April
            },
        };
        await middleware(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            url: 'invalid URL format',
            endtime: 'invalid utc time format. must be of YYYY-MM-DDTHH:mm:ss.SSZ',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should check when optional fields are provided', async () => {
        ctx = {
            query: {
                url: 'https://kubernetes.io',
                starttime: '2018-05-01T07:20:50.52Z',
                endtime: '2018-05-31T23:20:50.52Z',
                summary: 'python',
            },
        };
        await middleware(ctx, next);
        expect(ctx.validation.isValid).toBe(false);
        expect(ctx.validation.messages).toEqual({
            summary: 'summary must be of one of true, false, or not provided',
        });
        expect(ctx.sanitizedBody).toEqual({});
    });

    test('should return a body object undefined fields are filtered in', async () => {
        ctx = {
            query: {
                url: 'https://kubernetes.io',
                starttime: '2018-05-01T07:20:50.52Z',
                endtime: '2018-05-31T23:20:50.52Z',
                summary: 'false',
                latency: 17000,
                undefinedField: 'null',
                comment: 'good',
            },
        };
        await middleware(ctx, next);
        expect(ctx.validation.isValid).toBe(true);
        expect(ctx.validation.messages).toEqual({});
        expect(ctx.sanitizedBody).toEqual({
            url: 'https://kubernetes.io',
            starttime: '2018-05-01T07:20:50.52Z',
            endtime: '2018-05-31T23:20:50.52Z',
            summary: 'false',
        });
    });
});
