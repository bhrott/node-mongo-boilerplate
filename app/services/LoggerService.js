var cluster = require('cluster');
var log4js = require('log4js');

var fileAppender = {
	"type": "dateFile",
	"filename": "./logs/",
	"pattern": "yyyy-MM-dd.log",
	"alwaysIncludePattern": true
};

var consoleAppender = {
	type: 'console'
};

log4js.configure({
	appenders: process.env.DEV ? [ consoleAppender, fileAppender ] : [ fileAppender ]
});

var logger = log4js.getLogger();
var workerId = cluster.isMaster ? 'master' : cluster.isWorker ? cluster.worker.id : 'unknown';

module.exports = function (app) {

	var id = 'worker ' + workerId;

	return {
		debug: function () {
			logger.debug(id, arguments);
		},
		error: function() {
			logger.error(id, arguments);
		},
		fatal: function() {
			logger.fatal(id, arguments);
		},
		info: function() {
			logger.info(id, arguments);
		}
	}
};
