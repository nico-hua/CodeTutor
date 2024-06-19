var ws=require("nodejs-websocket")
var port=8099

// 信令
const SIGNAL_TYPE_JOIN="join";//主动加入房间
const SIGNAL_TYPE_RESP_JOIN="resp-join";//告知加入方对方是谁
const SIGNAL_TYPE_LEAVE="leave";//主动离开房间
const SIGNAL_TYPE_NEW_PEER="new-peer";//有人加入房间，通知已经在房间的人
const SIGNAL_TYPE_PEER_LEAVE="peer-leave";//有人离开房间，通知已经在房间的人
const SIGNAL_TYPE_OFFER="offer";//发送offer给对端peer
const SIGNAL_TYPE_ANSWER="answer";//发送answer给对端peer
const SIGNAL_TYPE_CANDIDATE="candidate";//发送candidate给对端peer

// 使用map保存信息
var WebRTCMap=function(){
    this._entrys=new Array();
    //插入
    this.put=function(key,value){
        if(key==null||key==undefined){
            return;
        }
        var index=this._getIndex(key);
        if(index==-1){
            var entry=new Object();
            entry.key=key;
            entry.value=value;
            this._entrys[this._entrys.length]=entry;
        }
        else{
            this._entrys[index].value=value;
        }
    };
    //根据key获取value
    this.get=function(key){
        var index=this._getIndex(key);
        return (index!=-1)?this._entrys[index].value:null;
    };
    //移除key-value
    this.remove=function(key){
        var index=this._getIndex(key);
        if(index!=-1){
            this._entrys.splice(index,1);
        }
    };
    //清空map
    this.clear=function(){
        this._entrys.length=0;
    };
    //判断是否包含key
    this.contains=function(key){
        var index=this._getIndex(key);
        return (index!=-1)?true:false;
    }
    // map中key-value的数量
    this.size=function(){
        return this._entrys.length;
    }
    //获取所有的key
    this.getEntrys=function(){
        return this._entrys;
    }
    //内部函数
    this._getIndex=function(key){
        if(key==null||key==undefined){
            return -1;
        }
        var _length=this._entrys.length;
        for(var i=0; i<_length;i++){
            var entry=this._entrys[i];
            if(entry==null||entry==undefined){
                continue;
            }
            if(entry.key===key){
                return i;
            }
        }
        return -1;
    };
}

// 客户端
function Client(uid, coon, roomId){
    this.uid=uid;//用户id
    this.conn=coon;//websocket对应的连接
    this.roomId=roomId;//房间id
}

function handleJoin(message,conn){
    var roomId=message.roomId;
    var uid=message.uid;
    var roomMap=roomTableMap.get(roomId);
    console.info(uid+" try to join room "+roomId);
    if(roomMap==null){//当前房间为空
        roomMap=new WebRTCMap();
        roomTableMap.put(roomId,roomMap);
    }
    if(roomMap.size()>=2){//当前房间已满2人
        return null;
    }
    var client=new Client(uid,conn,roomId);
    roomMap.put(uid,client);
    if(roomMap.size()>1){//房间里面原本有人
        var clients=roomMap.getEntrys();
        for(var i in clients){
            var remoteUid=clients[i].key;
            if(remoteUid!=uid){
                //告知对方自己加入房间
                var jsonMsg={
                    "cmd":SIGNAL_TYPE_NEW_PEER,
                    "remoteUid":uid
                };
                var msg=JSON.stringify(jsonMsg);
                var remoteClient=roomMap.get(remoteUid);
                console.log("new-peer: "+msg);
                remoteClient.conn.sendText(msg);

                //房间中原本有哪些人
                jsonMsg={
                    "cmd":SIGNAL_TYPE_RESP_JOIN,
                    "remoteUid":remoteUid
                };
                msg=JSON.stringify(jsonMsg);
                console.info("resp-join: "+msg);
                conn.sendText(msg);
            }
        }
    }
    return client;
}

function handleLeave(message){
    var roomId=message.roomId;
    var uid=message.uid;
    var roomMap=roomTableMap.get(roomId);
    console.info(uid+" leave room "+roomId);
    if(roomMap==null){
        console.error("handleLeave can't find the roomId"+roomId);
        return;
    }
    roomMap.remove(uid);
    if(roomMap.size()>=1){//房间中还有人
        var clients=roomMap.getEntrys();
        for(var i in clients){
            var jsonMsg={
                "cmd":SIGNAL_TYPE_PEER_LEAVE,
                "remoteUid":uid
            }
            var msg=JSON.stringify(jsonMsg);
            var remoteUid=clients[i].key;
            var remoteClient=roomMap.get(remoteUid);
            if(remoteClient){
                console.info("notify peer: "+remoteClient.uid+", uid "+uid+" leave");
                remoteClient.conn.sendText(msg);
            }
        }
    }
}

function handleForceLeave(client){
    var roomId=client.roomId;
    var uid=client.uid;
    var roomMap=roomTableMap.get(roomId);
    if(roomMap==null){
        console.error("handleLeave can't find the roomId"+roomId);
        return;
    }
    if(!roomMap.contains(uid)){
        return;
    }
    console.info(uid+" force leave room "+roomId);
    roomMap.remove(uid);
    if(roomMap.size()>=1){//房间中还有人
        var clients=roomMap.getEntrys();
        for(var i in clients){
            var jsonMsg={
                "cmd":SIGNAL_TYPE_PEER_LEAVE,
                "remoteUid":uid
            }
            var msg=JSON.stringify(jsonMsg);
            var remoteUid=clients[i].key;
            var remoteClient=roomMap.get(remoteUid);
            if(remoteClient){
                console.info("notify peer: "+remoteClient.uid+", uid "+uid+" leave");
                remoteClient.conn.sendText(msg);
            }
        }
    }
}

function handleOffer(message){
    var roomId=message.roomId;
    var uid=message.uid;
    var remoteUid=message.remoteUid;
    var roomMap=roomTableMap.get(roomId);
    //console.info("haddleOffer from "+uid+" to "+remoteUid);
    if(roomMap==null){
        console.error("handleOffer can't find the roomId"+roomId);
        return;
    }
    if(roomMap.get(uid)==null){
        console.error("handleOffer can't find the uid"+uid);
        return;
    }
    var remoteClient=roomMap.get(remoteUid);
    if(remoteClient){
        var msg=JSON.stringify(message);
        remoteClient.conn.sendText(msg);
    }
    else{
        console.error("handleOffer can't find the remoteUid"+remoteUid);
    }
}

function handleAnswer(message){
    var roomId=message.roomId;
    var uid=message.uid;
    var remoteUid=message.remoteUid;
    var roomMap=roomTableMap.get(roomId);
    //console.info("haddleAnswer from "+uid+" to "+remoteUid);
    if(roomMap==null){
        console.error("handleAnswer can't find the roomId"+roomId);
        return;
    }
    if(roomMap.get(uid)==null){
        console.error("handleAnswer can't find the uid"+uid);
        return;
    }
    var remoteClient=roomMap.get(remoteUid);
    if(remoteClient){
        var msg=JSON.stringify(message);
        remoteClient.conn.sendText(msg);
    }
    else{
        console.error("handleAnswer can't find the remoteUid"+remoteUid);
    }
}

function handleCandidate(message){
    var roomId=message.roomId;
    var uid=message.uid;
    var remoteUid=message.remoteUid;
    var roomMap=roomTableMap.get(roomId);
    //console.info("haddleCandidate from "+uid+" to "+remoteUid);
    if(roomMap==null){
        console.error("handleCandidate can't find the roomId"+roomId);
        return;
    }
    if(roomMap.get(uid)==null){
        console.error("handleCandidate can't find the uid"+uid);
        return;
    }
    var remoteClient=roomMap.get(remoteUid);
    if(remoteClient){
        var msg=JSON.stringify(message);
        remoteClient.conn.sendText(msg);
    }
    else{
        console.error("handleCandidate can't find the remoteUid"+remoteUid);
    }
}

var roomTableMap=new WebRTCMap();

var server=ws.createServer(function(conn){
    console.log("创建一个新的连接------");
    conn.client=null;
    conn.on("text",function(str){
        //console.info("recv msg: "+str);
        var jsonMsg=JSON.parse(str);
        switch(jsonMsg.cmd){
            case SIGNAL_TYPE_JOIN:
                conn.client=handleJoin(jsonMsg,conn);
                break;
            case SIGNAL_TYPE_LEAVE:
                handleLeave(jsonMsg);
                break;
            case SIGNAL_TYPE_OFFER:
                handleOffer(jsonMsg);
                break;
            case SIGNAL_TYPE_ANSWER:
                handleAnswer(jsonMsg);
                break;
            case SIGNAL_TYPE_CANDIDATE:
                handleCandidate(jsonMsg);
                break;
        }
    });

    conn.on("close",function(code,reason){
        console.info("连接关闭 code"+code+", reason: "+reason);
        if(conn.client!=null){
            //强制客户端从房间退出
            handleForceLeave(conn.client);
        }
    });

    conn.on("error",function(err){
        console.info("监听到错误: "+err);
    });
}).listen(port);