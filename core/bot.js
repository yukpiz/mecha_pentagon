var restify = require('restify');
var builder = require('botbuilder');

var yaml = require('yamljs');
config = yaml.load('config.yml');

var appId = config.microsoft.appId;
var appSecret = config.microsoft.appSecret;

exports.connector = new builder.ChatConnector({
    appId: appId,
    appPassword: appSecret
});
var bot = new builder.UniversalBot(connector);

bot.on('conversationUpdate', function (message) {
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
    console.log(session.message.address);
    console.log(session.message.address.user);
    console.log(session.message.address.conversation);
    console.log(session.message.address.bot);
    var parse = require('../core/parse');
    var reply_msg = parse.reply(session, builder, function(msg) {
        console.log(msg);
        session.send(msg);
    });
});
