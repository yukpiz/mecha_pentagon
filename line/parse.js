exports.reply = function(e) {
	var message = e.message.text;
	var reply_message = null;
	reply_message = match0(message) ?
		'我が名はめぐみん！\n' +
		'アークウィザードを生業とし最強の攻撃魔法、爆裂魔法を操る者！\n' +
		'あまりの強大さゆえ世界に疎まれし我が禁断の力を汝も欲するか\n' +
		'ならば、我とともに究極の深淵を除く覚悟をせよ！\n' +
		'人が深淵を覗く時、深淵もまた人を覗いているのだ！'
		: reply_message;

	var MeCab = new require('mecab-async');
	var mecab = new MeCab();
	mecab.parse(message, function(err, res) {
		console.log(res);
        var mongo = require('../core/mongodb');
		db = mongo.initDb();
		db.open(function() {
            var collection = db.collection('megumin_analyzer');
			var words = new Array();
			res.forEach(function(a) {
				if (a[1] == '名詞' || a[1] == '感動詞') {
					words.push(a[0]);
					collection.find({ word: a[0] }).count(function(err, c) {
						if (c != 0) return;
						collection.insert({
							word: a[0],
							reply: [],
						}, function() {
							console.log('Saved: ' + a[0]);
							db.close();
						});
					});
				}
			});

			var random_word = words[Math.floor(Math.random() * words.length)];
			collection.findOne({ word: random_word }, function(err, doc) {
				if (doc.reply.length == 0) return;
				var random_reply = doc.reply[Math.floor(Math.random() * doc.reply.length)];
				console.log(random_reply);
			});
		});
	});

	if (!reply_message) return;

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
			'replyToken': e.replyToken,
			'messages': [
				{
					'type': 'text',
					'text': reply_message,
				},
			],
		}),
	};

	request(options, function(err, res, body) {
		console.log(body);
	});
}

function match0(message) {
	m = message.match(/はじめまして/);
	return m ? true : false;
}
