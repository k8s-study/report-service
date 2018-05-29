const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');

const db = require('./src/db');
const { environment } = require('./src/config');
const routes = require('./src/routes');


const app = new Koa();

if (environment === 'develop') {
    app.use(logger());
}

app.use(bodyParser());

app.use(db.setContext());
app.use(routes.routes());

module.exports = app;
