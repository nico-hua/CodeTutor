package com.ss.codetutor.entity.dtos;

import com.alibaba.fastjson.JSON;
import lombok.Data;

@Data
public class SignalMessage {
    private String cmd; // 信令类型
    private String roomId; // 房间Id
    private String uid;  // 用户名
    private String remoteUid; // 对方用户名
    private String msg;  // 用于存储一些数据
}
