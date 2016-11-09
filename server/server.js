var restify = require('restify');
var fs = require('fs');

var https_options = {
    key: fs.readFileSync('/etc/letsencrypt/live/yukpiz.me/privkey.pem'),
    certificate: fs.readFileSync('/etc/letsencrypt/live/yukpiz.me/cert.pem')
};

var server = restify.createServer(https_options);
server.use(restify.bodyParser());
server.listen(process.env.port || process.env.PORT || 8081, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var skype_bot = require('../skype/bot');
server.post('/api/messages', skype_bot.connector.listen());

var line_bot = require('../line/bot');
server.post('/line/api/messages', line_bot.receive);
