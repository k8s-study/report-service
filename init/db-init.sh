arangosh \
    --server.endpoint=$ARANGO_SERVER_ENDPOINT \
    --server.password=$ARANGO_ROOT_PASSWORD \
    --javascript.execute-string \
'
const username='\"$DB_USERNAME\"';
const passwd='\"$DB_PASSWORD\"';
const dbname='\"$DB_NAME\"';

const createUser = (username, passwd, dbname) => {
    if(users.all().map(obj=>obj.user).indexOf(username) < 0){
        users.save(username, passwd)
        users.grantDatabase(username, dbname);
    }
    users.grantDatabase(username, dbname);
}

var users = require("@arangodb/users");

if (db._databases().indexOf(dbname) < 0){
    db._createDatabase(dbname)
    createUser(username, passwd, dbname);
} else {
    createUser(username, passwd, dbname);
}
'
