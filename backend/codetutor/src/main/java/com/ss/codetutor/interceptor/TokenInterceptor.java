package com.ss.codetutor.interceptor;

import com.alibaba.fastjson.JSONObject;
import com.ss.codetutor.entity.pojos.User;
import com.ss.codetutor.utils.ResponseResult;
import com.ss.codetutor.utils.ThreadLocalUtil;
import com.ss.codetutor.utils.common.JwtUtil;
import com.ss.codetutor.utils.enums.WebHttpCodeEnum;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Optional;

@Component
public class TokenInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        response.setContentType("application/json;charset=utf-8");
        //System.out.println(request.getRequestURL());
        //获取token
        String token=request.getHeader("token");
        //判断token是否存在
        ResponseResult error=new ResponseResult();
        if(token==null||token.equals("")||token.trim().equals("")){
            error.setCode(WebHttpCodeEnum.TOKEN_REQUIRE.getCode());
            error.setErrorMessage(WebHttpCodeEnum.TOKEN_REQUIRE.getErrorMessage());
            String errorResponse= JSONObject.toJSONString(error);
            response.getWriter().write(errorResponse);
            return false;
        }
        //判断token是否有效
        try{
            Claims claimsBody= JwtUtil.getClaimsBody(token);
            //判断token是否过期
            int result=JwtUtil.verifyToken(claimsBody);
            if(result==1){
                error.setCode(WebHttpCodeEnum.TOKEN_EXPIRE.getCode());
                error.setErrorMessage(WebHttpCodeEnum.TOKEN_EXPIRE.getErrorMessage());
                String errorResponse= JSONObject.toJSONString(error);
                response.getWriter().write(errorResponse);
                return false;
            }
            else if(result==2){
                error.setCode(WebHttpCodeEnum.TOKen_EXCEPTION.getCode());
                error.setErrorMessage(WebHttpCodeEnum.TOKen_EXCEPTION.getErrorMessage());
                String errorResponse= JSONObject.toJSONString(error);
                response.getWriter().write(errorResponse);
                return false;
            }
            else {
                //得到header中的信息
                Object userId = claimsBody.get("id");
                Optional<String> optional = Optional.ofNullable(userId != null ? userId.toString() : null);
                optional.ifPresent(id -> {
                    User user = new User();
                    user.setId(Integer.valueOf(id));
                    ThreadLocalUtil.setUser(user);
                });
                return true;
            }
        }catch (Exception e){
            error.setCode(WebHttpCodeEnum.TOKEN_INVALID.getCode());
            error.setErrorMessage(WebHttpCodeEnum.TOKEN_INVALID.getErrorMessage());
            String errorResponse= JSONObject.toJSONString(error);
            response.getWriter().write(errorResponse);
            return false;
        }
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        ThreadLocalUtil.clear();
    }
}
