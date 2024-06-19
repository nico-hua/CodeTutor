package com.ss.codetutor.config;

import com.ss.codetutor.controller.SignalingWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
public class WebSocketConfig{
    @Bean
    public ServerEndpointExporter serverEndpointExporter (){

        ServerEndpointExporter exporter = new ServerEndpointExporter();
        // 手动注册 WebSocket 端点
        exporter.setAnnotatedEndpointClasses(SignalingWebSocketHandler.class);
        return exporter;
    }
}
