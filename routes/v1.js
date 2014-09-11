var express = require('express');
var router = express.Router();

var gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick: true });
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "apiV1"});


/* GET users listing. */
router.get('/', function(req, res, next) {
  var whom = req.url.substring(req.url.indexOf('?') + 1, req.url.length);
  whom = unescape(whom);
  whom = whom.replace("+", " ");

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
      stdout.on('error', next);
    });
});

module.exports = router;
