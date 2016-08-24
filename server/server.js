var restify = require('restify');
var fs = require('fs');

var https_options = {
    key: fs.readFileSync('/etc/letsencrypt/live/yukpiz.me/privkey.pem'),
    certificate: fs.readFileSync('/etc/letsencrypt/live/yukpiz.me/cert.pem')
};

var server = restify.createServer(https_options);
server.listen(process.env.port || process.env.PORT || 8081, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var bot = require('../core/bot');
server.post('/api/messages', bot.connector.listen());
