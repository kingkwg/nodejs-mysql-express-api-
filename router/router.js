/**
 * 测试用的api
 */

const {Router} = require('express')
const router = new Router()
const sd=require('silly-datetime');

var pool= require('../db/pool.js');
var dbUtils = require('../db/dbUtils');
var clinet = pool.create();
var dbClient = new dbUtils.dbClient(clinet);


router.get("/userList/:page/:page_size", (req, res) => {
    dbClient.pagination({tableName:'user',page:req.params.page,page_size:req.params.page_size},function(err, result){
        if (err)
            console.log(err);
        else{
            res.json(result);
        }
    })

});
router.get("/user/:id", (req, res) => {
    dbClient.select({tableName:'user',fields:"id,name"},{id:req.params.id},function(err, result){
        if (err)
            console.log(err);
        else{
            res.json(result);
        }
    })
});
router.get("/del/:id", (req, res) => {
    dbClient.del('user',{id:req.params.id},function(err, result){
        if (err)
            console.log(err);
        else{
            res.json(result);
        }
    })
});

router.get("/add",(req,res)=>{
    var myDate = new Date();
    dbClient.add("user",{name:'wwww',email:'eea@qq.com',create_time:sd.format(myDate, 'YYYY-MM-DD HH:mm')},function (err,result) {
        if (err)
            console.log(err);
        else{
            res.json(result);
        }
    })
});

router.post('/update',(req,res)=>{
    var myDate = new Date();
    dbClient.update("user",
        {name:req.body.name,email:req.body.email,update_time:sd.format(myDate, 'YYYY-MM-DD HH:mm')},
        {id:req.body.id}
        ,function (err,result) {
        if (err)
            console.log(err);
        else{
            res.json(result);
        }
    })
});

router.get("/add1",(req,res)=>{
    var myDate = new Date();
    var datas=[];
    for (let i=1;i<50;i++){
        datas.push(["dsfs"+i,"emails@11g"+i,sd.format(myDate, 'YYYY-MM-DD HH:mm'),sd.format(myDate, 'YYYY-MM-DD HH:mm')]);
    }
    let sql="INSERT INTO user(`name`,`email`,`create_time`, `update_time`) VALUES ?";
    db.query(sql,[datas],(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.send("插入成功");
        }
    })
});
router.get('/test',(req,res)=>{
    let sql='select * FROM `user`,record where `user`.id=record.uid';
    dbClient.query(sql,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            console.log(result[0].name);
            res.json(result);
        }
    })
})
module.exports = router