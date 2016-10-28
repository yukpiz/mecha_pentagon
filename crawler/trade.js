var cheerio = require('cheerio');
var yaml = require('yamljs');
config = yaml.load('config.yml');
url = config.mabinogi.base_url + config.mabinogi.trade.url;

var request = require('request');
request(url, get_urls);

var article_counter = 0;
var insert_counter = 0;

var mongo = require('../core/mongodb');
db = mongo.initDb();
db.open(function() {
    db.collection('mabinogi_trade').find().forEach(function(trade) {
        db.collection('mabinogi_feed').find({checked: false}).forEach(function(feed) {
            if (feed.title.match(trade.word) ||
                feed.summary.match(trade.word) ||
                feed.username.match(trade.word)) {
                msg = '取引版に"' + trade.word + '"に該当する記事が投稿されました！<br/>' +
                    '　' + feed.title + '(' + feed.username + ')<br/>' +
                    '　' + feed.summary + '<br/>' +
                    '　' + feed.link;
                var bot = require('../core/bot');
                console.log(msg);
                console.log('GROUP ID: ' + trade.group_id);
                bot.say(trade.group_id, msg);
            }
            db.collection('mabinogi_feed').update({link: feed.link}, {$set: {checked: true}});
        });
    });
});

function get_urls(err, res, body) {
    if (err) return;
    $ = cheerio.load(body, {decodeEntities: false});
    $('[class^="list-title"] > p > a').each(function() {
        url = config.mabinogi.base_url + $(this).prop('href');
        request(url, save_db);
    });
}

function save_db(err, res, body) {
    if (err) return;
    db = mongo.initDb();
    db.open(function() {
        var collection = db.collection('mabinogi_feed');
        collection.find({link: res.request.uri.href}).count(function(err, count) {
            if (count != 0) {
                article_counter++;
                if (article_counter == 20) {
                    db.close();
                    console.log(insert_counter + '件の更新がありました。');
                    process.exit();
                }
                return;
            }

            $ = cheerio.load(body, {decodeEntities: false});
            var ecl = require('../plugins/ecl');
            doc = {
                title: $('.detail-title-txt').html(),
                summary: $('#detail-main > p').html().replace(/\r\n|\t+/g, '').replace(/\<center\>.*\<\/center\>/g, '').replace(/\<br\>/g, '<br/>'),
                username: $('#contributor-name').html(),
                date: $('#contributor-date').html(),
                link: res.request.uri.href,
                checked: false,
            };
            console.log($('.detail-title-txt').html());
            collection.insert(doc, function() {
                article_counter++;
                insert_counter++;
                if (article_counter == 20) {
                    db.close();
                    console.log(insert_counter + '件の更新がありました。');
                    process.exit();
                }
            });
        });
    });
}
