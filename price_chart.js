const express = require('express');
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

const url = 'https://finance.naver.com/item/main.nhn?code=005930';


//크롤링파트
const getHtml = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
    }
};
//파싱파트 
router.get('/', function(req, res, next){
    getHtml(url).then(html => {
        let ulList = [];
        const $ = cheerio.load(html.data);
        const $bodyList = $("div#rate_info").children("div");
        $bodyList.each(function(i,elem){
            const price = $(this).find('div.today').text().replace(/ /gi,"");
           ulList[i] = {
               stockPrice: $(this).find('p.no_today').text(),
               
           };
        });
        return ulList.filter(n => n.title);
    })
    .then(result => res.render('index', {title: result}));
});

module.exports = router;