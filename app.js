const http = require('http');
const arangojs = require('arangojs');

const db = new arangojs.Database({
    url: process.env.DB_ACCESS_URL || 'http://127.0.0.1:8529',
    databaseName: process.env.DB_NAME || 'testdb',
}).useBasicAuth(
    process.env.DB_USER || 'testuser',
    process.env.DB_PASS || 'testpassword',
);

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify({
        message: 'Hello from Report service',
        dbConnectionInfo: db._connection.config
    }));
}).listen(8000);
