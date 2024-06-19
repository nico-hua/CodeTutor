package com.ss.codetutor.service;

import com.ss.codetutor.entity.dtos.UserDto;
import com.ss.codetutor.utils.ResponseResult;

public interface UserService {
    ResponseResult register(UserDto userDto);

    ResponseResult login(UserDto userDto);

    ResponseResult getLocalUserName();
}
