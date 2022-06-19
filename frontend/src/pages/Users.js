import React from 'react'
import { useState , useEffect} from 'react';
import {
    Link
  } from "react-router-dom";
  

const Users = (props) => {

    const [users, setUsers] = useState([])

    const [search, setSearch] = useState("")

    
    const [empty, setEmpty] = useState(false)
    
    useEffect(() => {
        getUsers()
      }, []);
    
      
    async function getUsers() {
        let response = await fetch(`https://chat-wango.herokuapp.com/chat/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
            },
        });
        let data = await response.json();       
        setUsers(data);
    }

    async function createRequest(to) {
        let response = await fetch(`https://chat-wango.herokuapp.com/chat/requests`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
            },
            body: JSON.stringify({'sent_to':to})
        });

        
        if(!response.ok){
            return alert('request already sent') 
        }


        console.log("request created")
        window.alert("Request sent. Wait for " + to + " to accept." )
        
    }

    const onSubmit = e => {
        e.preventDefault()
        searchUsers(search)
       
      };
  

    const onChange = (e) => {
        setSearch( e.target.value)
        searchUsers(e.target.value)
    }

    async function searchUsers(query) {
        let response = await fetch(`https://chat-wango.herokuapp.com/chat/users`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
            },
            body: JSON.stringify({search:query})
        });

        let data = await response.json();  
        data = data.users  
        if (data.length === 0){
            setEmpty(true)
            
        }   else {
            setEmpty(false)
        }
        setUsers(data);
        
        if(!response.ok){
            return alert('unable to search') 
        }
    }

    
  return (
    
        <div className="col-md-4 col-xl-3 chat">
            <div className="card mb-sm-3 mb-md-0 contacts_card">
                <div className="card-header">
                <form onSubmit={e => onSubmit(e)}>
                    <div className="input-group">
                        
                            <input type="text" value={search}
                                onChange={e => onChange(e)} 
                                placeholder="Search for new friends..." name="" className="form-control search"/>
                        
                            <div className="input-group-prepend">
                                <span className="input-group-text search_btn"><button type='submit'><i className="fas fa-search"></i></button></span>
                            </div>
                        
                    </div>
                </form>
                </div>

    
                <div className='controls'>
                    <div className='controlschild'>
                        <Link to={"/users"}>Add Friends</Link>
                    </div>
                    <div className='controlschild'>
                        <Link to={"/requests"}>Friend Requests</Link>
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
                    <div style={{marginTop:80, textAlign:'center'}}>
                        <h4>No users found</h4>
                    </div>
                        
                    :
                    <>
                        {users.map(user =>
                            
                            <li className="active" key={user.username}>
                                <div className="d-flex bd-highlight">
                                    <div className="img_cont">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" className="rounded-circle user_img"/>
                                        <span className="online_icon"></span>
                                    </div>
                                    <div className="user_info">
                                        <span>{user.username}</span>
                                        <div id='add'><button onClick={() => createRequest(user.username)}>Add friend</button></div>
                                        
                                    </div>
                                </div>
                            </li>
                            
                        )}</>
                       
                    }
                    </ul>
                </div>
                <div className="card-footer"></div>
            </div>
        </div>
    
  )
}

export default Users