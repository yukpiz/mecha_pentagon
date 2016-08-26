exports.success = false;

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
        callback(msg);
    }

    //エンチャント検索
    match1 = val.match(/エンチャント\s(.*)/);
    if (match1) {
        var ecl = require('../plugins/ecl');
        enchant_word = ecl.EscapeSJIS(match1[1]);
        msg = config.enchant.url.replace('{text}', enchant_word);
        callback(msg);
    }

    //取引追加
    match2 = val.match(/取引\s\+(.*)/);
    if (match2) {
        var mongo = require('../core/mongodb');
        db = mongo.initDb();
        db.open(function() {
            var collection = db.collection('mabinogi_trade');
            collection.find({
                group_id: session.message.address.conversation.id,
                word: match2[1],
            }).count(function(err, count) {
                if (count != 0) {
                    db.close();
                    callback('そのワードは登録済みだよっ！');
                    return;
                }

                collection.insert({
                    group_id: session.message.address.conversation.id,
                    word: match2[1],
                }, function() {
                    db.close();
                    callback('監視をはじめます！');
                    return;
                });
            });
        });
    }

    //取引削除
    match3 = val.match(/取引\s\-(.*)/);
    if (match3) {
        var mongo = require('../core/mongodb');
        db = mongo.initDb();
        db.open(function() {
            var collection = db.collection('mabinogi_trade');
            collection.find({
                group_id: session.message.address.conversation.id,
                word: match3[1],
            }).count(function(err, count) {
                if (count == 0) {
                    console.log('no');
                    db.close();
                    callback('そのワードは登録されていません・・');
                    return;
                }

                collection.remove({
                    group_id: session.message.address.conversation.id,
                    word: match3[1],
                }, function(err, result) {
                    console.log('yes');
                    db.close();
                    callback('監視ワードから削除したよっ！');
                    return;
                });
            });
        });
    }

    //取引一覧
    match4 = val.match(/取引$/);
    if (match4) {
        var mongo = require('../core/mongodb');
        db = mongo.initDb();
        db.open(function() {
            var collection = db.collection('mabinogi_trade');
            items = collection.find({
                group_id: session.message.address.conversation.id,
            });
            var msg = '';
            items.count(function(err, count) {
                msg = count == 0 ?
                    '監視中のワードはありません！<br/>':
                    'このグループで監視中のワード一覧ですっ！<br/>';
                var counter = 0;
                items.forEach(function(item) {
                    msg = msg + '　　' + item.word + '<br/>';
                    counter++;
                });

                setTimeout(function() {
                    if (count == counter) {
                        callback(msg);
                        clearTimeout();
                    }
                }, 1000);
            });
        });
    }

    //攻略情報
    if (val.match("夢幻") && val.match("攻略")) {
        msg = config.doc.comment + config.doc.url;
        callback(msg);
    }

    //5秒待って結果がなければ、固定文言を選んで返す
    setTimeout(function() {
        var unknown_reply = config.unknown;
        var rand = unknown_reply[Math.floor(Math.random() * unknown_reply.length)];
        callback(rand.replace('{text}', val));
        clearTimeout();
    }, 5000);
};
