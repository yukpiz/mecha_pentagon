var log4js = require('log4js');

log4js.configure({
    appenders: [
    {
        "type": "file",
        "category": "comment",
        "filename": "./logs/comment.log",
        "pattern": "-yyyy-MM-dd"
    }
    ]
});

exports.comment = log4js.getLogger('comment');
