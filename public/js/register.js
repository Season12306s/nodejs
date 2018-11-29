    $(document).ready(function () {
        //昵称验证
        $('.nickname').blur(function () {
            var nickReg = /^[\u4e00-\u9fa5\w]{2,8}$/;
            if (!nickReg.test($(this).val())) {
                $('.nickError').show();
            } else {
                $('.nickError').hide();
            }
        });
        //账号验证
        $('.username').blur(function () {
            var userReg = /^\w{5,12}$/;
            if (!userReg.test($(this).val())) {
                $('.userError').show();
            } else {
                $('.userError').hide();
            }
        });
        //密码验证
        $('.password').blur(function () {
            var pwdReg = /^\w{6,12}$/;
            if (!pwdReg.test($(this).val())) {
                $('.pwdError').show();
            } else {
                $('.pwdError').hide();
            }
        });
        //重复密码验证
        $('.repassword').blur(function () {
            if ($('.password').val() !== $(this).val()) {
                $('.apwdError').show();
            } else {
                $('.apwdError').hide();
            }
        });
        //手机号码验证
        $('.phone').blur(function () {
            var phoneReg = /^^1(3|4|5|7|8)\d{9}$/;
            if (!phoneReg.test($(this).val())) {
                $('.phoneError').show();
            } else {
                $('.phoneError').hide();
            }
        });
        $(".btn").click(function () {
            if ($('.nickname').val() == '' || $('.username').val() == '' || $('.password').val == '' || $('.repassword').val() == '' || $('.phone').val() == '') {
                alert('请正确填写表单');
            } else {
              $("form").submit();  
            }
        });
    });