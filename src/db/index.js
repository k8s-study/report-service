const arangojs = require('arangojs');

const dbConfig = require('../config').database;
const {
    DatabaseClient,
} = require('./client');

// database connection pool
const db = new arangojs.Database({
    url: dbConfig.accessUrl,
    databaseName: dbConfig.dbName,
}).useBasicAuth(
    dbConfig.dbUsername,
    dbConfig.dbPassword,
);

// create the collection if not exist
const collection = db.collection(dbConfig.dbCollection);
collection.get().then(null, () => {
    collection.create().then(() => {
        console.log('collection was created'); // eslint-disable-line
    }, () => {
        console.log('collection access failed'); // eslint-disable-line
    });
});

module.exports = {
    db,
    collection,
    client: new DatabaseClient(db, collection),
};
