package com.ss.codetutor.utils.constant;

public class SignalEnum {
    public static final String SIGNAL_TYPE_JOIN = "join";                    // 主动加入房间
    public static final String SIGNAL_TYPE_RESP_JOIN = "resp-join";          // 告知新加入方房间中原本有谁
    public static final String SIGNAL_TYPE_FULL = "full";                    // 当前房间已满员
    public static final String SIGNAL_TYPE_LEAVE = "leave";                  // 主动离开房间
    public static final String SIGNAL_TYPE_NEW_PEER = "new-peer";            // 有人加入房间，通知已经在房间的人
    public static final String SIGNAL_TYPE_PEER_LEAVE = "peer-leave";        // 有人离开房间，通知已经在房间的人
    public static final String SIGNAL_TYPE_OFFER = "offer";                  // 发送offer给对端peer
    public static final String SIGNAL_TYPE_ANSWER = "answer";                // 发送answer给对端peer
    public static final String SIGNAL_TYPE_CANDIDATE = "candidate";          // 发送candidate给对端peer
    public static final String SIGNAL_TYPE_MESSAGE="message";
}
