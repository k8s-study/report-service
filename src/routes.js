'use strict';

const Router = require('koa-router');

const controllers = require('./controllers');

var router = new Router();
router.get('/health', controllers.healthcheck);

module.exports = router;
