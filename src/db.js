const arangojs = require('arangojs');

// database connection pool
const db = new arangojs.Database({
    url: process.env.DB_ACCESS_URL || 'http://127.0.0.1:8529',
    databaseName: process.env.DB_NAME || 'testdb',
}).useBasicAuth(
    process.env.DB_USERNAME || 'testuser',
    process.env.DB_PASSWORD || 'testpassword',
);

// create the collection if not exist
const collection = db.collection('reports');
collection.get().then(null, () => {
    collection.create().then(() => {
        console.log('collection was created'); // eslint-disable-line
    }, () => {
        console.log('collection access failed'); // eslint-disable-line
    });
});

exports.setContext = () => async (ctx, next) => {
    ctx.db = db;
    ctx.reports = collection;
    await next();
};
