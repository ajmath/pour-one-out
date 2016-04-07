var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var v1 = require('./routes/v1');
var v2 = require('./routes/v2');

var app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', v1);
app.use('/api/v2', v2);
app.use('/api/', v2);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err,
            prod: false
        });
    });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.json({
          message: err.message,
          error: err,
          prod: true
      });
  });
}


module.exports = app;
