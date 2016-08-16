var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

var https_options = {
    key: fs.readFileSync('/etc/letsencrypt/live/yukpiz.me/privkey.pem'),
    certificate: fs.readFileSync('/etc/letsencrypt/live/yukpiz.me/cert.pem')
};

var yaml = require('yamljs');
config = yaml.load('config.yml');

var appId = config.microsoft.appId;
var appSecret = config.microsoft.appSecret;

var server = restify.createServer(https_options);
server.listen(process.env.port || process.env.PORT || 8081, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: appId,
    appPassword: appSecret
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.on('conversationUpdate', function (message) {
    console.log('Conversation Update Event ---');
    console.log(message);

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
    var parse = require('../core/parse');
    var reply_msg = parse.reply(session, builder, function(msg) {
        session.send(msg);
    });
});
