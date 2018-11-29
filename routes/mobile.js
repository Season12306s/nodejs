var express = require('express');
var router = express.Router();
var phoneModle = require('../module/phoneModle.js');
//引入multer，并设置好默认的一个tmp目录
var multer = require('multer');
var upload = multer({
    dest: 'D:/tep/'
});
var fs = require('fs');
var path = require('path');
var async = require('async');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';


router.post('/list', function (req, res) {
    var page = parseInt(req.body.page);
    var pageSize = parseInt(req.body.pageSize);
    var totalPage = 0;

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    MongoClient.connect(url, function (err, client) {
        if (err) {
            console.log(err);
        } else {
            var db = client.db('yutian');

            async.parallel([
                function (callback) {
                    // 查询所有条数
                    db.collection('phone').find().count(function (err, num) {
                        if (err) {
                            console.log('查询所有条数失败');
                            callback({ code: -1, msg: '查询失败' });
                        } else {
                            totalPage = Math.ceil(num / pageSize);
                            callback(null, num);
                        }
                    });
                },

                function (callback) {
                    // 分页查询
                    db.collection('phone').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
                        if (err) {
                            console.log('查询分页数据失败');
                            callback({ code: -1, msg: '查询失败' });
                        } else {
                            callback(null, data);
                        }
                    });
                }
            ], function (err, results) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        code: 0, msg: '成功', data: {
                            list: results[1],
                            totalPage: totalPage
                        }
                    })
                }
            })

        }
        client.close();
    });

});

router.post('/add', upload.single('mobile'), function (req, res) {
    //req上面就有一个req.file这个属性，这个属性是一个对象，对象里面就是我上传的这个文件的一些属性
    //并且multer还会把其余的一些数据放到req.body 里面
    // console.log(req.file);
    // console.log(req.body.choose);
    //需要将临时目录下的文件读取过来，在写入到哪里
    fs.readFile(req.file.path, function (err, data) {
        if (err) {
            console.log('读取文件失败', err);
        } else {
            //写
            var fileName = new Date().getTime() + "_" + req.file.originalname;
            var dest_file = path.resolve(__dirname, '../public/images/phone/', fileName);
            console.log(dest_file);
            fs.writeFile(dest_file, data, function (err) {
                if (err) {
                    console.log('写入失败', err);
                    res.send({ code: '错误状态为：-102', msg: '新增手机失败' });
                } else {
                    phoneModle.add({
                        name: req.body.mobileName,
                        brand: req.body.choose,
                        guanPrice: req.body.guanPrice,
                        secondPrice: req.body.secondPrice,
                        src: 'images/phone/' + fileName
                    }, function (err, data) {
                        if (err) {
                            res.send(err);
                        } else {
                            console.log(data);
                            res.send(data);
                        }
                    });
                }
            });
        }
    });
});

router.get('/delete', function (req, res) {

    phoneModle.deletePhone(req.query.id, function (err) {
        if (err) {
            console.log('删除失败');
            res.send(err);
        } else {
            res.send({ code: 0, msg: '删除成功' });
        }
    });
});

//修改功能
router.post('/update', upload.single('mobilePic'), function (req, res) {
    if (req.file.originalname) {
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                console.log('读取文件失败', err);
            } else {
                //写
                var fileName = new Date().getTime() + "_" + req.file.originalname;
                var dest_file = path.resolve(__dirname, '../public/images/phone/', fileName);
                console.log(fileName);
                fs.writeFile(dest_file, data, function (err) {
                    if (err) {
                        console.log('写入失败', err);
                        res.send({ code: '错误状态为：-102', msg: '修改手机失败' });
                    } else {
                        phoneModle.updatePhone({
                            _id: req.body.id,
                            names: req.body.names,
                            brands: req.body.selectedBrand,
                            guanprices: req.body.guanprices,
                            secondprices: req.body.secondprices,
                            fileNames: fileName
                        }, function (err, data) {
                            if (err) {
                                console.log('执行出错');
                                res.send(err);
                            } else {
                                console.log('执行完成');
                                res.send(data);
                            }
                        })
                    }
                });
            }
        });
    } else {
        res.send('请正确填写表单');
    }
});

//品牌添加
router.post('/brandAdd', upload.single('logo'), function (req, res) {
    fs.readFile(req.file.path, function (err, data) {
        if (err) {
            console.log('读取文件失败', err);
        } else {
            //写
            var fileName = new Date().getTime() + "_" + req.file.originalname;
            var dest_file = path.resolve(__dirname, '../public/images/phone/', fileName);
            console.log(dest_file);
            fs.writeFile(dest_file, data, function (err) {
                if (err) {
                    console.log('写入失败', err);
                    res.send({ code: '错误状态为：-102', msg: '新增品牌失败' });
                } else {
                    phoneModle.brandAdd({
                        brandName: req.body.brandName,
                        logoName: fileName
                    }, function (err, result) {
                        if (err) {
                            res.send(err);
                        } else {
                            console.log(result);
                            res.send(result);
                        }
                    });
                }
            });
        }
    });
});

//品牌展示
router.get('/brandList', function (req, res) {
    var page = parseInt(req.query.page);
    var pageSize = parseInt(req.query.pageSize);

    phoneModle.showBrand({
        page: page,
        pageSize: pageSize
    }, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                code: 0, msg: '成功', data: {
                    list: data.list,
                    totalPage: data.totalPage
                }
            });
        }
    });

});

//品牌删除
router.get('/deleteBrand', function (req, res) {
    console.log(req.query.id)
    phoneModle.deleteBrand(req.query.id, function (err) {
        if (err) {
            console.log('删除失败');
            res.send(err);
        } else {
            res.send({code:0,msg:'删除成功'});
        }
    });
});

//品牌修改
router.post('/updateBrand', upload.single('brandPic'), function (req, res) {
    console.log(req.file.originalname+'sddsgregerb');
    if (req.file.originalname) {

        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                console.log('读取文件失败', err);
            } else {
                //写
                var fileName = new Date().getTime() + "_" + req.file.originalname;
                var dest_file = path.resolve(__dirname, '../public/images/phone/', fileName);
                console.log(dest_file);
                fs.writeFile(dest_file, data, function (err) {
                    if (err) {
                        console.log('写入失败', err);
                        res.send({ code: '错误状态为：-102', msg: '修改手机失败' });
                    } else {
                        phoneModle.updateBrand({
                            _id: req.body.id,
                            brandNames: req.body.brandNames,
                            logoName: fileName
                        }, function (err, data) {
                            if (err) {
                                console.log('执行出错');
                                res.send(err);
                            } else {
                                res.send(data);
                            }
                        })
                    }
                });
            }
        });
    }

});

//品牌的获取
router.post('/findBrand', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) {
            res.send({ code: -101, msg: '连接失败' });
        } else {
            var db = client.db('yutian');
            db.collection('brand').find().toArray(function (err, data) {
                if (err) {
                    res.send({ code: -101, msg: '查询失败' });
                } else {
                    res.send(data);
                }
            })
        }
    })
})
module.exports = router;