const Router = require('koa-router');

const config = require('./config');
const controllers = require('./controllers');
const validators = require('./validators');

const router = new Router({
    prefix: `/${config.API_VER}`,
});
router.get('/health', controllers.healthcheck);
router.post('/results', validators.results, controllers.results);
router.get('/reports', validators.reports, controllers.reports);

module.exports = router;
