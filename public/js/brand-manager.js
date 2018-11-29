

var page = 1;
var pageSize = 3;
//获取品牌列表
function getList() {
    $.get('/mobile/brandList', {
        page:page,
        pageSize:pageSize
    },function (result) {
        if(result.code === 0) {
            var list = result.data.list;
            var totalPage =result.data.totalPage;
            // data:
            // list: Array(2)
            // 0: { _id: 1, brandName: "华为", logoName: "1540344022947_huaiwei.jpg" }
            // 1: { _id: 2, brandName: "华为", logoName: "1540346314943_huawei-logo.png" }
            // length: 2
            // __proto__: Array(0)
            // totalPage: 4

            var str = '';
            for(var i=0; i<list.length; i++) {
                str+=`
                    <tr class="tr" style="height:80px;">
                        <td>${list[i]._id}</td>
                        <td>
                            <img src="images/phone/${list[i].logoName}"/>
                        </td>
                        <td>${list[i].brandName}</td>
                        <td>
                            <a class="brand-update">修改</a>
                            <a class="brand-delete">删除</a>
                        </td>
                    </tr>
                `
            }
            var pageStr = '<li class="first" style="float: left; width: 35px;margin-top:10px;"><<</li>';
            for (var i = 0; i < totalPage; i++) {
                pageStr+=`
                    <li style="float: left; width: 35px;margin-top:10px;" class="list_li">${i + 1}页</li>
                `
            }
            pageStr = pageStr + '<li class="last" style="float: left; width: 35px;margin-top:10px;">>></li>';

            $('.tbody').html(str);
            $('.pageEl').html(pageStr);
        }
    });
}

//发送一个ajax

$(document).ready (function () {
    //点击退出登录，显示退出成功
    $('#logout').click(function () {
        $.get('/users/loginout', function (res) {
            if (res.code === 0) {
                alert('成功退出');
                // 首页- 刷新首页 - 判断是否有cookie
                // 用户管理页 - 刷新 - 判断是否有cookie
                location.reload();
            } else {
                alert('退出失败');
            }
        });
    });

    //默认调用
    getList();



    $("#addBrand").click (function () {
        $("#Abrand").show();
    });

    $("#cancel").click (function () {
        $("#Abrand").hide();
    });

   

    //分页显示
    $(".pageEl").on('click','li',function(){
        page = $(this).text().trim();
        getList();
    });
    //回到第一页
    $('.pageEl').on('click', '.first', function () {
        page = 1;
        getList();
    });
    //回到最后一页
    $('.pageEl').on('click', '.last', function () {
        page = $('.list_li').length;
        getList();
    });




    //事件委托ajax删除
    $('.tbody').on('click','.brand-delete',function (){
        var id = $(this).parent().parent().children().eq(0).text().trim();
        var does = confirm("确认删除吗？");
        if (does) {
            // $(this).attr("href", `/mobile/deleteBrand/?id=${id}`);
            $.ajax({
                url:'/mobile/deleteBrand',
                method:'get',
                data: { id: id },
                success:function (res) {
                    console.log(res);
                    if (res.code === 0) {
                        //主动调用list方法，刷新页面
                        getList();
                    } else {
                        alert(res.msg);

                    }
                }
            })
        }
        
    });

    //事件委托修改
    $('.tbody').on('click', '.brand-update', function () {
            $('.alert').show();
            var id = $(this).parent().parent().children().eq(0).text().trim();
            var brandNames = $(this).parent().parent().children().eq(2).text().trim();
            $(".id").val(id);
            $(".names").val(brandNames);
    });

    $('.dont').click(function () {
        $('.alert').hide();
    })

    //ajax修改品牌
    $(".confirm").click (function () {
        //自己模拟form表单
        var formData = new FormData();
        formData.append('id', $(".id").val());
        formData.append('brandNames', $("#brandNames").val());
        formData.append('brandPic', $("#brandPic")[0].files[0]);
        // console.log($("#brandPic")[0].files[0]);
        if ($("#brandPic").val()) {
            $.ajax({
                url: '/mobile/updateBrand',
                method: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (result) {
                    console.log(result);
                    if (result.code === 0) {
                        $('.alert').hide();
                        //主动调用list方法，刷新页面
                        getList();
                    } else {
                        console.log(result.msg);
                    }
                }
            });
        } else {
            alert('请正确请选择文件');
        }
    });


    $("#confirmAdd").click(function () {
        //自己模拟form表单
        var formData = new FormData();
        formData.append('brandName', $("#brandName").val());
        formData.append('logo', $("#logo")[0].files[0]);
        // console.log($("#logo")[0].files[0]);
        if ($("#logo").val()){
            $.ajax({
                url: '/mobile/brandAdd',
                method: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result.code === 0) {
                        $('#Abrand').hide();

                        //主动调用list方法，刷新页面
                        getList();
                    } else {
                        console.log(result.msg);
                    }
                }
            });
        }else {
            alert('请正确请选择文件');
        }
    });
});
