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

var unknown_reply = [
    "{text}はわかりません",
    "{text}(✌＇ｗ＇✌)",
    "えっ？",
    "だめでーす",
    "むりでーす",
    "いやでーす",
    "わかりませーん",
    "未実装♡",
];

bot.dialog('/', function (session) {
    // Action of Reply.
    console.log('Reply Event ---');
    console.log(session);

    var reply_msg = parse_reply(session.message.text);
    session.send(reply_msg);
});

function parse_reply(val) {
    var match = val.match(/^.*うまるちゃん\<\/at\>\s?(.*)/);
    val = match == null ? val : match[1];

    if (val.match("夢幻") && val.match("攻略")) {
        return "夢幻ラビの攻略ですっ！<br/>" +
            "https://docs.google.com/document/d/1tsyiRnAeWUEdx0DGfbu0D5JQz8I0aUlW0SKEkcn7Jz8";
    }

    var rand = unknown_reply[Math.floor(Math.random() * unknown_reply.length)];
    return rand.replace('{text}', val);
}
