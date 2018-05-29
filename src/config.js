const API_VER = 'v1';

const environment = process.env.NODE_ENV || 'develop';

const database = {
    accessUrl: process.env.DB_ACCESS_URL || 'http+tcp://127.0.0.1:8529',
    dbName: process.env.DB_NAME || 'testdb',
    dbUsername: process.env.DB_USERNAME || 'testuser',
    dbPassword: process.env.DB_PASSWORD || 'testpassword',
    dbCollection: 'reports',
};

if (environment === 'test') {
    database.dbCollection = 'reports_test';
}

module.exports = {
    API_VER,
    environment,
    database,
};
