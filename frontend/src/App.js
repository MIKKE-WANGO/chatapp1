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

import useWebSocket, { ReadyState } from 'react-use-websocket';


function App() {

  const [socketUrl, setSocketUrl] = useState(`ws://127.0.0.1:8000/connect/`);
 
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl+"?token=" + localStorage.getItem('access'), {
    //onOpen: () =>  sendJsonMessage({command:'connect', username:localStorage.getItem('user')}) ,
    //onClose: () => console.log('closed') ,
    share: true,

    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });


  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    localStorage.removeItem("qty")
       
    console.log("Logout success")
    //setSocketUrl(null)
  }


  
  return (
    <Router>
      <div className="container-fluid h-100" style={{marginTop:'50px'}}>
        <div className="row justify-content-center h-100">

         <Routes>
            <Route path="/" element={<Login logout={logout} setSocketUrl={setSocketUrl}/>}/>
            <Route path="/register" element={<Register/> }/>
            
            <Route path="/chats" element={<Sidepanel />}/>
            <Route path="/users" element={<Users logout={logout} setSocketUrl={setSocketUrl}/> }/>
            <Route path="/requests" element={<Requests logout={logout} setSocketUrl={setSocketUrl}/>}/>
            <Route  path="/chat/:id/:username" element={<Chat logout={logout} setSocketUrl={setSocketUrl}/>}/>   
                    
            
          </Routes>  
        </div>      
      </div>
    
  </Router>
   
  );
}

export default App;
