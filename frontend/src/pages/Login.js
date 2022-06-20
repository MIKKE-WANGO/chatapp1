import React from 'react'

import { useState , useEffect} from 'react';

import { Link, useNavigate } from "react-router-dom";


import Helmet from 'react-helmet'


const Login = (props) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const [loggedin, setLoggedin] = useState(false)
  
    useEffect(() => {
      redirect()
    })

    useEffect(() => {
      props.logout()
    },[])
  
    //destructure to access formData keys  individually
    const {username, password} = formData
  
    let navigate = useNavigate()

    let redirect = ()  => {
      if(loggedin){
          console.log('redirected')
          return navigate('/chats')
          }
      
      }
  
    const onChange = (e) => {
         setFormData({...formData, [e.target.name]: e.target.value});
    }
  
    const onSubmit = e => {
      e.preventDefault()
      Loginuser(formData)
     
    };


    async function  Loginuser  (formData)  {
        //retrieve refresh and access
        let response = await fetch('https://chat-wango.herokuapp.com/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(formData)
        })
    
        //remove items from local storage
        if(!response.ok){
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          alert('Username or password is incorrrect')
          return console.log('not authorised') 
          
        }
    
        let data = await response.json()
    
        console.log("login success")
        
        //set access in localstorage of browser
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)
        get_user()
           
      
      }

      const get_user = async () => {
        if (localStorage.getItem('access')){
          let response = await fetch('https://chat-wango.herokuapp.com/chat/user-details', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',            
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
           
                },

           })
    
          let data = await response.json()
     
          if(!response.ok){
            console.log("unable to get user")
            
          }

          

          localStorage.setItem('user', data.user.username)
          console.log("user accessed")
          setLoggedin(true)
        } else {
          console.log(" no access key")
          
        }
      }


  return (
    <div> 
        <Link to='/' onClick={props.logout}>Logout</Link>
        <h1>Login</h1>
        <form onSubmit={e => onSubmit(e)} style={{margin:5}} >
            <div className="card-footer">
            <div className="input-group">
                
                <input
                placeholder='username'
                name="username"  
                value={username}
                onChange={e => onChange(e)} 
                
                               
                className="form-control type_msg" 
                />
                
            </div>
            <div className="input-group">
               
                <input 
                 placeholder='Password' 
                 name="password" 
                type="password"
                value={password}
                onChange={e => onChange(e)} 
                className="form-control type_msg"
                
                  />
                
            </div>
            </div>
            <div className="input-group-append" style={{width:'20%', textAlign:'center', background:'black'}}>
                <button type='submit'><span className="input-group-text send_btn">Login<i className="fas fa-location-arrow"></i></span></button>
            </div>
        </form>

         <Link to='/register' style={{fontSize:'25px'}}>Create an account</Link>
         
      
    </div>
  )
}

export default Login