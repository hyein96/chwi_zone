const express = require('express');
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);

router.get("/", function (req, res) {
    //해당 email 구독하는 youtube_category 가져오기
    //category랑 매칭하는 sector_id 가져오기
  
    //우선 email_address ="1"로 test
    let email_address = "1";
    pool.getConnection(function (err, connection) {
      //category list - > sector_id select
      let get_bookmark_query = `SELECT stocks_id,stocks_name FROM chwizone.stock_code WHERE stocks_id IN(select stocks_id from chwizone.bookmark where email_address="${email_address}");`;
      let get_bookmark = connection.query(get_bookmark_query, function (err, rows) {
        if (err) {
          connection.release();
          throw err;
        } else {
          if (rows.length == 0) {
          } else {
                   console.log(rows);
                   ret = JSON.stringify(rows);
                   result = JSON.parse(ret);
                   console.log(result);
                   res.json(result);
                 }
        }
        connection.release();
      });
    });
  });


router.post("/", function (req, res) {

});

module.exports = router;