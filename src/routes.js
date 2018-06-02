const Router = require('koa-router');

const config = require('./config');
const controllers = require('./controllers');
const {
    reportValidators,
    resultValidators,
} = require('./validators');
const {
    buildValidateMiddleware,
} = require('./middlewares');

const router = new Router({
    prefix: `/${config.API_VER}`,
});
router.get('/health', controllers.healthcheck);
router.post('/results', buildValidateMiddleware(resultValidators, 'request.body'), controllers.results);
router.get('/reports', buildValidateMiddleware(reportValidators, 'query'), controllers.reports);

module.exports = router;
