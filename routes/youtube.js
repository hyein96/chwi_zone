const express = require("express");
const router = express.Router();
const request = require("request");

// db - mysql
let mysql = require("mysql");
let config = require("../db/db_info").local;
let dbconfig = require("../db/db_con")();
let pool = mysql.createPool(config);

// 전역변수 
let my_youtube = [];
let access_token;
let email_address;

router.get("/subscribe", function (req, res) {
  email_address = req.query.email_address;
  console.log("youtube.ejs에서 받아온 값:" + email_address);

  // email 정보로 access_token 받아오기
  pool.getConnection(function (err, connection) {
    //category list - > sector_id select
    let get_at_query = `SELECT access_token FROM user WHERE email_address="${email_address}";`;
    connection.query(get_at_query, function (err, rows) {
      if (err) {
        connection.release();
        throw err;
      } else {
        if (rows.length == 0) {
          res.json("you are not my user");
        } else {
          //구독리스트 query 날리기
          console.log(rows[0].access_token);
          access_token = rows[0].access_token;
          let option = {
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
              fields: "items(snippet(resourceId(channelId)))",
            },
          };
          //category counting 빈 값이 들어가서 delay 줌 -> 결과 받아온 후 함수 실행
          const delay = (ms) => {
            request(option, function (error, response, body) {
              if (error) {
                console.error(error);
                throw error;
              } else {
                let resultJson = JSON.parse(body);
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
          //db insert가 끝난 후 누적 값을 제거하기 위해 배열 재선언
          delay(3000).then(() => {
            count_value(function(){
              my_youtube=[];
            });
            res.json(1);
            //session 값에 email 있으므로 data 안넘겨줘도 됨(db에 저장하고 main.ejs로 넘기고 끝)
            //res.render("main.ejs");
            
          });
         
        }
      }
      connection.release();
    });
  });
  // console.log(resultJson);
  //res.json(resultJson);
});

/*channel id 받아와서 topic id가져오는 함수입니다.*/
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


/*topic list 받아와서 중복 제거 후 category 반환하는 함수입니다.*/
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
    connection.query(get_category_query, function (err, rows) {
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

      connection.release();
    });

    //console.log(my_youtube);
  });
}

//구독 리스트 분석이 끝난 후 전체 결과를 db저장
function count_value(callback) {
  const result = my_youtube.reduce((t, a) => {
    if (t[a]) {
      t[a]++;
    } else {
      t[a] = 1;
    }
    return t;
  }, {});

  console.log(result);
  for (let key in result) {
    pool.getConnection(function (err, connection) {
      let insert_my_youtube_query = `INSERT INTO my_youtube (email_address, youtube_category, sub_count) VALUES('${email_address}', '${key}', ${result[key]}) ON DUPLICATE KEY UPDATE sub_count=${result[key]};`;;
      connection.query(insert_my_youtube_query, function (err, rows) {
        if (err) {
          connection.release();
          throw err;
        } else {
          //topicId -> category 변환 가능 확인
          if (rows.length == 0) {
          } else {
            console.log("insert success");
            setTimeout(callback, 100);
          }
        }

        connection.release();
      });
    });
  }
}

module.exports = router;
