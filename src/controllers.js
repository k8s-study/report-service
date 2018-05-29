const { aql } = require('arangojs');

const serializers = require('./serializers');

exports.healthcheck = async (ctx) => {
    const dbCheck = await ctx.reports.get(); // eslint-disable-line
    ctx.body = { message: 'ok' };
};

exports.results = async (ctx) => {
    if (!ctx.validation.isValid) {
        ctx.status = 400;
        ctx.body = { ...ctx.validation.messages };
        return;
    }
    await ctx.reports.save(ctx.sanitizedBody);
    ctx.status = 201;
};

exports.reports = async (ctx) => {
    if (!ctx.validation.isValid) {
        ctx.status = 400;
        ctx.body = { ...ctx.validation.messages };
        return;
    }
    const query = { ...ctx.sanitizedBody };
    const isSummarized = query.summary === 'true';

    const summaryCursor = await ctx.db.query(aql`
        FOR r IN ${ctx.reports}
        FILTER r.url == ${query.url}
            AND r.utctime >= ${query.starttime}
            AND r.utctime <= ${query.endtime}
        COLLECT status = r.status WITH COUNT INTO count
        RETURN { status, count }
    `);
    const summary = await summaryCursor.reduce((prevObj, item) => {
        return {
            ...prevObj,
            [item.status]: item.count,
        };
    }, {});

    ctx.body = {
        summary,
    };
    if (!isSummarized) {
        const resultsCursor = await ctx.db.query(aql`
            FOR r IN ${ctx.reports}
            FILTER r.url == ${query.url}
                AND r.utctime >= ${query.starttime}
                AND r.utctime <= ${query.endtime}
            RETURN r
        `);
        const results = await resultsCursor.map(value => serializers.serializeResult(value));
        ctx.body = {
            ...ctx.body,
            results,
        };
    }
    ctx.status = 200;
};
