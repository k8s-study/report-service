'use strict';

exports.healthcheck = async (ctx, next) => {
    let aa = await ctx.reports.get();
    ctx.body = {message: 'ok'}
}
