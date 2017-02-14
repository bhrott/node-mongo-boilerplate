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

module.exports = function (app) {

	return {
		debug: function () {
			logger.debug(arguments);
		},
		error: function() {
			logger.error(arguments);
		},
		fatal: function() {
			logger.fatal(arguments);
		},
		info: function() {
			logger.info(arguments);
		}
	}
};
