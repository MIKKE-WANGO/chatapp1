import React from 'react'

import { useState , useEffect} from 'react';

import { Link, useNavigate } from "react-router-dom";

const Register = () => {
 
  const [accountCreated, setAccountCreated] = useState(false)
  const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      re_password: ''
  })

  //destructure to access formData keys  individually
  const {username, email, password, re_password} = formData

  useEffect(() => {
    redirect()
  })

  let navigate = useNavigate()
  
  let redirect = ()  => {
    if(accountCreated){
        console.log('redirected')
        return navigate("/")
        }
    }
  
  const onChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const onSubmit = e => {
    e.preventDefault()
    if (password === re_password){
      
      signup(formData)
        } else {
          alert("passwords dont match")
      }
    
  };

  const signup= async  (formData) => {
  
    let response = await fetch('https://chat-wango.herokuapp.com/chat/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify(formData)
    })

    let data = await response.json()
    
    //remove items from local storage
    if(!response.ok){
      setAccountCreated(false)

      if( data.error === 'User with this email already exists'){
        return console.log('user already exists')    
      
        } 
      alert('not signed up')

        
    } else {
      setAccountCreated(true)
      console.log("sign up success") 
     
    }         
  }

  return (
    <div>
      <h1>Register</h1>
        <div> 
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
                 placeholder='email' 
                 name="email" 
                
                value={email}
                type="email"
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
            <div className="input-group">
                
            <input 
                 placeholder='re_assword' 
                 name="re_password" 
                 type="password"
                value={re_password}
                onChange={e => onChange(e)} 
                className="form-control type_msg"
                
                  />
                
            </div>
            

            </div>
            <div className="input-group-append">
                <button type='submit'><span className="input-group-text send_btn">Register<i className="fas fa-location-arrow"></i></span></button>
            </div>
        </form>
        <Link to='/'>Login</Link>
      
    </div>
    </div>
  )
}

export default Register