import React from 'react'
import { useState , useEffect} from 'react';
import {
    Link
  } from "react-router-dom";
  



const Sidepanel = (props) => {

    const [chats, setChats] = useState([])
    const [empty, setEmpty] = useState(false)
   
    
    useEffect(() => {
        getChats()
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
                <Link to={"/"} onClick={props.logout}>Logout</Link>
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
                        <Link to={`/Chat/${chat.id}/${chatWith(chat)}`} key={chat.id}>
                            <li className="active">
                                <div className="d-flex bd-highlight">
                                    <div className="img_cont">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img"/>
                                        <span className="online_icon"></span>
                                    </div>
                                    <div className="user_info">
                                        <span>{chatWith(chat)} <br></br> <p>online</p> </span>
                                        
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