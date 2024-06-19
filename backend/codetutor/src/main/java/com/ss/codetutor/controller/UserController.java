package com.ss.codetutor.controller;

import com.ss.codetutor.entity.dtos.UserDto;
import com.ss.codetutor.service.UserService;
import com.ss.codetutor.utils.ResponseResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Api(tags = "用户接口")
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    @ApiOperation("用户注册")
    public ResponseResult register(@RequestBody UserDto userDto){
        return userService.register(userDto);
    }

    @PostMapping("/login")
    @ApiOperation("用户登录")
    public ResponseResult login(@RequestBody UserDto userDto){
        return userService.login(userDto);
    }

    @GetMapping("/getLocalUserName")
    @ApiOperation("获取当前登录用户名")
    public ResponseResult getLocalUserName(){return userService.getLocalUserName();}
}
