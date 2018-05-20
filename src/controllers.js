exports.healthcheck = async (ctx) => {
    const dbCheck = await ctx.reports.get(); // eslint-disable-line
    ctx.body = { message: 'ok' };
};
