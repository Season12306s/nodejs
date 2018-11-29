$(document).ready (function () {
    //点击退出登录，显示退出成功
    $('#logout').click(function () {
        $.get('/users/loginout', function(res) {
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

    // $('.buttonSearch').click (function () {
    //     if ($('.nickSearch').val() == '') {
    //         alert('请输入你想搜素的昵称');
    //     }
    // });

    //点击删除，弹窗
    $(".dele").click (function () {
        var id = $(this).parent().parent().children().eq(0).text();
        var yes =confirm("确认删除吗？");
        if (yes) {
            $(this).attr("href", `/users/delete/?id=${id}`);
        }
    });

    //点击用户管理修改，弹窗
    $(".upto").click (function () {
        $(".alert").css("display","block");
        // var id = $(this).parent().parent().children().eq(0).text().trim();
        // $('.updatas').attr("href", `/users/update/?id=${id}`);

        var id = $(this).parent().parent().children().eq(0).text().trim();
        var username = $(this).parent().parent().children().eq(1).text().trim();
        var nickname = $(this).parent().parent().children().eq(2).text().trim();
        var phone = $(this).parent().parent().children().eq(3).text().trim();
        var sex = $(this).parent().parent().children().eq(4).text().trim();
        var age = $(this).parent().parent().children().eq(5).text().trim();
        $(".id").val(id);
        $(".user").val(username);
        $(".nickname").val(nickname);
        $(".phone").val(phone);
        $(".age").val(age);
    });

    //手机管理点击修改，弹窗
    $('.addMobile').click(function () {
        $('.mobile').show();
    });

    //点击取消
    $('.not').click (function (){
        $(".alert").hide();
    });
    $('.donts').click(function () {
        $(".mobile").hide();
    });
});