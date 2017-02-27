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

function _parseSection(sectionName, content, options, callback, next) {
	var containerTagName = '<tpl:render-' + sectionName + '></tpl:render-' + sectionName + '>';

	if(content.indexOf('<tpl:' + sectionName + '>') >= 0) {
		var scriptsTag = _getTag('tpl:' + sectionName, content);
        var scripts = _getTagValue(scriptsTag);

		var renderScriptsIndex = content.indexOf(containerTagName);

		content = content.insert(renderScriptsIndex, scripts);
        content = content.replace(scriptsTag, '');

		_parseSection(sectionName, content, options, callback, next);
	}
	else {
		content = content.replace(containerTagName, '');
		next(content, options, callback);
	}
}

function applyLayout(content, options, callback, next) {

	if(content.indexOf('<tpl:layout>') >= 0) {
        var layoutTag = _getTag('tpl:layout', content);
        var value = _getTagValue(layoutTag);

        var layoutPath = templateOptions.viewsPath + '/' + value + '.' + templateName;

        fs.readFile(layoutPath, function(err, layoutContent) {
            if(err) return callback(err);

            layoutContent = layoutContent.toString();
            var bodyTag = _getTag('tpl:body', layoutContent);
            layoutContent = layoutContent.replace(bodyTag, content);
            layoutContent = layoutContent.replace(layoutTag, '');

            applyLayout(layoutContent, options, callback, next);
        });
    }
    else {
        next(content, options, callback);
    }
}

function configureScripts(content, options, callback, next) {
	_parseSection('scripts', content, options, callback, next);
}

function configureHeader(content, options, callback, next) {
	_parseSection('header', content, options, callback, next);
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
}
