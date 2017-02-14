var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

var templateName = 'tpl';
var templateOptions = null;

function _getTag(tagName, content) {
    var open = '<' + tagName + '>';
    var close = '</' + tagName + '>';

    var start = content.indexOf(open);
    var end = content.indexOf(close) + close.length;

    return content.substring(start, end);
}

function _getTagValue(tag) {
    var start = tag.indexOf('>') + 1;
    var end = tag.lastIndexOf('<');

    return tag.substring(start, end);
}

function applyLayout(content, options, callback, next) {
    if(content.indexOf('<tpl:layout>') >= 0) {
        var layoutTag = _getTag('tpl:layout', content);
        var value = _getTagValue(layoutTag);

        var layoutPath = templateOptions.viewsPath + '/' + value + '.' + templateName;

        fs.readFile(layoutPath, function(err, layoutContent) {
            if(err) return callback(err);

            layoutContent = layoutContent.toString();
            var bodyTag = _getTag('tpl:render-body', layoutContent);
            layoutContent = layoutContent.replace(bodyTag, content);
            layoutContent = layoutContent.replace(layoutTag, '');

            next(layoutContent, options, callback);
        });
    }
    else {
        next(content, options, callback);
    }
}

function configureScripts(content, options, callback, next) {
    if(content.indexOf('<tpl:scripts>') >= 0) {
        var scriptsTag = _getTag('tpl:scripts', content);
        var scripts = _getTagValue(scriptsTag);

        content = content.replace('<tpl:render-scripts></tpl:render-scripts>', scripts);
        content = content.replace(scriptsTag, '');
    }
    else {
        content = content.replace('<tpl:render-scripts></tpl:render-scripts>', '');
    }

    next(content, options, callback);
}

function configureHeader(content, options, callback, next) {
    if(content.indexOf('<tpl:header>') >= 0) {
        var headerTag = _getTag('tpl:header', content);
        var headerContent = _getTagValue(headerTag);

        content = content.replace('<tpl:render-header></tpl:render-header>', headerContent);
        content = content.replace(headerTag, '');
    }
    else {
        content = content.replace('<tpl:render-header></tpl:render-header>', '');
    }

    next(content, options, callback);
}

function render(content, options, callback, next) {
    var html = ejs.render(content, options);
    callback(null, html);
}

function engine(filePath, options, callback) {
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(err)

        var pipes = [
            applyLayout,
            configureScripts,
            configureHeader,
            render
        ];

        var executed = 0;

        function next(nextContent, nextOptions, nextCallback) {
            pipes[executed++](nextContent, nextOptions, nextCallback, next);
        }

        next(content.toString(), options, callback);
    });
}

module.exports = function(app) {
    templateOptions = {
        viewsPath: app.get('views')
    };

    app.engine(templateName, engine);
    app.set('view engine', templateName);
};
