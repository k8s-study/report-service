exports.healthcheck = async (ctx) => {
    const dbCheck = await ctx.client.healthcheck(); // eslint-disable-line
    ctx.body = { message: 'ok' };
};

exports.results = async (ctx) => {
    if (!ctx.validation.isValid) {
        ctx.status = 400;
        ctx.body = { ...ctx.validation.messages };
        return;
    }
    await ctx.client.saveResult(ctx.sanitizedBody);
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

    const { summary, results } = await ctx.client.generateReport(query, isSummarized);

    ctx.body = {
        summary,
    };
    if (!isSummarized) {
        ctx.body = {
            ...ctx.body,
            results,
        };
    }
    ctx.status = 200;
};
