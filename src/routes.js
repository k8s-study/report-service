const Router = require('koa-router');

const config = require('./config');
const controllers = require('./controllers');

const router = new Router({
    prefix: `/${config.API_VER}`,
});
router.get('/health', controllers.healthcheck);

module.exports = router;
