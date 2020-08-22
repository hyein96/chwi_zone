const express = require("express");
const router = express.Router();
const request = require("request");
​
// client id 변경하기
const CLIENT_ID =
  "323175054347-2opv5viepsbbh21foitrcit5qvfdh5is.apps.googleusercontent.com";
const CLIENT_SECRET = "22TqiukkUyK8yAn4Wjip3BSR";
var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);
​
// 구글 로그인 인증
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);
/* GET home page. */
//가입 정보 선언(login함수에서 매개변수로 쓰이므로 전역으로)
let access_token;
let refresh_token;
let user_name;
let email_address;
​
//구글 oauth callback 
router.get("/googlesigncallback", (req, res, next) => {
  let authCode = req.query.code;
  console.log(authCode);
​
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
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/account/googlesigncallback",
      grant_type: "authorization_code",
    },
  };
  const delay = (ms) => {
    request(option, function (error, response, body) {
      if (error) {
        console.error(error);
        throw error;
      } else {
        var accessRequestResult = JSON.parse(body);
        console.log(accessRequestResult);
        //token 저장
        access_token = accessRequestResult.access_token;
        refresh_token = accessRequestResult.refresh_token;
​
        //id_token -> jwt verify email 정보 , user_name 정보 얻음
        async function verify() {
          const ticket = await client.verifyIdToken({
            idToken: accessRequestResult.id_token,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
          });
          const payload = ticket.getPayload();
          email_address = payload["email"];
          user_name = payload["name"];
​
          // If request specified a G Suite domain:
          // const domain = payload['hd'];
          console.log(email_address);
          console.log(user_name);
        }
        verify().catch(console.error);
      }
    });
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
  //정보 가져온 후 회원확인 절차 loing
  delay(3000).then(() => {
    function login(access_token, refresh_token, user_name, email_address, callback) {
      let find_user_query = `select * from user where email_address="${email_address}"`;
      pool.getConnection(function (err, connection) {
​
        let find_user = connection.query(find_user_query, function (err, rows) {
          if (err) {
            connection.release();
            throw err;
          } else {
            //회원 x -> db 저장(길이가 0이면 회원이 없는 것)
            if (rows.length == 0) {
              var sql = `insert into user (access_token, refresh_token, user_name, email_address) values ("${access_token}","${refresh_token}","${user_name}","${email_address}");`;
              connection.query(sql, function (err, results) {
                if (err) throw err;
                else {
                  setTimeout(callback, 1000, email_address);
                }
              });
            } else {
              //회원 o -> 정보 업데이트
              var sql = `UPDATE user SET access_token="${access_token}", refresh_token="${refresh_token}" where email_address="${email_address}";`;
              connection.query(sql, function (err, results) {
                if (err) throw err;
                else {
                  setTimeout(callback, 1000, email_address);
                }
              });
            }
          }
          connection.release();
        });
      });
    }
    login(access_token, refresh_token, user_name, email_address, function (email_address) {
      //youtube.ejs로 넘기기 
      console.log("youtube.ejs로 넘기는 data:" + email_address);
      res.render("youtube.ejs", { data: email_address });
    });
  });
});
module.exports = router;