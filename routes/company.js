const express = require('express');
const router = express.Router();
const request = require("request");

let mysql = require("mysql");
let config = require("../db/db_info").local;
let dbconfig = require("../db/db_con")();
let pool = mysql.createPool(config);

router.get("/", function(req,res){
  res.render("company.ejs");
});

router.get("/info", function (req, res) {
    //email 필요?  book mark stocks_id 
    let stocks_id = req.query.stocks_id;
    let email_address = req.query.email_address;
    //let stocks_id = "4970";
    //let email_address = "1";
    console.log(stocks_id);
  
    //우선 email_address ="1"로 test
    pool.getConnection(function (err, connection) {
      //category list - > sector_id select
      let get_company_query = `SELECT sector_name ,stocks_name FROM stock_code WHERE stocks_id =${stocks_id};`;
      let get_bookmark = `select count(*) as value from bookmark where email_address="${email_address}" and stocks_id=${stocks_id}`
      connection.query(get_company_query+get_bookmark, function (err, rows) {
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



module.exports = router;