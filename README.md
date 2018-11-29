# 数据库表结构的设计

### 用户表

- username not null
- password not null
- nickname not null
- sex default 0 男
- age default ''
- iphone default ''
- is_admin default 0 -不是管理员  1-是管理员

#登录

userModle.js  定义 login方法，查找数据库
.find({username:username,password:password}).toArray(function (err,data) {
    data不为空数组，说明可以登陆

    当前用户的数据data[0]{}
})

#判断用户在网站上是否登陆
cookie,localstorage
用户在登陆的时候，如果登录成功，就将用户的信息写入到存储中
其余需要验证用户是否登录的页面，就验证一下是否有cookie或者本地存储，有的话正常显示，没有的话打回到登录页面

#用户管理页面
1.查询所有用户的数据

2.分页功能
    2.1  页面需要传递参数(页码page,每页显示多少条数pageSize)
    2.2  后台需要返回什么样的数据结构

    {
        userList:[{username:'',age:''},{}],
        totalPage:'',  //总页数
        page:'',   //当前的页码
    }

2.3数据库查询怎么写
    //pageSize 每页显示多少条数

    .find().limit(pageSize).skip(page * pageSize -pageSize).toArray()