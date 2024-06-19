'use strict';

// 信令
const SIGNAL_TYPE_JOIN="join";//主动加入房间
const SIGNAL_TYPE_FULL="full";//当前房间已满员
const SIGNAL_TYPE_RESP_JOIN="resp-join";//告知加入方对方是谁
const SIGNAL_TYPE_LEAVE="leave";//主动离开房间
const SIGNAL_TYPE_NEW_PEER="new-peer";//有人加入房间，通知已经在房间的人
const SIGNAL_TYPE_PEER_LEAVE="peer-leave";//有人离开房间，通知已经在房间的人
const SIGNAL_TYPE_OFFER="offer";//发送offer给对端peer
const SIGNAL_TYPE_ANSWER="answer";//发送answer给对端peer
const SIGNAL_TYPE_CANDIDATE="candidate";//发送candidate给对端peer

var localUserId=Math.random().toString(36).substring(2); //本地uid
var remoteUserId=-1;
var roomId=0;

var localVideo=document.querySelector('#localVideo');
var remoteVideo=document.querySelector('#remoteVideo');
var localStream=null;
var remoteStream=null;
var webRTCEngine;

var pc=null;

var webRTCEngine=function(wsUrl){
    this.init(wsUrl);
    webRTCEngine=this;
    return this;
}

// 初始化
webRTCEngine.prototype.init=function(wsUrl){
    // 设置websocket url
    this.wsUrl=wsUrl;
    // websocket对象
    this.signaling=null;
}

// 创建websocket
webRTCEngine.prototype.createWebsocket=function(){
    webRTCEngine=this;
    webRTCEngine.signaling=new WebSocket(this.wsUrl);

    webRTCEngine.signaling.onopen=function(){
        webRTCEngine.onOpen();
    }

    webRTCEngine.signaling.onmessage=function(ev){
        webRTCEngine.onMessage(ev);
    }

    webRTCEngine.signaling.onerror=function(ev){
        webRTCEngine.onError(ev);
    }

    webRTCEngine.signaling.onclose=function(ev){
        webRTCEngine.onClose(ev)
    }
}

webRTCEngine.prototype.onOpen=function(){
    console.log("websocket open");
}

webRTCEngine.prototype.onMessage=function(event){
    console.log("onMessage: "+event.data);

    var jsonMsg=null;
    try{
        jsonMsg=JSON.parse(event.data);
    }catch(e){
        console.warn("onMessage parse Json failed:"+e.name);
        return;
    }
    switch(jsonMsg.cmd){
        case SIGNAL_TYPE_NEW_PEER:
            handleRemoteNewPeer(jsonMsg);
            break;
        case SIGNAL_TYPE_RESP_JOIN:
            handleRespJoin(jsonMsg);
            break;
        case SIGNAL_TYPE_PEER_LEAVE:
            handlePeerLeave(jsonMsg);
            break;
        case SIGNAL_TYPE_OFFER:
            handleRemoteOffer(jsonMsg);
            break;
        case SIGNAL_TYPE_ANSWER:
            handleRemoteAnswer(jsonMsg);
            break;
        case SIGNAL_TYPE_CANDIDATE:
            handleRemoteCandidate(jsonMsg);
            break;
        case SIGNAL_TYPE_FULL:
            console.info("当前房间已满员："+jsonMsg);
            //关闭本地码流
            localVideo.srcObject=null
            localStream=null
            alert("当前房间已满员，无法加入！")
            break;
    }
}

webRTCEngine.prototype.onError=function(event){
    console.log("onError: "+event.data);
}

webRTCEngine.prototype.onClose=function(event){
    console.log("onClose -> code: "+event.code+", reason:"+EventTarget.reason);
}

webRTCEngine.prototype.sendMessage=function(message){
    webRTCEngine.signaling.send(message);
}

function handleRemoteNewPeer(message){
    console.log("handleRemoteNewPeer, remoteUid: "+message.remoteUid);
    remoteUserId=message.remoteUid;
    doOffer();
}

function handleRespJoin(message){
    console.log("handleRespJoin, remoteUid: "+message.remoteUid);
    remoteUserId=message.remoteUid;
}

function handlePeerLeave(message){
    console.log("handlePeerLeave, remoteUid: "+message.remoteUid);
    remoteVideo.srcObject=null;
    if(pc!=null){//关闭pc
        pc.close();
        pc=null;
    }
}

function handleRemoteOffer(message){
    console.info("handleRemoteOffer");
    if(pc==null){
        createPeerConnection();
    }
    var desc=JSON.parse(message.msg);
    pc.setRemoteDescription(desc).catch(e=>{
        console.error("handleRemoteOffer failed:"+e.name);
    });
    doAnswer();
}

function handleRemoteAnswer(message){
    console.info("handleRemoteAnswer");
    var desc=JSON.parse(message.msg);
    pc.setRemoteDescription(desc).catch(e=>{
        console.error("handleRemoteAnswer failed:"+e);
    });
}

function handleRemoteCandidate(message){
    console.info("handleRemoteCandidate");
    var candidate=JSON.parse(message.msg);
    pc.addIceCandidate(candidate).catch(e=>{
        console.error("addIceCandidate failed:"+e);
    });
}


function handleIceCandidate(event){
    console.info("handleIceCandidate");
    if(event.candidate){
        var jsonMsg={
            "cmd":SIGNAL_TYPE_CANDIDATE,
            "roomId":roomId,
            "uid":localUserId,
            "remoteUid":remoteUserId,
            "msg":JSON.stringify(event.candidate)
        };
        var message=JSON.stringify(jsonMsg);
        webRTCEngine.sendMessage(message);
        console.info("handleIceCandidate message: "+message);
    }
    else{
        console.warn("end of candidates");
    }
}

function handleRemoteStreamAdd(event){
    console.info("handleRemoteStreamAdd");
    remoteStream=event.streams[0];
    remoteVideo.srcObject=remoteStream;
}

function createPeerConnection(){
    // var defaultConfiguration={
    //     bundlePolicy:"max-bundle",
    //     rtcpMuxPolicy:"require",
    //     iceTransportPolicy:"relay",//relay或者all
    //     iceServers:[
    //         {
    //             "urls":[
    //                 "turn:192.168.186.129:3478?transport=udp",
    //                 "turn:192.168.186.129:3478?transport=tcp"
    //             ],
    //             "username":"tch",
    //             "credential":"tCh024012"
    //         },
    //         {
    //             "urls":[
    //                 "stun:192.168.186.129"
    //             ]
    //         }
    //     ]
    // };

    // pc=new RTCPeerConnection(defaultConfiguration);
    // 如果本地测试直接
    pc=new RTCPeerConnection(null);
    pc.onicecandidate=handleIceCandidate;
    pc.ontrack=handleRemoteStreamAdd;
    localStream.getTracks().forEach((track)=>pc.addTrack(track,localStream));
}

function doOffer(){
    // 创建RTCPeerConnection
    if(pc==null){
        createPeerConnection();
    }
    pc.createOffer().then(function(session){
        pc.setLocalDescription(session)
        .then(function(){
            var jsonMsg={
                "cmd":SIGNAL_TYPE_OFFER,
                "roomId":roomId,
                "uid":localUserId,
                "remoteUid":remoteUserId,
                "msg":JSON.stringify(session)
            };
            var message=JSON.stringify(jsonMsg);
            webRTCEngine.sendMessage(message);
            console.info("createOfferAndSendMessage message: "+message);
        })
        .catch(function(error){
            console.error("offer setLocalDescription failed: "+error);
        });
    }).catch(function(error){
        console.error("handleCreateOfferErroe: "+error);
    });
}

function doAnswer(){
    pc.createAnswer().then(function(session){
        pc.setLocalDescription(session)
        .then(function(){
            var jsonMsg={
                "cmd":SIGNAL_TYPE_ANSWER,
                "roomId":roomId,
                "uid":localUserId,
                "remoteUid":remoteUserId,
                "msg":JSON.stringify(session)
            };
            var message=JSON.stringify(jsonMsg);
            webRTCEngine.sendMessage(message);
            console.info("createAnswerAndSendMessage message: "+message);
        })
        .catch(function(error){
            console.error("offer setLocalDescription failed: "+error);
        });
    }).catch(function(error){
        console.error("handleCreateAnswerErroe: "+error);
    });
}


function doJoin(roomId){
    var jsonMsg={
        "cmd":"join",
        "roomId":roomId,
        "uid":localUserId,
    };
    var message=JSON.stringify(jsonMsg);
    webRTCEngine.sendMessage(message);
    console.info("doJoin message: "+message);
}

function doLeave(){
    var jsonMsg={
        "cmd":"leave",
        "roomId":roomId,
        "uid":localUserId,
    };
    var message=JSON.stringify(jsonMsg);
    webRTCEngine.sendMessage(message);
    console.info("doLeave message: "+message);
    localVideo.srcObject=null;//关闭自己的显示
    remoteVideo.srcObject=null;//不显示对方
    if(localStream!=null){//关闭本地流
        localStream.getTracks().forEach((track)=>{
            track.stop();
        });
    }
    if(pc!=null){//关闭pc
        pc.close();
        pc=null;
    }
}



webRTCEngine=new webRTCEngine("ws://127.0.0.1:8080/ws/server");
//webRTCEngine=new webRTCEngine("ws://192.168.186.129:8099");
webRTCEngine.createWebsocket();

function openLocalStream(stream){
    doJoin(roomId);
    localVideo.srcObject=stream;
    localStream=stream;
    //localVideo.play();
}

function openLocalStream1(stream){
    //doJoin(roomId);
    localVideo.srcObject=stream;
    localStream=stream;
    //localVideo.play();
    localStream.getTracks().forEach((track)=>pc.addTrack(track,localStream));
}

function initLocalStream(){
    navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
    })
    .then(openLocalStream)
    .catch(function(e){
        alert("getUserMedia() error: "+e.name);
    });
}

document.getElementById('joinBtn').onclick=function(){
    roomId=document.getElementById('roomId').value.trim();
    if(roomId==""){
        alert("请输入房间ID");
        return;
    }
    console.log("加入按钮被点击, roomId: "+roomId);
    // 初始化本地码流
    initLocalStream();
}

document.getElementById('leaveBtn').onclick=function(){
    console.log("离开按钮被点击");
    doLeave();
}

document.getElementById('shareScreenBtn').onclick = function() {
    if (!pc) {
        alert("请先加入房间");
        return;
    }

    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true // 可选：如果需要捕获系统音频
    }).then(handleScreenStream).catch(function(e) {
        console.error("getDisplayMedia() 错误: " + e.name);
    });
}

function handleScreenStream(stream) {
    // 停止当前 localStream 中的所有轨道
    localStream.getTracks().forEach(track => track.stop());

    // 将 localStream 设置为新的屏幕流
    localStream = stream;

    // 替换 RTCPeerConnection 中的轨道
    const videoTrack = stream.getVideoTracks()[0];
    const sender = pc.getSenders().find(s => s.track.kind === videoTrack.kind);
    if (sender) {
        sender.replaceTrack(videoTrack);
    }

    localVideo.srcObject = stream;

    stream.getVideoTracks()[0].onended = function() {
         // 当用户停止共享屏幕时，恢复到摄像头
         navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(function(stream) {
            // 恢复 localStream
            localStream = stream;

            // 替换回摄像头的 video track
            const videoTrack = stream.getVideoTracks()[0];
            const sender = pc.getSenders().find(s => s.track.kind === videoTrack.kind);
            if (sender) {
                sender.replaceTrack(videoTrack);
            }

            localVideo.srcObject = stream;

            // 将摄像头的音频轨道也替换
            const audioTrack = stream.getAudioTracks()[0];
            const audioSender = pc.getSenders().find(s => s.track.kind === audioTrack.kind);
            if (audioSender) {
                audioSender.replaceTrack(audioTrack);
            }

        }).catch(function(e) {
            console.error("getUserMedia() 错误: " + e.name);
        });
    };
}
