import React from 'react'
import { useState , useEffect} from 'react';
import {
    Link,useNavigate
  } from "react-router-dom";
  



const Sidepanel = (props) => {

    const [chats, setChats] = useState([])
    const [empty, setEmpty] = useState(false)
   
    
   
    useEffect(() => {
        const timer = setInterval(getChats, 1000);
        return () => clearInterval(timer);
        getChats()
      }, []);
    
    useEffect(() => {
        const timer = setInterval(getrequests, 2000);
        return () => clearInterval(timer);
        getrequests()
      }, []);

    const user = localStorage.getItem('user')
     
    async function getChats() {
        let response = await fetch(`https://chat-wango.herokuapp.com/chat/list/${user}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
            },
        });

        let data = await response.json();       
        setChats(data);
        console.log(localStorage.getItem('qty'))
        if (data.length === 0){
            setEmpty(true)
            
        }   else {
            setEmpty(false)
        }
        
        
    }

    const chatWith = (chat) => {
        let chatting = ''
        if (chat.user1 == user){
            chatting = chat.user2
        } else {
            chatting = chat.user1
        }
        return chatting
    }

    async function getrequests() {
        let response = await fetch(`https://chat-wango.herokuapp.com/chat/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
            },
        });
        let data = await response.json();       
        localStorage.setItem("qty", data.length)
       
      }

      let getContent = (message) => {
        
        //Slice content and add three dots in over 45 characters to show there is more
        if (message.length > 10) {
            return message.slice(0, 25) + '...'
        } else {
            return message
        }
    
    }

    let navigate = useNavigate()

    let redirect = ()  => {
     
        props.logout('null')
        console.log('redirected')
        return navigate('/')
          
      
      }

    
  return (
    <div className="col-md-4 col-xl-3 chat"><div className="card mb-sm-3 mb-md-0 contacts_card">
        <div className="card-header">
            <div className="input-group">
                <input type="text" placeholder="Search for chat..." name="" className="form-control search"/>
                <div className="input-group-prepend">
                    <span className="input-group-text search_btn"><i className="fas fa-search"></i></span>
                </div>
            </div>
        </div>

    
        <div className='controls'>
            <div className='controlschild'>
                <Link to={"/users"}>Add Friends</Link>
            </div>
            <div className='controlschild'>
                <Link to={"/requests"}>Friend Requests <span style={{color:'white'}}>{localStorage.getItem("qty")}</span></Link>
            </div>
            <div className='controlschild'>
                <Link to={"/chats"}>Chats</Link>
            </div>
            <div className='controlschild'>
                <Link to={"/"} onClick={redirect}>Logout</Link>
            </div>
        </div>
   

    <div className="card-body contacts_body">
        <ul className="contacts">
            {empty
                ?
                    <div className='add_intro'>
                        <Link to={"/users"}>Add Friends</Link>
                            
                        
                        <p>To start chating with them</p>
                    </div>
                        
                :
                    <>
                    {chats.map(chat =>
                        <Link to={`/chat/${chat.id}/${chatWith(chat)}`} key={chat.id}>
                            <li className="active">
                                <div className="d-flex bd-highlight">
                                    <div className="img_cont">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img"/>
                                        {chat.unread_user_status === 'Online'?<span className="online_icon"></span>: <span className="online_icon offline"></span>}
                                    </div>
                                    <div className="user_info">
                                        { chat.count>0
                                        ?
                                        <>
                                        <span style={{width:'100%'}}>{chatWith(chat)}  <div className='count'>{chat.count}</div>  </span>
                                        <p>{getContent(chat.latest)}</p>
                                        </>
                                        :
                                        <>
                                        <span style={{width:'100%'}}>{chatWith(chat)}</span>
                                        { chat.sent === localStorage.getItem('user')
                                            ?
                                            <>
                                            { chat.msg_status === 'Unread' ?
                                            <p>{<i className="fas fa-check-double" style={{fontSize:'10px', marginRight:'5px',color:'grey'}}></i>}{getContent(chat.latest)}</p>
                                            :
                                            <p>{<i className="fas fa-check-double" style={{fontSize:'10px', marginRight:'5px',color:'skyblue'}}></i>}{getContent(chat.latest)}</p>
                                           
                                            }
                                            </>
                                            :
                                            <p>{getContent(chat.latest)}</p>
   
                                        }
                                        </>
                                        
                                        
                                        }
                                    </div>
                                </div>
                            </li>
                        </Link>
                    )}
                    </>
            }
        </ul>
    </div>
    <div className="card-footer"></div>
</div></div>
  )
}

export default Sidepanel