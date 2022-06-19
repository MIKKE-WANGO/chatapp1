import {
  //BrowserRouter as Router,
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import './App.css';
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Requests from "./pages/Requests";
import Sidepanel from "./pages/Sidepanel";
import Users from "./pages/Users";
import { useEffect,useState } from 'react'

function App() {

  
  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    localStorage.removeItem("qty")
       
    console.log("Logout success")
    
  }


  
  return (
    <Router>
      <div className="container-fluid h-100" style={{marginTop:'50px'}}>
        <div className="row justify-content-center h-100">

         <Routes>
            <Route path="/" element={<Login logout={logout}/>}/>
            <Route path="/register" element={<Register/>}/>
            
            <Route path="/chats" element={<Sidepanel />}/>
            <Route path="/users" element={<Users logout={logout}/>}/>
            <Route path="/requests" element={<Requests logout={logout} />}/>
            <Route  path="/chat/:id/:username" element={<Chat logout={logout}/>}/>   
                    
            
          </Routes>  
        </div>      
      </div>
    
  </Router>
   
  );
}

export default App;
