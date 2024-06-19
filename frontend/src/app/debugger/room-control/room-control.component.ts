import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const SIGNAL_TYPE_JOIN = "join";
const SIGNAL_TYPE_FULL = "full";
const SIGNAL_TYPE_RESP_JOIN = "resp-join";
const SIGNAL_TYPE_LEAVE = "leave";
const SIGNAL_TYPE_NEW_PEER = "new-peer";
const SIGNAL_TYPE_PEER_LEAVE = "peer-leave";
const SIGNAL_TYPE_OFFER = "offer";
const SIGNAL_TYPE_ANSWER = "answer";
const SIGNAL_TYPE_CANDIDATE = "candidate";
const SIGNAL_TYPE_MESSAGE="message";

@Component({
  standalone: true,
  selector: 'app-room-control',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-control.component.html',
  styleUrls: ['./room-control.component.scss']
})
export class RoomControlComponent implements OnInit, AfterViewInit{
  enterId: string = ''
  roomId: string = '';
  localUserId: string = '';
  // localUserId: string = Math.random().toString(36).substring(2);
  remoteUserId: string = '';
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  pc: RTCPeerConnection | null = null;
  signaling: WebSocket | null = null;
  wsUrl: string = 'ws://47.116.195.16:8080/ws/server';
  isChatBoxVisible: boolean = false;
  messages: string[] = [];
  newMessage: string = '';

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideoContainer') remoteVideoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>;

  @Output() join: EventEmitter<string> = new EventEmitter();

  constructor(private authService: AuthService,private renderer: Renderer2) { }

  ngOnInit(): void {
    this.authService.getUserName().subscribe((username: string) => {
      this.localUserId = username;
    });
    this.roomId = '';
    this.createWebsocket();
  }

  ngAfterViewInit() {
    this.localVideo.nativeElement.muted = true;
    this.initResizeHandle();
  }

  initResizeHandle(): void {
    const container = this.remoteVideoContainer.nativeElement;
    const handle = this.resizeHandle.nativeElement;

    let isResizing = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isResizing = true;
      lastX = e.clientX;
      lastY = e.clientY;
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) {
        return;
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      const newWidth = container.offsetWidth - dx;
      const newHeight = container.offsetHeight + dy;

      if (newWidth > 200) { // 限制最小宽度
        this.renderer.setStyle(container, 'width', `${newWidth}px`);
        lastX = e.clientX;
      }

      if (newHeight > 150) { // 限制最小高度
        this.renderer.setStyle(container, 'height', `${newHeight}px`);
        lastY = e.clientY;
      }

      e.preventDefault();
    };

    const onMouseUp = () => {
      isResizing = false;
    };

    this.renderer.listen(handle, 'mousedown', onMouseDown);
    this.renderer.listen('window', 'mousemove', onMouseMove);
    this.renderer.listen('window', 'mouseup', onMouseUp);
  }

  createWebsocket(): void {
    this.signaling = new WebSocket(this.wsUrl);

    this.signaling.onopen = () => {
      console.log("websocket open");
    }

    this.signaling.onmessage = (ev) => {
      this.onMessage(ev);
    }

    this.signaling.onerror = (ev) => {
      console.log("onError: " + ev);
    }

    this.signaling.onclose = (ev) => {
      console.log("onClose -> code: " + ev.code + ", reason:" + ev.reason);
    }
  }

  onMessage(event: MessageEvent): void {
    console.log("onMessage: " + event.data);

    let jsonMsg = null;
    try {
      jsonMsg = JSON.parse(event.data);
    } catch (e) {
      console.warn("onMessage parse Json failed:" + e);
      return;
    }
    switch (jsonMsg.cmd) {
      case SIGNAL_TYPE_NEW_PEER:
        this.handleRemoteNewPeer(jsonMsg);
        break;
      case SIGNAL_TYPE_RESP_JOIN:
        this.handleRespJoin(jsonMsg);
        break;
      case SIGNAL_TYPE_PEER_LEAVE:
        this.handlePeerLeave(jsonMsg);
        break;
      case SIGNAL_TYPE_OFFER:
        this.handleRemoteOffer(jsonMsg);
        break;
      case SIGNAL_TYPE_ANSWER:
        this.handleRemoteAnswer(jsonMsg);
        break;
      case SIGNAL_TYPE_CANDIDATE:
        this.handleRemoteCandidate(jsonMsg);
        break;
      case SIGNAL_TYPE_FULL:
        console.info("当前房间已满员：" + jsonMsg);
        //关闭本地码流
        this.localVideo.nativeElement.srcObject = null;
        this.localStream = null;
        this.join.emit("当前房间已满员，无法加入！");
        this.roomId = '';
        break;
      case SIGNAL_TYPE_MESSAGE:
        this.handleRemoteReceive(jsonMsg);
        break;
    }
  }

  sendMessage(message: any): void {
    this.signaling?.send(JSON.stringify(message));
  }

  handleRemoteNewPeer(message: any): void {
    console.log("handleRemoteNewPeer, remoteUid: " + message.remoteUid);
    this.remoteUserId = message.remoteUid;
    this.messages.push(this.remoteUserId+"加入了房间");
    this.doOffer();
  }

  handleRespJoin(message: any): void {
    console.log("handleRespJoin, remoteUid: " + message.remoteUid);
    this.remoteUserId = message.remoteUid;
    this.messages.push(this.remoteUserId+"已经在房间中");
  }

  handlePeerLeave(message: any): void {
    console.log("handlePeerLeave, remoteUid: " + message.remoteUid);
    this.messages.push(message.remoteUid+"离开了房间");
    this.remoteUserId='';
    this.remoteVideo.nativeElement.srcObject = null;
    this.remoteStream=null;
    if (this.pc != null) {
      this.pc.close();
      this.pc = null;
    }
  }

  handleRemoteOffer(message: any): void {
    console.info("handleRemoteOffer");
    if (this.pc == null) {
      this.createPeerConnection();
    }
    const desc = JSON.parse(message.msg);
    this.pc?.setRemoteDescription(desc).catch(e => {
      console.error("handleRemoteOffer failed:" + e.name);
    });
    this.doAnswer();
  }

  handleRemoteAnswer(message: any): void {
    console.info("handleRemoteAnswer");
    const desc = JSON.parse(message.msg);
    this.pc?.setRemoteDescription(desc).catch(e => {
      console.error("handleRemoteAnswer failed:" + e);
    });
  }

  handleRemoteCandidate(message: any): void {
    console.info("handleRemoteCandidate");
    const candidate = JSON.parse(message.msg);
    this.pc?.addIceCandidate(candidate).catch(e => {
      console.error("addIceCandidate failed:" + e);
    });
  }

  handleIceCandidate(event: RTCPeerConnectionIceEvent): void {
    console.info("handleIceCandidate");
    if (event.candidate) {
      const jsonMsg = {
        cmd: SIGNAL_TYPE_CANDIDATE,
        roomId: this.roomId,
        uid: this.localUserId,
        remoteUid: this.remoteUserId,
        msg: JSON.stringify(event.candidate)
      };
      this.sendMessage(jsonMsg);
      console.info("handleIceCandidate message: " + JSON.stringify(jsonMsg));
    } else {
      console.warn("end of candidates");
    }
  }

  handleRemoteReceive(message: any): void {
    console.info("handleRemoteAnswer");
    this.messages.push(message.remoteUid+": "+message.msg);
  }

  handleRemoteStreamAdd(event: RTCTrackEvent): void {
    console.info("handleRemoteStreamAdd");
    this.remoteStream = event.streams[0];
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;
  }

  createPeerConnection(): void {
    this.pc = new RTCPeerConnection({});
    this.pc.onicecandidate = this.handleIceCandidate.bind(this);
    this.pc.ontrack = this.handleRemoteStreamAdd.bind(this);
    this.localStream?.getTracks().forEach((track) => this.pc?.addTrack(track, this.localStream!));
  }

  doOffer(): void {
    if (this.pc == null) {
      this.createPeerConnection();
    }
    this.pc!.createOffer().then((session) => {
      this.pc?.setLocalDescription(session).then(() => {
        const jsonMsg = {
          cmd: SIGNAL_TYPE_OFFER,
          roomId: this.roomId,
          uid: this.localUserId,
          remoteUid: this.remoteUserId,
          msg: JSON.stringify(session)
        };
        this.sendMessage(jsonMsg);
        console.info("createOfferAndSendMessage message: " + JSON.stringify(jsonMsg));
      }).catch((error) => {
        console.error("offer setLocalDescription failed: " + error);
      });
    }).catch((error) => {
      console.error("handleCreateOfferError: " + error);
    });
  }

  doAnswer(): void {
    this.pc?.createAnswer().then((session) => {
      this.pc?.setLocalDescription(session).then(() => {
        const jsonMsg = {
          cmd: SIGNAL_TYPE_ANSWER,
          roomId: this.roomId,
          uid: this.localUserId,
          remoteUid: this.remoteUserId,
          msg: JSON.stringify(session)
        };
        this.sendMessage(jsonMsg);
        console.info("createAnswerAndSendMessage message: " + JSON.stringify(jsonMsg));
      }).catch((error) => {
        console.error("offer setLocalDescription failed: " + error);
      });
    }).catch((error) => {
      console.error("handleCreateAnswerError: " + error);
    });
  }

  initLocalStream(): void {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).then((stream) => {
      this.localVideo.nativeElement.srcObject = stream;
      this.localStream = stream;
      this.doJoin();
    }).catch((e) => {
      alert("getUserMedia() error: " + e.name);
    });
  }
  
  doJoin(): void {
    const jsonMsg = {
      cmd: SIGNAL_TYPE_JOIN,
      roomId: this.roomId,
      uid: this.localUserId,
    };
    this.sendMessage(jsonMsg);
    console.info("doJoin message: " + JSON.stringify(jsonMsg));
  }

  handleScreenStream(stream: MediaStream): void {
    // 停止当前 localStream 中的所有轨道
    this.localStream?.getTracks().forEach(track => track.stop());
  
    // 设置 localStream 为新的流
    this.localStream = stream;
  
    // 替换 RTCPeerConnection 中的视频轨道
    const videoTrack = stream.getVideoTracks()[0];
    const videoSender = this.pc?.getSenders().find(s => s.track?.kind === videoTrack.kind);
    if (videoSender) {
      videoSender.replaceTrack(videoTrack);
    }
  
    // 替换 RTCPeerConnection 中的音频轨道
    const audioTrack = stream.getAudioTracks()[0];
    const audioSender = this.pc?.getSenders().find(s => s.track?.kind === audioTrack.kind);
    if (audioSender) {
      audioSender.replaceTrack(audioTrack);
    }
  
    this.localVideo.nativeElement.srcObject = stream;
  
    // 当用户停止共享屏幕时，恢复到摄像头
    stream.getVideoTracks()[0].onended = () => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then((cameraStream) => {
        // 恢复 localStream
        this.localStream = cameraStream;
  
        // 替换回摄像头的视频轨道
        const cameraVideoTrack = cameraStream.getVideoTracks()[0];
        const cameraVideoSender = this.pc?.getSenders().find(s => s.track?.kind === cameraVideoTrack.kind);
        if (cameraVideoSender) {
          cameraVideoSender.replaceTrack(cameraVideoTrack);
        }
  
        // 替换回摄像头的音频轨道
        const cameraAudioTrack = cameraStream.getAudioTracks()[0];
        const cameraAudioSender = this.pc?.getSenders().find(s => s.track?.kind === cameraAudioTrack.kind);
        if (cameraAudioSender) {
          cameraAudioSender.replaceTrack(cameraAudioTrack);
        }
  
        this.localVideo.nativeElement.srcObject = cameraStream;
      }).catch((e) => {
        console.error("getUserMedia() 错误: " + e.name);
      });
    };
  }

  joinRoom(): void {
    // this.authService.getUserName().subscribe((username: string) => {
    //   this.localUserId = username;
    // });
    if(this.localUserId==''){
      this.join.emit("请先登录");
      return;
    }
    else{
      if(this.enterId.trim()==''){
        this.join.emit("房间号不能为空");
        return;
      }
      else{
        if(this.roomId!=''){
          this.join.emit("请先离开当前房间再加入");
          return;
        }
        else{
          this.roomId = this.enterId;
          this.initLocalStream();
        }
      }
    }
    // if(this.roomId.trim()==''){
    //   this.join.emit("房间号不能为空");
    // }
    // else{
    //   this.initLocalStream();
    // }
  }

  leaveRoom(): void {
    if(this.localUserId!=''&&this.localStream!=null){
      const jsonMsg = {
        cmd: SIGNAL_TYPE_LEAVE,
        roomId: this.roomId,
        uid: this.localUserId,
      };
      this.sendMessage(jsonMsg);
      console.info("doLeave message: " + JSON.stringify(jsonMsg));
      this.roomId='';
      this.localVideo.nativeElement.srcObject = null;
      this.remoteVideo.nativeElement.srcObject = null;
      if (this.localStream != null) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      this.localStream=null;
      this.remoteStream=null;
      if (this.pc != null) {
        this.pc.close();
        this.pc = null;
      }
    }
  }

  toggleChatBox(): void {
    this.isChatBoxVisible = !this.isChatBoxVisible;
  }

  shareScreen(): void {
    if(this.localUserId==''){
      this.join.emit("请先登录");
      return;
    }
    if (this.localStream == null) {
      this.join.emit("请先加入房间");
      return;
    }
    if (!this.pc) {
      this.join.emit("请等待对方加入房间");
      return;
    }
  
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    }).then((screenStream) => {
      // 获取麦克风音频流
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((micStream) => {
          // 创建一个新的 MediaStream
          let newStream = new MediaStream();
  
          // 添加屏幕共享的视频轨道
          screenStream.getVideoTracks().forEach(track => {
            newStream.addTrack(track);
          });
  
          // 添加麦克风的音频轨道
          micStream.getAudioTracks().forEach(track => {
            newStream.addTrack(track);
          });
  
          // 使用新的流进行传输
          this.handleScreenStream(newStream);
        }).catch((e) => {
          console.error("getUserMedia() 错误: " + e.name);
        });
  
    }).catch((e) => {
      console.error("getDisplayMedia() 错误: " + e.name);
    });
  }

  send(): void {
    // this.authService.getUserName().subscribe((username: string) => {
    //   this.localUserId = username;
    // });
    if(this.localUserId==''){
      this.join.emit("请先登录");
      return;
    }
    else{
      if (this.newMessage.trim()) {
        this.messages.push(this.localUserId+": "+this.newMessage);
        if(this.roomId!=''){
          const jsonMsg = {
            cmd: SIGNAL_TYPE_MESSAGE,
            roomId: this.roomId,
            uid: this.localUserId,
            msg: this.newMessage
          };
          this.sendMessage(jsonMsg);
          console.info("doSend message: " + JSON.stringify(jsonMsg));
        }
        this.newMessage = '';
      }
      else{
        this.join.emit("消息不能为空");
      }
    }
  }


}