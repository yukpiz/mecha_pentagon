var replyed = false;

exports.reply = function(e) {
	replyed = false;
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

			m = message.match(/^\!add\s[\"|\'](.*)[\"|\']\s[\"|\'](.*)[\"|\']/);
			if (m) {
				collection.find({word:m[1]}).count(function(err, c) {
					if (c == 0) {
						//Insert
						collection.insert({word:m[1], reply:[m[2]]}, function() {
							console.log('SUCCESS ADD COMMAND BY INSERT: ' + m[1] + ',' + m[2]);
						});
					} else {
						//Update
						collection.update({word:m[1]}, {$push:{reply:m[2]}}, function() {
							console.log('SUCCESS ADD COMMAND BY UPDATE: ' + m[1] + ',' + m[2]);
						});
					}
				});
				return
			}

			m = message.match(/^\!remove\s[\"|\'](.*)[\"|\']/);
			if (m) {
				collection.remove({word:m[1]}, function(err) {
					console.log('SUCCESS REMOVE COMMAND: ' + m[1]);
				});
				return
			}

			collection.findOne({word:message}, function(err, doc) {
				if (doc.reply.length == 0) return;
				var random_reply = doc.reply[Math.floor(Math.random() * doc.reply.length)];
				send(e.replyToken, random_reply);
				return;
			});

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

			var random_word = words[Math.floor(Math.random() * words.length)];
			collection.findOne({ word: random_word }, function(err, doc) {
				if (doc.reply.length == 0) return;
				var random_reply = doc.reply[Math.floor(Math.random() * doc.reply.length)];
				send(e.replyToken, random_reply);
				return;
			});
		});
	});
}

exports.send = send;
function send(token, message) {
	if (replyed) return;
	replyed = true;
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
