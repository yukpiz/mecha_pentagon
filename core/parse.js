var success = false;

exports.reply = function(session, callback) {
    var val = session.message.text;
    var match = val.match(/^.*うまるちゃん\<\/at\>\s?(.*)/);
    val = match == null ? val : match[1];

    var yaml = require('yamljs');
    var config = yaml.load('config.yml');

    config.matches.help.forEach(function(r) {
        var reg = new RegExp(r);
        if (val.match(reg)) {
            success = true;
            callback(config.help);
        }
    });

    match = val.match(/エンチャント\s(.*)/);
    if (match) {
        var ecl = require('../plugins/ecl');
        enchant_word = ecl.EscapeSJIS(match[1]);
        msg = config.enchant.url.replace('{text}', enchant_word);
        success = true;
        callback(msg);
    }

    if (val.match("夢幻") && val.match("攻略")) {
        msg = config.doc.comment + config.doc.url;
        success = true;
        callback(msg);
    }

    //5秒待って結果がなければ、固定文言を選んで返す
    setTimeout(function() {
        if (!success) {
            var unknown_reply = config.unknown;
            var rand = unknown_reply[Math.floor(Math.random() * unknown_reply.length)];
            callback(rand.replace('{text}', val));
        }
        clearTimeout();
    }, 5000);
};
