package com.ss.codetutor.entity.dtos;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel(description = "用户信息")
public class UserDto {
    @ApiModelProperty(value = "用户名",required = true, example = "nico")
    private String name;
    @ApiModelProperty(value = "密码",required = true, example = "123456a")
    private String password;
}