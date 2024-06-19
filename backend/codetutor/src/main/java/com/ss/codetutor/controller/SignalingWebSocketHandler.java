package com.ss.codetutor.controller;

import com.google.gson.Gson;
import com.ss.codetutor.entity.dtos.Client;
import com.ss.codetutor.entity.dtos.Room;
import com.ss.codetutor.entity.dtos.SignalMessage;
import com.ss.codetutor.utils.constant.SignalEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@ServerEndpoint(value = "/ws/server")
public class SignalingWebSocketHandler extends TextWebSocketHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(SignalingWebSocketHandler.class);
    private static final Gson gson = new Gson();
    private Session session;
    private static Map<String, Room> roomTableMap=new HashMap<>();
    private Client client=null;

    // 连接打开
    @OnOpen
    public void onOpen(Session session, EndpointConfig endpointConfig){
        // 保存 session 到对象
        this.session = session;
        LOGGER.info("[websocket] 新的连接：id={}", this.session.getId());
    }

    // 连接关闭
    @OnClose
    public void onClose(CloseReason closeReason){
        if(this.client!=null){
            handleDisconnect();
        }
        LOGGER.info("[websocket] 连接断开：id={}，reason={}", this.session.getId(),closeReason);
    }

    // 连接异常
    @OnError
    public void onError(Throwable throwable) throws IOException {
        LOGGER.info("[websocket] 连接异常：id={}，throwable={}", this.session.getId(), throwable.getMessage());
        // 关闭连接。状态码为 UNEXPECTED_CONDITION（意料之外的异常）
        this.session.close(new CloseReason(CloseReason.CloseCodes.UNEXPECTED_CONDITION, throwable.getMessage()));
    }

    // 收到消息
    @OnMessage
    public void onMessage(String message) {
        LOGGER.info("[websocket] 收到消息：id={}，message={}", this.session.getId(), message);
        // 解析 JSON 消息为 SignalMessage 对象
        try {
            SignalMessage signalMessage = gson.fromJson(message, SignalMessage.class);
            // 在这里可以根据 cmd 的类型来处理不同的业务逻辑
            switch (signalMessage.getCmd()) {
                case SignalEnum.SIGNAL_TYPE_JOIN:
                    handleJoin(signalMessage);
                    break;
                case SignalEnum.SIGNAL_TYPE_LEAVE:
                    handleLeave(signalMessage);
                    break;
                case SignalEnum.SIGNAL_TYPE_OFFER:
                    handleOffer(signalMessage);
                    break;
                case SignalEnum.SIGNAL_TYPE_ANSWER:
                    handleAnswer(signalMessage);
                    break;
                case SignalEnum.SIGNAL_TYPE_CANDIDATE:
                    handleCandidate(signalMessage);
                    break;
                case SignalEnum.SIGNAL_TYPE_MESSAGE:
                    handleMessage(signalMessage);
                    break;
            }
        } catch (Exception e) {
            LOGGER.error("解析 JSON 消息时出错: {}", e.getMessage(), e);
        }
    }

    private void handleJoin(SignalMessage signalMessage){
        String roomId = signalMessage.getRoomId();
        String uid = signalMessage.getUid();
        Room room = roomTableMap.get(roomId);

        if (room == null) {
            room = new Room();
            roomTableMap.put(roomId, room);
        }

        if (room.size() == 2) {
            sendRoomFullMessage(uid, roomId);
            return;
        }

        Client client = new Client(uid, roomId, this.session);
        this.client = client;
        room.put(uid, client);

        if (room.size() > 1) {
            notifyClientsOfNewPeer(uid, room);
        }
    }

    private void sendRoomFullMessage(String uid, String roomId) {
        SignalMessage message = new SignalMessage();
        message.setCmd(SignalEnum.SIGNAL_TYPE_FULL);
        message.setUid(uid);
        message.setRoomId(roomId);
        String jsonMessage = gson.toJson(message);
        try {
            this.session.getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("sendRoomFullMessage,发送消息时出错: {}", e.getMessage(), e);
        }
    }

    private void notifyClientsOfNewPeer(String uid, Room room) {
        Collection<Client> clients = room.getAllClients();
        for (Client entry : clients) {
            String remoteUid = entry.getUid();
            if (!remoteUid.equals(uid)) {
                notifyClientOfNewPeer(uid, entry);
                notifySelfOfExistingPeer(remoteUid);
            }
        }
    }

    private void notifyClientOfNewPeer(String uid, Client client) {
        SignalMessage message = new SignalMessage();
        message.setCmd(SignalEnum.SIGNAL_TYPE_NEW_PEER);
        message.setRemoteUid(uid);
        String jsonMessage = gson.toJson(message);
        try {
            client.getSession().getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("notifyClientOfNewPeer,发送消息时出错: {}", e.getMessage(), e);
        }
    }

    private void notifySelfOfExistingPeer(String remoteUid) {
        SignalMessage message = new SignalMessage();
        message.setCmd(SignalEnum.SIGNAL_TYPE_RESP_JOIN);
        message.setRemoteUid(remoteUid);
        String jsonMessage = gson.toJson(message);
        try {
            this.session.getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("notifySelfOfExistingPeer,发送消息时出错: {}", e.getMessage(), e);
        }
    }

    private void handleLeave(SignalMessage signalMessage){
        String roomId=signalMessage.getRoomId();
        String uid=signalMessage.getUid();
        Room room=roomTableMap.get(roomId);
        if(room==null){
            LOGGER.error("handleLeave,找不到房间号: "+roomId);
            return;
        }
        room.remove(uid);
        // 房间中还有人
        if(room.size()>0){
            Collection<Client> clients=room.getAllClients();
            for(Client entry: clients){
                //告知对方离开房间
                SignalMessage message=new SignalMessage();
                message.setCmd(SignalEnum.SIGNAL_TYPE_PEER_LEAVE);
                message.setRemoteUid(uid);
                String jsonMessage = gson.toJson(message);
                try {
                    entry.getSession().getBasicRemote().sendText(jsonMessage);
                } catch (IOException e) {
                    LOGGER.error("handleLeave,发送消息时出错: {}", e.getMessage(), e);
                }
            }
        }
    }

    private void handleOffer(SignalMessage signalMessage){
        String roomId=signalMessage.getRoomId();
        String uid=signalMessage.getUid();
        String remoteUid= signalMessage.getRemoteUid();
        Room room=roomTableMap.get(roomId);
        if(room==null){
            LOGGER.error("handleOffer,找不到房间号: "+roomId);
            return;
        }
        if(room.get(uid)==null){
            LOGGER.error("handleOffer,找不到uid: "+uid);
            return;
        }
        Client remoteClient=room.get(remoteUid);
        if(remoteClient==null){
            LOGGER.error("handleOffer,找不到remoteUid: "+remoteUid);
            return;
        }
        String jsonMessage = gson.toJson(signalMessage);
        try {
            remoteClient.getSession().getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("handleOffer,发送消息时出错: {}", e.getMessage(), e);
        }
    }

    private void handleAnswer(SignalMessage signalMessage){
        String roomId=signalMessage.getRoomId();
        String uid=signalMessage.getUid();
        String remoteUid= signalMessage.getRemoteUid();
        Room room=roomTableMap.get(roomId);
        if(room==null){
            LOGGER.error("handleAnswer,找不到房间号: "+roomId);
            return;
        }
        if(room.get(uid)==null){
            LOGGER.error("handleAnswer,找不到uid: "+uid);
            return;
        }
        Client remoteClient=room.get(remoteUid);
        if(remoteClient==null){
            LOGGER.error("handleAnswer,找不到remoteUid: "+remoteUid);
            return;
        }
        String jsonMessage = gson.toJson(signalMessage);
        try {
            remoteClient.getSession().getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("handleAnswer,发送消息时出错: {}", e.getMessage(), e);
        }
    }

    private void handleCandidate(SignalMessage signalMessage){
        String roomId=signalMessage.getRoomId();
        String uid=signalMessage.getUid();
        String remoteUid= signalMessage.getRemoteUid();
        Room room=roomTableMap.get(roomId);
        if(room==null){
            LOGGER.error("handleCandidate,找不到房间号: "+roomId);
            return;
        }
        if(room.get(uid)==null){
            LOGGER.error("handleCandidate,找不到uid: "+uid);
            return;
        }
        Client remoteClient=room.get(remoteUid);
        if(remoteClient==null){
            LOGGER.error("handleCandidate,找不到remoteUid: "+remoteUid);
            return;
        }
        String jsonMessage = gson.toJson(signalMessage);
        try {
            remoteClient.getSession().getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("handleCandidate,发送消息时出错: {}", e.getMessage(), e);
        }
    }

    private void handleDisconnect(){
        String roomId=this.client.getRoomId();
        String uid=this.client.getUid();
        Room room=roomTableMap.get(roomId);
        if(room==null){
            LOGGER.error("handleDisconnect,找不到房间号: "+roomId);
            return;
        }
        if(room.get(uid)==null){
            LOGGER.error("handleDisconnect,找不到uid: "+uid);
            return;
        }
        room.remove(uid);
        // 房间中还有人
        if(room.size()>0){
            Collection<Client> clients=room.getAllClients();
            for(Client entry: clients){
                //告知对方离开房间
                SignalMessage message=new SignalMessage();
                message.setCmd(SignalEnum.SIGNAL_TYPE_PEER_LEAVE);
                message.setRemoteUid(uid);
                String jsonMessage = gson.toJson(message);
                try {
                    entry.getSession().getBasicRemote().sendText(jsonMessage);
                } catch (IOException e) {
                    LOGGER.error("handleDisconnect,发送消息时出错: {}", e.getMessage(), e);
                }
            }
        }
    }

    private void handleMessage(SignalMessage signalMessage) {
        String roomId = signalMessage.getRoomId();
        String uid = signalMessage.getUid();
        String msg = signalMessage.getMsg();
        Room room = roomTableMap.get(roomId);

        if (isInvalidRoom(room, roomId) || isInvalidClient(room, uid)) {
            return;
        }

        if (room.size() > 1) {
            broadcastMessageToRoom(uid, msg, room);
        }
    }

    private boolean isInvalidRoom(Room room, String roomId) {
        if (room == null) {
            LOGGER.error("handleMessage,找不到房间号: " + roomId);
            return true;
        }
        return false;
    }

    private boolean isInvalidClient(Room room, String uid) {
        if (room.get(uid) == null) {
            LOGGER.error("handleMessage,找不到uid: " + uid);
            return true;
        }
        return false;
    }

    private void broadcastMessageToRoom(String uid, String msg, Room room) {
        Collection<Client> clients = room.getAllClients();
        for (Client entry : clients) {
            if (!entry.getUid().equals(uid)) {
                sendMessageToClient(uid, msg, entry);
            }
        }
    }

    private void sendMessageToClient(String uid, String msg, Client client) {
        SignalMessage message = new SignalMessage();
        message.setCmd(SignalEnum.SIGNAL_TYPE_MESSAGE);
        message.setRemoteUid(uid);
        message.setMsg(msg);
        String jsonMessage = gson.toJson(message);
        try {
            client.getSession().getBasicRemote().sendText(jsonMessage);
        } catch (IOException e) {
            LOGGER.error("sendMessageToClient,发送消息时出错: {}", e.getMessage(), e);
        }
    }

}

























