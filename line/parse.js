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

	if (!reply_message) {
		return;
	}

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
