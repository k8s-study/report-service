const validator = require('validator');
const moment = require('moment');

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSZ';
const resultValidators = {
    url: {
        required: true,
        validate: validator.isURL,
        message: 'invalid URL format',
    },
    utctime: {
        required: true,
        validate: value => moment(value, DATE_FORMAT, true).isValid(),
        message: 'invalid utc time format. must be of YYYY-MM-DDTHH:mm:ss.SSZ',
    },
    status: {
        required: true,
        validate: value => ['200', '300', '400', '500'].includes(value),
        message: 'invalid status code, must be one of ["200", "300", "400", "500"]',
    },
    latency: {
        required: false,
        validate: value => validator.isInt(`${value}`, { min: 0, allow_leading_zeroes: false }),
        message: 'invalid latency (ms), must be of integer lte 0',
    },
};

module.exports.results = async (ctx, next) => {
    // validate body
    const body = { ...ctx.request.body };
    const validationMessages = Object.keys(resultValidators).reduce((prevObj, key) => {
        const fieldValidator = resultValidators[key];
        const value = body[key];
        if ((typeof value === 'undefined' || value === null)) {
            if (fieldValidator.required) {
                return {
                    ...prevObj,
                    [key]: 'required but not provided',
                };
            }
            return { ...prevObj };
        }

        if (!fieldValidator.validate(value)) {
            return {
                ...prevObj,
                [key]: fieldValidator.message,
            };
        }
        return { ...prevObj };
    }, {});

    ctx.validation = {
        isValid: Object.keys(validationMessages).length === 0,
        messages: validationMessages,
    };

    // sanitize body
    if (ctx.validation.isValid) {
        ctx.sanitizedBody = Object.keys(ctx.request.body).reduce((prevObj, key) => {
            if (key in resultValidators) {
                return {
                    ...prevObj,
                    [key]: ctx.request.body[key],
                };
            }
            return { ...prevObj };
        }, {});
    } else {
        ctx.sanitizedBody = {};
    }

    await next();
};
