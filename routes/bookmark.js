const express = require("express");
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);

router.get("/", function (req, res) {
  res.render("bookmark.ejs");
});
router.get("/company", function (req, res) {
  let email_address = req.query.email_address;
  //email_address -> stocks_id, stocks_name 설정
  pool.getConnection(function (err, connection) {
    let get_bookmark_query = `SELECT stocks_id,stocks_name FROM chwizone.stock_code WHERE stocks_id IN(select stocks_id from chwizone.bookmark where email_address="${email_address}");`;
    connection.query(get_bookmark_query, function (err, rows) {
      if (err) {
        connection.release();
        throw err;
      } else {
        if (rows.length == 0) {
          res.json("bookmark 정보 없음");
        } else {
          //bookmark 정보 있으면 출력
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
  console.log(req.body);
  let email_address = req.body.email_address;
  let stocks_id = req.body.stocks_id;
  let order = req.body.order;
  //order - insert : bookmark 삽입 , delete : bookmark 삭제
  if (order == "insert") {
    pool.getConnection(function (err, connection) {
      let insert_bm = `insert into bookmark (email_address, stocks_id) values ("${email_address}","${stocks_id}");`;
      connection.query(insert_bm, function (err, results) {
        if (err) throw err;
        else {
          res.json("bookmark 입력");
        }
        connection.release();
      });
    });
  } else if (order == "delete") { 
    pool.getConnection(function (err, connection) {
    let delete_bm = `delete from bookmark where email_address="${email_address}" and stocks_id="${stocks_id}";`;
    connection.query(delete_bm, function (err, results) {
      if (err) throw err;
      else {
        res.json("bookmark 제거");
      }
      connection.release();
    });
  });
  }
});

module.exports = router;
