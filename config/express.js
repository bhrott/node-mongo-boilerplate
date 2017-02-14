var express = require('express');
var load = require('express-load');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var path = require('path');

var viewsPath = './app/views';

var templateEngine = require('./template-engine');

module.exports = function () {
    var app = express();

    app.set('port', process.env.PORT);

    app.set('views', './app/views');
    templateEngine(app);

    app.use(express.static('./public'));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '10mb' }));

    app.use(logger('dev'));
    app.use(cookieParser());

    load('models', { cwd: 'app' })
        .then('services')
        .then('middlewares')
        .then('routes')
        .into(app);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = process.env.DEV ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');

		app.services.LoggerService.error(JSON.stringify(err, null, 4));
    });

    return app;
};
