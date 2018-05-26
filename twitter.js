const redis = require('redis'),
    CryptoJS = require("crypto-js"),
    client = redis.createClient(6379, "192.168.99.100"),
    Twitter = require('twitter-node-client').Twitter;
let hashtag = process.env.WINBOX_TWITTER_HASHTAG;
const tweetsCount = 20,
    REDIS_SET_NAME = 'dashboard',
    SOURCE = 'twitter';
let encryptedTwitterApiConfig = 'U2FsdGVkX19l0m6FLamXMXluD8//1Au0i0IMX7l6mx34mFcRt05YQvHGZuUay0Vt8pKv+wCwx+jd5pFUXXTpuN23M5tiZqzxDfrjYVYGWj7dZpKeHku1kSoy3Z436QgQJGM8cs+jV85/2mZ4uykoesEeFJhlkNgQOzKshOib/HiB2+dhibrGrkgsGBkaUUPFBSuBE/0FW1kxqydcbvtZYPrPnnJVBptrbHSzQ+OvRd19jz2NT/D7YBG/yPKBR6tTVEYWjsqR1DJCr5uZfzwfhfik2FvgW/xTBoLqeot2y5NHtJrTTDwpIeM6nbGGGt8xc6+1xUQA/9SNZQk0I5XpZXVMkX2vDjslNiD0rSM0ujZ7a00D3UfCn06hQy7TOfCk';

if (!process.env.WINBOX_TWITTER_PASSWORD) {
    console.log("WINBOX_TWITTER_PASSWORD isn't set! This must be set for the program to work! Exiting...");
    return;
}

let twitterApiConfig = JSON.parse(
    CryptoJS.AES.decrypt(encryptedTwitterApiConfig, process.env.WINBOX_TWITTER_PASSWORD)
        .toString(CryptoJS.enc.Utf8));
console.dir(twitterApiConfig);

client.on("error", function (err) {
    console.log("Redis Error: " + err);
});

client.on('connect', function () {
    console.log('redis connected');
    getTweets();
});

var getTweets = async function () {
    let twitter = new Twitter(twitterApiConfig);
    let tweetsJson;
    await twitter.getSearch({'q': hashtag, 'count': tweetsCount}, error => {
        console.log(error)
    }, (tweets) =>  {
        tweetsJson = JSON.parse(tweets);
        loopTweets(tweetsJson);
    });
};

let loopTweets = async function  (tweetsJson) {
    console.log();
    for (let entry of tweetsJson.statuses) {
        let id = entry.id;
        let date = new Date(entry.created_at);
        let timestamp = date.getTime();
        let text = entry.text;
        let author = entry.user.screen_name;
        let ret = {
            text: text,
            timestamp: timestamp,
            author: author,
            source: SOURCE
        };
        await putOnRedis(id, ret);
    }
    client.quit();
}

let putOnRedis = async function (key, value) {
    await new Promise((resolve, reject) => {
        client.hsetnx(REDIS_SET_NAME, key, value, redis.print);
        resolve();
    });
};


/*
* var getTweets = async function () {
    let twitter = new Twitter(twitterApiConfig);
    await twitter.getSearch({'q': hashtag, 'count': tweetsCount}, error => {
        console.log(error)
    }, async function (tweets) {
        let tweetsJson = JSON.parse(tweets);
        for (let entry of tweetsJson.statuses) {
            let id = entry.id;
            let date = new Date(entry.created_at);
            let timestamp = date.getTime();
            let text = entry.text;
            let author = entry.user.screen_name;
            let ret = {
                text: text,
                timestamp: timestamp,
                author: author,
                source: SOURCE
            };
            await putOnRedis(id, ret);
        }
    });
    client.quit();
};
let putOnRedis = async function (key, value) {
    await new Promise((resolve, reject) => {
        client.hsetnx(REDIS_SET_NAME, key, value, redis.print)
        resolve();
    });
};
*
* */
/*
let startCron = function () {
    new CronJob('10 * * * * *', function () {
        console.log('You will see this message every second');
        getTweets()
    }, null, true, 'America/Los_Angeles');
};
*/