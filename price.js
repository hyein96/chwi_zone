const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');

scrapingResult = {
    'price': ''
}

function getData(){
    request("https://finance.naver.com/item/main.nhn?code=005930", function (err, res, body){
        const $ = cheerio.load(body);
        const imgSrc = $("#img_chart_area").attr('src');
        console.log(imgSrc);
        
        const bodyList = $(".today").map(function(i,element){
            scrapingResult['price'] = String($(element).find('p:nth-of-type(1)').text());

            console.log(scrapingResult)
        });
    });
}

getData();
