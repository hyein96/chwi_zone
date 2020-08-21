const express = require("express");
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);

router.get("/", function (req, res) {
  let email_address = req.query.email_address;
  //user 정보 가져오기
  let mypage_user_query = `select user_name,email_address from user where email_address = "${email_address}";`;
  //취향 카테고리 가져오기
  let mypage_youtube_query = `select youtube_category,sub_count from my_youtube where email_address ="${email_address}";`;
  pool.getConnection(function (err, connection) {
    connection.query(mypage_user_query + mypage_youtube_query, function (
      err,
      rows,
      fields
    ) {
      if (err) {
        connection.release();
        throw err;
      } else {
        if (rows.length == 0) {
        } else {
          //json으로 파싱...
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

module.exports = router;
