exports.initDb = function() {
    var mongodb = require('mongodb');
    var db = new mongodb.Db('mecha_pentagon',
        new mongodb.Server('localhost', 27017, {}), {});
    return db;
}
