package com.ss.codetutor.utils;


import com.ss.codetutor.entity.pojos.User;

public class ThreadLocalUtil {

    private final static ThreadLocal<User> WM_USER_THREAD_LOCAL=new ThreadLocal<>();

    public static void setUser(User user){
        WM_USER_THREAD_LOCAL.set(user);
    }

    public static User getUser(){
        return WM_USER_THREAD_LOCAL.get();
    }

    public static void clear(){
        WM_USER_THREAD_LOCAL.remove();
    }
}


