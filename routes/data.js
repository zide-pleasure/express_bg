var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');
var dbsql = require("./db");
var PATH = './public/data/';

//读取数据模块，供客户端调用
//查询接口，token校验
//公共接口，无需校验
//data/read?type=it
//data/read?type=it.json
//创建数据库连接
var connection = mysql.createConnection(dbsql);
//链接数据库
connection.connect();
router.get('/read', function(req, res, next) {
    var type = req.param('type') || "";
   //发送查询语句.一个参数是sql,第二个参数是得到值，第三个参数是回调函数，回调函数有三个值，
   //第一个是error,第二个是rows数组，第三个是filde
   connection.query('SELECT * FROM `sign_info` order by score', function(error, rows, fields) {
      //返回数据给前台
if (error) {
    res.json(500);
} else {
    res.json({status:1,data:rows});
}
    // });
  })
});
router.get('/readUser', function(req, res, next) {
    // var type = req.param('type') || "";
   connection.query('SELECT * FROM `hqb_daily_user` order by id', function(error, rows, fields) {
      //返回数据给前台
if (error) {
    res.json(500);
} else {
    res.json({status:1,data:rows});
}
    // });
  })
});

router.post('/writeUser',function(req, res, next){
    if(!req.cookies.user){
        return res.render('login',{});
    }

    var name = req.param('name') || '';
    var id = req.param('id') || '';

    if(!name){
        return res.send({
            status:0,
            info:'提交的字段不全'
        });
    }
    //1)读取文件
        connection.query('INSERT INTO `hqb_daily_user`( `id`, `name) VALUES (?,?)', [id, name], function(err, result) {
            res.json("添加信息成功");
        });
});

router.post('/delete', function(req, res, next) {
    //得到值
    var nid = req.body.nid;
    connection.query('DELETE FROM `sign_info` WHERE `id` = ?', [nid], function(err, result) {
        console.log(result.affectedRows)
    });
});
router.post('/write',function(req, res, next){
    if(!req.cookies.user){
        return res.render('login',{});
    }
    // 文件名
    var type = req.param('type') || "";
    // 关键字段
    var score = req.param('score') || '';
    var name = req.param('name') || '';
    var reason = req.param('reason') || '';
    var Data = req.param('Data') || '';

    if(!type || !score || !name || !reason || !Data){
        return res.send({
            status:0,
            info:'提交的字段不全'
        });
    }
    //1)读取文件
        connection.query('INSERT INTO `sign_info`( `score`, `name`, `Data`, `reason`, `id`, `time`) VALUES (?,?,?,?,?,?)', [score, name, Data, reason,guidGenerate(),new Date()], function(err, result) {
            res.json("添加信息成功");
        });
    // var filePath = PATH + type + '.json';
    // fs.readFile(filePath, function(err, data){
    //     if(err){
    //         return res.send({
    //             status:0,
    //             info: '读取数据失败'
    //         });
    //     }
    //     var arr = JSON.parse(data.toString());
    //     //代表每一条记录
    //     var obj = {
    //         score: score,
    //         name: name,
    //         Data: Data,
    //         reason: reason,
    //         id: guidGenerate(),
    //         time: new Date()
    //     };
    //     arr.splice(0, 0, obj);
    //     //2)写入文件
    //     var newData = JSON.stringify(arr);
    //     fs.writeFile(filePath, newData, function(err){
    //         if(err){
    //             return res.send({
    //                 status:0,
    //                 info: '写入文件失败'
    //             });
    //         }
    //         return res.send({
    //             status:1,
    //             info: obj
    //         });
    //     });
    // });
});


//阅读模块写入接口 后台开发使用
router.post('/write_config', function(req, res, next){
    if(!req.cookies.user){
        return res.render('login',{});
    }
    //TODO:后期进行提交数据的验证
    //防xss攻击 xss
    // npm install xss
    // require('xss')
    // var str = xss(name);
    var data = req.body.data;
    //TODO ： try catch
    var obj = JSON.parse(data);
    var newData = JSON.stringify(obj);

    // 写入
    fs.writeFile(PATH + 'config.json',newData, function(err, data){
        if(err){
            return res.send({
                status: 0,
                info: '写入数据失败'
            });
        }
        return res.send({
            status:1,
            info:'数据写入成功',
            data:newData
        })
    })
});

//登录接口
router.post('/login', function(req, res, next){
    //用户名、密码、验证码
    var username = req.body.username;
    var password = req.body.password;

    //TODO ：对用户名、密码进行校验
    //xss处理、判空

    //密码加密 md5(md5(password + '随机字符串'))
    //密码需要加密－> 可以写入JSON文件
    if(username === 'admin' && password === '123456'){
        res.cookie('user',username);
        return res.send({
            status: 1
        });
    }

    return res.send({
        status: 0,
        info: '登录失败'
    });
});

//guid
function guidGenerate() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

module.exports = router;
