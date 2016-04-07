var gm = require('gm');
var bunyan = require('bunyan');
var fs = require('fs');
var Promise = require('promise');
var StreamCache = require('stream-cache');

var imageMagick = gm.subClass({ imageMagick: true });

var log = bunyan.createLogger({name: "imageGen"});

var cache = {};

var cacheTime = 1000 * 60 * 60 * 12;

module.exports = {

  getAnnotatedImage : (whom, filename) => {
    var cacheKey = whom + "." + filename;

    if (cache[cacheKey]) {
      log.info("Cache hit for " + cacheKey);
      return Promise.resolve(cache[cacheKey]);
    }

    log.info("Cache miss for " + cacheKey);
    return new Promise(function (fulfill, reject){
      imageMagick(filename)
        .font("Impact.ttf", 70)
        .stroke("black")
        .strokeWidth(2)
        .fill("white")
        .drawText(0, 0, whom, "center")
        .stream('gif', (err, stdout, stderr) => {
          if (err) return reject(err);

          cache[cacheKey] = new StreamCache();
          stdout.pipe(cache[cacheKey]);
          stdout.on('error', (err) => reject(err));
          stdout.on('end', () => setTimeout(() => delete cache[cacheKey], cacheTime));
          fulfill(cache[cacheKey]);
        });
    });
  }
};
