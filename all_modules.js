var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var cookieSession = require('cookie-session')//http://goo.gl/IImRVj
var fs = require("fs");
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config/config'); // get our config file
var jwt = require("express-jwt");
var unless = require('express-unless');
var cookieParser = require('cookie-parser');



module.exports.express = express;
module.exports.path = path;
module.exports.logger = logger;
module.exports.bodyParser = bodyParser;
module.exports.flash = flash;
module.exports.session = session;
module.exports.cookieSession = cookieSession;
module.exports.fs = fs;
module.exports.jwt = jwt;
module.exports.config = config;
module.exports.unless = unless;
module.exports.cookieParser = cookieParser;

