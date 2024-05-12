var express = require('express');
var path = require('path');
const config = require('./config');
var moment = require('moment');
var async = require("async");
const session = require('express-session');
var globalHelperFn = require("./backend/helpers");


var fs = require('fs');
var app = express();

const httpServer = require('http').createServer({}, app);
var socketIO = require('socket.io')(httpServer);


app.use(function (req, res, next) {
  req.session = {};

  if (req.session.user == undefined) {
    req.session.user = {
      lang: 'en'
    }
  }

  res.locals.session = req.session;
  next();
});



var frontendPath = path.resolve(__dirname, './frontend');
var frontendPublicPath = frontendPath + '/public';

var backendPath = path.resolve(__dirname, './backend');

app.set('view engine', 'ejs');

app.set('views', path.join(frontendPath, '/views'));

app.set('view options', {delimiter: '?'});

app.locals.moment = moment;
app.locals.globalHelperFn = globalHelperFn;

app.use(express.static(frontendPublicPath));

app.use(express.json({limit: '50mb', extended: true})) // for parsing application/json
app.use(express.urlencoded({limit: '50mb', extended: true})) // for parsing application/x-www-form-urlencoded


require('./backend/routes/index')(app);

require('./import-files')(app);
require('./backend/routes/search')(app);


httpServer.listen(config.app.port, function () {
  console.log(`Example app listening on port ${config.app.port}!`);
});