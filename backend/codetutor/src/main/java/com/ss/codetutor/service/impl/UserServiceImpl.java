package com.ss.codetutor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ss.codetutor.entity.dtos.UserDto;
import com.ss.codetutor.entity.pojos.User;
import com.ss.codetutor.mapper.UserMapper;
import com.ss.codetutor.service.UserService;
import com.ss.codetutor.utils.ResponseResult;
import com.ss.codetutor.utils.ThreadLocalUtil;
import com.ss.codetutor.utils.common.JwtUtil;
import com.ss.codetutor.utils.enums.WebHttpCodeEnum;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public ResponseResult register(UserDto userDto) {
        if(userDto.getName().trim().equals("")){
            return ResponseResult.errorResult(WebHttpCodeEnum.DATA_NOT_EXIST,"用户名不能为空");
        }
        if(userDto.getPassword().trim().equals("")){
            return ResponseResult.errorResult(WebHttpCodeEnum.DATA_NOT_EXIST,"密码不能为空");
        }
        LambdaQueryWrapper<User> lambdaQueryWrapper=new LambdaQueryWrapper<>();
        User userSql=getOne(lambdaQueryWrapper.eq(User::getName,userDto.getName()));
        if(userSql!=null){
            return ResponseResult.errorResult(WebHttpCodeEnum.DATA_EXIST,"用户名"+userDto.getName()+"已存在");
        }
        //生成16位盐值
        SecureRandom random = new SecureRandom();
        byte[] saltByte = new byte[16];
        random.nextBytes(saltByte);
        String salt=Base64.getEncoder().encodeToString(saltByte);
        //MD5加密
        String password= DigestUtils.md5DigestAsHex((userDto.getPassword()+salt).getBytes());
        User user=new User(salt,userDto.getName(),password);
        save(user);
        return new ResponseResult();
    }

    @Override
    public ResponseResult login(UserDto userDto) {
        if(userDto.getName().trim().equals("")){
            return ResponseResult.errorResult(WebHttpCodeEnum.DATA_NOT_EXIST,"用户名不能为空");
        }
        if(userDto.getPassword().trim().equals("")){
            return ResponseResult.errorResult(WebHttpCodeEnum.DATA_NOT_EXIST,"密码不能为空");
        }
        LambdaQueryWrapper<User> lambdaQueryWrapper=new LambdaQueryWrapper<>();
        User userSql=getOne(lambdaQueryWrapper.eq(User::getName,userDto.getName()));
        if(userSql==null){
            return ResponseResult.errorResult(WebHttpCodeEnum.DATA_NOT_EXIST,"用户名"+userDto.getName()+"不存在");
        }
        String pswd=DigestUtils.md5DigestAsHex((userDto.getPassword()+userSql.getSalt()).getBytes());
        if(!pswd.equals(userSql.getPassword())){
            return ResponseResult.errorResult(WebHttpCodeEnum.LOGIN_PASSWORD_ERROR);
        }
        String token= JwtUtil.getToken(userSql.getId().longValue());
        Map<String,Object> map=new HashMap<>();
        map.put("token",token);
        userSql.setSalt("");
        userSql.setPassword("");
        map.put("user",userSql);
        return ResponseResult.okResult(map);
    }

    @Override
    public ResponseResult getLocalUserName(){
        User user= ThreadLocalUtil.getUser();
        User userSql=getById(user.getId());
        Map<String,Object> map=new HashMap<>();
        map.put("username",userSql.getName());
        return ResponseResult.okResult(map);
    }
}











