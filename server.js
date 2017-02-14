require('dotenv').config();

var http = require('http');
var cluster = require('cluster');

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;

    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
}
else {
	var database = require('./config/database')();
	var app = require('./config/express')();

	http.createServer(app).listen(app.get('port'), function () {
		console.log('Express server listening on port ' + app.get('port'));
	});
}

cluster.on('exit', function (worker) {
    console.log('Worker %d died :(', worker.id);
    cluster.fork();
});
