const express = require("express");
const app = express();
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const options = { // letsencrypt로 받은 인증서 경로를 입력해 줍니다.
ca: fs.readFileSync("/etc/letsencrypt/live/chwizone.cf/fullchain.pem"),
key: fs.readFileSync("/etc/letsencrypt/live/chwizone.cf/privkey.pem"),
cert: fs.readFileSync("/etc/letsencrypt/live/chwizone.cf/cert.pem")
};

// -- router

app.use(express.static(path.join(__dirname, "public"))); 

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const youtubeRouter = require("./routes/youtube");
const mainRouter = require("./routes/main");
const mypageRouter = require("./routes/mypage");
const bookmarkRouter = require("./routes/bookmark");
const companyRouter = require("./routes/company");


app.use("/index",indexRouter);
app.use("/account",accountRouter);
app.use("/youtube",youtubeRouter);
app.use("/mypage",mypageRouter);
app.use("/main",mainRouter);
app.use("/bookmark",bookmarkRouter);
app.use("/company",companyRouter);


http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

module.exports=app;