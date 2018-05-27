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
