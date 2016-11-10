exports.reply = function(e) {
	var message = e.message.text;

	var MeCab = new require('mecab-async');
	var mecab = new MeCab();
	MeCab.command = 'mecab -d /usr/lib/mecab/dic/mecab-ipadic-neologd';
	mecab.parse(message, function(err, res) {
		console.log(res);
		var mongo = require('../core/mongodb');
		db = mongo.initDb();
		db.open(function() {
			var collection = db.collection('megumin_analyzer');
			var words = new Array();
			res.forEach(function(a) {
				if (a[1] == '名詞' || a[1] == '感動詞') {
					if (words.indexOf(a[0]) >= 0) return;
					words.push(a[0]);
					collection.find({ word: a[0] }).count(function(err, c) {
						if (c != 0) return;
						collection.insert({
							word: a[0],
							reply: [],
						}, function() {
							console.log('Saved: ' + a[0]);
						});
					});
				}
			});

			m = message.match(/[v|V]ersion/);
			if (m) {
				collection.find({}).count(function(err, c) {
					reply_message =
						'AI CODE: mecha_pentagon::megumin_analyzer\n' +
						'  https://github.com/yukpiz/mecha_pentagon\n' +
						'  今の単語数は ' + c + ' 件です！';
					send(e.replyToken, reply_message);
				});
				return;
			}

			var random_word = words[Math.floor(Math.random() * words.length)];
			collection.findOne({ word: random_word }, function(err, doc) {
				if (doc.reply.length == 0) return;
				var random_reply = doc.reply[Math.floor(Math.random() * doc.reply.length)];
				send(e.replyToken, random_reply);
			});
		});
	});
}

exports.send = send;
function send(token, message) {
	var yaml = require('yamljs');
	var config = yaml.load('config.yml');

	var request = require('request');
	var headers = {
		'Content-Type': 'application/json',
		'Authorization': config.line.access_token,
	};

	var options = {
		url: config.line.url.reply,
		method: 'POST',
		headers: headers,
		json: true,
		body: JSON.stringify({
			'replyToken': token,
			'messages': [
				{
					'type': 'text',
					'text': message,
				},
			],
		}),
	};

	request(options, function(err, res, body) {
		console.log(body);
	});
}
