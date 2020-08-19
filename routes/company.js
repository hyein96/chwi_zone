const express = require('express');
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);


router.get("/", function (req, res) {

});


router.post("/", function (req, res) {

});

module.exports = router;