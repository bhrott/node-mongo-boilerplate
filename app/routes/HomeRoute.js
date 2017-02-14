module.exports = function(app) {
	app.get('/', function(req, res, next) {
		res.status(200).render('index', { title: 'Index =)'});
	});
};
