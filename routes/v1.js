var express = require('express');
var router = express.Router();
var ImageGen = require(__dirname + '/../lib/image_generator')

var fs = require('fs');
var gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick: true });
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "apiV1"});
var tempfile = require('tempfile');

router.get('/', function(req, res, next) {
  var whom = req.url.substring(req.url.indexOf('?') + 1, req.url.length);
  whom = unescape(whom);
  whom = whom.replace(/\+/g, " ");

  var filename = __dirname + '/../public/gifs/liquor.gif';
  var streamPromise = ImageGen.getAnnotatedImage(whom, filename);

  var annotateWin = function(stream) {
    res.set('Content-Type', 'image/gif');
    stream.pipe(res);
  };
  var annotateFail = function(err) {
    log.error({err: err}, "Unable to annotate image " + filename + " with text '" + whome + "'");
    res.send(500, { error: 'something blew up' });
  };
  streamPromise.then(annotateWin, annotateFail);
});

module.exports = router;
