const http = require('http');

const app = require('./app');


const server = http.createServer(app.callback());
server.listen(8000);
server.on('listening', () => {
    console.log('server is listening on the port 8000'); // eslint-disable-line
});
