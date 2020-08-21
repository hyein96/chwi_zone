const express = require('express');
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);

router.get("/", function (req, res) {
   let email_address = req.query.email_address
    //해당 email 구독하는 youtube_category 가져오기
    //category랑 매칭하는 sector_id 가져오기
  
    //우선 email_address ="1"로 test
    //let email_address = "1";
    pool.getConnection(function (err, connection) {
      //category list - > sector_id select
      let get_bookmark_query = `SELECT stocks_id,stocks_name FROM chwizone.stock_code WHERE stocks_id IN(select stocks_id from chwizone.bookmark where email_address="${email_address}");`;
      connection.query(get_bookmark_query, function (err, rows) {
        if (err) {
          connection.release();
          throw err;
        } else {
          if (rows.length == 0) {
            res.json("bookmark 정보 없음")
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

// 수정중 수정중 수정중
// 수정중 수정중 수정중
// 수정중 수정중 수정중
// 수정중 수정중 수정중
// 수정중 수정중 수정중
// 수정중 수정중 수정중
router.post("/", function (req, res) {
  //let email_address = req.query.email
  //let email_address = req.query.stocks_id

  let email_address = "1";
  let stocks_id ="6040"
  pool.getConnection(function (err, connection) {
    //category list - > sector_id select
    let find_bookmark_query = `select * from bookmark where email_address="${email_address}" and stocks_id ="${stocks_id}";`;
    let find_bookmark = connection.query(find_bookmark_query, function (err, rows) {
      if (err) {
        connection.release();
        throw err;
      } else {
        if (rows.length == 0) {
          let insert_bm = `insert into bookmark (email_address, stocks_id) values ("${email_address}","${stocks_id}");`;
              connection.query(insert_bm, function (err, results) {
                if (err) throw err;
                else {
                  res.json("bookmark deleted..");
                }
              });
        } else {
          let delete_bm = `delete from bookmark where email_address="${email_address}" and stocks_id="${stocks_id}";`;
          connection.query(delete_bm, function (err, results) {
          if (err) throw err;
          else {
            res.render("bookmark update..");
          }
        });
               }
      }
    
      connection.release();
    });
  });
});

module.exports = router;