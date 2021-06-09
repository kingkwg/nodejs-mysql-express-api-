const express = require("express");
var bodyParser= require("body-parser");
const router = require('./router/router')
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(router)
app.listen(3000, () => {
    console.log("服务开启在3000端口")
})
