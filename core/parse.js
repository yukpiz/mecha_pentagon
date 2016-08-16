var success = false;

exports.reply = function(session, builder, callback) {
    var val = session.message.text;
    var match = val.match(/^.*うまるちゃん\<\/at\>\s?(.*)/);
    val = match == null ? val : match[1];

    var yaml = require('yamljs');
    var config = yaml.load('config.yml');

    //ヘルプ表示
    config.matches.help.forEach(function(r) {
        var reg = new RegExp(r);
        if (val.match(reg)) {
            success = true;
            callback(config.help);
        }
    });

    //空リプ
    if (val.trim().length == 0) {
        image_url = config.empty.url[Math.floor(Math.random() * config.empty.url.length)];
        msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: image_url
            }]);
        success = true;
        callback(msg);
    }

    //エンチャント検索
    match = val.match(/エンチャント\s(.*)/);
    if (match) {
        var ecl = require('../plugins/ecl');
        enchant_word = ecl.EscapeSJIS(match[1]);
        msg = config.enchant.url.replace('{text}', enchant_word);
        success = true;
        callback(msg);
    }

    //攻略情報
    if (val.match("夢幻") && val.match("攻略")) {
        msg = config.doc.comment + config.doc.url;
        success = true;
        callback(msg);
    }

    //5秒待って結果がなければ、固定文言を選んで返す
    setTimeout(function() {
        if (!success) {
            console.log("umaru!!");
            var unknown_reply = config.unknown;
            var rand = unknown_reply[Math.floor(Math.random() * unknown_reply.length)];
            callback(rand.replace('{text}', val));
        }
        clearTimeout();
    }, 3000);
};
