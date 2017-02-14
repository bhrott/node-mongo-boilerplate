module.exports = function(app) {
	return function(req, res, next) {
		var expectedKey = 'your_hash_key';

		if(req.headers['x-your-header-auth'] === expectedKey) {
			next();
		}
		else {
			res.status(401).end();
		}
	};
};
