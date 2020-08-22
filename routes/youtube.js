const express = require("express");
const router = express.Router();
const request = require("request");
const path = require("path");
var mysql = require("mysql");
var config = require("../db/db_info").local;
var dbconfig = require("../db/db_con")();
var pool = mysql.createPool(config);


//category 값 key, value 저장 -> db에 id와 함께 저장
//id 가져오는거 방법 생각하기!!!!
const my_youtube = [];
let access_token;
let email_address;

// channel 중복 값 거르기 위해 set 사용

//해당 이메일에 해당하는 token 받아서 youtube API 접근/데이터 받아옴
//호출 후, 받아온 데이터 db에 저장 됨 
router.get("/subscribe", function (req, res) {
  email_address = req.query.email_address;
  console.log("youtube.ejs에서 받아온 값:" + email_address); 
  pool.getConnection(function (err, connection) {
    //category list - > sector_id select
    let get_at_query = `SELECT access_token FROM user WHERE email_address="${email_address}";`;
    connection.query(get_at_query, function (
      err,
      rows
    ) {
      if (err) {
        connection.release();
        throw err;
      } else {
        if (rows.length == 0) {
          res.json("you are not my user");
        } else {
          console.log(rows[0].access_token);
          access_token = rows[0].access_token;
          var option = {
            method: "GET",
            url: "https://www.googleapis.com/youtube/v3/subscriptions",
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
            //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
            qs: {
              part: "snippet",
              mine: "true",
              maxResults: "50",
              //key: `apikey`,
              fields: "items(snippet(resourceId(channelId)))",
            },
          };
          const delay = (ms) => {
            request(option, function (error, response, body) {
              if (error) {
                console.error(error);
                throw error;
              } else {
                var resultJson = JSON.parse(body);
                let items = resultJson.items;
                for (let i = 0; i < items.length; i++) {
                  let item = items[i].snippet;
                  let channelId = item.resourceId.channelId;
                  //console.log(channelId);
                  //token, channelId 넘겨서 channel 정보 가져오기
                  getTopic(access_token, channelId);
                }
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
        
          delay(3000).then(() => {
            count_value();
            res.render("main.ejs",{ data: email_address });
          });
          //여기서(res 있는 곳) main.ejs로 바꾸며 email_address값 넘겨주기 
          //email_address 전역으로 선언해서 DB insert 할 때 넣기(query로 받아온 것 까지 확인))
         
        }
      }
      connection.release();
    });
  });

  

  // console.log(resultJson);
  //res.json(resultJson);
});
​
function getTopic(access_token, channelId) {
  // for(let i=0;i<channels.length;i++){
  let option = {
    method: "GET",
    url: "https://www.googleapis.com/youtube/v3/channels",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
    qs: {
      part: "topicDetails",
      id: channelId,
      //key: `apikey`,
      fields: "items(topicDetails)",
    },
  };
  request(option, function (error, response, body) {
    //console.log(channelId);
    let resultJson = JSON.parse(body);
    let topicDetails = resultJson.items[0].topicDetails;
    let topics = topicDetails.topicIds;
    get_category(topics);
  });
}
​
function get_category(topics) {
  //console.log(topics)
  let str = "";
  for (let i = 0; i < topics.length; i++) {
    str += `"${topics[i]}"`;
    if (i != topics.length - 1) {
      str += `,`;
    }
  }
  //console.log(str);
  pool.getConnection(function (err, connection) {
    //topicId -> category 변환
    //배열 전체 -> topic id 변환,  중복제거 후 category 반환
    let get_category_query = `SELECT DISTINCT category FROM chwizone.topic_id WHERE topic_id IN(${str});`;
    let get_category = connection.query(get_category_query, function (
      err,
      rows
    ) {
      if (err) {
        connection.release();
        throw err;
      } else {
        //topicId -> category 변환 가능 확인
        if (rows.length == 0) {
        } else {
          //console.log(rows);
          for (let i = 0; i < rows.length; i++) {
            my_youtube.push(rows[i].category);
          }
        }
      }
​
      connection.release();
    });
​
    //console.log(my_youtube);
  });
}
function count_value() {
  const result = my_youtube.reduce((t, a) => {
    if (t[a]) {
      t[a]++;
    } else {
      t[a] = 1;
    }
    return t;
  }, {});
​
  console.log(result);
  for (let key in result) {
    pool.getConnection(function (err, connection) {
      let insert_my_youtube_query = `INSERT INTO my_youtube (email_address, youtube_category, sub_count) VALUES('${email_address}', '${key}', ${result[key]});`;
      let insert_my_youtube = connection.query(
        insert_my_youtube_query,
        function (err, rows) {
          if (err) {
            connection.release();
            throw err;
          } else {
            //topicId -> category 변환 가능 확인
            if (rows.length == 0) {
            } else {
              console.log("insert success");
            }
          }
​
          connection.release();
        });
    });
  }
}
module.exports = router;