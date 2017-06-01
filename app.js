var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//const formidable = require("express-formidable");

var routes = require('./routes/index');
var users = require('./routes/users');
var flash = require('connect-flash');
var app = express();
app.listen(3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
//app.use(formidable());
//app.use('/upload', express.static(__dirname + '/uploads'));
app.use(session({secret: 'ssshhhhh'}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});
app.use('/', routes);
app.use('/users', users);



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
