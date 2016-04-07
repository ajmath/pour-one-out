var express = require('express'),
    fs = require('fs'),
    bunyan = require('bunyan'),
    tempfile = require('tempfile'),
    ImageGen = require(__dirname + '/../lib/image_generator');

var router = express.Router();
var log = bunyan.createLogger({name: "apiV2"});
var sameImageTime = 1000 * 60 * 60 * 3; // 3 hours
var imagePickerCache = {};
var gifList = fs.readdirSync(`${__dirname}/../public/gifs/`)
  .filter(f => f.endsWith(".gif"))
  .map(f => f.replace(".gif", ""));

if(gifList == "undefined" || gifList.length < 1) {
  log.fatal("could not load gif list", gifList);
  process.exit(1);
}
log.info("Using gif list = ", gifList);

function parseWhom(url) {
  var whom = url.substring(url.indexOf('?') + 1, url.length);
  whom = unescape(whom);
  return whom.replace(/\+/g, " ");
}

function returnImage(req, res, next) {
  if (!req["gif"] || gifList.indexOf(req.gif) < 0) {
    return res.status(400).send({ msg: `No gif found for ${req.gif}`, valid_gifs: gifList });
  }
  var filename = `${__dirname}/../public/gifs/${req.gif}.gif`;
  var annotateWin = (stream) => {
    res.set('Content-Type', 'image/gif');
    stream.pipe(res);
  };
  var annotateFail = (err) => {
    log.error({err: err}, `Unable to annotate image ${filename} with text ${req.whom}`);
    res.status(500).send({ msg: `Unable to annotate image ${filename} with text ${req.whom}`, err: err });
  };

  return ImageGen.getAnnotatedImage(req.whom, filename).then(annotateWin, annotateFail);
}

router.get('/:gif', (req, res, next) => {
  req.whom = parseWhom(req.url);
  req.gif = req.params["gif"].toLowerCase();
  returnImage(req, res, next);
});

router.get('/', (req, res, next) => {
  req.whom = parseWhom(req.url);
  req.gif = imagePickerCache[req.whom];
  if(req.gif) {
    log.info(`Found existing '${req.whom}', using ${req.gif}`);
    return returnImage(req, res, next);
  }

  req.gif = gifList[Math.round(Math.random() * (gifList.length - 1))];
  imagePickerCache[req.whom] = req.gif;

  log.info(`No existing image found for '${req.whom}', using ${req.gif}`);
  setTimeout(() => delete imagePickerCache[req.whom], sameImageTime);

  return returnImage(req, res, next);
});


module.exports = router;
