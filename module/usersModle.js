//模板，是用来操作users相关的后台数据库处理的代码
//注册操作
//登录操作
//修改操作
//删除操作
//查询列表
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');

const usersModle = {
    //添加操作，注册操作
    /**
     * 
     * @param {Object} data 注册信息
     * @param {function} cb 回调函数
     */
    add (data,cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('连接数据库失败',err);
                cb({
                    code:'错误状态为：-101',msg:'连接数据库失败'});
                return;
            }
            const db = client.db('yutian');
            //1.对前端传过来的data做修改，isAdmin修改为is_Admin
            //2.写一个id为1
            //思考：下一个注册，先得到之前的用户表记录条数中id最大的数，+1操作之后之后传给下一个人，
            //不允许用户名相同

            let dataSave = {
                username:data.username,
                password:data.password,
                nickname:data.nickname,
                phone:data.phone,
                is_Admin:data.isAdmin
            }

            async.series([

                //查询用户名是否已注册
                function (callback) {
                    db.collection('users').find({ username: dataSave.username }).count(function (err, num) {
                        if (err) {
                            callback({ code: '错误状态为：-101', msg: '查询是否注册失败' });
                        } else if (num !== 0) {
                            //数量!==0则用户名存在
                            callback({ code: '错误状态为：-100', msg: '用户已经被注册过了' });
                        } else {
                            //数量为空则用户名不存在
                            console.log('用户不存在，可以进行注册！');
                            callback(null);
                        }
                    })
                },
                //先得到之前的用户表记录条数中id最大的数，+1操作之后之后传给下一个人，
                function (callback) {
                    db.collection('users').find().sort({ _id: -1 }).toArray(function (err, result) {
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
                    db.collection('users').insertOne(dataSave, function (err) {
                        if (err) {
                            callback({ code: '错误状态为：-101', msg: '用户写入失败！' });
                        } else {
                            console.log('用户写入成功！');
                            callback(null);
                        }
                    })
                }
            ], function (err, results) {
                //不管上面的3个异步是否都成功，都会进入最终的回调里面
                if (err) {
                    console.log(err);
                    //告诉前端
                    cb({ code: '错误状态为：-101', msg: '用户注册失败！' });
                } else {
                    cb(null);
                }
                client.close();
            });
        });
    },

    //登录操作
    /**
     * 
     * @param {Object} data 获取到的信息
     * @param {function} cb    回调函数
     */
    login (data,cb) {
        MongoClient.connect(url,function (err,client) {
            if (err) {
                cb({code: '错误状态为：-101', msg: '连接数据库失败'});
            }else {
                const db = client.db('yutian');
                db.collection('users').find({
                    username:data.username,
                    password:data.password
                }).toArray (function (err,result) {
                    if (err) {
                        console.log('查询数据库失败',err);
                        cb({ code: '错误状态为：-101', msg: '查询数据库失败！' });
                        client.close();
                    } else if (result.length <= 0) {
                        //没有找到，用户不能登录
                        console.log('用户不能登录');
                        cb({ code: '错误状态为：-102', msg: '用户名或密码错误！' });
                    } else {
                        console.log('用户可以登录！');
                        //这里需要将用户名和密码，和是否为管理员返回回来
                        //是个数组，所以要拿到第一条就result[0]
                        cb(null,{
                            username: result[0].username,
                            nickname: result[0].nickname,
                            isAdmin: result[0].is_Admin
                        });
                    }
                    client.close();
                });
            }

        });
    },

    //获取用户列表数据
    /**
     * 
     * @param {Object} data 页码信息和每页显示条数信息
     * @param {Function} cb   回调函数
     */
    getUserList (data,cb) {
        MongoClient.connect(url,function (err,client) {
            if(err) {
                cb({code:'错误状态为：-101',msg:'连接数据库失败'});
            } else {
                var db = client.db('yutian');
                var pageNum = data.page * data.pageSize - data.pageSize;
                async.parallel([
                    function (callback) {
                        //查询所有记录
                        db.collection('users').find().count(function (err,num) {
                            if (err) {
                                callback({ code: '错误状态为：-101', msg: '查询数据失败' })
                            } else {
                                callback(null,num);
                            }
                        });
                    },
                    function (callback) {
                        //查询分页数据
                        db.collection('users').find().limit(data.pageSize).skip(pageNum).toArray(function (err, data) {
                            if (err) {
                                callback({ code: '错误状态为：-101', msg: '查询数据失败' });
                            } else {
                                console.log(data);
                                callback(null, data);
                            }
                        });
                    }
                ],function (err,result) {
                    //result是一个数组，第一个是num（总数量），第二个是data（每页对应的数据）
                    if (err) {
                        cb(err);
                    } else {
                        cb(null,{
                            //总页数=总数量/每页的数量再向上取整
                            totalPage: Math.ceil(result[0] / data.pageSize),  
                            //每页用户信息列表
                            userList:result[1],
                            //页码
                            page:data.page
                        });
                    }
                    client.close();
                });
            }
        })
    },


    //搜索功能
    /**
     * 
     * @param {Object} data 找到的对应数据
     * @param {Function} cb 回调函数
     */
    findUsers (data,cb) {
        MongoClient.connect (url,function (err,client) {
            if (err) {
                cb({ code: '错误状态为：-101', msg: '连接数据库失败'});
            }else {
                var db = client.db('yutian');
                //查询数据
                let searchName = data.searchName;
                let pageSize = data.pageSize;
                let nickname = new RegExp(searchName);
                let pageNum = data.page * data.pageSize - data.pageSize;
                async.parallel ([
                    function (callback) {
                        //查询对应的所有数据
                        db.collection('users').find({ nickname: nickname}).count(function (err,num) {
                            if (err) {
                                callback({code:'错误状态为：'-101,msg:'查询数据库失败'});
                            } else {
                                callback(null,num);
                            }
                        });
                    },
                    function (callback) {
                        //搜索框
                        db.collection('users').find({ nickname: nickname }).limit(pageSize).skip(pageNum).toArray(function (err,res) {
                            if (err) {
                                callback({ code: '错误状态为：' - 101, msg: '查询对应数据失败' });
                            } else {
                                callback(null,res);
                            }
                        });
                    }
                ],function (err,result) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null,{
                            //总页数=总数量/每页的数量再向上取整
                            totalPage: Math.ceil(result[0] / pageSize),
                            //每页用户信息列表
                            userList: result[1],
                            //页码
                            page: data.page
                        });
                    }
                    client.close();
                });
            }
        });
    },

    //删除功能
    deleteUsers (data,cb) {
        MongoClient.connect(url,function (err,client) {
            if (err) {
                cb({code:'错误信息为:-101',msg:'连接数据库失败'});
            } else {
                var db = client.db('yutian');
                db.collection('users').deleteOne({_id:parseInt(data)},function (err) {
                    if (err) {
                        cb({ code: '错误信息为:-101', msg: '删除数据失败' })
                    } else {
                        cb(null);
                        console.log("删除成功");
                    }
                });
                client.close();
            }
        })
    },

    //更新功能
    /**
     * 
     * @param {Object} data 获取到前端传过来的数据
     * @param {Function} cb 回调函数
     */
    updateUsers (data,cb) {
        MongoClient.connect(url,function (err,client) {
            if(err) {
                cb({code: '错误信息为:-101', msg: '连接数据库失败'});
            } else {
                var db = client.db("yutian");
               
                db.collection("users").updateOne({
                    _id: parseInt(data.id)
                },{
                    $set:{
                        // username:data.username,
                        nickname: data.nickname,
                        phone: data.phone,
                        age: data.age,
                        sex:data.sex
                    }
                });
                cb(null);
            }
            client.close();
        });
    }
    
}

module.exports = usersModle;
