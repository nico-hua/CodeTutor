package com.ss.codetutor.config;

import com.ss.codetutor.interceptor.TokenInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Component
public class WebConfig implements WebMvcConfigurer{

    @Value("${code.trace.url}")
    private String codeTraceUrl;

    public String getCodeTraceUrl() {
        return codeTraceUrl;
    }

    @Value("${code.trace.by.url.url}")
    private String codeTraceByUrlUrl;

    public String getCodeTraceByUrlUrl(){return codeTraceByUrlUrl;}

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new TokenInterceptor()).addPathPatterns("/**").excludePathPatterns("/api/user/login","/api/user/register","/webjars/**","/swagger-resources/**","/v2/**","/doc.html","**/swagger-ui.html","/swagger-ui.html/**","/favicon.ico","/error");
    }
}
