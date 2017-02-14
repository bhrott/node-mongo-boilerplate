require('dotenv').config()

var http = require('http');
var database = require('./config/database')();
var app = require('./config/express')();

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
