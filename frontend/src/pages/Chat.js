import React from 'react'
import { useEffect,useState } from 'react'
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
      else{
        setMessageHistory(lastJsonMessage.messages)
      }
  
  }, [lastJsonMessage,]);

  useEffect(() => {
      
    
    setSocketUrl(`wss://chat-wango.herokuapp.com/ws/chat/${chatUrl.id}/`)
  }, [chatUrl,readyState]);

  

  
  

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  const onChange = (e) => {
    setText( e.target.value)
   
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
                <p></p>

              </div>
              <div className="video_cam">
                <span><i className="fas fa-video"></i></span>
                
              </div>
            </div>
            <span id="action_menu_btn"><i className="fas fa-ellipsis-v"></i></span>
            <div className="action_menu">
              <ul>
                <li><i className="fas fa-user-circle"></i> View profile</li>
                <li><i className="fas fa-users"></i> Add to close friends</li>
                <li><i className="fas fa-plus"></i> Add to group</li>
                <li><i className="fas fa-ban"></i> Block</li>
              </ul>
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
                      <span className="msg_time_send">{new Date(message.timestamp).toLocaleDateString()}</span>
               
                  </div>
                </div>
            )}
                    
            
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