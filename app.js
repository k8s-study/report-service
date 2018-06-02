const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');

const db = require('./src/db');
const middlewares = require('./src/middlewares');
const { environment } = require('./src/config');
const routes = require('./src/routes');


const app = new Koa();

if (environment === 'develop') {
    app.use(logger());
}

app.use(bodyParser());
app.use(middlewares.setContext({
    db: db.db,
    reports: db.collection,
}));
app.use(routes.routes());

module.exports = app;
