const Router = require('koa-router');

const controllers = require('./controllers');

const router = new Router();
router.get('/health', controllers.healthcheck);

module.exports = router;
