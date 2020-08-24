const express = require('express');
const router = express.Router();
const request = require("request");

let mysql = require("mysql");
let config = require("../db/db_info").local;
let dbconfig = require("../db/db_con")();
let pool = mysql.createPool(config);

//index page render

router.get('/',(req,res,next)=>{
    res.render("index.ejs");
});


module.exports = router;