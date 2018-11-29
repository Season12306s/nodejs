var express = require('express');
var router = express.Router();
var usersModule = require('../module/usersModle.js');


//首页
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//注册处理
router.post('/register',function (req,res) {
  // console.log('获取传递过来的post数据');
  // console.log(req.body);

  var str = '';
  if (!/^[\u4e00-\u9fa5\w]{2,8}$/.test(req.body.nickname)) {
     res.render('werror', { code: '错误状态为：-1', msg: '请输入2-8位字符的用户名' });
    return;
  }
  if (!/^\w{5,12}$/.test(req.body.username)) {
    res.render('werror', { code: '错误状态为：-2', msg: '请输入5-12位字符的用户名' });
    return;
  }

  if (!/^\w{6,12}$/.test(req.body.password)) {
    res.render('werror', { code: '错误状态为：-3', msg: '请输入6~12位的密码 ！' });
    return;
  }

  //数据库处理
  //err需要是对象的一个格式
  usersModule.add(req.body,function (err) {
    if(err) {
      //如果有错误，渲染错误信息
      res.render('werror', err);
    }else {
      //注册成功，调到登录页面（不应该渲染，应该跳转）
      res.redirect('/login.html');
    }
    
  });

});

//登录处理
router.post('/login',function (req,res) {
  usersModule.login(req.body,function (err,data) {
    if (err) {
      res.render('werror',err);
    }else {
      console.log('当前登录用户的信息是：', data);

      //在跳转的时候，先把cookie存储进去

      //username
      res.cookie('username',data.username,{
        maxAge: 1000 * 60 *1000000,//单位是毫秒
      });

      //nickname
      // var nicknames = decodeURIComponent(data.nickname);
      // console.log(nicknames);
      res.cookie('nickname', data.nickname, {
        maxAge: 1000 * 60 * 1000000,
      });

      //isAdmin
      res.cookie('isAdmin', data.isAdmin, {
        maxAge: 1000 * 60 * 1000000,
      });


      res.redirect('/');
    }
  });
});


//退出登录
router.get('/loginout',function (req,res) {

  //清除cookie，跳转到登录
  res.clearCookie('username');
  res.clearCookie('nickname');
  res.clearCookie('isAdmin');

  //不能直接跳转
  // res.redirect('/login.html');
  //在script标签中能直接用window对象中的方法
  // res.send('<script>location.replace("/")</script>');
  // // res.redirect('back');

  res.send({code: 0, msg: '退出成功'});

});

//搜索功能
router.get('/search',function (req,res) {
  
   if(req.query.nickname == ''){
    res.redirect('/user-manager.html');
   }else{
     usersModule.findUsers({
       page: req.query.page || 1,  //页码
       pageSize: req.query.pageSize || 2, //每页只让他显示1条
       searchName: req.query.nickname   //查询的字符

     }, function (err, data) {
       if (err) {
         res.render('werror', err);
       } else {
         res.render('user-manager', {
           username: req.cookies.username,
           nickname: req.query.nickname,
           isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
           //这里的data是cb(null,{})返回回来的数据
           totalPage: 0,
           searchPage: data.totalPage,
           userList: data.userList,
           page: data.page,
           curHref: ''
         });
       }
       console.log(req.query.nickname + "kjjjjjjjjj");
     });
   }
});

//删除功能
router.get('/delete',function (req,res) {
 
  usersModule.deleteUsers (req.query.id,function (err) {
    if (err) {
      res.render('werror', err);
    } else {
      res.send('<script>location.replace("/user-manager.html")</script>');
    }
  });
});

//修改功能
router.post('/update',function (req,res) {
  console.log('hjdhfhd', req.body.id);
    usersModule.updateUsers ({
      id:req.body.id,
      username:req.body.username,
      nickname:req.body.nickname,
      phone: req.body.phone,
      age: req.body.age,
      sex:req.body.sex
    },function (err,data) {
      if(err) {
       console.log('执行出错');
      }else {
        res.redirect('/user-manager.html')
      }
    })
 });

module.exports = router;