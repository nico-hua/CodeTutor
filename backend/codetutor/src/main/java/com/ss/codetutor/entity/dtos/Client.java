package com.ss.codetutor.entity.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.websocket.Session;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Client {
    private String uid;
    private String roomId;
    private Session session;
}
