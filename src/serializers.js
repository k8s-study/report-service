const fieldSerializer = {
    convert: value => value,
};

const resultSerializers = {
    url: fieldSerializer,
    utctime: fieldSerializer,
    status: fieldSerializer,
    latency: fieldSerializer,
};

const serialize = (serializersToUse, objToSerialize) => {
    return Object.keys(objToSerialize).reduce((prevObj, key) => {
        const serializer = serializersToUse[key];
        if (serializer) {
            return {
                ...prevObj,
                [key]: serializer.convert(objToSerialize[key]),
            };
        }
        return { ...prevObj };
    }, {});
};

const serializeResult = result => serialize(resultSerializers, result);

module.exports = {
    serializeResult,
};
