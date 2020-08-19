const express = require('express');
const router = express.Router();
const request = require("request");

var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);


var access_token;
/* GET home page. */
router.get('/signin',(req,res,next)=>{
  res.render('signin');
});
router.get('/authResult',(req,res)=>{
})
router.get('/googlesigncallback',(req,res,next)=>{
    let authCode = req.query.code;
    console.log(authCode);
  
    var option = {
      method: "POST",
      url: "https://oauth2.googleapis.com/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
      form: {
        code: authCode,
        //#자기 키로 시크릿 변경
        client_id: "client_id",
        client_secret: "client_secret",
        redirect_uri: "http://localhost:3000/account/googlesigncallback",
        grant_type: "authorization_code",
      },
    };
    request(option, function (error, response, body) {
      if (error) {
        console.error(error);
        throw error;
      } else {
        var accessRequestResult = JSON.parse(body);
        console.log(accessRequestResult);
        //res.render("resultChild", { data: accessRequestResult });
        access_token = accessRequestResult.access_token;
        //ACCESS_TOKEN /YOUTUBE/SUBSCRIBE GET 요청
       
    }
  });
});

router.get('/yt',(req,res,next)=>{
  
  var option = {
    method: "GET",
    url: "http://localhost:3000/youtube/subscribe",
    headers: {
      Authorization: access_token,
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***

  };
  request(option, function (error, response, body) {
    if (error) {
      console.error(error);
      throw error;
    } else {
        
      var resultJson = JSON.parse(body);
      // let items = resultJson.items;
      // for (let i in items){
      //     let snippet = i.snippet;
      //     let resourceId = snippet.resourceId
      //     console.log(resourceId.channelId)
      // } 
      
      
      console.log(resultJson);
      //res.json(resultJson);
    }
  });
});
module.exports = router;

