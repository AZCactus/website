var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var users1 = require('./routes/users1');

var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');

var fs = require("fs");
var userModel = require('./model/user');
var userModel1 = require('./model/user1');

var configDB = require('./config/mongo.js');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config/config'); // get our config file




// Asynchronous - Opening File
// fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('Hello World > helloworld.txt');
// });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');// set up ejs for templating

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var passportConfig = require('./config/passport'); // pass passport for configuration

// required for passport

app.use(session({
    secret: 'keyboard cat',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));//https://github.com/expressjs/session/issues/56
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.set('superSecret', config.secret); // secret variable
console.log(config);


app.use(logger('dev')); // log every request to the console
// use body parser so we can get info from POST and/or URL parameters

app.use(bodyParser.json());// get information from html forms
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());// read cookies (needed for auth)   
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/users1', users1);

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
