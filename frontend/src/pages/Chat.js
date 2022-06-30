import React from 'react'
import { useEffect,useState, useRef } from 'react'
import Sidepanel from './Sidepanel'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {
  Link
} from "react-router-dom";


import {  useParams } from "react-router-dom";

const Chat = (props) => {

  const chatUrl = useParams(props.id)
  const username = useParams(props.username)
  const [socketUrl, setSocketUrl] = useState(`wss://chat-wango.herokuapp.com/ws/chat/${chatUrl.id}/`);
  const [messageHistory, setMessageHistory] = useState([]);

  const user = localStorage.getItem("user")
  const [text, setText] = useState("")
  
  
  const [typing, setTyping] = useState(false)
  
  const [calling, setCalling] = useState(false)

  const [status, setStatus] = useState("Offline")

  const bottomRef = useRef(null);


  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl+"?token=" + localStorage.getItem('access'), {
    onOpen: () =>  sendJsonMessage({command:'fetch_messages', chatId:chatUrl.id}) ,
    onClose: () => console.log('closed') ,
    share: true,

    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage !== null ) 
      if(lastJsonMessage.to == 'all') {
        
        setMessageHistory((prev) => prev.concat(lastJsonMessage.messages));
      }
      else if(lastJsonMessage.to == 'user'){

        setMessageHistory(lastJsonMessage.messages)
        
      } 

      else if(lastJsonMessage.to == 'calling' && lastJsonMessage.user != user){
        if(calling === false){
          setCalling(true)
          console.log('calling')
        }
      }
      else if(lastJsonMessage.to == 'typing' && lastJsonMessage.user != user ){
        if(typing === false){
          setTyping(true)
        }
      }
  
  }, [lastJsonMessage,]);

  useEffect(() => {
      
    
    setSocketUrl(`wss://chat-wango.herokuapp.com/ws/chat/${chatUrl.id}/`)
  }, [chatUrl,readyState]);

  
  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messageHistory]);

  useEffect(() =>{
    messageHistory.forEach(updateChat)
  }, [messageHistory])

  useEffect(() => {
    const timer = setInterval(getStatus, 2000);
    return () => clearInterval(timer);
    getStatus()
  }, []);

  useEffect(() => {
    
    callTimer()
  }, [calling]);

  useEffect(() => {
    
    typingTimer()
  }, [typing]);


  
  const callTimer = () => {
    setTimeout(() => {
      setCalling(false)
    }, 10000);
   
  }

  const typingTimer = () => {
    if(typing === true){
      setTimeout(() => {
        setTyping(false)
      }, 1500);
  }
   
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  const onChange = (e) => {
    setText( e.target.value)
    sendJsonMessage({command:'typing', from:user, chatId:chatUrl.id}) 
    
  }


  const onSubmit = e => {
    e.preventDefault()
    
    sendJsonMessage({from:user, message:text , command:"new_message", chatId:chatUrl.id})
    console.log(user)
    setText("")
  };

  let getDate = (note) => {
    return new Date(note.timestamp).toLocaleTimeString() 
  }

  async function updateChat(value) {
    
    if (value.status === 'Unread' && value.contact != localStorage.getItem('user')){
      let response = await fetch(`https://chat-wango.herokuapp.com/chat/messages`, {

          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access')}`,
        
          },
          body: JSON.stringify({'id':value.id, 'chatId':value.chat})
      });
      if(!response.ok){
          return console.log('unable to update chat') 
      }
    }
    
}

const getStatus = async () => {
  if (localStorage.getItem('access')){
    let response = await fetch('https://chat-wango.herokuapp.com/chat/status', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',            
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
     
          },
          body: JSON.stringify({'username':username.username})

     })

    let data = await response.json()

    if(!response.ok){
      console.log("unable to get user")
     
    }
    setStatus(data.status)
    return console.log("status accessed")
    
  } else {
    console.log(" no access key")
    return('offline')
  }
}

  
  return (

    <>
    <div className="col-md-8 col-xl-6 chat">
        <div className="card">
          <div className="card-header msg_head">
            <div className="d-flex bd-highlight">
              <div className="img_cont" >
                <Link style={{fontSize:'25px', color:'white', marginRight:'13px'}} to={"/chats"}><span><i className="fas fa-arrow-left"></i></span></Link>              
              </div>

              <div className="img_cont">
                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img"/>
                <span className="online_icon"></span>
              </div>
              <div className="user_info">
                <span style={{width:'100%'}}>{username.username}</span>
                {typing 
                  ?
                    <p>typing...</p>
                  : <p>{status}</p>}

              </div>
              <div className="video_cam">
                <span><Link style={{color:'white'}}to={`/video/${chatUrl.id}/${username.username}`}><i className="fas fa-video"></i></Link></span>
                
              </div>
            </div>
           
          </div>

          
          <div className="card-body msg_card_body">

            {messageHistory.map(message => 
              message.contact === user ? 
                <div className="d-flex justify-content-end mb-4" key={message.timestamp}>
                  <div className="msg_cotainer_send">
                      <div className='text_send'>{message.content}</div>
                      <span className="msg_time_send">{getDate(message)}</span>
                      <span className="msg_time_send">{new Date(message.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="img_cont_msg">
                      <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img_msg"/>
            
                  </div>
                </div>              
              :                
                <div className="d-flex justify-content-start mb-4" key={message.timestamp}>
                  <div className="img_cont_msg">
                    <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img_msg"/>
                  </div>
                  <div className="msg_cotainer">
                      <div className='text'>{message.content}</div>
                      <span className="msg_time">{getDate(message)}</span>
                      <span className="msg_time">{new Date(message.timestamp).toLocaleDateString()}</span>
               
                  </div>
                </div>
            )}
                    
            <div ref={bottomRef} />
            
          </div>

          <form onSubmit={e => onSubmit(e)}>
            <div className="card-footer">
              <div className="input-group">
                <div className="input-group-append">
                  <span className="input-group-text attach_btn"><i className="fas fa-paperclip"></i></span>
                </div>
                <textarea name="text"  
                  value={text}
                  onChange={e => onChange(e)} 
                  className="form-control type_msg" 
                />
                <div className="input-group-append">
                  <button type='submit'><span className="input-group-text send_btn"><i className="fas fa-location-arrow"></i></span></button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
   
   </> 
  )
}

export default Chat