const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');

const phoneModle = {
    //添加操作
    add (data,cb) {
        MongoClient.connect (url,function (err,client) {
            if (err) {
                cb({code:'错误状态为：-101',msg:'错误信息为：连接数据库失败'});
                return;
            } else {
                var db = client.db('yutian');
                let dataSave = {
                    name: data.name,
                    brand: data.brand,
                    guanprice: data.guanPrice,
                    secondprice: data.secondPrice,
                    src: data.src,
                }
                console.log(dataSave);

                async.series([
                    function (callback) {
                        db.collection('phone').find().sort({ _id: -1 }).toArray(function (err, result) {
                            if (err) {
                                callback({ code: '错误状态为：-101', msg: '查询记录失败' });
                            } else {
                                if (result == '') {
                                    dataSave._id = 1;
                                } else {
                                    //result是一个数组，当前获取的是倒序后排第一的id
                                    var num = result[0]._id;
                                    console.log(result[0]._id);
                                    num++;
                                    dataSave._id = num;
                                }
                                callback(null);
                            }
                        });
                    },
                    function (callback) {
                        //添加数据库的操作
                        db.collection('phone').insertOne(dataSave, function (err) {
                            if (err) {
                                callback({ code: '错误状态为：-102', msg: '新增手机失败' });
                            } else {
                                console.log('新增写入成功！');
                                callback(null, { code: 0, msg: '新增成功' });
                            }
                            client.close();
                        })
                    }
                ],function (err,result) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, result[1]);
                    }
                });
            }
        })
    },
    //删除操作
    deletePhone(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: '错误信息为:-101', msg: '连接数据库失败' });
            } else {
                var db = client.db('yutian');
                db.collection('phone').deleteOne({ _id: parseInt(data) }, function (err) {
                    if (err) {
                        cb({ code: '错误信息为:-101', msg: '删除数据失败' })
                    } else {
                        cb(null, { code: 0, msg: '删除成功' });
                        console.log("删除成功");
                    }
                });
                client.close();
            }
        })
    },
    //更新
    updatePhone(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: '错误信息为:-101', msg: '连接数据库失败' });
            } else {
                var db = client.db('yutian');
                db.collection('phone').updateOne({
                    _id: parseInt(data._id)
                },{
                    $set: {
                        name: data.names,
                        brand: data.brands,
                        guanprice: data.guanprices.split('￥')[1],
                        secondprice: data.secondprices.split('￥')[1],
                        src: '/images/phone/'+data.fileNames
                    }
                });
                cb(null, { code: 0, msg: '修改成功' });
            }
            client.close();
        });
    },
    //品牌增加
    brandAdd (data,cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('连接数据库失败');
                cb({ code: '错误状态为：-101', msg: '连接失败' });
            } else {
                var db = client.db('yutian');
                let saveData = {
                    brandName:data.brandName,
                    logoName:data.logoName
                }
                async.series([
                    function (callback) {
                        db.collection('brand').find().sort({ _id: -1 }).toArray(function (err, result) {
                            if (err) {
                                callback({ code: '错误状态为：-101', msg: '查询记录失败' });
                            } else {
                                if (result == '') {
                                    saveData._id = 1;
                                } else {
                                    //result是一个数组，当前获取的是倒序后排第一的id
                                    var num = result[0]._id;
                                    console.log(result[0]._id);
                                    num++;
                                    saveData._id = num;
                                }
                                callback(null);
                            }
                        });
                    },
                    function (callback) {
                        db.collection('brand').insertOne(saveData, function (err) {
                            if (err) {
                                console.log('插入数据库失败！');
                                callback({ code: '错误状态为：-102', msg: '新增手机失败' });
                            } else {
                                console.log('写入成功');
                                callback(null, {code: 0, msg: '新增成功' });
                            }
                            client.close();
                        });
                    }

                ],function (err,result) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null,result[1]);
                    }
                });
            }
        });
    },

    //品牌显示
    showBrand (data,cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log(err);
            } else {
                var db = client.db('yutian');

                async.parallel([
                    function (callback) {
                        // 查询所有条数
                        db.collection('brand').find().count(function (err, num) {
                            if (err) {
                                console.log('查询所有条数失败');
                                callback({ code: -1, msg: '查询失败' });
                            } else {
                                totalPage = Math.ceil(num / data.pageSize);
                                callback(null, num);
                            }
                        });
                    },

                    function (callback) {
                        // 分页查询
                        db.collection('brand').find().limit(data.pageSize).skip(data.page * data.pageSize - data.pageSize).toArray(function (err, data) {
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
                        cb(err);
                    } else {
                        cb(null, {
                                list: results[1],
                                totalPage: totalPage
                        });
                    }
                })

            }
            client.close();
        });
    },

    //品牌删除
    deleteBrand(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: '错误信息为:-101', msg: '连接数据库失败' });
            } else {
                var db = client.db('yutian');
                db.collection('brand').deleteOne({ _id: parseInt(data) }, function (err) {
                    if (err) {
                        cb({ code: '错误信息为:-101', msg: '删除数据失败' })
                    } else {
                        cb(null,{code: 0, msg:'删除成功'});
                        console.log("删除成功");
                    }
                });
                client.close();
            }
        })
    },

    //品牌更新
    updateBrand(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: '错误信息为:-101', msg: '连接数据库失败' });
            } else {
                var db = client.db('yutian');
                db.collection('brand').updateOne({
                    _id: parseInt(data._id)
                }, {
                        $set: {
                            brandName: data.brandNames,
                            logoName: data.logoName
                        }
                    });
                cb(null, { code: 0, msg: '修改成功' });
            }
            client.close();
        });
    }
}
module.exports = phoneModle;