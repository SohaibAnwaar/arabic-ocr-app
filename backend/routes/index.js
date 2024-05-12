var express = require('express');
var path = require('path');
const config = require('../../config');
// var db = require('./../../backend/db');
var moment = require('moment');
var async = require("async");
var Enumerable = require("linq");
var url = require('url');
var globalHelperFn = require("../helpers");


module.exports = function (app) {

  app.get('/', function (req, res) {

    res.render('index', {
      query: {}
    });

  });


};