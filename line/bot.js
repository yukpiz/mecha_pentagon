exports.receive = function(req, res, next) {
	var parse = require('../line/parse');
	parse.reply(req.body.events[0]);
}
