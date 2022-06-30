import React from 'react'
import { useState , useEffect} from 'react';
import {
    Link, useNavigate
  } from "react-router-dom";
  

const Requests = (props) => {

    const [requests, setrequests] = useState([])

    
    useEffect(() => {
        getrequests()
      }, []);
    

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
        setrequests(data);
        localStorage.setItem("qty", data.length)
       
       
    }

    async function acceptRequest(id) {
        let response = await fetch(`https://chat-wango.herokuapp.com/chat/requests`, {

            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
            },
            body: JSON.stringify({'id':id})
        });
        if(!response.ok){
            return alert('unable to accept') 
        }
        console.log("request accepted")
        window.alert("Request accepted")
        
    }

    let navigate = useNavigate()

    let redirect = ()  => {
     
        props.logout('null')
        console.log('redirected')
        return navigate('/')
          
      
      }
    
    
  return (
    <div className="col-md-4 col-xl-3 chat">
            <div className="card mb-sm-3 mb-md-0 contacts_card">
                <div className="card-header">
                    
                </div>

    
                <div className='controls'>
                    <div className='controlschild'>
                        <Link to={"/users"}>Add Friends</Link>
                    </div>
                    <div className='controlschild'>
                        <Link to={"/requests"}>Friend Requests {localStorage.getItem("qty")}</Link>
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
                    {requests.map(request =>
                        
                        <li className="active" key={request.id}>
                            <div className="d-flex bd-highlight">
                                <div className="img_cont">
                                    <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img"/>
                                    <span className="online_icon"></span>
                                </div>
                                <div className="user_info">
                                    <span>{request.sent_by}</span>
                                    <div id='add'><button onClick={() => acceptRequest(request.id)}>Accept</button></div>
                                    
                                </div>
                            </div>
                        </li>
                        
                    )}
                    
                    </ul>
                </div>
                <div className="card-footer"></div>
            </div>
        </div>
  )
}

export default Requests