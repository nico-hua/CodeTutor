package com.ss.codetutor.utils.enums;

public enum WebHttpCodeEnum {
    // 成功段0
    SUCCESS(200,"操作成功"),
    // 登录段1~50
    NEED_LOGIN(1,"需要登录后操作"),
    LOGIN_PASSWORD_ERROR(2,"密码错误"),
    // TOKEN50~100
    TOKEN_REQUIRE(50,"TOKEN为空"),
    TOKEN_INVALID(51,"无效的TOKEN"),
    TOKEN_EXPIRE(52,"TOKEN已过期"),
    TOKen_EXCEPTION(53,"TOKEN验证异常"),
    // SIGN验签 100~120
    SIGN_INVALID(100,"无效的SIGN"),
    SIG_TIMEOUT(101,"SIGN已过期"),
    // 参数错误 500~1000
    PARAM_REQUIRE(500,"缺少URL参数"),
    PARAM_INVALID(501,"代码为空，URL参数无效"),
    PARAM_IMAGE_FORMAT_ERROR(502,"图片格式有误"),
    SERVER_ERROR(503,"服务器内部错误"),
    // 数据错误 1000~2000
    DATA_EXIST(1000,"数据已经存在"),
    USER_DATA_NOT_EXIST(1001,"User数据不存在"),
    DATA_NOT_EXIST(1002,"数据不存在"),
    // 数据错误 3000~3500
    NO_OPERATOR_AUTH(3000,"无权限操作"),
    NEED_ADMIND(3001,"需要管理员权限"),
    MATERIASL_REFERENCE_FAIL(3002,"素材失效" );


    int code;
    String errorMessage;

    WebHttpCodeEnum(int code, String errorMessage){
        this.code = code;
        this.errorMessage = errorMessage;
    }

    public int getCode() {
        return code;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
