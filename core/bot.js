var builder = require('botbuilder');
exports.builder = builder;

var fs = require('fs');
var serialize = require('node-serialize');

var logger = require('../core/logger');

//var logger = require('../core/logger');

var yaml = require('yamljs');
config = yaml.load('config.yml');

var appId = config.microsoft.appId;
var appSecret = config.microsoft.appSecret;

var connector = new builder.ChatConnector({
    appId: appId,
    appPassword: appSecret
});
exports.connector = connector;
var bot = new builder.UniversalBot(connector);
exports.bot = bot;

bot.on('conversationUpdate', function (message) {
    // WebChat Wakeup
    if (message.address.channelId === 'webchat') {
        var reply = new builder.Message()
            .address(message.address)
            .text(
                    "You can leave a feel free to comment:) \n" +
                    "コメントを残せます(｡･･｡)"
                );
        bot.send(reply);
    }
    // Add Members of Group.
    if (message.address.conversation.isGroup && message.membersAdded) {
        message.membersAdded.forEach(function(identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message()
                    .address(message.address)
                    .text(
                            "うまるちゃんが参加しました！<br/>" +
                            "皆さんよろしくおねがいします(｡･･｡)"
                         );
                bot.send(reply);
            }
        });
    }
});

bot.dialog('/', function (session) {
    var filepath = config.session.dir + session.message.address.conversation.id;
    if (!fs.existsSync(filepath)) {
        var session_str = serialize.serialize(session.message.address);

        var fd = fs.openSync(filepath, 'w');
        fs.writeSync(fd, session_str, 0, 'utf8');
        fs.closeSync(fd);
    }

    logger.comment.info('Channel: ' + session.message.address.channelId);
    logger.comment.info(' => UserName: ' + session.message.address.user.name);
    logger.comment.info(' => Message: ' + session.message.text);

    //Debug Log
    console.log('--- session.message.address ----------------');
    console.log(session.message.address);
    console.log('--- session.message.address.user -----------');
    console.log(session.message.address.user);
    console.log('--- session.message.address.conversation ---');
    console.log(session.message.address.conversation);
    console.log('--- session.message.address.bot ------------');
    console.log(session.message.address.bot);

    var parse = require('../core/parse');
    parse.success = false;
    var reply_msg = parse.reply(session, builder, function(msg) {
        if (parse.success) return;
        parse.success = true;
        console.log(msg);
        session.send(msg);
    });
});

exports.say = function(id, text, attachments) {
    var filepath = config.session.dir + id;
    if (!fs.existsSync(filepath))
        throw 'Session file is not found.'
    var stat = fs.statSync(filepath);
    var fd = fs.openSync(filepath, 'r');
    var bytes = fs.readSync(fd, stat.size, 0, 'utf8');
    var session_str = bytes[0];
    fs.closeSync(fd);

    var address = serialize.unserialize(session_str);
    var message = attachments ?
        new builder.Message()
            .address(address)
            .attachments(attachments)
            .text(text) :
        new builder.Message()
            .address(address)
            .text(text);
    console.log(session_str);
    bot.send(message);
}
