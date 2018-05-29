const validator = require('validator');
const moment = require('moment');

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSZ';
const commonValidators = {
    url: {
        required: true,
        validate: value => validator.isURL(value, { require_protocol: true }),
        message: 'invalid URL format',
    },
    datetime: {
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

const resultValidators = {
    url: commonValidators.url,
    utctime: commonValidators.datetime,
    status: commonValidators.status,
    latency: commonValidators.latency,
};

const validate = (validatorsObj, objToValidate) => {
    const messages = Object.keys(validatorsObj).reduce((prevObj, key) => {
        const fieldValidator = validatorsObj[key];
        const value = objToValidate[key];
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

    return {
        isValid: Object.keys(messages).length === 0,
        messages,
    };
};

const sanitize = (sanitizersObj, objToSanitize) => {
    return Object.keys(objToSanitize).reduce((prevObj, key) => {
        if (key in sanitizersObj) {
            return {
                ...prevObj,
                [key]: objToSanitize[key],
            };
        }
        return { ...prevObj };
    }, {});
};

module.exports.results = async (ctx, next) => {
    // validate body
    const body = { ...ctx.request.body };
    ctx.validation = validate(resultValidators, body);

    // sanitize body
    if (ctx.validation.isValid) {
        ctx.sanitizedBody = sanitize(resultValidators, body);
    } else {
        ctx.sanitizedBody = {};
    }

    await next();
};
