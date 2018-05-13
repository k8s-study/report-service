'use strict';

const http = require('http');
const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');

const db = require('./src/db')
const routes = require('./src/routes');


const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(db.setContext())
app.use(routes.routes());

const server = http.createServer(app.callback());
server.listen(8000);
server.on('listening', () => {
    console.log('server is listening on the port 8000');
});
