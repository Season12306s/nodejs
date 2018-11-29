var express = require('express');
var router = express.Router();
var usersModle = require('../module/usersModle.js');
//首页
router.get('/', function(req, res, next) {
  // 判断用户是否已经登录，如果登录就返回首页，否则返回 登录页面
  if (req.cookies.username) {
    // 需要将 用户登录信息，传递给页面
    res.render('index', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
      curHref: ' '
    });
  } else {
    // 跳转到登陆页面
    res.redirect('/login.html');
  }
});

//注册页面
router.get('/register.html', function (req, res) {
  res.render('register');
});

//登录界面
router.get('/login.html', function (req, res) {
  res.render('login');
});

//用户管理
router.get('/user-manager.html',function (req,res) {
  //判断用户是否登录，并且是否是管理员
  if (req.cookies.username && parseInt(req.cookies.isAdmin)) {
    //需要查询数据库，从前端取得2个参数

    let page = req.query.page || 1;  //页码
    let pageSize = req.query.pageSize || 5;  //每页显示的条数
    
    usersModle.getUserList({
      page:page,
      pageSize:pageSize
    },function (err,data) {
      if (err) {
        res.render ('werror',err);
      } else {
        res.render('user-manager', {
          username: req.cookies.username,
          nickname: req.cookies.nickname,
          isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
          //这里的data是cb(null,{})返回回来的数据
          totalPage: data.totalPage,
          searchPage:0,
          userList: data.userList,
          page:data.page,
          curHref: 'user-manager'
        });
      }
    });
  } else {
    res.redirect('/login.html');
  }
});

//手机管理
router.get('/mobile-manager.html', function (req, res) {
      //判断用户是否登录，并且是否是管理员
      if (req.cookies.username) {
        res.render('mobile-manager',{
          username: req.cookies.username,
          nickname: req.cookies.nickname,
          isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
          curHref: 'mobile-manager'
        });
      } else {
        res.redirect('/login.html');
      }
});

//品牌管理
router.get('/brand-manager.html', function (req, res) {
  //判断用户是否登录，并且是否是管理员
  if (req.cookies.username) {
    res.render('brand-manager', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
      curHref: 'brand-manager'
    });
  } else {
    res.redirect('/login.html');
  }
});


module.exports = router;
