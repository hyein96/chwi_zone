const express = require("express");
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);

router.get("/", function(req,res){
  res.render("main.ejs");
})

const company_list = [];
let company = new Object();

router.get("/recommend", function (req, res) {

  //해당 email 구독하는 youtube_category 가져오기
  //category랑 매칭하는 sector_id 가져오기

  //우선 email_address ="1"로 test
  //let email_address = "1";
  let email_address = req.query.email_address;
  console.log("main.ejs에서 받아온 값:" + email_address); 
  pool.getConnection(function (err, connection) {
    //category list - > sector_id select
    let get_sector_query = `SELECT sector_id FROM chwizone.category_code WHERE youtube_category IN(select youtube_category from chwizone.my_youtube where email_address="${email_address}" order by sub_count desc);`;
    let get_sector = connection.query(get_sector_query, function (err, rows) {
      if (err) {
        connection.release();
        throw err;
      } else {
        if (rows.length == 0) {
        } else {
          //console.log(rows);
          const delay = (ms) => {
            //sector_id -> get company list
            for (let i = 0; i < rows.length; i++) {
              console.log(rows[i].sector_id);
              get_company(rows[i].sector_id);
            }
            return new Promise((resolve, reject) => {
              try {
                setTimeout(() => {
                  resolve();
                }, ms);
              } catch (err) {
                reject(err);
              }
            });
          };
          delay(1000).then(() => {
            console.log(company_list);
            //send compnay_list array
            //res.send(company_list);
            res.json(company_list);
          });
        }
      }

      connection.release();
    });
  });
});
//1. get sector_name, 2.get stock_name, stock_id
function get_company(sector_id) {
  let get_sector_name_query = `SELECT DISTINCT sector_name FROM chwizone.stock_code WHERE sector_id = "${sector_id}";`;
  let get_company_query = `SELECT stocks_name,stocks_id FROM chwizone.stock_code WHERE sector_id ="${sector_id}";`;
  pool.getConnection(function (err, connection) {
    let get_company_info = connection.query(
      get_sector_name_query + get_company_query,
      function (err, rows, fields) {
        if (err) {
          connection.release();
          throw err;
        } else {
          if (rows.length == 0) {
          } else {
            //json으로 파싱... -> array 접근
            ret = JSON.stringify(rows);
            result = JSON.parse(ret);
            company.sector_name = result[0][0].sector_name;
            company.company_list = result[1];
            console.log(company);
            //company_list compnay object push
            company_list.push(company);
            company = {};
          }
        }

        connection.release();
      }
    );
  });
}
module.exports = router;
