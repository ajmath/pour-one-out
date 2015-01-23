var express = require('express');
var router = express.Router();

var fs = require('fs');
var gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick: true });
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "apiV1"});
var tempfile = require('tempfile');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var whom = req.url.substring(req.url.indexOf('?') + 1, req.url.length);
  whom = unescape(whom);
  whom = whom.replace(/\+/g, " ");

  var cacheDir = process.env.CACHE_DIR || "gif_cache";
  var cacheFile = cacheDir + "/" + whom + ".gif";
  if (!fs.existsSync(cacheFile)) {
    var tempGif = tempfile('.gif');
    var file = fs.createWriteStream(tempGif);
    imageMagick(__dirname + '/../public/gifs/liquor.gif')
      .font("Impact.ttf", 70)
      .stroke("black")
      .strokeWidth(2)
      .fill("white")
      .drawText(0, 0, whom, "center")
      .stream('gif', function (err, stdout, stderr) {
         if (err) return next(err);
         res.set('Content-Type', 'image/gif');
         stdout.pipe(res);
         stdout.pipe(file);
         stdout.on('error', next);
         stdout.on('end', function() {
           fs.rename(tempGif, cacheFile, function() {
           });
         });
       });
  } else {
    var file = fs.createReadStream(cacheFile);
    res.set('Content-Type', 'image/gif');
    file.pipe(res);
  }
});

module.exports = router;
