//create web socket object

const webSocket=new WebSocket("ws://127.0.0.1:3000");
let peerConn;
let username;
webSocket.onmessage=e=>{
    handleSignallingData(JSON.parse(e.data));
}

function handleSignallingData(data){
    switch (data.type){
        case "answer":
            peerConn.setRemoteDescription(data.answer);
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate);    
    }
}

function sendUsername(){
    username=document.getElementById("username-input").value;
    sendData({
        type:"store_user",
    })
}

function sendData(data){
    data.username=username;
    webSocket.send(JSON.stringify(data));
}

function startCall(){
    document.getElementById('video-call-div').style.display="inline";
    navigator.getUserMedia({
        video:{
            framRate:24,
            width:{
                min:480,ideal:720,max:1280
            },
            aspectRatio: 1.33333
        },
        audio:true,
    },(stream)=>{
        localStream = stream
        document.getElementById("local-video").srcObject = localStream;
        //create pair connection
        let configaration={
            iceServers:{
                "urls":[{"urls":["stun:stun.l.google.com:19302"]}]
            }
        }
        peerConn=new RTCPeerConnection(configaration);
        peerConn.addStream(localStream);
        peerConn.onaddstrem=e=>{
            document.getElementById("remote-vedio").srcObject=e.stream;
        }
        peerConn.onicecandidate=((e)=>{
            if(e.candidate==null){
                return null;
            }
            sendData({
                type:"store_candidate",
                candidate:e.candidate,
            })

        })
        createAndSendOffer();

    },(error)=>{
        console.log(error);
    })

}

function createAndSendOffer(){
    peerConn.createOffer((offer)=>{
        sendData({
            type:"store_offer",
            offer:offer,
        })
        peerConn.setLocalDescription(offer);
    },(error)=>{
        console.log(error);
    })
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}