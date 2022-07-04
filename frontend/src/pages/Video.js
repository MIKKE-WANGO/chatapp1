import React from 'react'

import { useEffect,useState, useRef } from 'react'
import useWebSocket from 'react-use-websocket';
import {
  Link,useParams,useNavigate
} from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng"

import leave from '../images/leave.svg'
import microphone from '../images/microphone.png'
import camera from '../images/video-camera.png'


const Video = (props) => {

    
    const user1 = localStorage.getItem("user")
    const userid = localStorage.getItem('userid')
    const chatUrl = useParams(props.id)
    const username = useParams(props.username)
    const [socketUrl, setSocketUrl] = useState(`wss://chat-wango.herokuapp.com/ws/chat/${chatUrl.id}/`);

    const [token, setToken] = useState('')
    const [uid, setUid] = useState('')
    const [channel, setChannel] = useState(chatUrl.id)
    const [users, setUsers] = useState([]);
    const APP_ID = '8d68b0c915984803a4a86ffffb0e49d2'

    const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    
        
    let localTracks = []
    let remoteUsers = {}

    useEffect(() => {
      getToken()
      }, []);

    useEffect(() => {

        joinAndDisplayLocalStream()
        
        //client.on('user-published', handleUserJoined)
       
    },[remoteUsers]);
    
  
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl+"?token=" + localStorage.getItem('access'), {
        onOpen: () =>  sendJsonMessage({command:'video_calling', chatId:chatUrl.id, from:user1}) ,
        onClose: () => console.log('video ws closed') ,
        share: true,
    
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
        });
        
    let joinAndDisplayLocalStream = async () => {

        client.on('user-published', handleUserJoined)
        client.on('user-left', handleUserLeft)
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

        try{
            await client.join(APP_ID, channel,token,userid)
        } catch(error){
            console.log(error)   
        
        }

        let player1 = document.getElementById(`user-container-${userid}`)

            if(player1 != null){
                player1.remove()
            }
        let player = `  <div class="video-container" id="user-container-${userid}">
                            <div class="username-wrapper"><span class="user-name">${user1}</span></div>
                            <div class="video-player" id="user-${userid}"></div>
                        </div>`

                        
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        localTracks[1].play(`user-${userid}`)
        await client.publish([localTracks[0], localTracks[1]])
        
    }


    
 
    let handleUserJoined = async (user, mediaType)=>{
        remoteUsers[user.uid] = user
        await client.subscribe(user, mediaType)

        if(mediaType === 'video'){
            //make sure user does not exist
            let player = document.getElementById(`user-container-${user.uid}`)

            if(player != null){
                player.remove()
            }

            //start building the player again
            player = `  <div class="video-container" id="user-container-${user.uid}">
                            <div class="username-wrapper"><span class="user-name">${username.username}</span></div>
                            <div class="video-player" id="user-${user.uid}"></div>
                        </div>`

            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
            user.videoTrack.play(`user-${user.uid}`)
        }

        if(mediaType === 'audio'){
            user.audioTrack.play()
        }
    }

    let handleUserLeft = async (user) =>{
        delete remoteUsers[user.uid]
        document.getElementById(`user-container-${user.uid}`).remove()
    }
    
    let navigate = useNavigate()

    let leaveAndRemoveLocalStream = async (e) => {
        console.log('leave stream')
        //client.removeAllListeners();
        //localTracks[0].close();
        //localTracks[1].close();
        
        await client.leave()
        for (let i=0; localTracks.length > i; i++){
            
            localTracks[i].stop()
            localTracks[i].close()
        }
    
        //await client.leave()
        
        window.open(`/chat/${chatUrl.id}/${username.username}`, '_self')
        //navigate(`/chat/${chatUrl.id}/${username.username}`)
    }

      
  let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80,80,1)'
    }
  }


  let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80,80,1)'
    }
  }



    
    
        
    useEffect(() => {
        setSocketUrl(`wss://chat-wango.herokuapp.com/ws/chat/${chatUrl.id}/`)
    }, [chatUrl]);

    
    const getToken = async () => {
        if (localStorage.getItem('access')){
            let response = await fetch('https://chat-wango.herokuapp.com/chat/get-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',            
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
            
                    },
                    body: JSON.stringify({'chatId':chatUrl.id})    
            })  
            let data = await response.json()    
            if(!response.ok){
                console.log("unable to get token")
            
            }
            setToken(data.token)
            setUid(data.uid)
            return console.log("token accessed")       
        } else {
        console.log(" no access key")
        return('offline')
        }
    }
    
        //document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
        return (
            <>
                <div id="video-streams">
                
                </div>

                <div id="controls-wrapper">
                    <div className="icon-wrapper">
                        <img  onClick={e => toggleMic(e)}   className="control-icon" id="mic-btn" src={microphone}  />

                    </div>

                    <div className="icon-wrapper">
                        <img onClick={e => toggleCamera(e)} className="control-icon" id="camera-btn" src={camera}  />

                    </div>

                    <div className="icon-wrapper">
                         <img onClick={e => leaveAndRemoveLocalStream(e)} className="control-icon" id="leave-btn" src={leave} />

                    </div>

                </div>
            </>
        )
    }

export default Video